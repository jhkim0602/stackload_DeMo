import os
import asyncio
import json
import subprocess
import tempfile
import shutil
from pathlib import Path
from uuid import uuid4
import numpy as np
from datetime import datetime
from fastapi import APIRouter, WebSocket, UploadFile, File, Response, Body, HTTPException
from starlette.responses import JSONResponse
from starlette.websockets import WebSocketDisconnect
from loguru import logger
from .service_context import ServiceContext
from .websocket_handler import WebSocketHandler
from .proxy_handler import ProxyHandler


def init_client_ws_route(default_context_cache: ServiceContext, config=None) -> APIRouter:
    """
    Create and return API routes for handling the `/client-ws` WebSocket connections.

    Args:
        default_context_cache: Default service context cache for new sessions.
        config: Application configuration.

    Returns:
        APIRouter: Configured router with WebSocket endpoint.
    """

    router = APIRouter()
    ws_handler = WebSocketHandler(default_context_cache, config)

    @router.websocket("/client-ws")
    async def websocket_endpoint(websocket: WebSocket):
        """WebSocket endpoint for client connections"""
        await websocket.accept()
        client_uid = str(uuid4())

        try:
            await ws_handler.handle_new_connection(websocket, client_uid)
            await ws_handler.handle_websocket_communication(websocket, client_uid)
        except WebSocketDisconnect:
            await ws_handler.handle_disconnect(client_uid)
        except Exception as e:
            logger.error(f"Error in WebSocket connection: {e}")
            await ws_handler.handle_disconnect(client_uid)
            raise

    return router


def init_proxy_route(server_url: str) -> APIRouter:
    """
    Create and return API routes for handling proxy connections.

    Args:
        server_url: The WebSocket URL of the actual server

    Returns:
        APIRouter: Configured router with proxy WebSocket endpoint
    """
    router = APIRouter()
    proxy_handler = ProxyHandler(server_url)

    @router.websocket("/proxy-ws")
    async def proxy_endpoint(websocket: WebSocket):
        """WebSocket endpoint for proxy connections"""
        try:
            await proxy_handler.handle_client_connection(websocket)
        except Exception as e:
            logger.error(f"Error in proxy connection: {e}")
            raise

    return router


def init_webtool_routes(default_context_cache: ServiceContext) -> APIRouter:
    """
    Create and return API routes for handling web tool interactions.

    Args:
        default_context_cache: Default service context cache for new sessions.

    Returns:
        APIRouter: Configured router with WebSocket endpoint.
    """

    router = APIRouter()

    @router.get("/web-tool")
    async def web_tool_redirect():
        """Redirect /web-tool to /web_tool/index.html"""
        return Response(status_code=302, headers={"Location": "/web-tool/index.html"})

    @router.get("/web_tool")
    async def web_tool_redirect_alt():
        """Redirect /web_tool to /web_tool/index.html"""
        return Response(status_code=302, headers={"Location": "/web-tool/index.html"})

    @router.get("/live2d-models/info")
    async def get_live2d_folder_info():
        """Get information about available Live2D models"""
        live2d_dir = "live2d-models"
        if not os.path.exists(live2d_dir):
            return JSONResponse(
                {"error": "Live2D models directory not found"}, status_code=404
            )

        valid_characters = []
        supported_extensions = [".png", ".jpg", ".jpeg"]

        for entry in os.scandir(live2d_dir):
            if entry.is_dir():
                folder_name = entry.name.replace("\\", "/")
                model3_file = os.path.join(
                    live2d_dir, folder_name, f"{folder_name}.model3.json"
                ).replace("\\", "/")

                if os.path.isfile(model3_file):
                    # Find avatar file if it exists
                    avatar_file = None
                    for ext in supported_extensions:
                        avatar_path = os.path.join(
                            live2d_dir, folder_name, f"{folder_name}{ext}"
                        )
                        if os.path.isfile(avatar_path):
                            avatar_file = avatar_path.replace("\\", "/")
                            break

                    valid_characters.append(
                        {
                            "name": folder_name,
                            "avatar": avatar_file,
                            "model_path": model3_file,
                        }
                    )
        return JSONResponse(
            {
                "type": "live2d-models/info",
                "count": len(valid_characters),
                "characters": valid_characters,
            }
        )

    @router.post("/asr")
    async def transcribe_audio(file: UploadFile = File(...)):
        """
        Endpoint for transcribing audio using the ASR engine
        """
        logger.info(f"Received audio file for transcription: {file.filename}")

        try:
            contents = await file.read()

            # Validate minimum file size
            if len(contents) < 44:  # Minimum WAV header size
                raise ValueError("Invalid WAV file: File too small")

            # Decode the WAV header and get actual audio data
            wav_header_size = 44  # Standard WAV header size
            audio_data = contents[wav_header_size:]

            # Validate audio data size
            if len(audio_data) % 2 != 0:
                raise ValueError("Invalid audio data: Buffer size must be even")

            # Convert to 16-bit PCM samples to float32
            try:
                audio_array = (
                    np.frombuffer(audio_data, dtype=np.int16).astype(np.float32)
                    / 32768.0
                )
            except ValueError as e:
                raise ValueError(
                    f"Audio format error: {str(e)}. Please ensure the file is 16-bit PCM WAV format."
                )

            # Validate audio data
            if len(audio_array) == 0:
                raise ValueError("Empty audio data")

            text = await default_context_cache.asr_engine.async_transcribe_np(
                audio_array
            )
            logger.info(f"Transcription result: {text}")
            return {"text": text}

        except ValueError as e:
            logger.error(f"Audio format error: {e}")
            return Response(
                content=json.dumps({"error": str(e)}),
                status_code=400,
                media_type="application/json",
            )
        except Exception as e:
            logger.error(f"Error during transcription: {e}")
            return Response(
                content=json.dumps(
                    {"error": "Internal server error during transcription"}
                ),
                status_code=500,
                media_type="application/json",
            )

    @router.websocket("/tts-ws")
    async def tts_endpoint(websocket: WebSocket):
        """WebSocket endpoint for TTS generation"""
        await websocket.accept()
        logger.info("TTS WebSocket connection established")

        try:
            while True:
                data = await websocket.receive_json()
                text = data.get("text")
                if not text:
                    continue

                logger.info(f"Received text for TTS: {text}")

                # Split text into sentences
                sentences = [s.strip() for s in text.split(".") if s.strip()]

                try:
                    # Generate and send audio for each sentence
                    for sentence in sentences:
                        sentence = sentence + "."  # Add back the period
                        file_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid4())[:8]}"
                        audio_path = (
                            await default_context_cache.tts_engine.async_generate_audio(
                                text=sentence, file_name_no_ext=file_name
                            )
                        )
                        logger.info(
                            f"Generated audio for sentence: {sentence} at: {audio_path}"
                        )

                        await websocket.send_json(
                            {
                                "status": "partial",
                                "audioPath": audio_path,
                                "text": sentence,
                            }
                        )

                    # Send completion signal
                    await websocket.send_json({"status": "complete"})

                except Exception as e:
                    logger.error(f"Error generating TTS: {e}")
                    await websocket.send_json({"status": "error", "message": str(e)})

        except WebSocketDisconnect:
            logger.info("TTS WebSocket client disconnected")
        except Exception as e:
            logger.error(f"Error in TTS WebSocket connection: {e}")
            await websocket.close()

    return router

