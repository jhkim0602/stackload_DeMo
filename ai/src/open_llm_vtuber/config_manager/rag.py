from pydantic import Field
from .i18n import I18nMixin, Description

class RAGConfig(I18nMixin):
    """
    Configuration for Retrieval Augmented Generation (RAG) settings.
    """
    enabled: bool = Field(default=True, description="Enable RAG functionality")
    llm_model: str = Field(default="gemini-2.0-flash-exp", description="LLM model name for RAG tasks")
    embedding_model: str = Field(default="models/embedding-001", description="Embedding model name")
    vector_db_path: str = Field(default="./chroma_db", description="Path to Vector DB persistence directory")
    temperature_question: float = Field(default=0.7, description="Temperature for question generation")
    temperature_feedback: float = Field(default=0.3, description="Temperature for feedback generation")

    DESCRIPTIONS = {
        "enabled": Description(en="Enable RAG functionality", zh="启用 RAG 功能"),
        "llm_model": Description(en="LLM model name for RAG tasks (e.g. gemini-pro)", zh="RAG 任务使用的 LLM 模型名称 (例如 gemini-pro)"),
        "embedding_model": Description(en="Embedding model name", zh="嵌入模型名称"),
        "vector_db_path": Description(en="Path to Vector DB persistence directory", zh="向量数据库持久化目录路径"),
        "temperature_question": Description(en="Temperature for question generation", zh="问题生成的温度值"),
        "temperature_feedback": Description(en="Temperature for feedback generation", zh="反馈生成的温度值"),
    }
