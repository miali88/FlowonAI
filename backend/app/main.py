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
import sys
import logging

load_dotenv()

# Add this near the top with other environment variables
DEV_MODE = os.getenv('DEV_MODE', 'false').lower() == 'true'

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
    logger.debug("Starting up FastAPI server...")
    global livekit_process
    
    if DEV_MODE:
        logger.debug("Running in dev mode - skipping LiveKit server startup")
        return
        
    try:
        logger.debug("Attempting to start LiveKit server...")
        
        MAX_RETRIES = 3
        RETRY_DELAY = 2

        # Get the absolute path to the project root
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
        
        # Get the current Python executable path
        python_executable = sys.executable
        
        # Set up the environment for the subprocess
        env = os.environ.copy()
        
        # Set event loop policy before starting the server
        if platform.system() == "Windows":
            import asyncio
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
            env['PYTHONPATH'] = os.pathsep.join([
                project_root,
                os.path.dirname(python_executable),
                env.get('PYTHONPATH', '')
            ])

        for attempt in range(MAX_RETRIES):
            try:
                # Simplified script execution
                livekit_process = subprocess.Popen(
                    [python_executable, 
                     os.path.join(project_root, "backend", "livekit_server.py")],
                    env=env,
                    cwd=project_root,
                    # Add these to prevent subprocess from inheriting console handling
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if platform.system() == "Windows" else 0
                )
                
                logger.info(f"LiveKit server started with PID: {livekit_process.pid}")
                # Wait a bit to ensure the process starts properly
                time.sleep(2)
                
                # Check if process is still running
                if livekit_process.poll() is None:
                    logger.info("LiveKit server successfully started")
                    break
                else:
                    raise subprocess.SubprocessError("LiveKit server failed to start")
                    
            except subprocess.SubprocessError as e:
                logger.error(f"Attempt {attempt + 1} failed: {e}")
                if attempt < MAX_RETRIES - 1:
                    logger.info(f"Retrying in {RETRY_DELAY} seconds...")
                    time.sleep(RETRY_DELAY)
                else:
                    logger.error("Failed to start LiveKit server after maximum retries")
                    raise
    except Exception as e:
        logger.error(f"Error in startup_event: {e}")
        # Don't raise the exception, allow the FastAPI server to start anyway
        pass

@app.on_event("shutdown")
async def shutdown_event():
    global livekit_process
    if livekit_process:
        try:
            logger.info("Shutting down LiveKit server...")
            if platform.system() == "Windows":
                # On Windows, we need to send Ctrl+C to the process group
                import signal
                livekit_process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                livekit_process.terminate()
            
            # Wait for the process to terminate
            try:
                livekit_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                # Force kill if graceful shutdown fails
                livekit_process.kill()
            
            logger.info("LiveKit server terminated")
        except Exception as e:
            logger.error(f"Error terminating LiveKit server: {e}")
        finally:
            livekit_process = None
