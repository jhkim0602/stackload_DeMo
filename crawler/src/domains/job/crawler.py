import requests
from bs4 import BeautifulSoup
from loguru import logger

def crawl_job_description(url: str) -> str:
    """
    Crawls a job description URL and extracts the main text content.
    Simple heuristic-based extraction.
    """
    logger.info(f"🕸️ Crawling JD URL: {url}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()

        # Get text
        text = soup.get_text(separator='\n')

        # Clean up lines
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        # Limit length to avoid token limits if it grabs too much garbage
        if len(text) > 10000:
            text = text[:10000] + "...(truncated)"

        logger.info(f"✅ Extracted {len(text)} chars from JD")
        return text

    except Exception as e:
        logger.error(f"❌ Failed to crawl JD: {e}")
        return f"Error crawling URL: {e}"
