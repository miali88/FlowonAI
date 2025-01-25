import sentry_sdk
from contextlib import asynccontextmanager
import os 
from dotenv import load_dotenv
import subprocess
import psutil
import time
import platform
import sys
import logging

from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from backend.app.api.routes.agents import router as agent_router
from app.core.config import settings
from services.twilio.call_handle import cleanup
load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Use full paths for executables
NETSTAT_PATH: str = "C:\\Windows\\System32\\netstat.exe" if platform.system() == "Windows" else "/usr/bin/netstat"
TASKKILL_PATH: str = "C:\\Windows\\System32\\taskkill.exe" if platform.system() == "Windows" else "/bin/kill"  # Provide default for non-Windows
LSOF_PATH: str = "/usr/bin/lsof" if platform.system() != "Windows" else "/bin/lsof"  # Provide default path

livekit_process = None  # Global variable to store LiveKit server process

def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


sentry_sdk.init(
    dsn=(
        "https://e0f7361d6f043e1f2d7a42549e152498@"
        "o4508208175906816.ingest.us.sentry.io/4508208188882944"
    ),
    traces_sample_rate=1.0,
    _experiments={
        "continuous_profiling_auto_start": True,
    },
)

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)  

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=None if settings.ENVIRONMENT == "production" else f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    docs_url=None if settings.ENVIRONMENT == "production" else "/docs",  # Disable docs in production
    redoc_url=None if settings.ENVIRONMENT == "production" else "/redoc",
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

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(agent_router, prefix="/api/v1/agent", tags=["agent"])

# Define global variable
livekit_process = None

def kill_processes_on_port(port):
    try:
        if platform.system() == "Windows":
            netstat = subprocess.run(
                [NETSTAT_PATH, "-ano"],
                capture_output=True,
                text=True,
                shell=False
            )
            for line in netstat.stdout.splitlines():
                if f":{port}" in line:
                    try:
                        pid = line.strip().split()[-1]
                        if pid.isdigit():
                            subprocess.run(
                                [TASKKILL_PATH, "/F", "/PID", pid],
                                shell=False
                            )
                    except (IndexError, ValueError):
                        continue
        else:
            current_pid = os.getpid()
            try:
                if not os.path.isfile(LSOF_PATH):
                    raise FileNotFoundError("lsof command not found")
                    
                result = subprocess.run(
                    [LSOF_PATH, "-ti", f":{port}"],
                    capture_output=True,
                    text=True,
                    shell=False
                )
                if result.stdout:
                    pids = result.stdout.strip().split('\n')
                    for pid_str in pids:
                        try:
                            pid = int(pid_str)
                            if pid != current_pid:
                                os.kill(pid, 9)
                                logger.info(f"Killed process {pid} on port {port}")
                        except (ValueError, ProcessLookupError) as e:
                            logger.error(f"Error processing PID {pid_str}: {e}")
            except FileNotFoundError:
                logger.error("lsof command not found")

        logger.info(f"Finished checking processes on port {port}")
    except Exception as e:
        logger.error(f"Error in kill_processes_on_port: {e}")


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize FastAPI server and start LiveKit server."""
    logger.debug("Starting up FastAPI server...")
    global livekit_process

    try:
        logger.debug("Attempting to start LiveKit server...")
        
        # Kill any existing processes on LiveKit's port (8081)
        kill_processes_on_port(8081)
        time.sleep(2)  # Increased delay to ensure cleanup
        
        MAX_RETRIES = 3
        RETRY_DELAY = 5  # Increased delay between retries

        # Get the absolute path to the project root
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
        python_executable = sys.executable
        env = os.environ.copy()

        # Validate paths before execution
        livekit_script = os.path.join(project_root, 'backend', 'livekit_server.py')
        if not os.path.isfile(livekit_script):
            raise FileNotFoundError(f"LiveKit server script not found at {livekit_script}")

        site_packages = os.path.join(
            os.path.dirname(python_executable),
            'Lib',
            'site-packages'
        )
        python_path = [
            project_root,
            site_packages,
            env.get('PYTHONPATH', '')
        ]
        env['PYTHONPATH'] = os.pathsep.join(filter(None, python_path))
        
        # Add DEBUG logging for LiveKit
        env['LIVEKIT_LOG_LEVEL'] = 'DEBUG'

        for attempt in range(MAX_RETRIES):
            try:
                # Kill any existing LiveKit processes before starting new one
                if livekit_process:
                    try:
                        parent = psutil.Process(livekit_process.pid)
                        for child in parent.children(recursive=True):
                            child.terminate()
                        parent.terminate()
                        time.sleep(1)  # Wait for termination
                    except (psutil.NoSuchProcess, Exception) as e:
                        logger.warning(f"Error cleaning up old LiveKit process: {e}")
                
                livekit_process = subprocess.Popen(
                    [
                        python_executable,
                        livekit_script,
                        'start'
                    ],
                    env=env,
                    cwd=project_root,
                    shell=False  # Explicitly set shell=False
                )
                
                # Wait a moment to check if process is still running
                time.sleep(3)
                if livekit_process.poll() is None:  # None means process is still running
                    logger.info("LiveKit server started successfully")
                    break
                else:
                    output, error = livekit_process.communicate()
                    logger.error(f"LiveKit server failed to start. Output: {output}, Error: {error}")
                    
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
        raise

@app.on_event("shutdown")
async def shutdown_event():
    global livekit_process

    logger.debug("Shutting down FastAPI server...")
    print("twilio cleanup")
    cleanup()
    if livekit_process:
        try:
            logger.info("Terminating LiveKit server")
            parent = psutil.Process(livekit_process.pid)
            for child in parent.children(recursive=True):
                child.terminate()
            parent.terminate()
            logger.info("LiveKit server terminated")
        except psutil.NoSuchProcess:
            logger.error("LiveKit server process not found")
        except Exception as e:
            logger.error(f"Error terminating LiveKit server: {e}")
