import sys
import os
from pathlib import Path
from datetime import datetime
from loguru import logger

# Define log directory
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Generate log filename with timestamp
current_time = datetime.now().strftime("%Y-%m-%d")
log_file = LOG_DIR / f"app_{current_time}.log"

# Configure loguru
def setup_logging():
    """
    Configure Loguru logger with standard format and outputs.
    
    This sets up:
    - Console output with colors
    - File output with rotation
    - Custom format with timestamps, level, and source location
    """
    # Remove default handler
    logger.remove()
    
    # Add console handler with colors - using a simpler format for better terminal display
    logger.add(
        sys.stdout,  # Use stdout instead of stderr for better terminal compatibility
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
        level="DEBUG",  # Always use DEBUG in development for maximum visibility
        enqueue=True    # Use queue for thread safety
    )
    
    # Add file handler with rotation
    logger.add(
        log_file,
        rotation="10 MB",  # Rotate when file reaches 10MB
        retention="1 week",  # Keep logs for 1 week
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="INFO",
        compression="zip",  # Compress rotated logs
        enqueue=True        # Use queue for thread safety
    )
    
    # Log startup message
    logger.info(f"Logging initialized. Log file: {log_file}")
    
    return logger

# Export configured logger
logger = setup_logging() 