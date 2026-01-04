import os
import asyncio
from typing import Dict, Any, List
import google.generativeai as genai
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

class ResumeAnalyzer:
    """
    Uses Gemini Multimodal (Vision/File API) to analyze resumes (PDF/Images) directly.
    No OCR or text extraction required.
    """

    def __init__(self, model_name: str = "gemini-2.0-flash-exp"):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY or GOOGLE_API_KEY not found in environment variables.")
            raise ValueError("API Key missing")

        genai.configure(api_key=self.api_key)
        self.model_name = model_name
        self.model = genai.GenerativeModel(model_name)

        # Combined Prompt for efficiency
        self.analysis_prompt = """
        You are an expert HR Recruiter. Analyze the provided resume file.
        Extract the following information in strict JSON format:
        1. "strengths": A string describing the candidate's key strengths (1-2 sentences).
        2. "weaknesses": A string describing potential weaknesses or areas for improvement (1-2 sentences).
        3. "experiences": A string summarizing key academic and professional experiences (2-3 sentences).
        4. "summary": A brief 1-sentence summary of the candidate.

        Return ONLY the JSON object. Do not inlcude markdown formatting like ```json.
        """

    async def analyze(self, input_data: str) -> Dict[str, Any]:
        """
        Analyzes the resume file (PDF or Image).

        Args:
            input_data (str): Absolute path to the resume file.

        Returns:
            Dict[str, Any]: The extracted insights.
        """
        logger.info(f"📄 Analyzing Resume using Multimodal API: {input_data}")

        if not os.path.exists(input_data):
            logger.warning(f"Resume file not found or invalid path: {input_data}. Proceeding without resume analysis.")
            return {
                "strengths_weaknesses": "Strengths: N/A\nWeaknesses: N/A (Resume not provided)",
                "experiences": "No resume provided.",
                "raw_text": "Resume analysis skipped."
            }

        try:
            # 1. Upload File to Gemini
            logger.info("Uploading file to Gemini...")
            # Use run_in_executor for synchronous SDK calls to avoid blocking
            loop = asyncio.get_event_loop()

            # Helper for synchronous upload
            def upload_and_process():
                uploaded_file = genai.upload_file(input_data)
                # Wait for processing state (usually fast for small files, but good practice)
                import time
                while uploaded_file.state.name == "PROCESSING":
                    time.sleep(1)
                    uploaded_file = genai.get_file(uploaded_file.name)
                return uploaded_file

            uploaded_file = await loop.run_in_executor(None, upload_and_process)
            logger.info(f"File uploaded: {uploaded_file.uri}")

            # 2. Generate Content
            logger.info("Generating analysis...")
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content([uploaded_file, self.analysis_prompt])
            )

            # 3. Parse Result
            response_text = response.text.replace("```json", "").replace("```", "").strip()
            import json
            result_json = json.loads(response_text)

            logger.info("Analysis complete.")
            return {
                "strengths_weaknesses": f"Strengths: {result_json.get('strengths', '')}\nWeaknesses: {result_json.get('weaknesses', '')}",
                "experiences": result_json.get('experiences', ''),
                "raw_text": result_json.get('summary', 'Analysis performed via Multimodal Model.')
            }

        except Exception as e:
            logger.error(f"Error during multimodal analysis: {e}")
            return {
                "error": str(e),
                "strengths_weaknesses": "Error initializing analysis.",
                "experiences": "N/A"
            }
