import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
#from services.twilio import cleanup

from app.api.main import api_router
from app.core.config import settings
from contextlib import asynccontextmanager
import os 
from dotenv import load_dotenv
import subprocess
import psutil
import time
import platform

load_dotenv()

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"

sentry_sdk.init(
    dsn="https://e0f7361d6f043e1f2d7a42549e152498@o4508208175906816.ingest.us.sentry.io/4508208188882944",
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for tracing.
    traces_sample_rate=1.0,
    _experiments={
        # Set continuous_profiling_auto_start to True
        # to automatically start the profiler on when
        # possible.
        "continuous_profiling_auto_start": True,
    },
)


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

origins = ["flowon.ai",
           "https://flowon.ai",
           "https://www.flowon.ai",
           "http://localhost:3000", 
           "https://localhost:3000", 
           ]

if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

#print("origins",[str(origins).strip(",") for origin in settings.BACKEND_CORS_ORIGINS])

app.include_router(api_router, prefix=settings.API_V1_STR)

def kill_processes_on_port(port):
    try:
        if platform.system() == "Windows":
            subprocess.run(['taskkill', '/F', '/PID', '$(netstat -ano | findstr :%d | awk \'{print $5}\')' % port], shell=True)
        else:  # Unix-like systems (Linux, macOS)
            # Get the current process ID
            current_pid = os.getpid()
            
            # Get all processes on the port
            result = subprocess.run(f"lsof -ti:{port}", shell=True, capture_output=True, text=True)
            if result.stdout:
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    try:
                        pid = int(pid)
                        # Don't kill our own process
                        if pid != current_pid:
                            os.kill(pid, 9)
                            print(f"Killed process {pid} on port {port}")
                    except (ValueError, ProcessLookupError) as e:
                        print(f"Error processing PID {pid}: {e}")
            
        print(f"Finished checking processes on port {port}")
    except Exception as e:
        print(f"Error in kill_processes_on_port: {e}")

@app.on_event("startup")
async def startup_event():
    global livekit_process
    
    try:
        time.sleep(1)  # Give processes time to fully terminate
        
        MAX_RETRIES = 3
        RETRY_DELAY = 2

        for attempt in range(MAX_RETRIES):
            try:
                python_path = "/root/FlowonAI/backend/venv/bin/python"
                #python_path = 'python'
                livekit_process = subprocess.Popen([python_path, 'livekit_server.py', 'start'])
                print("LiveKit server started")
                break
            except subprocess.SubprocessError as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < MAX_RETRIES - 1:
                    print(f"Retrying in {RETRY_DELAY} seconds...")
                    time.sleep(RETRY_DELAY)
                else:
                    print("Failed to start LiveKit server after maximum retries")
                    raise
    except Exception as e:
        print(f"Error in startup_event: {e}")

@app.on_event("shutdown")
async def shutdown_event():

    global livekit_process
    if livekit_process:
        try:
            # Terminate the LiveKit server process
            print("\n\nTerminating LiveKit server")
            parent = psutil.Process(livekit_process.pid)
            for child in parent.children(recursive=True):
                child.terminate()
            parent.terminate()
            print("LiveKit server terminated")
        except psutil.NoSuchProcess:
            print("LiveKit server process not found")
        except Exception as e:
            print(f"Error terminating LiveKit server: {e}")
