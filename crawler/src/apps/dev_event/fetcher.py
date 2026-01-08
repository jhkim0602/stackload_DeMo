import requests
from loguru import logger

GITHUB_RAW_URL = "https://raw.githubusercontent.com/brave-people/Dev-Event/master/README.md"

def fetch_readme() -> str:
    logger.info(f"Fetching Dev-Event README from {GITHUB_RAW_URL}")
    try:
        response = requests.get(GITHUB_RAW_URL, timeout=15)
        response.raise_for_status()
        logger.info(f"Successfully fetched {len(response.text)} chars")
        return response.text
    except Exception as e:
        logger.error(f"Failed to fetch README: {e}")
        raise
