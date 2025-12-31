import os
import time
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from src.core.config import GEMINI_API_KEY, TAG_RETRY_BASE_MS

ALLOWED_TAGS = [
    # Frontend
    "frontend", "react", "nextjs", "javascript", "typescript", "css", "web", "ui/ux", "design",
    # Backend
    "backend", "nodejs", "nestjs", "spring", "java", "python", "go", "api", "database",
    # AI
    "ai", "ai-ml", "llm", "genai", "mlops", "nlp", "cv",
    # DevOps
    "devops", "kubernetes", "docker", "terraform", "monitoring", "logging", "sre", "cloud", "cicd",
    # Architecture
    "architecture", "scalability", "micro frontend", "monorepo", "module federation", "system design",
    # Else
    "career", "culture", "business", "product", "ad", "case-study",
]

def merge_and_dedupe(tags):
    normalized = []
    for tag in tags:
        if tag:
            normalized_tag = str(tag).lower().strip()
            if normalized_tag:
                normalized.append(normalized_tag)
    return list(dict.fromkeys(normalized))

def parse_tags_from_text(text):
    if not text:
        return []
    text = text.replace("[", "").replace("]", "")
    parts = [p.strip().lower() for p in text.replace("\n", ",").split(",") if p.strip()]
    return merge_and_dedupe(parts)

def build_prompt(title, summary="", author=""):
    allowed = ", ".join(ALLOWED_TAGS)
    return f"""
You are a concise tagger for a tech blog aggregator.
Article:
- Title: {title}
- Author/Blog: {author}
- Summary: {summary}

Task: Choose 3-6 tags that best describe the article from the allowed list.
Allowed List: {allowed}

Output Format: Comma-separated list only. No extra text.
""".strip()

def generate_with_gemini(prompt, retry_count=0):
    if not GEMINI_API_KEY:
        print("⚠️ GEMINI_API_KEY is missing via config.")
        return ""

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(
            prompt,
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
        )
        return response.text
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            if retry_count < 3:
                wait_time = (2 ** retry_count) * TAG_RETRY_BASE_MS / 1000.0
                print(f"⏳ Rate Limit hit. Retrying in {wait_time}s... (Attempt {retry_count + 1}/3)")
                time.sleep(wait_time)
                return generate_with_gemini(prompt, retry_count + 1)
            else:
                print(f"❌ Max retries exceeded for Gemini: {error_msg}")
        else:
            print(f"❌ Gemini request failed: {e}")
        return ""


def generate_tags_fallback(title, summary, author):
    """
    Simple keyword matching fallback when AI API fails.
    """
    combined_text = (title + " " + summary).lower()
    found_tags = []

    keyword_map = {
        "react": "react", "next": "nextjs", "vue": "frontend", "angular": "frontend",
        "javascript": "javascript", "typescript": "typescript", "css": "css",
        "spring": "spring", "java": "java", "node": "nodejs", "express": "nodejs",
        "nest": "nestjs", "python": "python", "django": "python", "fastapi": "python",
        "go": "go", "golang": "go", "rust": "backend",
        "aws": "cloud", "azure": "cloud", "gcp": "cloud", "docker": "docker", "k8s": "kubernetes",
        "kubernetes": "kubernetes", "ci/cd": "cicd", "jenkins": "cicd", "github actions": "cicd",
        "ai": "ai", "llm": "llm", "gpt": "genai", "machine learning": "ai-ml",
        "design": "design", "ux": "ui/ux", "ui": "ui/ux",
        "career": "career", "interview": "career", "salary": "career",
        "startup": "business", "agile": "culture", "scrum": "culture"
    }

    for keyword, tag in keyword_map.items():
        if keyword in combined_text:
            found_tags.append(tag)

    return merge_and_dedupe(found_tags)[:5]

def generate_tags_for_article(article):
    """
    article dict must contain: title, summary, author
    """
    if not GEMINI_API_KEY:
        print("⚠️ GEMINI_API_KEY missing - using fallback.")
        return generate_tags_fallback(article.get("title", ""), article.get("summary", ""), article.get("author", ""))

    try:
        prompt = build_prompt(
            title=article.get("title", ""),
            summary=article.get("summary", ""),
            author=article.get("author", "")
        )

        text = generate_with_gemini(prompt)
        # If API returns empty (max retries or error), use fallback
        if not text:
            print("⚠️ API failed/empty - using fallback tags.")
            return generate_tags_fallback(article.get("title", ""), article.get("summary", ""), article.get("author", ""))

        parsed_tags = parse_tags_from_text(text)
        filtered = [tag for tag in parsed_tags if tag in ALLOWED_TAGS]
        result = merge_and_dedupe(filtered)[:6]

        # If AI result is empty after filtering, try fallback just in case
        if not result:
             return generate_tags_fallback(article.get("title", ""), article.get("summary", ""), article.get("author", ""))

        return result
    except Exception as e:
        print(f"❌ Error generating tags: {e}")
        return []

def base_tags_from_feed_category(category):
    if not category:
        return []
    key = str(category).upper()
    if key == "FE":
        return ["frontend", "web"]
    elif key == "BE":
        return ["backend"]
    elif key == "AI":
        return ["ai"]
    elif key == "APP":
        return ["mobile"]
    return []
