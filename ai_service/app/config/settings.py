from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Model
    MODEL_PATH: str
    CONFIDENCE_THRESHOLD: float = 0.6

    # Temporal anomaly logic
    FRAMES_FOR_ANOMALY: int = 3
    ALERT_COOLDOWN_SECONDS: int = 60

    # Alerts
    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_CHAT_ID: str

    class Config:
        env_file = ".env"


settings = Settings()
