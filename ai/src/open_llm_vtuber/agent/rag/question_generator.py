import json
import asyncio
from typing import List, Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from loguru import logger
from .vector_store import VectorStoreManager
from .resume_analyzer import ResumeAnalyzer

class QuestionGenerator:
    """
    지원자의 이력서와 Vector Store에서 검색한 가이드라인을 바탕으로
    맞춤형 인터뷰 질문을 생성합니다.
    """

    def __init__(self, vector_store: VectorStoreManager, resume_analyzer: ResumeAnalyzer, model_name: str, temperature: float = 0.7):
        self.vector_store = vector_store
        self.resume_analyzer = resume_analyzer
        self.llm = ChatGoogleGenerativeAI(model=model_name, temperature=temperature)

        # 질문 생성 프롬프트
        self.question_prompt = PromptTemplate(
            input_variables=["resume_analysis", "guidelines"],
            template="""
            당신은 전문 기술 면접관입니다. 다음 정보를 바탕으로 지원자에게 묻고 싶은 날카로운 면접 질문 3~5개를 생성해 주세요.

            [지원자 분석]
            {resume_analysis}

            [면접 가이드라인]
            {guidelines}

            조건:
            1. 질문은 직무 역량, 문제 해결 능력, 인성에 골고루 초점을 맞춰야 합니다.
            2. 각 질문은 구체적이어야 하며 상황이나 예시를 요구해야 합니다.
            3. 한국어로 작성해 주세요.
            4. 번호 매겨진 목록 형식으로 출력해 주세요.
            """
        )

    async def generate_questions(self, resume_input: str) -> List[str]:
        """
        이력서를 분석하고 맞춤형 질문 리스트를 생성합니다.
        resume_input: 파일 경로 또는 텍스트
        """
        try:
            # 1. 이력서 분석
            logger.info("이력서 분석 중...")
            analysis_result = await self.resume_analyzer.analyze(resume_input)

            # 분석 텍스트 구성
            resume_text = f"강점/약점: {analysis_result['strengths_weaknesses']}\n경험: {analysis_result['experiences']}"

            # 2. 관련 가이드라인 검색 (RAG)
            logger.info("면접 가이드라인 검색 중...")
            # 'guideline' 키워드로 관련 문서 검색 시도
            # (실제로는 직무명이나 키워드를 추출하여 검색하는 것이 더 좋음)
            related_docs = await self.vector_store.similarity_search("question", "guideline", k=2)
            guidelines = "\n".join([doc.page_content for doc in related_docs])

            # 검색된 가이드라인이 없을 경우 기본값 제공
            if not guidelines:
                logger.warning("가이드라인을 찾을 수 없어 기본 가이드라인을 사용합니다.")
                guidelines = "지원자의 경험을 바탕으로 기술적 깊이와 문제 해결 능력을 검증하세요."

            # 3. 질문 생성
            logger.info("질문 생성 중...")
            chain = self.question_prompt | self.llm | StrOutputParser()
            result_text = await chain.ainvoke({
                "resume_analysis": resume_text,
                "guidelines": guidelines
            })

            # 4. 결과 파싱 (간단한 줄바꿈 분리)
            questions = [q.strip() for q in result_text.split('\n') if q.strip() and (q[0].isdigit() or q.startswith('-'))]

            return questions

        except Exception as e:
            logger.error(f"질문 생성 중 오류 발생: {e}")
            # 에러 발생 시 기본 질문 반환 (Fallback)
            return [
                "자기소개를 간단히 해주세요.",
                "지원하신 직무와 관련된 가장 인상 깊었던 프로젝트에 대해 설명해주세요.",
                "우리 회사에 지원하게 된 동기는 무엇인가요?"
            ]
