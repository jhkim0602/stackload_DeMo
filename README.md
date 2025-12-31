# StackLoad Demo 🚀

**StackLoad**는 기술 블로그 어그리게이터와 AI VTuber 인터랙션 기술을 결합한 통합 데모 프로젝트입니다. 개발자들을 위한 최신 기술 트렌드 수집과 실시간 AI 음성 대화 환경을 제공합니다.

---

## 🏗 프로젝트 구조

프로젝트는 세 개의 주요 모듈로 구성된 모노레포 구조입니다:

- **`web/`**: Next.js 기반의 프론트엔드 및 대시보드. 기술 블로그 목록 확인 및 AI 인터뷰/채팅 UI를 제공합니다.
- **`ai/`**: LiveKit Agents와 Gemini Multimodal 모델을 활용한 AI 백엔드. 실시간 캐릭터 대화 및 인터랙션을 담당합니다.
- **`crawler/`**: Python 기반의 RSS 크롤러. 국내외 주요 기술 블로그의 최신 포스트를 자동으로 수집하여 데이터베이스에 저장합니다.

---

## 🛠 기술 스택

### Web (Frontend)
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State/Data**: Supabase, LiveKit Client
- **Deployment**: Vercel

### AI Agent (Backend)
- **Model**: Gemini 2.0 Flash (Multimodal)
- **Framework**: LiveKit Agents, Python 3.10+
- **Communication**: WebSockets, Real-time Audio/Video

### Crawler
- **Language**: Python
- **Libraries**: BeautifulSoup4, Feedparser, Google Generative AI (Tagging)
- **Database**: Supabase

---

## 🚀 시작하기

### 1. 환경 변수 설정
각 디렉토리(`. /ai`, `./web`, `./crawler`)에 있는 `.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 API Key를 설정하세요.
- Gemini API Key
- Supabase URL & Service Role Key
- LiveKit API Key & Secret

### 2. 실행 방법

#### Web
```bash
cd web
pnpm install
pnpm dev
```

#### AI Agent
```bash
cd ai
uv sync
uv run run_server.py
```

#### Crawler
```bash
cd crawler
uv sync
uv run main.py
```

---

## 📝 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.
