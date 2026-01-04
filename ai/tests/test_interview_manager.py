
import unittest
from unittest.mock import MagicMock
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.open_llm_vtuber.interview.interview_manager import InterviewManager, InterviewSession

class TestInterviewManager(unittest.TestCase):
    def setUp(self):
        self.manager = InterviewManager()
        self.client_uid = "test_user"
        self.jd = "Software Engineer"
        self.resume = "Python Expert"

    def test_create_session(self):
        session = self.manager.create_session(self.client_uid, self.jd, self.resume)
        self.assertIsInstance(session, InterviewSession)
        self.assertEqual(session.client_uid, self.client_uid)
        self.assertEqual(session.jd_text, self.jd)
        self.assertEqual(session.status, "init")

    def test_prompt_generation_introduction_phase(self):
        session = self.manager.create_session(self.client_uid, self.jd, self.resume)
        session.current_phase = "introduction"

        prompt = self.manager.generate_system_prompt(session)

        self.assertIn("named \"Mao\"", prompt) # Check base prompt
        self.assertIn("Software Engineer", prompt) # Check JD injection
        self.assertIn("CURRENT PHASE: INTRODUCTION", prompt) # Check phase label
        self.assertIn("Start by briefly introducing yourself", prompt) # Check specific phase instruction

    def test_prompt_generation_technical_phase(self):
        session = self.manager.create_session(self.client_uid, self.jd, self.resume)
        session.current_phase = "technical"

        prompt = self.manager.generate_system_prompt(session)

        self.assertIn("CURRENT PHASE: TECHNICAL", prompt)
        self.assertIn("Focus on the hard skills", prompt)
        self.assertIn("Testing Depth", prompt)

    def test_prompt_generation_behavioral_phase(self):
        session = self.manager.create_session(self.client_uid, self.jd, self.resume)
        session.current_phase = "behavioral"

        prompt = self.manager.generate_system_prompt(session)

        self.assertIn("CURRENT PHASE: BEHAVIORAL", prompt)
        self.assertIn("STAR method", prompt)

if __name__ == "__main__":
    unittest.main()
