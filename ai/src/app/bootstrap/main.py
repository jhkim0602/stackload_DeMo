import os
import sys
import atexit
import asyncio
import os
import argparse
from pathlib import Path
import tomli
import uvicorn
from loguru import logger
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Compatibility: Alias GEMINI_API_KEY to GOOGLE_API_KEY if not set
if os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

from src.app.bootstrap.server import WebSocketServer
from src.app.core.config.main import Config, read_yaml, validate_config

os.environ["HF_HOME"] = str(Path(__file__).parent / "models")
os.environ["MODELSCOPE_CACHE"] = str(Path(__file__).parent / "models")

def get_version() -> str:
    with open("pyproject.toml", "rb") as f:
        pyproject = tomli.load(f)
    return pyproject["project"]["version"]


def init_logger(console_log_level: str = "INFO") -> None:
    logger.remove()
    # Console output
    logger.add(
        sys.stderr,
        level=console_log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | {message}",
        colorize=True,
    )

    # File output
    logger.add(
        "logs/debug_{time:YYYY-MM-DD}.log",
        rotation="10 MB",
        retention="30 days",
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message} | {extra}",
        backtrace=True,
        diagnose=True,
    )


def parse_args():
    parser = argparse.ArgumentParser(description="Open-LLM-VTuber Server")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    parser.add_argument(
        "--hf_mirror", action="store_true", help="Use Hugging Face mirror"
    )
    return parser.parse_args()


def free_port(port: int):
    """
    Checks if the port is in use and kills the process occupying it.
    Supported on macOS/Linux using lsof.
    """
    import subprocess
    import signal
    import time

    try:
        # Check if port is in use
        result = subprocess.run(
            ["lsof", "-t", "-i", f":{port}"],
            capture_output=True,
            text=True
        )
        pids = result.stdout.strip().split('\n')

        if any(pids) and pids[0]:
            logger.warning(f"Port {port} is in use by PID(s): {pids}. Attempting to free it...")
            for pid in pids:
                if pid:
                    try:
                        os.kill(int(pid), signal.SIGKILL)
                        logger.info(f"Killed process {pid} on port {port}")
                    except ProcessLookupError:
                        pass
            time.sleep(1) # Wait for OS to release port
        else:
            logger.debug(f"Port {port} is free.")

    except Exception as e:
        logger.warning(f"Failed to auto-free port {port}: {e}")



@logger.catch
def run(console_log_level: str):
    init_logger(console_log_level)
    logger.info(f"Open-LLM-VTuber, version v{get_version()}")

    atexit.register(WebSocketServer.clean_cache)

    # Load configurations from yaml file
    config: Config = validate_config(read_yaml("conf.yaml"))
    server_config = config.system_config

    # Auto-free port if in use
    free_port(server_config.port)

    if server_config.enable_proxy:
        logger.info("Proxy mode enabled - /proxy-ws endpoint will be available")

    # Initialize the WebSocket server (synchronous part)
    server = WebSocketServer(config=config)

    # Perform asynchronous initialization (loading context, etc.)
    logger.info("Initializing server context...")
    try:
        asyncio.run(server.initialize())
        logger.info("Server context initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize server context: {e}")
        sys.exit(1)  # Exit if initialization fails

    # Run the Uvicorn server
    logger.info(f"Starting server on {server_config.host}:{server_config.port}")
    uvicorn.run(
        app=server.app,
        host=server_config.host,
        port=server_config.port,
        log_level=console_log_level.lower(),
    )


if __name__ == "__main__":
    args = parse_args()
    console_log_level = "DEBUG" if args.verbose else "INFO"
    if args.verbose:
        logger.info("Running in verbose mode")
    else:
        logger.info(
            "Running in standard mode. For detailed debug logs, use: uv run run_server.py --verbose"
        )
    if args.hf_mirror:
        os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
    run(console_log_level=console_log_level)
