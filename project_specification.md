# 📄 StackLoad 프로젝트 기획 및 상세 명세서 (Project Specification)

**StackLoad**는 기술 블로그 어그레이게이터와 차세대 AI 인터랙션 기술을 결합하여, 개발자의 성장을 돕는 **'All-in-one 커리어 성장 플랫폼'**입니다.

---

## 1. 프로젝트 개요 (Overview)
- **목표**: 파편화된 기술 정보를 한곳에 모으고(Crawler), 이를 기반으로 자신의 실력을 검증하며(AI Interviewer), 커뮤니티를 통해 성장하는 생태계 구축.
- **핵심 가치**:
  - **Efficiency**: 최신 기술 트랜드를 놓치지 않는 효율적인 정보 수집.
  - **Interaction**: 정적인 텍스트가 아닌, AI 아바타와의 실시간 인터랙션.
  - **Practicality**: 실제 면접과 유사한 환경에서의 기술 피드백 제공.

---

## 2. 주요 기능 명세 (Feature Specifications)

### A. 기술 블로그 어그리게이터 (Tech Blog Aggregator)
- **[현재 구현]**
  - RSS 기반 국내외 주요 기술 블로그(네이버, 카카오, 토스 등) 크롤링.
  - Supabase DB 연동 및 게시글 자동 수집.
  - Gemini AI를 활용한 게시글 자동 태깅 및 카테고리 분류.
- **[구현 예정]**
  - **개인화 추천 알고리즘**: 유저의 관심 태그(예: React, Golang)에 기반한 맞춤형 게시글 피드.
  - **게시글 요약**: 긴 기술 아티클을 3줄 내외로 요약하여 바쁜 개발자들에게 신속한 정보 제공.
  - **북마크 및 컬렉션**: 나중에 다시 읽을 글들을 저장하고 폴더별로 관리.

### B. AI 인터뷰어 'TechMoa' (AI Virtual Interviewer)
- **[현재 구현]**
  - **LiveKit & Gemini Realtime**: 500ms 미만의 지연시간을 가진 실시간 음성 대화.
  - **Live2D 시각화**: `mao_pro` 모델을 통한 아바타 립싱크 및 감정 표현.
  - **기초 인터뷰 매니저**: JD(직무설명서)와 Resume(이력서)를 기반으로 한 시스템 프롬프트 생성.
- **[구현 예정]**
  - **심층 피드백 리포트**: 면접 종료 후 기술적 답변의 정확도, 의사소통 능력, 태도 등에 대한 AI 분석 결과 보고서 생성.
  - **화이트보드/코딩 테스트 연동**: 브라우저 내 코드 에디터를 공유하여 AI 인터뷰어가 실시간으로 코드를 리뷰하고 힌트를 주는 기능.
  - **감정 분석**: 유저의 음성 톤과 표정을 분석하여 자신감이 부족한 부분이나 당황한 지점을 체크.

### C. 대시보드 및 커뮤니티 (Dashboard & Community)
- **[현재 구현]**
  - 기술 블로그 목록 조회 UI.
  - 기본적인 인터뷰 룸 UI.
- **[구현 예정]**
  - **성장 리포트 (Dashboard)**: 인터뷰 횟수, 평균 점수, 월간 기술 블로그 독서량 등을 시각화(Chart.js/D3.js).
  - **기술 스택 discussion**: 게시글이나 면접 질문에 대해 유저들끼리 의견을 나누는 스레드 시스템.

---

## 3. 기술 아키텍처 (Architecture)

### **Frontend (web/)**
- **Next.js 15+ (App Router)**: 고성능 렌더링 및 SEO 최적화.
- **LiveKit JS SDK**: 실시간 RTC 스트리밍 제어.
- **Shadcn/ui & Tailwind**: 프리미엄 디자인 시스템 구축.

### **AI Backend (ai/)**
- **LiveKit Agents**: Python 기반의 이벤트 기반 에이전트 환경.
- **Gemini 2.5 Flash (Native Audio)**: 별도의 STT/TTS 엔진 없이 모델 레벨에서 오디오를 직접 처리하여 레이턴시 극대화.
- **PIXI.js & pixi-live2d-display**: 프론트엔드와 연동되는 캐릭터 렌더링 엔진.

### **Data & Infra**
- **Supabase (PostgreSQL)**: 실시간 데이터베이스 및 인증 서비스.
- **Crawler (Python)**: `feedparser`와 `BeautifulSoup`를 활용한 데이터 파이프라인.

---

## 4. 향후 로드맵 (Roadmap)

### **Phase 1: 기반 강화 (현재 진행 중)**
- [x] LiveKit 서버 환경 구축
- [x] Gemini Realtime API 연동
- [x] Live2D 캐릭터 렌더링 최적화
- [ ] Sherpa-ONNX 등 로컬 ASR 라이브러리 의존성 해결

### **Phase 2: 고도화**
- [ ] JD/Resume PDF 파싱 자동화
- [ ] 기술 면접 단계별 프로세스 고도화 (자기소개 -> 기술 -> 압박 -> 피드백)
- [ ] 대시보드 내 성과 지표(Skill Graph) 시각화

### **Phase 3: 확장 및 수익화**
- [ ] 화이트보드 캔버스 및 동시 편집 에디터 통합
- [ ] 기업용 인터뷰 서비스 (B2B) 확장 가능성 검토
- [ ] 모바일 앱 (iOS/Android) 지원

---

## 5. 결론
StackLoad는 단순히 정보를 전달하는 앱을 넘어, **AI 기술을 통해 개발자의 커리어 패스를 직접적으로 가이드하는 파트너**를 지향합니다. 최첨단 Multimodal AI를 가장 실용적인 분야인 '학습'과 '면접'에 접목한 선도적인 프로젝트입니다.
