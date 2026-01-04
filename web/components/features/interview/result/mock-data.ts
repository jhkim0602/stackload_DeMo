import { InterviewReport } from "../feedback-report";

export const MOCK_DASHBOARD_DATA = {
    report: {
        candidate_uid: "mock-user-expert-001",
        style: "Professional (Deep Tech)",
        total_questions: 3,
        duration: "24분 30초",
        overall_summary: `지원자님은 **프론트엔드 아키텍처**와 **성능 최적화**에 대해 시니어 수준의 깊은 이해도를 보여주셨습니다.

특히 **React 18의 동시성 모델(Concurrency)** 작동 원리를 브라우저 렌더링 파이프라인과 연결하여 설명한 점과, **마이크로 프론트엔드** 도입 시의 트레이드오프를 실무 경험에 빗대어 논리적으로 전개한 점이 매우 인상적이었습니다.

다만, 기술적 의사결정이 비즈니스에 미친 영향을 설명할 때 **정량적인 성과 데이터(KPI)**가 다소 부족했던 점은 아쉬움으로 남습니다. 앞으로 기술적 챌린지를 설명할 때 "어떤 문제를 해결했는지"에 더해 "그 결과 비즈니스가 얼마나 성장했는지"를 수치로 증명하는 연습을 하신다면, 테크 리드(Tech Lead)로서도 손색이 없을 것입니다.`,

        // Context Context
        jd_text: `[프론트엔드 시니어 엔지니어 채용]

주요 업무
- 대규모 트래픽을 처리하는 웹 서비스의 프론트엔드 아키텍처 설계 및 구현
- 성능 최적화 및 웹 표준, 접근성 개선
- 생산성 향상을 위한 공통 라이브러리 및 디자인 시스템 구축
- 주니어 개발자 멘토링 및 코드 리뷰

자격 요건
- React, TypeScript 기반의 웹 애플리케이션 개발 경험 5년 이상
- 브라우저 동작 원리 및 렌더링 최적화에 대한 깊은 이해
- 모던 프론트엔드 빌드 도구(Webpack, Vite 등) 설정 및 최적화 경험
- 마이크로 프론트엔드 아키텍처에 대한 이해 또는 경험
- 주도적으로 문제를 해결하고 동료와 원활하게 소통할 수 있는 분`,

        resume_text: `[이경력]

## Summary
7년차 프론트엔드 개발자입니다. 사용자 경험을 극대화하기 위한 성능 최적화와 확장 가능한 아키텍처 설계에 관심이 많습니다.

## Experience
**A-Tech Corp. (2020.03 - 현재)**
*Senior Frontend Engineer*
- **글로벌 이커머스 플랫폼 리뉴얼 주도**: Legacy JSP 기반 시스템을 Next.js 기반의 모던 아키텍처로 점진적 마이그레이션.
- **성능 최적화**: LCP 2.5초 -> 1.2초 단축, CLS 0.1 미만 유지. 이미지 최적화 및 코드 스플리팅 전략 수립.
- **디자인 시스템 구축**: 디자이너와 협업하여 사내 공통 UI 라이브러리 개발 및 배포 (npm private registry). 개발 생산성 30% 향상 기여.

**B-Soft (2017.01 - 2020.02)**
*Frontend Developer*
- 사내 어드민 대시보드 개발 (React, Redux).
- 실시간 데이터 시각화 차트 구현 (D3.js).

## Skills
- Languages: TypeScript, JavaScript (ES6+)
- Frameworks: React, Next.js, Vue.js
- State Management: React Query, Zustand, Redux
- Tools: Webpack, Vite, Jest, Cypress`,

        // Transcript
        transcript: [
            { role: "interviewer", text: "안녕하세요, 이경력님. 반갑습니다. 오늘 면접을 진행하게 된 AI 면접관 마오입니다. 편안한 마음으로 임해주시면 감사하겠습니다. 먼저 간단한 자기소개 부탁드려요.", timestamp: "00:00" },
            { role: "candidate", text: "안녕하세요! 사용자 경험을 최우선으로 생각하는 7년차 프론트엔드 개발자 이경력입니다. 저는 기술 그 자체보다 기술이 비즈니스 문제를 어떻게 해결할 수 있는지에 집중합니다. 지난 4년 동안 글로벌 이커머스 플랫폼의 성능 최적화를 주도하며 매출 증대에 기여한 경험이 있습니다.", timestamp: "00:45" },
            { role: "interviewer", text: "상당히 인상적인 소개네요. 특히 성능 최적화 경험이 눈에 띕니다. React 18에 도입된 Concurrent Mode에 대해 알고 계신가요? 도입 배경과 UX에 미치는 영향에 대해 설명해 주시겠어요?", timestamp: "01:20" },
            { role: "candidate", text: "네, React 18의 Concurrent features는 렌더링 작업을 중단하고 재개할 수 있는 능력을 제공하기 위해 도입되었습니다. 기존의 Blocking rendering 방식은 무거운 계산이 메인 스레드를 점유하면 UI가 프리징되는 문제가 있었습니다. useTransition이나 useDeferredValue를 활용하면, 입력(Input)과 같은 긴급한 업데이트를 우선 처리하고, 무거운 리스트 렌더링은 뒷단에서 처리함으로써 UI 반응성을 획기적으로 개선할 수 있습니다. 이를 통해 사용자는 데이터 로딩 중에도 끊김 없는 인터랙션을 경험하게 됩니다.", timestamp: "02:10" },
            { role: "interviewer", text: "정확하게 이해하고 계시군요. 그렇다면 Concurrent Rendering을 적용했을 때 발생할 수 있는 부작용, 예를 들어 Tearing 현상이나 서드파티 라이브러리 호환성 문제에 대해 고민해보신 적이 있나요?", timestamp: "03:05" },
            { role: "candidate", text: "네, Tearing은 렌더링 중에 상태가 변경되어 UI의 일관성이 깨지는 현상인데요, React 18에서는 이를 방지하기 위해 startTransition을 사용할 때 자동으로 배치 처리를 하거나 useSyncExternalStore 같은 훅을 제공하여 외부 스토어와의 동기화를 보장합니다. 실제로 저희 팀에서도 Redux 구버전을 사용할 때 호환성 이슈가 있어서 Zustand로 마이그레이션하면서 useSyncExternalStore를 활용해 해결한 경험이 있습니다.", timestamp: "03:50" },
            { role: "interviewer", text: "훌륭합니다. 실무 경험이 뒷받침된 답변이네요. 다음 질문으로 넘어가겠습니다. 마이크로 프론트엔드 아키텍처를 도입할 때 고려해야 할 트레이드오프는 무엇인가요? 이력서에 관련 경험은 없으신 것 같지만, 평소 생각하신 바를 말씀해 주세요.", timestamp: "04:40" },
            { role: "candidate", text: "마이크로 프론트엔드는 팀 간의 독립적인 배포와 개발 자율성을 보장한다는 강력한 장점이 있습니다. 하지만 런타임 통합 복잡도 증가, 번들 사이즈 중복으로 인한 성능 저하, 그리고 일관된 디자인 시스템 유지의 어려움이라는 단점이 존재합니다. 저는 Module Federation을 통해 의존성을 공유하여 번들 사이즈를 줄이고, 공통 UI 라이브러리를 엄격하게 버전 관리함으로써 이러한 단점들을 상쇄하려고 노력했습니다.", timestamp: "05:30" },
            { role: "interviewer", text: "잘 알겠습니다. 마지막으로 협업 관련 질문을 드릴게요. 팀 내에서 기술적 의견 충돌이 발생했을 때, 이를 해결하고 합의를 이끌어낸 경험이 있다면 공유해주세요.", timestamp: "06:20" },
            { role: "candidate", text: "과거 프로젝트에서 상태 관리 라이브러리 도입을 두고 Redux와 React Query 사이에서 의견이 갈린 적이 있습니다. 저는 감정적인 논쟁을 피하기 위해, 실제 우리 프로젝트의 데이터 패턴을 분석했습니다. 그 결과 서버 상태(Server State) 비중이 90% 이상임을 데이터로 보여주며 React Query 도입을 설득했습니다. 대신 전역 UI 상태는 Context API로 가볍게 관리하는 절충안을 제시하여 팀원 모두의 동의를 얻어냈습니다.", timestamp: "07:15" },
            { role: "interviewer", text: "데이터 기반의 설득과 절충안 제시, 아주 좋은 접근이었습니다. 오늘 인터뷰 고생 많으셨습니다. 이것으로 면접을 마치겠습니다.", timestamp: "08:00" },
        ],

        // Detailed Feedback Analysis
        details: [
            {
                turn: 1,
                question: "React 18의 Concurrent Mode가 도입된 배경과, 이것이 사용자 경험(UX)에 미치는 구체적인 영향에 대해 설명해주세요.",
                answer: "React 18의 Concurrent features는 렌더링 작업을 중단하고 재개할 수 있는 능력을 제공하기 위해 도입되었습니다. 기존의 Blocking rendering 방식은 무거운 계산이 메인 스레드를 점유하면 UI가 프리징되는 문제가 있었습니다. useTransition이나 useDeferredValue를 활용하면, 입력(Input)과 같은 긴급한 업데이트를 우선 처리하고, 무거운 리스트 렌더링은 뒷단에서 처리함으로써 UI 반응성을 획기적으로 개선할 수 있습니다. 이를 통해 사용자는 데이터 로딩 중에도 끊김 없는 인터랙션을 경험하게 됩니다.",
                feedback: {
                    feedback: "Concurrent Features의 기술적 배경(Blocking vs Interruptible Rendering)과 실제 UX 이점(Input Responsiveness)을 논리적으로 잘 연결하여 설명하셨습니다. 프레임워크 내부 동작 원리에 대한 깊이 있는 이해가 돋보입니다.",
                    follow_up_question: "Concurrent Rendering을 적용했을 때 발생할 수 있는 부작용(예: Tearing)이나, 서드파티 라이브러리(zustand, recoil 등)와의 호환성 문제에 대해 고민해보신 적이 있나요?"
                }
            },
            {
                turn: 2,
                question: "마이크로 프론트엔드(Micro-Frontend) 아키텍처를 도입할 때 고려해야 할 트레이드오프(Trade-off)는 무엇인가요?",
                answer: "마이크로 프론트엔드는 팀 간의 독립적인 배포와 개발 자율성을 보장한다는 강력한 장점이 있습니다. 하지만 런타임 통합 복잡도 증가, 번들 사이즈 중복으로 인한 성능 저하, 그리고 일관된 디자인 시스템 유지의 어려움이라는 단점이 존재합니다. 저는 Module Federation을 통해 의존성을 공유하여 번들 사이즈를 줄이고, 공통 UI 라이브러리를 엄격하게 버전 관리함으로써 이러한 단점들을 상쇄하려고 노력했습니다.",
                feedback: {
                    feedback: "아키텍처의 장점뿐만 아니라 단점(Runtime Complexity, performance overhead)을 명확히 인지하고 계신 점이 인상적입니다. 특히 Module Federation을 해결책으로 제시한 점은 실무 경험이 풍부함을 보여줍니다. 디자인 시스템의 거버넌스(Governance) 전략에 대해 더 구체적인 사례가 있었다면 완벽했을 것입니다.",
                    follow_up_question: "여러 팀이 배포 주기가 다를 때 발생할 수 있는 버전 충돌(Version Mismatch) 문제를 런타임에서 우아하게 처리하기 위한 전략은 무엇이 있을까요?"
                }
            },
            {
                turn: 3,
                question: "팀 내에서 기술적 의견 충돌이 발생했을 때, 이를 해결하고 합의를 이끌어낸 경험이 있다면 공유해주세요.",
                answer: "과거 프로젝트에서 상태 관리 라이브러리 도입을 두고 Redux와 React Query 사이에서 의견이 갈린 적이 있습니다. 저는 감정적인 논쟁을 피하기 위해, 실제 우리 프로젝트의 데이터 패턴을 분석했습니다. 그 결과 서버 상태(Server State) 비중이 90% 이상임을 데이터로 보여주며 React Query 도입을 설득했습니다. 대신 전역 UI 상태는 Context API로 가볍게 관리하는 절충안을 제시하여 팀원 모두의 동의를 얻어냈습니다.",
                feedback: {
                    feedback: "단순히 '소통했다'가 아니라, '데이터 기반의 분석'과 '합리적인 절충안(Hybrid Approach)'을 통해 문제를 해결했다는 점이 매우 설득력 있습니다. 리더십과 문제 해결 능력이 돋보이는 답변입니다.",
                    follow_up_question: "만약 데이터 기반으로 설득했음에도 불구하고, 시니어 개발자가 익숙함을 이유로 반대한다면 그 상황을 어떻게 타개하시겠습니까?"
                }
            }
        ]
    }
};
