import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

class Config:
    DEBUG = True  # ✅ 추가
    PORT = 5002   # ✅ 추가
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'your_mysql_username')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'your_mysql_password')
    MYSQL_DB = os.getenv('MYSQL_DB', 'chatbot_db')
    
    if not OPENAI_API_KEY:
        raise ValueError("Missing OpenAI API key. Please check your .env file.")
    
    @staticmethod
    def init_app(app):
        pass