import os
from typing import List, Optional, Tuple
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from loguru import logger

class VectorStoreManager:
    """
    RAG 파이프라인을 위한 벡터 스토어(ChromaDB) 관리자입니다.
    질문, 답변, 코멘트 등의 데이터를 저장하고 검색하는 역할을 담당합니다.
    """

    def __init__(self, persist_directory: str = "./chroma_db", embedding_model: str = "models/embedding-001"):
        self.persist_directory = persist_directory
        # Google Gemini Embeddings 사용
        # .env 파일 또는 환경 변수에 GOOGLE_API_KEY가 설정되어 있어야 합니다.
        self.embeddings = GoogleGenerativeAIEmbeddings(model=embedding_model)

        # 컬렉션 초기화
        self.collections = {
            "question": Chroma(
                collection_name="jobk_question",
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory
            ),
            "answer": Chroma(
                collection_name="jobk_answer",
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory
            ),
            "comment": Chroma(
                collection_name="jobk_comment",
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory
            )
        }
        logger.info(f"VectorStoreManager가 {self.persist_directory}에서 Gemini Embeddings로 초기화되었습니다.")

    async def add_documents(self, collection_name: str, documents: List[Document]):
        """
        특정 컬렉션에 문서를 추가합니다.
        """
        if collection_name not in self.collections:
            raise ValueError(f"유효하지 않은 컬렉션 이름입니다: {collection_name}")

        logger.info(f"{collection_name} 컬렉션에 {len(documents)}개의 문서를 추가합니다.")
        await self.collections[collection_name].aadd_documents(documents)

    async def similarity_search(
        self,
        collection_name: str,
        query: str,
        k: int = 4
    ) -> List[Tuple[Document, float]]:
        """
        특정 컬렉션에서 유사도 검색을 수행합니다.
        """
        if collection_name not in self.collections:
            raise ValueError(f"유효하지 않은 컬렉션 이름입니다: {collection_name}")

        # 참고: ChromaDB similarity_search_with_score는 기본적으로 L2 거리(낮을수록 좋음)를 반환하거나
        # 설정에 따라 코사인 거리를 반환할 수 있습니다.
        results = await self.collections[collection_name].asimilarity_search_with_score(query, k=k)
        return results

    def get_retriever(self, collection_name: str, k: int = 4):
        """
        """
        if collection_name not in self.collections:
            raise ValueError(f"Invalid collection name: {collection_name}")

        return self.collections[collection_name].as_retriever(search_kwargs={"k": k})
