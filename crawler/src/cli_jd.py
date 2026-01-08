import sys
import argparse
from src.apps.job_post.crawler import crawl_job_description

def main():
    parser = argparse.ArgumentParser(description="StackLoad JD Crawler CLI")
    parser.add_argument("url", help="Job Description URL to crawl")
    args = parser.parse_args()

    # Print only the result text to stdout so caller can capture it
    # We suppress logs or stderr if needed, but loguru logs to stderr by default usually
    result = crawl_job_description(args.url)
    print(result)

if __name__ == "__main__":
    main()
