
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
import json
import sys
import os

# Add src to path to import modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.open_llm_vtuber.websocket_handler import WebSocketHandler
from src.open_llm_vtuber.service_context import ServiceContext
from src.open_llm_vtuber.config_manager.main import Config
from src.open_llm_vtuber.interview.interview_manager import InterviewManager

class TestWebSocketProtocol(unittest.IsolatedAsyncioTestCase):
    async def test_init_interview_session(self):
        # 1. Setup Mocks
        mock_context = MagicMock(spec=ServiceContext)
        mock_context.config = MagicMock()
        mock_context.config.model_copy.return_value = mock_context.config # Mock copy
        mock_context.character_config = MagicMock()
        mock_context.load_from_config = AsyncMock() # Async method

        # Mock InterviewManager
        mock_interview_manager = MagicMock(spec=InterviewManager)
        mock_session = MagicMock()
        mock_interview_manager.create_session.return_value = mock_session
        mock_interview_manager.generate_system_prompt.return_value = "Mock System Prompt"

        # Initialize Handler with mocked context
        handler = WebSocketHandler(default_context_cache=mock_context)
        # Inject mock interview manager
        handler.interview_manager = mock_interview_manager

        # Mock Client Contexts
        handler.client_contexts["test_client"] = mock_context

        # Mock WebSocket
        mock_ws = AsyncMock()
        mock_ws.send_text = AsyncMock()

        # 2. Test Payload
        payload = {
            "type": "init-interview-session",
            "jd": "Wanted: Wizard",
            "resume": "I am a wizard"
        }

        # 3. Call the handler
        await handler._handle_init_interview_session(mock_ws, "test_client", payload)

        # 4. Verify Assertions

        # Verify Session Created
        mock_interview_manager.create_session.assert_called_with("test_client", "Wanted: Wizard", "I am a wizard")

        # Verify Prompt Generated
        mock_interview_manager.generate_system_prompt.assert_called_with(mock_session)

        # Verify Context Updated
        # Check if load_from_config was called (meaning config was reloaded)
        mock_context.load_from_config.assert_called_once()

        # Verify Response Sent to Client
        called_args = mock_ws.send_text.call_args[0][0]
        response_data = json.loads(called_args)

        self.assertEqual(response_data["type"], "interview-session-created")
        self.assertEqual(response_data["status"], "ready")
        print("\n[SUCCESS] Unit Test Passed: init-interview-session handled correctly.")

if __name__ == "__main__":
    unittest.main()
