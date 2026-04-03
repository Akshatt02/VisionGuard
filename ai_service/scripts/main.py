import sys
import os
import cv2
import requests
import io
import base64
import time
import socketio
from datetime import datetime

# Path setup
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.inference.video_stream import VideoStream
from app.inference.yolo_infer import YoloInferencer
from app.anomaly_engine.helmet_logic import helmet_violations
from app.anomaly_engine.temporal_engine import TemporalAnomalyEngine
from app.alerts.async_dispatcher import AlertDispatcher

# --- CONFIGURATION ---
NODE_API_URL = "http://localhost:5000/api/violations/detect" 
STATION_ID = "STATION_01"  

sio = socketio.Client()
try:
    sio.connect('http://localhost:5000')
except Exception as e:
    print(f"Socket connection failed: {e}")

def send_to_backend(frame, station_id):
    try:
        success, encoded_image = cv2.imencode('.jpg', frame)
        if not success: return False

        files = {'image': ('violation.jpg', io.BytesIO(encoded_image.tobytes()), 'image/jpeg')}
        data = {'station_id': station_id}

        response = requests.post(NODE_API_URL, files=files, data=data, timeout=10)
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"📡 Cloud Sync Error: {e}")
        return False

def main():
    stream = VideoStream(source=0)
    yolo = YoloInferencer(model_path="models/best.pt")
    engine = TemporalAnomalyEngine(frames_required=3, cooldown_seconds=15)
    dispatcher = AlertDispatcher()

    alert_sent = False

    print(f"VisionGuard Edge Active - {STATION_ID}")

    last_stream_time = 0
    stream_interval = 0.2  # 5 FPS

    while True:
        frame, fps = stream.read()
        if frame is None: break

        # 1. Detection
        detections = yolo.infer(frame)
        persons = [d for d in detections if d.class_name == "person"]
        helmets = [d for d in detections if d.class_name == "helmet" and d.confidence >= 0.7]
        violations = helmet_violations(persons, helmets, head_ratio=0.22)

        # 2. Logic State
        is_violation_present = len(violations) > 0
        anomaly_confirmed = engine.update(is_violation_present)

        # 3. Drawing (Always draw for the local UI and potential upload)
        for h in helmets:
            cv2.rectangle(frame, (h.x1, h.y1), (h.x2, h.y2), (0, 255, 0), 2)
        for p in violations:
            cv2.rectangle(frame, (p.x1, p.y1), (p.x2, p.y2), (0, 0, 255), 2)

        # 4. Trigger Alert & Upload (Once per anomaly)
        if anomaly_confirmed and not alert_sent:
            # Telegram Alert
            dispatcher.dispatch(f"🚨 Helmet violation at {STATION_ID}")
            
            # Node.js / Cloudinary Upload
            if send_to_backend(frame, STATION_ID):
                print("✅ Violation synced to cloud")
            
            alert_sent = True

        # 5. Reset Trigger
        if not engine.active:
            alert_sent = False

        # 6. HUD
        status_txt = "ANOMALY" if engine.active else "NORMAL"
        status_clr = (0, 0, 255) if engine.active else (0, 255, 0)
        cv2.putText(frame, f"FPS: {fps:.1f} | {status_txt}", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_clr, 2)

        # --- STREAMING LOGIC ---
        current_time = time.time()
        if current_time - last_stream_time > stream_interval:
            try:
                # 1. Resize to 480p (Fast for web)
                small_frame = cv2.resize(frame, (640, 360))
                # 2. Lower JPEG quality to 40% (Huge bandwidth savings)
                _, buffer = cv2.imencode('.jpg', small_frame, [cv2.IMWRITE_JPEG_QUALITY, 40])
                # 3. Convert to Base64 string
                jpg_as_text = base64.b64encode(buffer).decode('utf-8')
                # 4. Emit via socket
                sio.emit('STREAM_FRAME', {
                    'station_id': STATION_ID, 
                    'image': jpg_as_text
                })
            except Exception:
                pass
            last_stream_time = current_time

        cv2.imshow("VisionGuard Edge", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"): break

    stream.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()