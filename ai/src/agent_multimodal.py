import logging
import os
from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.multimodal import MultimodalAgent
from livekit.plugins import google

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger("ai-interviewer")
logging.basicConfig(level=logging.INFO)

async def entrypoint(ctx: JobContext):
    """
    Main entry point for the LiveKit Agent (Native Audio / Multimodal Mode).
    Requires livekit-agents >= 1.4.0 (or pre-release).
    """
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")

    # Gemini Live API (Native Audio)
    model = google.realtime.RealtimeModel(
        model="gemini-2.0-flash-exp",
        voice="Puck",
        temperature=0.7,
        instructions="""
            You are a professional AI Technical Interviewer named 'TechMoa'.
            Your goal is to conduct a coding interview for a Senior Developer position.
        """
    )

    agent = MultimodalAgent(model=model)
    agent.start(ctx.room, participant)
    logger.info("Multimodal Agent started.")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
