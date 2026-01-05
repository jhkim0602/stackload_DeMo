# 📄 StackLoad: The Ultimate Developer Growth Platform
## Final Project Specification

**문서 개요**: 본 문서는 **StackLoad** 프로젝트의 모든 기획 의도와 기술적 구현 방안을 제3자가 봐도 완벽히 이해할 수 있도록 상세화한 최종 명세서입니다. 기존에 논의된 기능(블로그, 인터뷰, 커뮤니티, 로드맵 등)만을 포함하며, 각 기능이 사용자에게 어떤 가치를 제공하고 기술적으로 어떻게 동작하는지 구체적으로 기술합니다.

---

## 1. 프로젝트 정체성 (Identity)

### **What is StackLoad?**
StackLoad는 파편화된 개발자 성장의 도구들을 하나로 통합한 **'Super App'**입니다.
단순히 정보를 나열하는 것을 넘어, **AI와의 실시간 상호작용**을 통해 개발자가 능동적으로 학습하고, 자신의 실력을 객관적으로 검증하며, 커리어의 다음 단계로 도약하도록 돕습니다.

### **Core Philosophy**
1.  **Hyper-Realism (초실감)**: 텍스트 기반의 학습을 넘어, **Live2D 아바타**와 **초저지연 음성 대화**를 통해 실제 사람과 대화하는 듯한 몰입감을 제공합니다.
2.  **Data-Driven Growth (데이터 기반 성장)**: 막연한 조언 대신, 내 이력서와 JD(채용공고) 간의 **매칭 점수(Match/Gap Points)**를 분석하여 구체적인 행동 지침을 제시합니다.
3.  **Visual Intelligence (시각적 지능)**: 복잡한 자료구조와 알고리즘을 **3D 시각화**로 풀어나가며 직관적인 이해를 돕습니다.

---

## 2. 상세 기능 명세 (Detailed Feature Specifications)

### 🌟 Zone 1: Career Intelligence (커리어 전략 센터)
**"나의 현재 위치를 파악하고, 갈 곳을 정한다."**

#### **1. Smart JD Analyzer (지능형 공고 분석기)**
*   **기능 설명**: 사용자가 목표 기업의 채용 공고(JD) URL이나 텍스트를 입력하면, AI가 이를 분석하여 핵심 정보를 구조화합니다.
*   **세부 구현**:
    *   **Culture Scanner**: 기업의 인재상, 복지, 워라밸 분위기를 3줄 요약.
    *   **Tech Stack Extractor**: JD에 명시된 기술 스택을 '필수(Must-have)'와 '우대(Nice-to-have)'로 자동 분류.
    *   **Resume Gap Analysis**: 사용자의 이력서와 JD를 1:1로 대조하여 **"현재 85% 일치합니다. 부족한 15%는 'Docker 경험'입니다."**와 같이 구체적인 부족 역량을 명시.

#### **2. Certification Roadmap (자격증 로드맵)**
*   **기능 설명**: 직무별(Backend, Frontend, DevOps 등) 필수 자격증과 학습 경로를 시각화된 로드맵으로 제공합니다.
*   **세부 구현**:
    *   **Interactive Path**: 노드 형태로 연결된 자격증 트리를 클릭하면 상세 정보(시험 일정, 난이도, 추천 학습 자료)가 모달로 표시됨.

---

### 🌟 Zone 2: AI Interview Lab (실전 모의 면접)
**"면접관의 표정까지 읽어내는 실전 트레이닝"**

#### **1. TechMoa (버추얼 AI 면접관)**
*   **페르소나 시스템 (Multi-Persona)**:
    *   **따뜻한 멘토형 (Warm)**: "이 부분은 다시 한번 설명해주시겠어요?"라며 부드럽게 유도.
    *   **압박 면접관형 (Pressure)**: "그 기술은 레거시 아닌가요? 왜 선택했죠?"라며 꼬리 물기 질문 시전.
*   **기술적 구현**:
    *   **Gemini 2.5 Flash Native Audio**: STT(음성인식) -> LLM -> TTS(음성합성) 과정을 거치지 않고, 오디오를 직접 모델에 입력하여 **500ms 미만의 압도적인 반응 속도** 구현 (사람 간 대화와 동일).
    *   **Live2D Visualization**: 음성의 톤과 감정에 따라 아바타의 눈, 입, 고개 움직임이 동기화되어 실제 눈을 맞추고 대화하는 느낌 전달.

#### **2. Interview Modes (면접 모드)**
*   **Dashboard-Style Entry**: 선형적 진행이 아닌, 대시보드에서 원하는 훈련 모드를 선택.
*   **Job Analysis Mode**: "이 JD에서는 어떤 질문이 나올까요?"라고 물으면 예상 질문 리스트를 뽑아주고 답변 전략을 같이 수립.
*   **Video Interview Mode**: 실제 화상 면접처럼 캠/마이크를 켜고 진행. 화면 공유 기능을 통해 **Whiteboard/Code Editor**를 띄우고 라이브 코딩 테스트 진행 가능.

