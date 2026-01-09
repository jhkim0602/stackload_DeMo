# StackLoad 해커톤 팀빌딩 워크스페이스 기획서

## 0. 요약
해커톤 정보를 제공하는 웹에서 "팀원 모집 -> 초대 -> 해커톤 전용 워크스페이스 생성" 흐름을 완성한다. 생성된 워크스페이스 안에서 팀 멤버가 실시간으로 화이트보드를 공동 편집할 수 있어야 한다. MVP는 빠르게 연결하고, 안정적 협업은 CRDT(Yjs/Hocuspocus)로 확장한다.

## 1. 목표
- 해커톤 페이지에서 팀 빌딩과 초대가 자연스럽게 이어지는 흐름 제공.
- 초대 링크 기반으로 팀원이 워크스페이스에 합류.
- 워크스페이스 내부 팀원 간 화이트보드 실시간 협업.
- 해커톤 주제에 맞는 기본 템플릿과 구조 제공.

## 2. 사용자/역할
- Organizer: 해커톤 주최자. 행사 페이지/팀 빌딩 정보 관리.
- Team Lead: 팀 생성/초대/워크스페이스 소유.
- Member: 초대를 통해 합류한 팀원. 보드/채팅/문서 편집 가능.
- Viewer(옵션): 읽기 전용 접근.

권한 초안:
- Team Lead: 워크스페이스 설정, 초대 링크 관리, 멤버 권한 변경.
- Member: 화이트보드/문서/태스크 편집, 채팅/허들 참여.
- Viewer: 읽기 전용.

## 3. 핵심 사용자 흐름
### 3.1 해커톤 -> 팀 빌딩 -> 워크스페이스 생성
1) 해커톤 상세 페이지에서 "팀원 모집" 버튼 클릭.
2) 팀 생성(팀명, 목표, 필요 역할/기술, 간단 소개).
3) 해커톤 템플릿 기반 워크스페이스 자동 생성.
4) 팀 리더가 초대 링크를 공유.

### 3.2 초대 링크 합류
1) 초대 링크 접속.
2) 회원이면 즉시 합류, 비회원은 가입/로그인 후 합류.
3) 합류 즉시 워크스페이스 온보딩(역할, 일정, 보드 안내).

### 3.3 워크스페이스 내 협업
- 화이트보드: 실시간 공동 편집.
- 채팅: 팀 채널 기본 생성.
- 문서: 기획/요구사항 정리 공간.
- 일정/칸반: 해커톤 일정과 태스크 운영.

## 4. 해커톤 워크스페이스 기본 구조
기본 탭(예시):
- Overview: 해커톤 요약/팀 소개/최근 활동
- Board: 칸반 보드
- Ideas: 화이트보드(브레인스토밍)
- Docs: 요구사항/기획 정리
- Schedule: 마일스톤 일정
- Chat: 팀 채팅

해커톤 전용 템플릿(초안):
- Whiteboard: Problem Statement, Persona, Solution Sketch, Tech Stack, Scope Box
- Docs: 팀 규칙, 역할 분담표, 제출 체크리스트
- Board: To Do / In Progress / Done 기본 컬럼

## 5. 화이트보드 협업 설계
### 5.1 MVP (빠른 연결)
- Socket.io 이벤트 기반 브로드캐스트.
- 이벤트: board:join, board:update
- 장점: 빠른 구현.
- 단점: 충돌/유실 가능성, 복구 로직 약함.

### 5.2 Production (권장)
- Yjs + Hocuspocus 기반 CRDT 동기화.
- 장점: 충돌 없는 병합, 오프라인 복구, 안정성.
- 서버: /collaboration WS 경로 분리.

### 5.3 저장 및 히스토리
- MVP: 일정 주기로 스냅샷 저장(서버 DB 또는 파일).
- Production: Yjs 업데이트 로그 저장 + 스냅샷 병행.

## 6. 초대/권한/보안
- 초대 링크는 서명된 토큰(만료 시간 포함).
- 링크 공유 후 멤버 승인 정책:
  - 오픈: 링크 클릭 즉시 합류
  - 승인형: Team Lead 승인 후 합류
- 권한 체크는 워크스페이스 멤버십 기준.

## 7. 데이터 모델(초안)
- Hackathon { id, title, 기간, 주제, 주최자 }
- Team { id, hackathonId, name, description, leaderId }
- Workspace { id, hackathonId, teamId, title, templateId }
- Membership { id, workspaceId, userId, role, status }
- InviteLink { id, workspaceId, token, expiresAt, policy }
- Whiteboard { id, workspaceId, snapshot, updatedAt }

## 8. API/웹소켓 이벤트(초안)
REST/HTTP:
- POST /hackathons/:id/teams
- POST /workspaces/:id/invite-links
- POST /invite-links/:token/join
- GET /workspaces/:id

Socket (MVP):
- board:join { roomId }
- board:update { roomId, elements }

Socket (Presence/Chat 확장):
- presence:update
- chat:message

Yjs (Production):
- ws://.../collaboration?workspaceId=...

## 9. 성공 지표
- 팀 생성 전환율 (해커톤 상세 -> 팀 생성)
- 초대 링크 합류율
- 워크스페이스 1일차 리텐션
- 화이트보드 협업 세션 길이

## 10. 구현 로드맵
Phase 1 (MVP):
- 해커톤 페이지에서 팀 생성/초대 링크 발급
- 워크스페이스 생성 자동화
- 화이트보드 Socket 브로드캐스트 동기화

Phase 2 (안정화):
- 멤버십 권한/승인 흐름
- 화이트보드 스냅샷 저장
- Presence/활동 로그

Phase 3 (Production):
- Yjs/Hocuspocus 협업 전환
- 스케일링/Redis 어댑터
- 감사 로그/히스토리 복원
