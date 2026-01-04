from typing import Type
from .tts_interface import TTSInterface


class TTSFactory:
    @staticmethod
    def get_tts_engine(engine_type, **kwargs) -> Type[TTSInterface]:
        if engine_type == "azure_tts":
            from .azure_tts import TTSEngine as AzureTTSEngine

            return AzureTTSEngine(
                kwargs.get("api_key"),
                kwargs.get("region"),
                kwargs.get("voice"),
                kwargs.get("pitch"),
                kwargs.get("rate"),
                kwargs.get("style", "general"),
            )
        elif engine_type == "edge_tts":
            from .edge_tts import TTSEngine as EdgeTTSEngine

            return EdgeTTSEngine(kwargs.get("voice"))
        elif engine_type == "sherpa_onnx_tts":
            from .sherpa_onnx_tts import TTSEngine as SherpaOnnxTTSEngine

            return SherpaOnnxTTSEngine(**kwargs)
        elif engine_type == "openai_tts":
            from .openai_tts import TTSEngine as OpenAITTSEngine

            return OpenAITTSEngine(
                model=kwargs.get("model"),
                voice=kwargs.get("voice"),
                api_key=kwargs.get("api_key"),
                base_url=kwargs.get("base_url"),
                file_extension=kwargs.get("file_extension"),
            )
        elif engine_type == "elevenlabs_tts":
            from .elevenlabs_tts import TTSEngine as ElevenLabsTTSEngine

            return ElevenLabsTTSEngine(
                api_key=kwargs.get("api_key"),
                voice_id=kwargs.get("voice_id"),
                model_id=kwargs.get("model_id", "eleven_multilingual_v2"),
                output_format=kwargs.get("output_format", "mp3_44100_128"),
                stability=kwargs.get("stability", 0.5),
                similarity_boost=kwargs.get("similarity_boost", 0.5),
                style=kwargs.get("style", 0.0),
                use_speaker_boost=kwargs.get("use_speaker_boost", True),
            )
        else:
            raise ValueError(f"Unknown TTS engine type: {engine_type}")


# Example usage:
# tts_engine = TTSFactory.get_tts_engine("azure", api_key="your_api_key", region="your_region", voice="your_voice")
# tts_engine.speak("Hello world")
if __name__ == "__main__":
    tts_engine = TTSFactory.get_tts_engine(
        "spark_tts",
        api_url="http://127.0.0.1:7860/voice_clone",
        used_voices=r"D:\python\spark_tts\收集的语音\纳西妲-完整.mp3",
    )
    tts_engine.generate_audio("Hello world")
