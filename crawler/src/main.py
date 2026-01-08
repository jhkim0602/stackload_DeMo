import sys
import argparse
import asyncio
from loguru import logger
from dotenv import load_dotenv

# Import crawlers
from src.apps.tech_blog.crawler import run_tech_blog_crawler
from src.apps.job_post.crawler import crawl_job_description
from src.apps.dev_event.service import run_dev_event_crawler

load_dotenv()

def main():
    parser = argparse.ArgumentParser(description="StackLoad Unified Crawler CLI")

    subparsers = parser.add_subparsers(dest="target", help="Target crawler to run")

    # Tech Blog
    subparsers.add_parser("tech_blog", help="Run Tech Blog Crawler (RSS)")

    # Job Post (JD)
    jd_parser = subparsers.add_parser("job_post", help="Run Job Description Crawler")
    jd_parser.add_argument("url", help="URL of the Job Description")

    # Dev Event
    subparsers.add_parser("dev_event", help="Run Dev-Event (GitHub) Crawler")

    args = parser.parse_args()

    if args.target == "tech_blog":
        # Tech Blog crawler was async but wrapped in sync function run_tech_blog_crawler?
        # Let's check: run_tech_blog_crawler is sync defined in crawler.py (it calls time.sleep)
        try:
            run_tech_blog_crawler()
        except KeyboardInterrupt:
            pass

    elif args.target == "job_post":
        result = crawl_job_description(args.url)
        print(result)

    elif args.target == "dev_event":
        run_dev_event_crawler()

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
