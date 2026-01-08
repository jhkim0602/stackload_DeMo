import re
import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import time

def strip_html(html_content):
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "lxml")
    return soup.get_text(separator=" ").strip()

def normalize_url(url):
    try:
        parsed = urlparse(url)
        # Parameters to remove
        params_to_remove = [
            "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
            "fbclid", "gclid", "fromRss", "trackingCode", "source", "rss"
        ]

        # Reconstruct query params
        query_params = []
        if parsed.query:
            pairs = parsed.query.split("&")
            for pair in pairs:
                key = pair.split("=")[0]
                if key not in params_to_remove:
                    query_params.append(pair)

        new_query = "&".join(query_params)

        # Remove trailing slash from path if it's not root
        path = parsed.path
        if path.endswith("/") and path != "/":
            path = path[:-1]

        return f"{parsed.scheme}://{parsed.netloc}{path}{'?' + new_query if new_query else ''}"
    except Exception:
        return url

def normalize_title(title):
    if not title:
        return ""
    # Normalize duplicate whitespace but keep special chars
    return re.sub(r'\s+', ' ', title).strip().lower()

def create_summary(content, feed_config=None, entry=None):
    # Medium logic if needed (simplified from JS)
    if feed_config and "medium.com" in feed_config.get("url", ""):
        # Try to find specific description in content
        # For python, just use simple strip_html and truncate
        pass

    cleaned = strip_html(content)
    if len(cleaned) > 200:
        return cleaned[:200] + "..."
    return cleaned

def fetch_thumbnail_from_web(url, blog_name="Web"):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"❌ [{blog_name} Thumbnail] HTTP Error {response.status_code}: {url}")
            return None

        soup = BeautifulSoup(response.content, "lxml")

        # og:image
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            print(f"✅ [{blog_name} Thumbnail] Extracted from Web: {og_image['content']}")
            return og_image["content"]

        # twitter:image
        twitter_image = soup.find("meta", name="twitter:image")
        if twitter_image and twitter_image.get("content"):
             print(f"✅ [{blog_name} Thumbnail] Extracted from Twitter Meta: {twitter_image['content']}")
             return twitter_image["content"]

        print(f"❌ [{blog_name} Thumbnail] No meta image found: {url}")
        return None
    except Exception as e:
        print(f"❌ [{blog_name} Thumbnail] Web fetch failed: {e}")
        return None

def extract_thumbnail(entry, feed_config=None):
    # Web Scraping Blogs list
    web_scraping_domains = [
        "toss.tech", "oliveyoung.tech", "tech.kakao.com", "tech.kakaopay.com",
        "techblog.woowahan.com", "blog.banksalad.com", "tech.devsisters.com",
        "d2.naver.com", "techblog.lycorp.co.jp"
    ]

    link = entry.get("link", "")

    # Check if scraping is needed
    for domain in web_scraping_domains:
        if domain in link:
            blog_name = feed_config.get("name", "Unknown") if feed_config else "Unknown"
            print(f"🔍 [{blog_name} Thumbnail] Attempting web scraping: {link}")
            thumb = fetch_thumbnail_from_web(link, blog_name)
            if thumb:
                return thumb
            break

    # 1. Enclosure
    if "enclosures" in entry:
        for enclosure in entry.enclosures:
            if enclosure.get("type", "").startswith("image/"):
                return enclosure.get("href")

    # 2. Media Content
    if "media_content" in entry:
        # feedparser puts media:content in media_content list
        for media in entry.media_content:
             if "url" in media:
                 return media["url"]

    # 3. Media Thumbnail
    if "media_thumbnail" in entry:
        # feedparser puts media:thumbnail in media_thumbnail list
        if len(entry.media_thumbnail) > 0:
            return entry.media_thumbnail[0].get("url")

    # 4. Content Image Extraction
    content = ""
    if "content" in entry and len(entry.content) > 0:
        content = entry.content[0].value
    elif "summary" in entry:
        content = entry.summary
    elif "description" in entry:
        content = entry.description

    soup = BeautifulSoup(content, "lxml")

    # Special Logics (Naver, Tistory, Velog)
    if "blog.naver.com" in link:
        # Naver specific patterns could be handled by generic img search often, but let's emulate provided logic if strictly needed
        # Python's soup.find_all('img') is easier
        pass

    imgs = soup.find_all("img")
    for img in imgs:
        src = img.get("src") or img.get("data-src")
        if not src:
            continue

        if src.startswith("data:"):
            continue

        # Convert relative to absolute
        if not src.startswith("http"):
             src = urljoin(link, src)

        # Naver specific clean up
        if "blog.naver.com" in link:
            src = src.split("?")[0]

        return src

    return None
