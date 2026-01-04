
import json
import time
import websocket
import threading
import sys
import argparse

def on_message(ws, message):
    data = json.loads(message)
    msg_type = data.get("type")
    print(f"[RECV] {msg_type}: {str(data)[:100]}...")

    if msg_type == "set-model-and-conf":
        print("[TEST] Handshake received. Sending init-interview-session...")
        payload = {
            "type": "init-interview-session",
            "jd": "We are looking for a Senior Python Developer with 5 years of experience in FastAPI and AI agents.",
            "resume": "Candidate: John Doe. Experience: 3 years Python, 2 years Node.js. Built 3 AI agents."
        }
        ws.send(json.dumps(payload))
        print("[TEST] init-interview-session sent.")

    elif msg_type == "interview-session-created":
        print(f"[TEST] SUCCESS! Session created. Status: {data.get('status')}")
        # Send a dummy audio packet to verify handling (silence)
        # 1024 samples of silence
        dummy_audio = [0.0] * 1024
        audio_payload = {
            "type": "mic-audio-data",
            "audio": dummy_audio
        }
        ws.send(json.dumps(audio_payload))
        print("[TEST] Dummy audio chunk sent.")

        # Close after success
        print("[TEST] Test Passed. Closing connection...")
        ws.close()

def on_error(ws, error):
    print(f"[ERROR] {error}")

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")

def on_open(ws):
    print("### Connection Opened ###")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=12393)
    args = parser.parse_args()

    websocket.enableTrace(True)
    ws_url = f"ws://localhost:{args.port}/client-ws"
    ws = websocket.WebSocketApp(ws_url,
                              on_open=on_open,
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close)

    ws.run_forever()
