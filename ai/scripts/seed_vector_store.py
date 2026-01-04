import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from open_llm_vtuber.agent.rag.vector_store import VectorStoreManager
from langchain_core.documents import Document

async def seed_data():
    print("Initializing Vector Store Manager...")
    vector_store = VectorStoreManager(persist_directory="./chroma_db")

    # 1. Seed Guidelines
    guidelines = [
        Document(
            page_content="면접 질문 생성 가이드라인: 지원자의 자기소개서를 바탕으로 직무 역량, 인성, 문제 해결 능력을 검증하는 질문을 생성하세요.",
            metadata={"source": "seed", "type": "guideline"}
        ),
        Document(
            page_content="평가 기준: 답변의 구체성(STAR 기법), 직무 연관성, 그리고 태도를 중점적으로 평가합니다.",
            metadata={"source": "seed", "type": "guideline"}
        ),
        Document(
            page_content="질문 유형 분배: 직무 역량 40%, 인성 30%, 문제 해결 30% 비율로 질문을 구성하는 것이 좋습니다.",
            metadata={"source": "seed", "type": "guideline"}
        )
    ]
    await vector_store.add_documents("question", guidelines) # Store guidelines in question collection for now or separate?
    # Actually QuestionGenerator searches 'guideline' in 'question' collection?
    # Let's check QuestionGenerator code. It calls vector_store.similarity_search("guideline", ...)
    # Wait, vector_store.similarity_search take collection_name first.
    # In QuestionGenerator: await self.vector_store.similarity_search("guideline", ...)
    # But in VectorStoreManager we defined collections: question, answer, comment.
    # We don't have a 'guideline' collection initialized in VectorStoreManager!
    # I need to fix VectorStoreManager to include 'guideline' collection or use one of the existing ones.
    # Let's check VectorStoreManager again.

    # 2. Seed Sample Questions (for Feedback RAG)
    questions = [
        Document(
            page_content="자기소개를 간단히 해주세요.",
            metadata={"type": "common"}
        ),
        Document(
            page_content="가장 힘들었던 프로젝트 경험은 무엇인가요?",
            metadata={"type": "behavioral"}
        ),
        Document(
            page_content="React의 Virtual DOM에 대해 설명해주세요.",
            metadata={"type": "technical"}
        )
    ]
    await vector_store.add_documents("question", questions)

    print("Seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_data())