#### **3. Review & Feedback (심층 분석 보고서)**
*   **Non-verbal Feedback**: "질문 3번에서 당황하여 목소리가 떨리고 시선이 불안정했습니다." (음성 데시벨 및 표정 분석)
*   **Technical Accuracy**: 답변의 기술적 정확도를 S/A/B/C 등급으로 매기고, 모범 답안 제시.

---

### 🌟 Zone 3: Tech Intelligence (기술 지식 허브)
**"매일 아침, 나에게 필요한 기술 뉴스만 떠먹여 주는 비서"**

#### **1. Tech Blog Aggregator (블로그 통합 수집)**
*   **기능 설명**: 네이버 D2, 카카오 기술 블로그, 토스 피드 등 국내외 유명 기술 블로그를 한곳에서 모아봅니다.
*   **Smart Features**:
    *   **AI 3-Line Summary**: 긴 글을 다 읽을 시간이 없는 개발자를 위해 Gemini가 핵심 내용만 3줄로 요약.
    *   **Personalized Feed**: 내가 'React'와 'Redis'에 관심 있다고 설정하면, 관련 글이 최상단에 노출.

#### **2. Stack Discussion (기술 토론 커뮤니티)**
*   **기능 설명**: 트위터의 가벼움과 스택오버플로우의 전문성을 결합.
*   **세부 구현**: 특정 기술 주제(예: "Next.js vs Remix")에 대해 투표하고 짧은 의견을 남기는 스레드형 커뮤니티.

#### **3. 3D Algo-Viz (3D 알고리즘 시각화)**
*   **기능 설명**: 추상적인 CS 지식을 시각적으로 체득.
*   **구현 예시**: 이진 탐색 트리(BST)가 회전하고 균형을 맞추는 과정을 **Three.js** 기반의 3D 그래픽으로 시뮬레이션. 사용자가 직접 노드를 추가/삭제하며 동작 원리 학습.

---

## 3. 사용자 경험 시나리오 (User Journey Scenario)

> **Scenario: 3년차 백엔드 개발자 A씨의 이직 준비**

1.  **09:00 AM (출근길)**: StackLoad 앱을 켜고 **[Tech Intelligence]** 탭에서 밤사이 올라온 'Netflix 기술 블로그' 글을 AI 요약으로 1분 만에 파악.
2.  **12:00 PM (점심시간)**: **[Stack Discussion]**에 올라온 "MSA 도입 찬반" 투표에 참여하고 짧은 댓글 작성.
3.  **20:00 PM (퇴근 후)**: 본격적인 이직 준비 시작. **[Job Analysis]**에 '쿠팡 백엔드 개발자' JD 링크를 입력.
4.  **20:05 PM**: AI가 "회원님은 Java 경험은 충분하지만, Kafka 경험이 JD 요구사항보다 부족합니다"라고 분석(**Gap Analysis**).
5.  **20:10 PM**: 부족한 부분을 채우기 위해 **[AI Interview Lab]** 입장. '압박 면접관' 페르소나를 선택하여 Kafka 관련 꼬리 물기 질문을 집중적으로 훈련.
6.  **20:40 PM**: 면접 종료 후 **[Feedback Report]**를 통해 "Kafka 파티셔닝 설명 시 자신감이 부족했음"을 확인하고 모범 답안 학습.

---

## 4. 기술 스택 선정 이유 (Technical Justification)

| 구분 | 기술 스택 | 선정 이유 |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15 (App Router)** | 최신 React 기능 활용 및 압도적인 SEO/초기 로딩 속도 확보. |
| **UI/UX** | **Shadcn/ui + Tailwind** | 유려하고 모던한 'Glassmorphism' 디자인을 가장 빠르고 일관되게 구현 가능. |
| **Realtime AI** | **Gemini 2.5 Flash** | 기존 STT/TTS 파이프라인의 2-3초 지연 시간을 **0.5초**로 단축하여 실시간 대화 가능. |
| **Avatar** | **Live2D + Pixi.js** | 3D 모델 대비 가볍으면서도, 웹 브라우저에서 높은 프레임의 부드러운 애니메이션 구현. |
| **Visualization**| **Three.js (R3F)** | 자료구조의 입체적/공간적 이해를 돕기 위한 최적의 3D 라이브러리. |
| **Backend** | **Python (FastAPI)** | AI 에이전트 로직(LiveKit Agents)과의 통합이 가장 용이하고 비동기 처리에 강점. |
| **Database** | **Supabase** | RDB(데이터 저장)와 Vector DB(RAG 검색)를 하나로 해결하며 실시간 구독 기능 제공. |

