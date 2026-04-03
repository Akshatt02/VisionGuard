import requests
from app.config.settings import settings


class AlertDispatcher:
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID

    def dispatch(self, message: str):
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"

        payload = {
            "chat_id": self.chat_id,
            "text": message,
            "disable_web_page_preview": True,
        }

        response = requests.post(url, data=payload, timeout=5)

        print("Telegram status:", response.status_code)
