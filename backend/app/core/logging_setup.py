import sys
import os
from pathlib import Path
from datetime import datetime
from loguru import logger

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

current_time = datetime.now().strftime("%Y-%m-%d")
log_file = LOG_DIR / f"app_{current_time}.log"

def setup_logging():
    """
    Configure Loguru logger with standard format and outputs.
    
    This sets up:
    - Console output with colors
    - File output with rotation
    - Custom format with timestamps, level, and source location
    """
    logger.remove()
    
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
        level="DEBUG",
        enqueue=True
    )
    
    logger.add(
        log_file,
        rotation="10 MB",
        retention="1 week",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="INFO",
        compression="zip",
        enqueue=True
    )
    
    logger.info(f"Logging initialized. Log file: {log_file}")
    
    return logger

logger = setup_logging() 