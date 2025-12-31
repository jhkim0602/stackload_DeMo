import asyncio
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

scheduler = AsyncIOScheduler()

from src.domains.tech_blog.crawler import run_tech_blog_crawler

async def crawl_job():
    logger.info("Starting scheduled crawl job...")
    run_tech_blog_crawler()
    logger.info("Crawl job finished.")

async def main():
    logger.info("Starting StackLoad Crawler Service...")

    # Add jobs
    scheduler.add_job(crawl_job, 'interval', hours=6, id='regular_crawl')

    # Run once immediately on startup for verification
    logger.info("Triggering initial crawl...")
    asyncio.create_task(crawl_job())

    scheduler.start()

    try:
        # Keep the event loop running
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        pass

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
