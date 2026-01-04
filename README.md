# StackLoad Demo 🚀

**StackLoad**는 기술 블로그 어그리게이터와 AI VTuber 인터랙션 기술을 결합한 통합 데모 프로젝트입니다. 개발자들을 위한 최신 기술 트렌드 수집과 실시간 AI 음성 대화 환경을 제공합니다.

---

## 📂 프로젝트 구조 (Project Structure)

DDD(도메인 주도 설계) 원칙에 따라 리팩토링된 프로젝트 구조 명세서입니다.
새로운 기능을 추가하거나 코드를 수정할 때 이 문서를 참고하세요.

### 1. AI Backend (`ai/src/app`)

핵심 로직과 외부 의존성을 철저히 분리했습니다.

```
ai/src/app/
├── agents/                           # AI 에이전트 (Brain)
│   └── interviewer/                  # 면접관 페르소나 및 대화 로직
├── api/                              # 네트워크 계층
│   └── routers/
│       ├── system.py                 # 시스템 상태 확인용 라우터
│       └── websocket.py              # 실시간 면접용 WebSocket 핸들러
├── bootstrap/                        # 앱 구동 (Startup)
│   ├── main.py                       # 메인 진입점 (run_server)
│   ├── di.py                         # 의존성 주입 (ServiceContext)
│   └── server.py                     # FastAPI 앱 생성 팩토리
├── core/                             # 핵심 도메인 로직 (Business Logic)
│   ├── audio/                        # 오디오 처리 (STT, TTS, VAD)
│   ├── chat/                         # 대화 관리 (히스토리, 메시지 큐)
│   ├── config/                       # 설정 관리 (YAML 로더)
│   └── interview/                    # 면접 세션 상태 관리 (InterviewManager)
└── infra/                            # 인프라 계층 (External Services)
    └── proxy/                        # 외부 서비스 프록시 (LLM API 등)
```

#### 💡 Backend 개발 가이드: 코드를 어디에 넣을까?
*   **새로운 AI 기능/성격 추가**: `agents/` 폴더에 새 에이전트 폴더 생성.
*   **핵심 비즈니스 로직 수정**: `core/` 하위의 적절한 도메인을 찾아 수정. (예: 대화 저장 방식 변경 -> `core/chat`)
*   **외부 API 연동 (GPT, Claude 등)**: `infra/` 폴더에 구현. `core`는 `infra`에 직접 의존하지 않도록 주의.
*   **새로운 API 엔드포인트**: `api/routers/`에 파일 추가 후 `bootstrap/server.py`에 등록.

### 2. Web Frontend (`web/`)

기능(Feature) 단위로 컴포넌트를 응집시켰습니다.

```
web/components/features/              # 도메인별 기능 컴포넌트
├── interview/                        # [면접] 도메인
│   ├── room/                         # 화상 면접실 화면 (LiveKit, Avatar, Video)
│   │   ├── interview-livekit.tsx     # 메인 컨테이너
│   │   └── (user-video, control...)  # 하위 제어 요소
│   ├── result/                       # 결과 대시보드 화면
│   │   ├── feedback-report.tsx       # 리포트 메인
│   │   └── (charts, summary...)      # 분석 차트 및 요약
│   └── setup/                        # 입장 전 설정 화면
│       ├── job-url-input.tsx         # 채용공고 입력
│       └── mode-selection.tsx        # 면접 모드 선택
└── tech-blog/                        # [기술블로그] 도메인
```

#### 💡 Frontend 개발 가이드: 코드를 어디에 넣을까?
*   **새로운 페이지 기능 개발**: `web/components/features/` 아래에 새로운 폴더(도메인) 생성. (예: 마이페이지 -> `features/mypage`)
*   **면접 관련 UI 수정**: `features/interview/` 내부에서 `room`(진행중), `result`(결과), `setup`(설정) 중 성격에 맞는 곳 수정.
*   **여러 곳에서 쓰는 버튼/입력창**: `web/components/ui` (Shadcn UI) 또는 `web/components/shared` 활용.

### 3. Crawler (`crawler/src`)

수집 대상(Domain)과 수집 엔진(Core)을 분리했습니다.

```
crawler/src/
├── main.py                           # 크롤러 실행 진입점
├── core/                             # 크롤링 엔진 공통 로직
│   ├── config.py                     # 설정
│   └── database.py                   # DB 연결
├── domains/                          # 수집 대상별 로직
│   ├── job_post/                     # 채용 공고 (원티드, 점핏 등)
│   └── tech_blog/                    # 기술 블로그 (Velog, Tistory 등)
└── infra/                            # 외부 서비스 연동
    └── tagger.py                     # Gemini AI 자동 태깅 서비스
```

#### 💡 Crawler 개발 가이드: 코드를 어디에 넣을까?
*   **새로운 사이트 크롤러 추가**: `domains/` 아래에 새로운 폴더 생성 (예: `domains/youtube_script`).
*   **수집 데이터를 AI로 가공**: `infra/` 폴더에 AI 처리 로직 추가.
*   **DB 저장 로직 변경**: `core/database.py` 수정.

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