def init_analysis_routes(service_context: ServiceContext) -> APIRouter:
    """
    Create API routes for data analysis (Resume & JD).
    """
    router = APIRouter(prefix="/analyze")

    @router.post("/resume")
    async def analyze_resume(file: UploadFile = File(...)):
        """
        Upload Resume (PDF/Image) and analyze using Gemini Multimodal.
        """
        logger.info(f"Received resume upload: {file.filename}")

        # Save to temp file
        try:
            suffix = Path(file.filename).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name

            logger.info(f"Saved resume to temp path: {tmp_path}")

            # Analyze using InterviewManager's ResumeAnalyzer
            # Note: We access the internal resume_analyzer of interview_manager
            # Ensure interview_manager is initialized in service_context
            if not service_context.interview_manager:
                raise HTTPException(status_code=500, detail="Interview Manager not initialized")

            result = await service_context.interview_manager.resume_analyzer.analyze(tmp_path)

            # Cleanup temp file
            os.remove(tmp_path)

            if "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])

            return JSONResponse(result)

        except Exception as e:
            logger.error(f"Error processing resume: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/jd")
    async def analyze_jd(payload: dict = Body(...)):
        """
        Crawl JD URL and analyze text.
        Payload: {"url": "..."}
        """
        url = payload.get("url")
        if not url:
            raise HTTPException(status_code=400, detail="URL is required")

        logger.info(f"Received JD analysis request for: {url}")

        try:
            # 1. Call Crawler Service (CLI)
            # Path to crawler/cli_jd.py relative to this file
            # ai/src/open_llm_vtuber/routes.py -> ../../../crawler/cli_jd.py
            base_dir = Path(__file__).parent.parent.parent.parent # ai/
            crawler_script = base_dir / "crawler" / "cli_jd.py"

            if not crawler_script.exists():
                 # Fallback/Debug path check
                 logger.error(f"Crawler script not found at: {crawler_script}")
                 # Try hardcoded assumption if relative path failed
                 crawler_script = Path("/Users/junghwan/Desktop/StackLoad_Demo/crawler/cli_jd.py")

            # Run subprocess using system python for simplicity as proof of concept
            # Assuming 'python' is in path
            cmd = ["python", str(crawler_script), url]
            logger.info(f"Running crawler command: {' '.join(cmd)}")

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                logger.error(f"Crawler failed: {stderr.decode()}")
                raise HTTPException(status_code=500, detail=f"Crawler failed: {stderr.decode()}")

            jd_text = stdout.decode().strip()
            logger.info(f"Crawler returned {len(jd_text)} chars")

            # 2. Analyze using JDAnalyzer
            if not service_context.jd_analyzer:
                 raise HTTPException(status_code=500, detail="JD Analyzer not initialized")

            analysis_result = await service_context.jd_analyzer.analyze(jd_text)

            return JSONResponse(analysis_result)

        except Exception as e:
            logger.error(f"Error processing JD: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router


def init_report_routes(service_context: ServiceContext) -> APIRouter:
    """
    Create API routes for fetching interview reports.
    """
    router = APIRouter(prefix="/interview")

    @router.get("/report/{client_uid}")
    async def get_interview_report(client_uid: str):
        if not service_context.interview_manager:
            return JSONResponse({"error": "Interview Manager not initialized"}, status_code=500)

        report = service_context.interview_manager.generate_report(client_uid)
        if not report:
            return JSONResponse(
                {
                    "error": "Session not found or empty",
                    "details": "No active or past session found for this UID."
                },
                status_code=404
            )

        return JSONResponse(report)

    return router
