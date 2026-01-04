from typing import Dict, List, Optional, Any
from loguru import logger
import json
import asyncio
from pydantic import BaseModel

from ..agent.rag.vector_store import VectorStoreManager
from ..agent.rag.resume_analyzer import ResumeAnalyzer
from ..agent.rag.question_generator import QuestionGenerator
from ..agent.rag.feedback_agent import FeedbackAgent

class InterviewSession(BaseModel):
    client_uid: str
    jd_text: str
    resume_text: str
    status: str = "init" # init, ready, running, completed
    current_phase: str = "introduction" # introduction, technical, behavioral, closing
    interviewer_style: str = "professional" # professional, friendly, pressure

    # Analysis Results
    analysis_result: Dict[str, Any] = {}

    # Generated Questions
    questions: List[Dict[str, Any]] = [] # List of {"type":..., "question":..., "reason":...}
    current_question_index: int = 0

    # Feedback Log
    feedback_log: List[Dict[str, Any]] = []

class InterviewManager:
    """
    AI 인터뷰 세션의 전체 수명 주기를 관리합니다.
    RAG(문서 검색 및 분석) 컴포넌트를 통합하여 실시간 질문 생성 및 피드백을 제공합니다.
    """

    def __init__(self, rag_config=None):
        self.sessions: Dict[str, InterviewSession] = {}
        self.config = rag_config

        # 기본값 설정 (Config 객체가 없을 경우 대비)
        if self.config is None:
            from ..config_manager.rag import RAGConfig
            self.config = RAGConfig()

        # RAG 컴포넌트 초기화
        self.vector_store = VectorStoreManager(
            persist_directory=self.config.vector_db_path,
            embedding_model=self.config.embedding_model
        )
        self.resume_analyzer = ResumeAnalyzer(
            model_name=self.config.llm_model
        )
        self.question_generator = QuestionGenerator(
            vector_store=self.vector_store,
            resume_analyzer=self.resume_analyzer,
            model_name=self.config.llm_model,
            temperature=self.config.temperature_question
        )
        self.feedback_agent = FeedbackAgent(
            vector_store=self.vector_store,
            model_name=self.config.llm_model,
            temperature=self.config.temperature_feedback
        )

        logger.info(f"InterviewManager가 RAG 컴포넌트와 함께 초기화되었습니다. (Model: {self.config.llm_model})")

    def create_session(self, client_uid: str, jd_text: str, resume_text: str, style: str = "professional") -> InterviewSession:
        session = InterviewSession(
            client_uid=client_uid,
            jd_text=jd_text,
            resume_text=resume_text,
            interviewer_style=style
        )
        self.sessions[client_uid] = session
        logger.info(f"{client_uid}에 대한 인터뷰 세션이 생성되었습니다.")
        return session

    async def prepare_session(self, client_uid: str) -> None:
        """
        [비동기] 세션을 준비합니다. 이력서를 분석하고 맞춤형 질문을 생성합니다.
        """
        session = self.sessions.get(client_uid)
        if not session:
            raise ValueError(f"세션을 찾을 수 없습니다: {client_uid}")

        logger.info(f"{client_uid} 세션 준비 중...")

        try:
            # 이력서 분석 및 질문 생성 (경로 또는 텍스트 지원)
            generated_questions = await self.question_generator.generate_questions(session.resume_text)
            session.questions = [{"type": "Generated", "question": q, "reason": "Resume Based"} for q in generated_questions]
            logger.info(f"세션 준비 완료. {len(generated_questions)}개의 질문이 생성되었습니다.")
            session.status = "ready"

        except Exception as e:
            logger.error(f"세션 준비 중 오류 발생: {e}", exc_info=True)
            session.questions = [
                {"type": "General", "question": "자기소개를 해주세요.", "reason": "Fallback"}
            ]

    def get_session(self, client_uid: str) -> Optional[InterviewSession]:
        return self.sessions.get(client_uid)

    def generate_system_prompt(self, session: InterviewSession) -> str:
        """
        생성된 질문을 포함하여 동적인 시스템 프롬프트를 생성합니다.
        """
        style_instructions = {
            "professional": "Maintain a polite, professional tone.",
            "friendly": "Be warm, encouraging, and supportive.",
            "pressure": "Be strict, skeptical, and demanding.",
        }
        selected_style = style_instructions.get(session.interviewer_style, style_instructions["professional"])

        questions_block = ""
        if session.questions:
            questions_block = "\n[PLANNED QUESTIONS - ASK THESE IN ORDER]\n"
            for i, q in enumerate(session.questions, 1):
                questions_block += f"{i}. [{q.get('type')}] {q.get('question')} (Reason: {q.get('reason')})\n"

        base_prompt = f"""
        You are "Mao", a professional AI Interviewer.
        Role: Senior Software Engineer conducting a technical interview.
        Style: {selected_style}

        [JOB DESCRIPTION]
        {session.jd_text}

        [PLANNED QUESTIONS]
        {questions_block}

        [GUIDELINES]
        1. Ask ONE question at a time.
        2. Wait for the candidate's answer.
        3. Determine if the answer is sufficient. If yes, move to the next planned question.
        4. If the answer is vague, ask a follow-up question before moving on.
        """

        phase_instructions = ""
        if session.current_phase == "introduction":
            phase_instructions = "Phase: INTRODUCTION. Start by welcoming the candidate and asking for a self-introduction."
        elif session.current_phase == "technical":
            phase_instructions = "Phase: TECHNICAL. Start asking the [PLANNED QUESTIONS] sequentially. Dig deep into their technical choices."
        elif session.current_phase == "behavioral":
            phase_instructions = "Phase: BEHAVIORAL. Focus on soft skills and teamwork. Ask about conflict resolution."
        elif session.current_phase == "closing":
            phase_instructions = "Phase: CLOSING. Key takeaway: Thank the candidate and ask if they have questions for you."

        return f"{base_prompt}\n\n{phase_instructions}"

    def get_phase_guide(self, phase: str) -> str:
        guides = {
            "introduction": "자기소개와 지원 동기를 말씀해 주세요.",
            "technical": "직무 관련 기술 면접이 진행됩니다.",
            "behavioral": "인성 및 협업 경험에 대한 질문입니다.",
            "closing": "면접을 마무리합니다."
        }
        return guides.get(phase, "면접 진행 중")

    async def handle_interview_turn(self, client_uid: str, user_answer: str):
        """
        대화 턴 처리: 사용자가 답변을 완료했을 때 호출됩니다.
        피드백을 생성하고 로그를 저장하며, 다음 단계로 진행합니다.
        """
        session = self.sessions.get(client_uid)
        if not session or session.status != "ready":
             return

        current_q = "General Interview Question"
        if session.questions and session.current_question_index < len(session.questions):
             current_q = session.questions[session.current_question_index].get("question", "Unknown")

        # 실시간 피드백 생성
        logger.info(f"피드백 생성 중... 질문: {current_q}")
        feedback = await self.generate_feedback(client_uid, current_q, user_answer)

        # 로그 저장
        entry = {
            "turn": session.current_question_index + 1,
            "question": current_q,
            "answer": user_answer,
            "feedback": feedback
        }
        session.feedback_log.append(entry)

        # 질문 인덱스 증가 (간단한 선형 흐름)
        if session.current_phase == "technical":
             session.current_question_index += 1

    async def generate_feedback(self, client_uid: str, question: str, answer: str) -> Dict[str, str]:
        return await self.feedback_agent.generate_feedback(question, answer)

    def generate_report(self, client_uid: str) -> Dict[str, Any]:
        """
        세션 로그를 바탕으로 최종 분석 보고서를 생성합니다.
        """
        session = self.sessions.get(client_uid)
        if not session:
            return {}

        report = {
            "candidate_uid": client_uid,
            "style": session.interviewer_style,
            "total_questions": len(session.feedback_log),
            "details": session.feedback_log,
            "overall_summary": "면접이 완료되었습니다. 자세한 코멘트는 각 항목을 참고하세요."
        }
        return report

    def end_session(self, client_uid: str):
        if client_uid in self.sessions:
            del self.sessions[client_uid]
            logger.info(f"{client_uid} 세션 종료됨")
