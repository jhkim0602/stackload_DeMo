# StackLoad 워크스페이스 구축 및 고도화 전략 (Workspace Deep Dive Planning)

> **문서 개요**: 본 문서는 StackLoad의 핵심 엔진인 **'실시간 협업 워크스페이스(Workspace)'** 섹션만을 분리하여, 현재 기능 상태를 진단하고 상용화 수준(Production-ready)으로 발전시키기 위한 **상세 요구사항(Requirements)**, **기술 전략(Tech Strategy)**, 그리고 **유저 확보(Go-to-Market) 전략**을 다룹니다.

---

## 1. 워크스페이스 현황 및 기능 진단 (Current Status Analysis)

현재 StackLoad 워크스페이스는 "UI 중심의 초기 프로토타입" 단계입니다. 시각적 완성도는 높으나, 실제 데이터 흐름과 실시간성이 결여되어 있습니다.

### 1.1 구현된 기능 (Implemented Features)
*   **UI/UX Framework**: `shadcn/ui` 기반의 유려하고 통일감 있는 컴포넌트 시스템 구축 완료.
*   **Kanban Board (Client-side)**:
    *   `dnd-kit`을 활용한 부드러운 드래그 앤 드롭 태스크 이동.
    *   **Advanced Task Modal**: 태스크 상세 보기, 댓글 UI, 서브 태스크 체크리스트, 커스텀 필드 UI 지원.
    *   **View System**: 태그별 보기, 담당자별 보기 등 다양한 뷰 모드 UI 스캐폴딩.
*   **Navigation & Layout**: 사이드바, 탭 내비게이션, 상단 액션 바 등 기본 레이아웃 완비.

### 1.2 한계점 및 미구현 요소 (Missing Core Features)
*   **데이터 영속성 부재**: 모든 데이터가 `store/mock-data.ts`에 의존. 새로고침 시 초기화됨.
*   **실시간 동기화 미비**: 내가 태스크를 옮겼을 때 다른 팀원 화면에 즉시 반영되지 않음 (WebSocket 부재).
*   **고립된 컴포넌트**: 채팅, 화이트보드, 문서 기능이 껍데기만 존재하며 서로 유기적으로 연동되지 않음.

---

## 2. 상세 요구사항 명세서 (Detailed Requirements Specification)

상용화를 위해 반드시 구현해야 할 기능들을 **P0 (필수)**, **P1 (권장)**, **P2 (고도화)** 로 나누어 상세 정의합니다.

### 2.1 P0: 실시간 협업 엔진 (The Real-time Engine)

워크스페이스의 생명은 '동시성'입니다. `workspace-server`가 담당할 핵심 기능입니다.

*   **[REQ-WS-CORE-001] Socket.io 기반 실시간 이벤트 버스**
    *   **Architecture**: `Namespace`로 프로젝트 구분 (`/project/{id}`).
    *   **Payload Spec**:
        ```typescript
        interface TaskUpdateEvent {
          type: 'TASK_MOVED';
          taskId: string;
          fromStatus: string;
          toStatus: string;
          newIndex: number;
          actorId: string; // 누가 옮겼는지
        }
        ```
    *   **Client Action**: 이벤트 수신 시 낙관적 업데이트(Optimistic Update) 롤백 방지 로직 적용.
*   **[REQ-WS-CORE-002] CRDT 기반 문서 동시 편집 (Docs & Whiteboard)**
    *   **Tech Stack**: **Yjs** (데이터 구조) + **Hocuspocus** (WebSocket 서버).
    *   **Requirement**:
        *   Text: 다중 커서 및 선택 영역 실시간 표시 (색상으로 유저 구분).
        *   Offline Support: 네트워크 끊김 후 재연결 시 변경 사항 자동 병합 (Merge).
*   **[REQ-WS-CORE-003] Presence System (실시간 접속 현황)**
    *   **Feature**: 우측 상단 "Avatar Pile" (현재 보고 있는 유저 겹쳐 보기).
    *   **Detail**:
        *   "User A님이 'API 기획서'를 보고 있습니다" (Mouse Tracking).
        *   "User B님이 댓글을 입력 중입니다..." (Typing Indicator).

### 2.2 P1: 심도 있는 프로젝트 관리 (Advanced Management)

단순한 할 일 목록을 넘어 '프로젝트'를 관리할 수 있어야 합니다.

*   **[REQ-WS-PM-001] 유연한 뷰(View) 시스템**
    *   **Feature**: 동일한 데이터를 다양한 관점에서 볼 수 있는 저장 가능한 뷰 설정.
    *   **Types**:
        *   **Timeline View (Gantt)**: 태스크의 `startDate`와 `dueDate`를 기반으로 가로 막대형 차트 렌더링. 의존성(Dependency) 화살표 연결 기능.
        *   **Calendar View**: 월간/주간 달력에 태스크 렌더링. 드래그로 날짜 변경.
        *   **List View (Spreadsheet)**: 엑셀처럼 빠르게 데이터를 입력하고 수정하는 그리드 뷰.
*   **[REQ-WS-PM-002] 강력한 필터 및 정렬 (Filter & Sort)**
    *   **Detail**: 복합 조건 지원 (e.g., "담당자가 '나'이면서 '긴급'이고 '완료'되지 않은 것").
    *   **Save Filter**: 자주 쓰는 필터 조건을 '빠른 필터'로 저장.
