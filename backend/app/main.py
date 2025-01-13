import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
# from services.twilio import cleanup

from app.api.main import api_router
from app.core.config import settings
import os
import logging
from dotenv import load_dotenv
import subprocess
import psutil
import time
import platform
import sys

load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


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
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

origins = [
    "flowon.ai",
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


def kill_processes_on_port(port: int) -> None:
    """Kill processes running on specified port.

    Args:
        port: Port number to check for processes
    """
    try:
        if platform.system() == "Windows":
            subprocess.run(
                [
                    'taskkill',
                    '/F',
                    '/PID',
                    '$(netstat -ano | findstr :%d | awk \'{print $5}\')'
                    % port
                ],
                shell=True
            )
        else:
            # Get the current process ID
            current_pid = os.getpid()

            # Get all processes on the port
            result = subprocess.run(
                f"lsof -ti:{port}",
                shell=True,
                capture_output=True,
                text=True
            )
            if result.stdout:
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    try:
                        pid = int(pid)
                        # Don't kill our own process
                        if pid != current_pid:
                            os.kill(pid, 9)
                            logger.info(f"Killed process {pid} on port {port}")
                    except (ValueError, ProcessLookupError) as e:
                        logger.error(f"Error processing PID {pid}: {e}")

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
        time.sleep(1)

        MAX_RETRIES = 3
        RETRY_DELAY = 2

        # Get the absolute path to the project root
        project_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '../..')
        )

        # Get the current Python executable path
        python_executable = sys.executable

        # Set up the environment for the subprocess
        env = os.environ.copy()

        # Ensure PYTHONPATH includes project root and site-packages
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

        for attempt in range(MAX_RETRIES):
            try:
                livekit_process = subprocess.Popen(
                    [
                        python_executable,
                        os.path.join(project_root, 'backend', 'livekit_server.py'),
                        'start'
                    ],
                    env=env,
                    cwd=project_root
                )
                logger.info(
                    f"LiveKit server started with PYTHONPATH: {env['PYTHONPATH']}"
                )
                break
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


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Cleanup and shutdown LiveKit server."""
    global livekit_process
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
