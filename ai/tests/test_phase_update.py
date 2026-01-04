
import unittest
from unittest.mock import MagicMock, AsyncMock
import json
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.open_llm_vtuber.websocket_handler import WebSocketHandler, WSMessage
from src.open_llm_vtuber.service_context import ServiceContext
from src.open_llm_vtuber.interview.interview_manager import InterviewManager, InterviewSession

class TestPhaseUpdate(unittest.IsolatedAsyncioTestCase):
    async def test_update_interview_phase(self):
        # 1. Setup Mocks
        mock_context = MagicMock(spec=ServiceContext)
        mock_context.agent_engine = MagicMock()
        mock_context.agent_engine.set_system = MagicMock() # Verify this is called

        # Mock InterviewManager and Session
        mock_interview_manager = MagicMock(spec=InterviewManager)
        mock_session = MagicMock(spec=InterviewSession)
        mock_session.current_phase = "introduction"

        mock_interview_manager.get_session.return_value = mock_session
        mock_interview_manager.generate_system_prompt.return_value = "New Phase System Prompt"

        # Initialize Handler
        handler = WebSocketHandler(default_context_cache=mock_context)
        handler.interview_manager = mock_interview_manager
        handler.client_contexts["test_client"] = mock_context

        # Mock WebSocket
        mock_ws = AsyncMock()
        mock_ws.send_text = AsyncMock()

        # 2. Test Payload
        payload = {
            "type": "update-interview-phase",
            "phase": "technical"
        }

        # 3. Call the handler
        await handler._handle_update_interview_phase(mock_ws, "test_client", payload)

        # 4. Verify Assertions

        # Session Phase Updated?
        self.assertEqual(mock_session.current_phase, "technical")

        # New Prompt Generated?
        mock_interview_manager.generate_system_prompt.assert_called_with(mock_session)

        # Agent System Prompt Updated using set_system? (NOT load_from_config)
        mock_context.agent_engine.set_system.assert_called_with("New Phase System Prompt")

        # Client Notified?
        called_args = mock_ws.send_text.call_args[0][0]
        response_data = json.loads(called_args)

        self.assertEqual(response_data["type"], "interview-phase-updated")
        self.assertEqual(response_data["phase"], "technical")
        print("\n[SUCCESS] Phase Update Test Passed: System prompt hot-swapped correctly.")

if __name__ == "__main__":
    unittest.main()
