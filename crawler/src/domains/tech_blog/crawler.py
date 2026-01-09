import asyncio
import time
from datetime import datetime
import feedparser
from supabase import create_client, Client
import requests

from src.core.config import RSS_FEEDS, SUPABASE_URL, SUPABASE_KEY, TAG_REQUEST_DELAY_MS
from src.core.database import normalize_url, normalize_title, create_summary, extract_thumbnail
from src.infra.tagger import generate_tags_for_article, base_tags_from_feed_category

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_existing_data():
    print("📋 Checking existing data...")
    url_set = set()
    author_title_map = {}

    all_data = []
    has_more = True
    offset = 0
    page_size = 1000

    try:
        while has_more:
            response = supabase.table("blogs").select("external_url, title, author, published_at").range(offset, offset + page_size - 1).execute()
            data = response.data

            if data:
                all_data.extend(data)
                print(f"   Loaded: {len(all_data)} articles")
                if len(data) < page_size:
                    has_more = False
                else:
                    offset += page_size
            else:
                has_more = False

        print(f"✅ Loaded total {len(all_data)} articles")

        for item in all_data:
            # Normalized URL
            if item.get("external_url"):
                url_set.add(normalize_url(item["external_url"]))

            # Author + Title map
            if item.get("title") and item.get("author"):
                key = f"{item['author']}:{item['title']}"
                author_title_map[key] = item

        return url_set, author_title_map
    except Exception as e:
        print(f"❌ Error fetching existing data: {e}")
        return set(), {}

def is_duplicate(article, url_set, author_title_map):
    # 1. URL Check
    if article["external_url"] in url_set:
        return True, "URL duplicate"

    # 2. Author + Title Check
    key = f"{article['author']}:{article['title']}"
    if key in author_title_map:
        return True, "Author+Title duplicate"

    return False, None

def parse_feed(feed_config):
    print(f"📡 Parsing feed: {feed_config['name']}...")
    try:
        # Use requests to get content first to handle headers often required
        headers = {
             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(feed_config['url'], headers=headers, timeout=20)
        resp.raise_for_status()

        feed = feedparser.parse(resp.content)
        articles = []

        for entry in feed.entries:
            if not getattr(entry, "link", None):
                continue

            normalized_url = normalize_url(entry.link)

            # PubDate
            pub_date = datetime.now()
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                 pub_date = datetime(*entry.published_parsed[:6])
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                 pub_date = datetime(*entry.updated_parsed[:6])

            # Summary
            summary = create_summary(
                entry.get("content", [{"value": ""}])[0]["value"] if "content" in entry else entry.get("summary", ""),
                feed_config,
                entry
            )

            # Thumbnail
            thumbnail_url = extract_thumbnail(entry, feed_config)

            article = {
                "title": (entry.get("title") or "No Title").strip(),
                "summary": summary,
                "author": feed_config["name"],
                "external_url": normalized_url,
                "published_at": pub_date.isoformat(),
                "thumbnail_url": thumbnail_url,
                "blog_type": feed_config["type"],
                "category": feed_config.get("category"),
                "tags": base_tags_from_feed_category(feed_config.get("category"))
            }
            articles.append(article)

        print(f"✅ {feed_config['name']}: Parsed {len(articles)} articles")
        return articles
    except Exception as e:
        print(f"❌ Failed to parse {feed_config['name']}: {e}")
        return []

def insert_articles(articles, url_set, author_title_map, feed_name):
    if not articles:
        return 0, 0

    new_articles = []
    duplicate_count = 0

    for article in articles:
        is_dup, reason = is_duplicate(article, url_set, author_title_map)
        if is_dup:
            duplicate_count += 1
            # print(f"   Duplicate ({reason}): {article['title'][:30]}...")
        else:
            # Generate AI Tags if needed
            if not article["tags"]:
                ai_tags = generate_tags_for_article(article)
                if ai_tags:
                    article["tags"] = list(set(article["tags"] + ai_tags))[:8]

                # Rate Limiting for AI API
                if TAG_REQUEST_DELAY_MS > 0:
                     time.sleep(TAG_REQUEST_DELAY_MS / 1000.0)

            new_articles.append(article)

            # Update memory immediately
            url_set.add(article["external_url"])
            key = f"{article['author']}:{article['title']}"
            author_title_map[key] = article

            # Progress Log
            print(f"   👉 [{len(new_articles)}] Tagged & Ready: {article['title'][:40]}...")

    if not new_articles:
        print(f"📝 [{feed_name}] All {duplicate_count} articles are duplicates.")
        return 0, duplicate_count

    try:
        # Insert into Supabase
        response = supabase.table("blogs").insert(new_articles).execute()
        # In supabase-py v2, insert returns response object. response.data is the list of inserted rows.
        inserted_count = len(response.data) if response.data else len(new_articles)

        print(f"✅ [{feed_name}] Inserted {inserted_count} new articles ({duplicate_count} duplicates)")
        return inserted_count, duplicate_count
    except Exception as e:
        print(f"❌ [{feed_name}] DB Insert failed: {e}")
        return 0, duplicate_count

def run_tech_blog_crawler():
    print(f"📊 Starting crawl for {len(RSS_FEEDS)} feeds...")

    url_set, author_title_map = get_existing_data()
    print(f"📊 Existing articles: {len(url_set)}")

    total_new = 0
    total_dup = 0
    total_processed = 0

    for feed in RSS_FEEDS:
        articles = parse_feed(feed)
        inserted, duplicates = insert_articles(articles, url_set, author_title_map, feed["name"])

        total_new += inserted
        total_dup += duplicates
        total_processed += len(articles)

        time.sleep(1) # Interval between feeds

    print("\n🎉 RSS Crawling Completed!")
    print(f"📊 Total processed: {total_processed}")
    print(f"✨ Newly saved: {total_new}")
    print(f"🔄 Duplicates found: {total_dup}")
    if total_processed > 0:
        print(f"📈 Deduplication rate: {(total_dup / total_processed * 100):.1f}%")


