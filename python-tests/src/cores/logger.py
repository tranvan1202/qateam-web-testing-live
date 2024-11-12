# python-tests/src/cores/logger.py

import logging
import os
from datetime import datetime

# Set the correct log folder path to `common/reports/logs`
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
LOGS_FOLDER_PATH = os.path.join(PROJECT_ROOT, 'common', 'reports', 'logs')

def setup_logger(computer_name: str, script_name: str):
    # Ensure the logs folder exists
    os.makedirs(LOGS_FOLDER_PATH, exist_ok=True)

    # Use the process ID to ensure unique log files in parallel runs
    process_id = os.getpid()
    timestamp = datetime.now().strftime("%y%m%d_%H%M%S")
    log_file_name = f"{computer_name}_{script_name}_{process_id}_{timestamp}_log.txt"
    log_file_path = os.path.join(LOGS_FOLDER_PATH, log_file_name)

    # Set up logging
    logger = logging.getLogger(f"{script_name}_{process_id}")
    logger.setLevel(logging.DEBUG)

    # Clear existing handlers to avoid duplicate logs
    if logger.hasHandlers():
        logger.handlers.clear()

    # File handler
    file_handler = logging.FileHandler(log_file_path)
    file_handler.setLevel(logging.INFO)

    # Formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)

    # Add the file handler to the logger
    logger.addHandler(file_handler)

    # Console handler for real-time feedback
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Log the path where the log file is saved
    logger.info(f"Log file saved to: {log_file_path}")

    return logger
