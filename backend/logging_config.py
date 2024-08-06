"""
Logging configuration for the application.
"""

import logging
import os


def setup_logging():
    """
    Set up logging configuration - configures the root logger with console and file handlers,
    sets their formatters, log levels, and adds them to the root logger.
    """
    try:
        # Define the base directory and log file path
        base_dir = os.path.dirname(os.path.abspath(__file__))
        log_file_path = os.path.join(base_dir, "app.log")

        # Configure the root logger
        logger = logging.getLogger()
        logger.setLevel(logging.DEBUG)

        if logger.hasHandlers():
            logger.handlers.clear()

        # Create console handler with a normal formatter
        c_handler = logging.StreamHandler()
        console_format = (
            "%(asctime)s loglevel=%(levelname)-6s "
            "logger=%(name)s %(funcName)s() L%(lineno)-4d "
            "%(message)s"
        )
        c_format = logging.Formatter(console_format)
        c_handler.setFormatter(c_format)
        c_handler.setLevel(logging.DEBUG)

        # Create file handler with a detailed formatter
        f_handler = logging.FileHandler(log_file_path)
        log_format = (
            "%(asctime)s loglevel=%(levelname)-6s "
            "logger=%(name)s %(funcName)s() L%(lineno)-4d "
            "%(message)s   call_trace=%(pathname)s L%(lineno)-4d"
        )
        f_format = logging.Formatter(log_format)
        f_handler.setFormatter(f_format)
        f_handler.setLevel(logging.DEBUG)

        # Add handlers to the root logger
        logger.addHandler(c_handler)
        logger.addHandler(f_handler)

        return logger
    except Exception as error:
        print(f"Failed to configure logging: {error}")
        raise