*   **[REQ-WS-PM-003] 자동화 (Automation) 기초**
    *   **Trigger**: "상태가 '완료'로 변경되면" -> **Action**: "담당자에게 알림 전송", "마감일 자동 기록".

### 2.3 P1: 올인원 문서 및 커뮤니케이션 (Docs & Chat)

*   **[REQ-WS-DOC-001] "Notion-like" 블록 에디터 완성**
    *   **Block Types**: Heading 1~3, Bullet List, Check List, Code Block(Syntax Highlighting), Quote, Callout, Image, Embed.
    *   **Slash Command**: `/` 입력 시 메뉴 팝업으로 블록 타입 변환.
    *   **@Mention**: `@` 입력 시 멤버/태스크/다른 문서 링크 팝업.
*   **[REQ-WS-CHAT-001] 컨텍스트 기반 채팅 (Contextual Chat)**
    *   **Floating Chat**: 뷰를 벗어나지 않고 언제든 열 수 있는 글로벌 채팅 사이드바.
    *   **Connect**: 문서를 보면서 해당 문서에 대한 채팅방을 별도로 생성(스레드)할 수 있는 기능.

---

## 3. 기술 고도화 전략 (Technical Deep Dive)

단순 구현을 넘어 '확장성'과 '성능'을 고려한 설계입니다.

### 3.1 상태 관리 아키텍처 (State Management)
*   **Problem**: 워크스페이스는 데이터가 매우 빈번하게 변함 (1초에 수십 번의 마우스 이동 등).
*   **Solution**: **Zustand + React Query (TanStack Query)** 하이브리드 전략.
    *   **Server State (React Query)**: 프로젝트 목록, 태스크 목록 등 DB 데이터. `staleTime`을 0으로 설정하되 WebSocket 이벤트 수신 시 `queryClient.setQueryData`로 캐시 직접 수정 (Re-fetch 최소화).
    *   **Client State (Zustand)**: UI 상태 (모달 열림, 사이드바 토글), 임시 드래그 상태.

### 3.2 렌더링 최적화 (Performance)
*   **Virtualization**: 칸반 보드에 카드 10,000개가 있어도 버벅이지 않도록 `react-window` 도입하여 화면에 보이는 카드만 렌더링.
*   **Selective Re-rendering**: 태스크 하나가 업데이트될 때 전체 리스트가 아닌 해당 태스크 컴포넌트만 리런더링되도록 `React.memo` 및 셀렉터 최적화 적용.

### 3.3 백엔드 확장성 (Scalability)
*   `workspace-server`는 **Stateful**합니다 (Socket 연결 유지). 사용자가 늘어나면 서버를 다중화해야 합니다.
*   **Redis Adapter**: 여러 대의 Socket.io 서버 간 메시지 및 이벤트를 동기화하기 위해 Redis Pub/Sub 도입 필수.

---

## 4. 유저 확보 및 배포 전략 (Deployment & Growth Strategy)

만든 기능을 실제 유저가 쓰게 만드는 '마지막 마일' 전략입니다.

### 4.1 배포 파이프라인 (Ops)
*   **Frontend**: Vercel (Edge Network 활용, 빠른 정적 및 ISR 서빙).
*   **Collaboration Server**: Railway 또는 AWS EC2. (WebSocket의 Long-polling 연결 유지가 안정적인 환경 필요).
*   **DB**: Supabase (PostgreSQL). 백업 및 PITR(Point-in-Time Recovery) 설정 필수.

### 4.2 프로덕트 주도 성장 전략 (Product-Led Growth)
워크스페이스 툴은 '팀' 단위 도입이 핵심입니다.

*   **[Strategy 1] "High-Utility Templates" (템플릿 마케팅)**
    *   개발자가 가장 필요로 하는 문서 템플릿 5종(기획서, API 명세서, 회고록 등)을 고퀄리티로 미리 심어둠.
    *   유저는 툴을 쓰러 오는 게 아니라, "잘 만든 기획서 양식"을 쓰러 왔다가 자연스럽게 StackLoad에 락인(Lock-in)됨.
    *   **SEO Action**: "개발자 기획서 양식", "API 명세서 템플릿" 키워드로 랜딩 페이지 최적화.
*   **[Strategy 2] "Frictionless Onboarding" (마찰 없는 진입)**
    *   회원가입 없이 '게스트 모드'로 즉시 칸반 보드를 체험할 수 있는 "Try It Now" 버튼 제공 (Local Storage 활용).
    *   "이 워크스페이스 저장하기" 버튼을 누를 때 비로소 회원가입 유도.
*   **[Strategy 3] "Viral Loop: Share as Image" (인증샷 공유)**
    *   완성된 프로젝트 칸반 보드나, 잘 정리된 로드맵을 **"예쁜 이미지"**로 생성해주는 기능 (`html-to-image`).
    *   개발자들이 자신의 사이드 프로젝트 진행 상황을 트위터/링크드인에 공유할 때 StackLoad 로고가 박힌 이미지를 사용하도록 유도.

### 4.3 측정 지표 (Metrics)
*   **Aha! Moment**: "유저가 첫 번째 태스크를 생성하고, 상태를 'Done'으로 옮기는 순간".
*   **Activation Rate**: 가입 후 24시간 이내에 팀원 1명 이상을 초대한 비율.
*   **Retention**: 주간 활성 사용자(WAU) 중 '문서 편집'과 '태스크 이동'을 모두 수행한 코어 유저 비율.
