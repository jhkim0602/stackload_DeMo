from .fetcher import fetch_readme
from .parser import parse_readme
from loguru import logger

def run_dev_event_crawler():
    logger.info("Starting Dev-Event Crawler...")
    try:
        content = fetch_readme()
        events = parse_readme(content)

        # Here we would normally save to DB using src.shared.database
        # For now, we will just print them as verification
        print(f"✅ Successfully parsed {len(events)} events.")
        for event in events[:5]:
            print(f"   - [{event.start_date}] {event.title} ({event.url})")

        return events
    except Exception as e:
        logger.error(f"Dev-Event Crawler failed: {e}")
        return []
