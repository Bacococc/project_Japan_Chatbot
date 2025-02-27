import openai
import os
import logging
from dotenv import load_dotenv
import time

# 환경 변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI API 키 설정
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API key. Please check your .env file.")

# OpenAI 클라이언트 생성 (v1.0.0 이후 방식)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# 동기 재시도 로직
def send_request_with_retry(request_function, retries=3, delay=5):
    for i in range(retries):
        try:
            return request_function()
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            if i < retries - 1:
                logger.warning(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                logger.error("Maximum retries reached, unable to complete the request.")
                raise

# OpenAI 응답 함수 (대화 기록을 기반으로 응답 생성)
def get_openai_response(conversation_history):
    def request():
        try:
            # OpenAI API 호출 (v1.0.0 방식)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",  # GPT 모델 지정
                messages=conversation_history,  # 대화 이력을 그대로 전달
                max_tokens=100,  # 응답 길이 제한
                temperature=0.7  # 창의적인 답변을 위한 온도 설정
            )

            # 응답 내용 추출
            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Error during OpenAI request: {e}")
            raise

    # 재시도 로직 적용
    return send_request_with_retry(request)