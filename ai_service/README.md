# VisionGuard — Real-Time Helmet Violation Detection System

VisionGuard is a real-time computer vision system that monitors live video streams, detects helmet violations using a custom-trained YOLO model, applies temporal anomaly logic to reduce false positives, and triggers Telegram alerts for confirmed violations.

The system is designed with a modular backend architecture, making it extensible for future multi-camera and full-stack integrations.

## 🔍 Key Features

- Real-time video ingestion using OpenCV
- Custom YOLO model for person & helmet detection
- Spatial logic to identify helmet violations
- Temporal anomaly engine to avoid alert noise
- SQLite-based event logging
- Telegram bot integration for instant alerts
- GPU-accelerated inference (when CUDA available)

## 🏗 System Architecture
Camera (Webcam)
↓
Frame Capture (OpenCV)
↓
YOLO Inference (Person + Helmet)
↓
Helmet Violation Logic
↓
Temporal Anomaly Engine
↓
Event Logger (SQLite)
↓
Telegram Alert Dispatcher

text

## 🧠 Anomaly Detection Logic

A helmet violation is considered valid only if:

1. A person is detected without a helmet
2. The condition persists across N consecutive frames
3. Cooldown rules prevent repeated alerts for the same incident

This temporal validation significantly reduces false positives caused by lighting or transient detections.

## 📂 Project Structure
visiongaurd/
├── app/
│ ├── inference/ # YOLO inference & video stream
│ ├── anomaly_engine/ # Helmet logic & temporal engine
│ ├── alerts/ # Telegram alert dispatcher
│ ├── db/ # SQLite database & models
│ └── config/ # App settings
│
├── scripts/
│ └── test_yolo.py # Main execution script
│
├── datasets/ # (Ignored) Training datasets
├── runs/ # YOLO training outputs
├── evidence/ # Saved violation frames (optional)
├── .env # Environment variables (ignored)
├── .gitignore
└── README.md

text

## 📦 Dataset Information

The model was trained using a helmet safety dataset sourced from Roboflow, exported in YOLO format.

### Dataset Classes
- `person`
- `helmet`

⚠️ **Note:** The dataset directory is not included in this repository due to size constraints.

You are expected to place datasets locally under:
datasets/helmet/

text

## 🧪 Virtual Environment Setup

A Python virtual environment is used to isolate dependencies.

1. **Create Virtual Environment**
python -m venv venv

text

2. **Activate (Windows)**
venv\Scripts\activate

text

3. **Install Dependencies**
pip install -r requirements.txt

text

📌 The `venv/` directory is git-ignored and must be created locally.

## 🔐 Environment Variables (.env)

Create a `.env` file in the project root.

### .env Example
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
FRAMES_FOR_ANOMALY=3
ALERT_COOLDOWN_SECONDS=10

text

**Notes:**
- `.env` is git-ignored
- Telegram bot must be started using `/start`
- Chat ID can be obtained via Telegram getUpdates API

## 🚨 Telegram Alerts

When a confirmed helmet violation occurs:

1. An entry is stored in SQLite
2. A Telegram alert is sent containing:
   - Violation type
   - Confidence score
   - Camera ID
   - Timestamp

This ensures real-time notification with persistent audit logs.

## ▶️ Running the System

From the project root:
python -m scripts.test_yolo

text

Press `q` to exit the video stream.

## ⚙ Hardware & Performance

- Tested with real-time webcam feed
- Supports GPU acceleration when CUDA is available
- Average inference latency: ~8–12 ms per frame

## 🚀 Future Enhancements (Planned)

- Multi-camera support (webcam, mobile, IP cameras)
- Web-based monitoring dashboard
- Evidence image/video storage
- FastAPI streaming APIs
- Cloud deployment

## 📌 Disclaimer

This project focuses on system design and real-time processing rather than perfect detection accuracy. Lighting conditions and dataset bias can affect raw detections, which are mitigated using temporal logic.

## 🧑‍💻 Author

VisionGuard — Built as an applied computer vision & backend systems project.
