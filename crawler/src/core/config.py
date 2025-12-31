import os
from dotenv import load_dotenv

# Load environment variables from the root .env file
# Assuming the script is run from the project root or techmoa directory
# Adjust path as necessary to find the root .env
load_dotenv(dotenv_path="../.env")
load_dotenv(dotenv_path=".env") # Fallback if run from root/techmoa/

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TAG_REQUEST_DELAY_MS = int(os.getenv("TAG_REQUEST_DELAY_MS", "1000"))
TAG_RETRY_BASE_MS = int(os.getenv("TAG_RETRY_BASE_MS", "5000"))

# Validation
if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Supabase URL or Service Role Key is missing.")
    # In a real app we might raise an error, but let's just print for now as in the JS script

RSS_FEEDS = [
    {"name": "토스", "url": "https://toss.tech/rss.xml", "type": "company"},
    {
        "name": "당근",
        "url": "https://medium.com/feed/daangn",
        "type": "company",
    },
    {
        "name": "카카오",
        "url": "https://tech.kakao.com/feed/",
        "type": "company",
    },
    {
        "name": "카카오페이",
        "url": "https://tech.kakaopay.com/rss",
        "type": "company",
    },
    {
        "name": "무신사",
        "url": "https://medium.com/feed/musinsa-tech",
        "type": "company",
    },
    {"name": "29CM", "url": "https://medium.com/feed/29cm", "type": "company"},
    {
        "name": "올리브영",
        "url": "https://oliveyoung.tech/rss.xml",
        "type": "company",
    },
    {
        "name": "우아한형제들",
        "url": "https://techblog.woowahan.com/feed/",
        "type": "company",
    },
    {"name": "네이버", "url": "https://d2.naver.com/d2.atom", "type": "company"},
    {
        "name": "라인",
        "url": "https://techblog.lycorp.co.jp/ko/feed/index.xml",
        "type": "company",
    },
    {
        "name": "마켓컬리",
        "url": "https://helloworld.kurly.com/feed.xml",
        "type": "company",
    },
    {
        "name": "에잇퍼센트",
        "url": "https://8percent.github.io/feed.xml",
        "type": "company",
    },
    {
        "name": "쏘카",
        "url": "https://tech.socarcorp.kr/feed",
        "type": "company",
    },
    {
        "name": "하이퍼커넥트",
        "url": "https://hyperconnect.github.io/feed.xml",
        "type": "company",
    },
    {
        "name": "데브시스터즈",
        "url": "https://tech.devsisters.com/rss.xml",
        "type": "company",
    },
    {
        "name": "뱅크샐러드",
        "url": "https://blog.banksalad.com/rss.xml",
        "type": "company",
    },
    {"name": "왓챠", "url": "https://medium.com/feed/watcha", "type": "company"},
    {
        "name": "다나와",
        "url": "https://danawalab.github.io/feed.xml",
        "type": "company",
    },
    {
        "name": "레브잇",
        "url": "https://medium.com/feed/%EB%A0%88%EB%B8%8C%EC%9E%87-%ED%85%8C%ED%81%AC%EB%B8%94%EB%A1%9C%EA%B7%B8",
        "type": "company",
    },
    {
        "name": "요기요",
        "url": "https://medium.com/feed/deliverytechkorea",
        "type": "company",
    },
    {
        "name": "쿠팡",
        "url": "https://medium.com/feed/coupang-tech",
        "type": "company",
    },
    {
        "name": "원티드",
        "url": "https://medium.com/feed/wantedjobs",
        "type": "company",
    },
    {
        "name": "데이블",
        "url": "https://teamdable.github.io/techblog/feed.xml",
        "type": "company",
    },
    {
        "name": "사람인",
        "url": "https://saramin.github.io/feed.xml",
        "type": "company",
    },
    {"name": "직방", "url": "https://medium.com/feed/zigbang", "type": "company"},
    {
        "name": "콴다",
        "url": "https://medium.com/feed/mathpresso/tagged/frontend",
        "type": "company",
    },
    {
        "name": "AB180",
        "url": "https://raw.githubusercontent.com/ab180/engineering-blog-rss-scheduler/main/rss.xml",
        "type": "company",
    },
    # 개인 블로그 - FE
    {
        "name": "문동욱",
        "url": "https://evan-moon.github.io/feed.xml",
        "type": "personal",
        "category": "FE",
    },
    {
        "name": "손수림",
        "url": "https://api.velog.io/rss/@surim014",
        "type": "personal",
        "category": "FE",
    },
    {
        "name": "스벨트전도사",
        "url": "https://api.velog.io/rss/@k-svelte-master",
        "type": "personal",
        "category": "FE",
    },
    {
        "name": "우혁",
        "url": "https://api.velog.io/rss/@woogur29",
        "type": "personal",
        "category": "FE",
    },
    {
        "name": "정현수",
        "url": "https://junghyeonsu.com/rss.xml",
        "type": "personal",
        "category": "FE",
    },
    {
        "name": "테오",
        "url": "https://api.velog.io/rss/@teo",
        "type": "personal",
        "category": "FE",
    },
    {
        "name": "황준일",
        "url": "https://junilhwang.github.io/TIL/rss.xml",
        "type": "personal",
        "category": "FE",
    },
    # 개인 블로그 - BE
    {
        "name": "향로",
        "url": "https://jojoldu.tistory.com/rss",
        "type": "personal",
        "category": "BE",
    },
    {
        "name": "망나니개발자",
        "url": "https://mangkyu.tistory.com/rss",
        "type": "personal",
        "category": "BE",
    },
    # 개인 블로그 - AI
    {
        "name": "멍개",
        "url": "https://rss.blog.naver.com/pjt3591oo.xml",
        "type": "personal",
        "category": "AI",
    },
    # 개인 블로그 - APP
    {
        "name": "심야",
        "url": "https://api.velog.io/rss/@ximya_hf",
        "type": "personal",
        "category": "APP",
    },
]
