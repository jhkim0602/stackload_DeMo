import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from loguru import logger
from pydantic import BaseModel, Field
from typing import List

class JobAnalysis(BaseModel):
    company: str = Field(description="Name of the company")
    position: str = Field(description="Job position title")
    qualifications: List[str] = Field(description="List of key qualifications (requirements)")
    preferences: List[str] = Field(description="List of preferred qualifications (nice-to-haves)")
    techStack: List[str] = Field(description="List of technology stack mentioned")
    process: str = Field(description="Summary of the recruitment process")

class JDAnalyzer:
    """
    Analyzes Job Description text to extract structured information
    matching the frontend requirements.
    """
    def __init__(self, model_name: str = "gemini-2.0-flash-exp"):
        self.llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.0)
        self.parser = JsonOutputParser(pydantic_object=JobAnalysis)

        self.prompt = PromptTemplate(
            template="""
            You are an expert Technical Recruiter. Analyze the following Job Description text and extract structured information.

            JOB DESCRIPTION:
            {jd_text}

            INSTRUCTIONS:
            Extract the following fields in strict JSON format:
            - company: Company name (guess if not explicit, or "Unknown")
            - position: Job title
            - qualifications: List of mandatory requirements (Top 5-7 key points)
            - preferences: List of preferred qualifications (Top 3-5 points)
            - techStack: List of specific technologies, languages, frameworks mentioned
            - process: Brief summary of the hiring process steps

            {format_instructions}
            """,
            input_variables=["jd_text"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )

        self.chain = self.prompt | self.llm | self.parser

    async def analyze(self, jd_text: str) -> dict:
        logger.info("🔍 Analyzing JD Text...")
        try:
            # Simple truncation to avoid context limits if crawler got garbage
            if len(jd_text) > 20000:
                jd_text = jd_text[:20000]

            result = await self.chain.ainvoke({"jd_text": jd_text})
            logger.info("✅ JD Analysis complete")
            return result
        except Exception as e:
            logger.error(f"❌ JD Analysis failed: {e}")
            return {
                "company": "Error",
                "position": "Analysis Failed",
                "qualifications": ["Failed to analyze JD."],
                "preferences": [],
                "techStack": [],
                "process": ""
            }
