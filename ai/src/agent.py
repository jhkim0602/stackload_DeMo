import logging
import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, WorkerOptions, cli
from livekit.plugins import google

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger("ai-interviewer")
logging.basicConfig(level=logging.INFO)

async def entrypoint(ctx: agents.JobContext):
    """
    Main entry point for the LiveKit Agent (Gemini Realtime Mode).
    Uses AgentSession + RealtimeModel for native audio interaction.
    """
    try:
        # Connect to the room
        await ctx.connect()
        logger.info(f"Connected to room: {ctx.room.name}")

        # Initialize Gemini Realtime Model (Native Audio)
        model = google.realtime.RealtimeModel(
            model="gemini-2.5-flash-native-audio-preview-12-2025",
            voice="Kore",
            instructions="""
                당신은 'StackLoad'라는 이름의 전문 AI 기술 면접관입니다.
                당신의 목표는 시니어 개발자 포지션에 지원한 후보자를 대상으로 코딩 면접을 진행하는 것입니다.
                정중하지만 엄격하게 평가하세요. 사용자가 말이 없으면 자연스럽게 대화를 유도하세요.
                사용자의 답변에 따라 꼬리 질문을 던지세요.
                답변은 간결하고 대화체로(1-2문장) 하세요.
            """,
        )

        session = AgentSession(llm=model)

        # Start the session with the room
        await session.start(
            room=ctx.room,
            agent=Agent(instructions="시스템 지침을 따르고 한국어로 면접을 진행하세요.")
        )

        # Send initial greeting
        await session.generate_reply(
            instructions="지원자에게 정중하게 인사하고 자기소개를 부탁하세요."
        )

        logger.info("Agent started successfully (Realtime Mode).")

    except Exception as e:
        logger.error(f"Failed to start agent: {e}")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
