from flask import Flask, jsonify, request, session
from flask_cors import CORS
from services.openai_service import get_openai_response
from flask_apispec import FlaskApiSpec, MethodResource, doc
from datetime import datetime
import os
from dotenv import load_dotenv
from auth import auth_bp  # auth.py에서 Blueprint 가져오기

# .env 파일에서 환경 변수 로드
load_dotenv()

# Flask app 설정
app = Flask(__name__)

# .env 파일에서 SECRET_KEY 가져오기
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key')

# CORS 활성화
CORS(app)

# 로깅 설정
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask-APISpec 설정
app.config['APISPEC_SWAGGER_UI_URL'] = '/swagger/'
docs = FlaskApiSpec(app)

# 대화 기록을 저장할 임시 데이터베이스 (세션별로)
conversation_db = {}

def get_current_date():
    return datetime.now().strftime("%Y年 %m月 %d日")

class ChatResource(MethodResource):
    @doc(description="Chat with the AI bot",
         params={
             'messages': {
                 'in': 'body',
                 'type': 'array',
                 'items': {
                     'type': 'object',
                     'properties': {
                         'role': {'type': 'string'},
                         'content': {'type': 'string'}
                     }
                 },
                 'description': 'Conversation messages history'
             }
         })
    def post(self):
        """Chat with the AI bot"""
        
        # 요청 본문에서 JSON을 가져오고, 없으면 에러를 반환
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        try:
            conversation_history = request.get_json().get("messages", [])
            
            # 세션 ID 확인 (없으면 새로운 세션 ID 생성)
            session_id = session.get('session_id')
            if not session_id:
                session['session_id'] = os.urandom(24).hex()  # 고유한 세션 ID 생성
                session_id = session['session_id']

            # 세션에 따른 대화 기록 관리
            if session_id not in conversation_db:
                conversation_db[session_id] = {}

            # 날짜별 대화 히스토리 설정
            current_date = get_current_date()
            if current_date not in conversation_db[session_id]:
                conversation_db[session_id][current_date] = []

            # 대화 히스토리에 사용자 입력 추가
            conversation_db[session_id][current_date].append({"role": "user", "content": conversation_history[-1]['content']})

            # OpenAI 응답을 받기
            response = get_openai_response(conversation_history)

            # 대화 기록에 봇의 답변 추가
            conversation_db[session_id][current_date].append({"role": "assistant", "content": response})

            # 응답 내용 로깅
            logger.info(f"Response from OpenAI: {response}")

            return jsonify({"response": response, "history": conversation_db[session_id][current_date]})

        except Exception as e:
            logger.error(f"Error occurred during OpenAI request: {str(e)}")
            return jsonify({"error": "Internal Server Error. Please try again later."}), 500

# 리소스 등록
app.add_url_rule('/chat', view_func=ChatResource.as_view('chatresource'))

# API 문서화
docs.register(ChatResource)

# auth Blueprint 등록
app.register_blueprint(auth_bp, url_prefix='/auth')  # /auth 경로에서 auth 관련 API 사용

# 서버 실행
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)