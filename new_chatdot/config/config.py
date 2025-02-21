import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

class Config:
    DEBUG = True  # ✅ 추가
    PORT = 5002   # ✅ 추가
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise ValueError("Missing OpenAI API key. Please check your .env file.")
    
    @staticmethod
    def init_app(app):
        pass