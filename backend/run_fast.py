import os
os.environ["FORCE_COLOR"] = "1"  # Force colorized output

import uvicorn
from dotenv import load_dotenv
import sys

# Add the project root to Python path
project_root = os.path.join(os.path.dirname(__file__), '..')
sys.path.append(project_root)

# Load environment variables
load_dotenv(os.path.join(project_root, '.env'))

# Import logger after environment variables are loaded
from app.core.logging_setup import logger

if __name__ == "__main__":
    # Start the server
    logger.info("Starting FastAPI server")
    try:
        logger.info("Initializing Uvicorn server")
        uvicorn.run("app.main:app", 
                    host="0.0.0.0",
                    port=8000, 
                    reload=True,
                    log_level="info"
                    )
    except OSError as e:
        if e.errno == 48:  # Address already in use
            logger.error("Port 8000 is already in use")
            logger.info("Please try:")
            logger.info("1. sudo lsof -i :8000  (to see what's using the port)")
            logger.info("2. pkill -f ngrok      (to kill ngrok processes)")
            logger.info("3. pkill -f Python     (to kill Python processes)")
            sys.exit(1)
        logger.exception("Failed to start server")
        raise
    #print("\n\nSUPABASE KEYS", settings.SUPABASE_URL, settings.SUPABASE_KEY)
