import json
import asyncio
from typing import Dict, Any, List
# from langchain_openai import ChatOpenAI # Deprecated
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from loguru import logger
from .vector_store import VectorStoreManager

class FeedbackAgent:
    """
    지원자의 답변을 바탕으로 실시간 피드백(좋은점/아쉬운점)을 생성하고
    심층적인 꼬리 질문을 제안합니다.
    RAG(Few-Shot Prompting)를 활용하여 유사한 우수 답변 사례를 참고합니다.
    """

    def __init__(self, vector_store: VectorStoreManager, model_name: str, temperature: float = 0.3):
        self.vector_store = vector_store
        self.llm = ChatGoogleGenerativeAI(model=model_name, temperature=temperature)

        # 피드백 생성 프롬프트 (RAG 기반 Few-Shot)
        self.feedback_prompt = PromptTemplate(
            input_variables=["question", "user_answer", "reference_examples"],
            template="""
            당신은 면접관의 보조 AI입니다. 다음은 면접 상황입니다.

            [현재 질문]
            {question}

            [지원자 답변]
            {user_answer}

            [참고할 만한 우수 답변 사례 (RAG 검색 결과)]
            {reference_examples}

            위 내용을 바탕으로 다음 두 가지를 수행해 주세요:
            1. 답변에 대한 간단한 피드백 (좋은 점과 아쉬운 점, 한국어로 작성)
            2. 이어서 물어볼 만한 날카로운 꼬리 질문 1개 (없으면 '꼬리질문 없음' 이라고 명시)

            형식:
            - 피드백: [내용]
            - 꼬리질문: [내용]
            """
        )

    async def generate_feedback(self, question: str, user_answer: str) -> Dict[str, str]:
        """
        사용자 답변을 분석하여 피드백과 꼬리 질문을 반환합니다.
        """
        try:
            # 1. 유사/우수 답변 사례 검색 (RAG)
            # 질문과 유사한 과거 우수 답변이나 평가 기준을 검색
            docs = await self.vector_store.similarity_search("answer", question, k=2)
            reference_examples = "\n\n".join([f"Q: {question}\nA: {d.page_content}" for d in docs])

            if not reference_examples:
                reference_examples = "참고할 만한 예시가 없습니다. 일반적인 면접 기준을 적용하세요."

            # 2. LLM 호출
            chain = self.feedback_prompt | self.llm | StrOutputParser()
            result = await chain.ainvoke({
                "question": question,
                "user_answer": user_answer,
                "reference_examples": reference_examples
            })

            # 3. 결과 파싱 (간단한 문자열 처리)
            # 피드백과 꼬리질문을 분리
            lines = result.strip().split('\n')
            feedback = "피드백을 생성할 수 없습니다."
            follow_up = None

            for line in lines:
                if line.startswith("- 피드백:") or line.startswith("피드백:"):
                    feedback = line.split(":", 1)[1].strip()
                elif line.startswith("- 꼬리질문:") or line.startswith("꼬리질문:"):
                    follow_up = line.split(":", 1)[1].strip()

            if follow_up == '꼬리질문 없음' or not follow_up:
                follow_up = None

            return {
                "feedback": feedback,
                "follow_up_question": follow_up
            }

        except Exception as e:
            logger.error(f"피드백 생성 중 오류 발생: {e}")
            return {
                "feedback": "피드백 생성 중 에러가 발생했습니다.",
                "follow_up_question": None
            }
