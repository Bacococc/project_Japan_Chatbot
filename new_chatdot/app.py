from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from services.openai_service import get_openai_response
from flask_apispec import FlaskApiSpec, MethodResource, doc
from flask.views import MethodView  # 추가됨
from datetime import datetime
import os
from dotenv import load_dotenv
import logging
from services.openai_service import get_openai_response  # Ensure import
from flask import url_for


# .env 파일에서 환경 변수 로드
load_dotenv()

# Flask 앱 설정
app = Flask(__name__)

# .env 파일에서 SECRET_KEY 가져오기
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key')

# CORS 활성화
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask-APISpec 설정
app.config['APISPEC_SWAGGER_UI_URL'] = '/swagger/'
docs = FlaskApiSpec(app)

# 대화 기록을 저장할 임시 데이터베이스 (세션별로)
conversation_db = {}

# 세션별, 날짜별로 채팅 횟수 제한 처리
@app.route('/')
def index():
    current_date = datetime.now().strftime("%Y年 %m月 %d日")
    
    if 'chat_count' not in session:
        session['chat_count'] = 0

    if session['chat_count'] >= 15:
        return render_template('mainpage.html', current_date=current_date, chat_limit_reached=True)

    return render_template('mainpage.html', current_date=current_date)  

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

def get_today_date():
    return datetime.now().strftime("%Y-%m-%d")

def get_chat_count_for_ip():
    ip_address = request.remote_addr
    if ip_address not in conversation_db:
        conversation_db[ip_address] = {"count": 0, "date": get_today_date()}
    return conversation_db[ip_address]

def reset_chat_count():
    chat_data = get_chat_count_for_ip()
    today_date = get_today_date()
    if chat_data["date"] != today_date:
        chat_data["count"] = 0
        chat_data["date"] = today_date

def update_chat_count():
    chat_data = get_chat_count_for_ip()
    chat_data["count"] += 1

class ChatResource(MethodResource, MethodView):
    @doc(description="Chat with the AI bot")
    def post(self):
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        try:
            reset_chat_count()
            chat_data = get_chat_count_for_ip()

            if chat_data["count"] >= 15:
                return jsonify({
                    "response": "오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!",
                    "chat_count_images": ["chat_complete.png"] * 15 + ["chat_count.png"]
                }), 400

            conversation_history = request.get_json().get("messages", [])
            bot_reply = get_openai_response(conversation_history, use_dummy=True)

            if not conversation_history:
                return jsonify({"error": "대화 내역이 없습니다."}), 400

            session_id = session.get('session_id')
            if not session_id:
                session_id = os.urandom(24).hex()  
                session['session_id'] = session_id


            if session_id not in conversation_db:
                conversation_db[session_id] = {}

            current_date = get_today_date()
            if current_date not in conversation_db[session_id]:
                conversation_db[session_id][current_date] = []

            conversation_db[session_id][current_date].append({"role": "user", "content": conversation_history[-1]['content']})
            conversation_db[session_id][current_date].append({"role": "assistant", "content": bot_reply})

            update_chat_count()

            # 🌸(chat_complete.png)와 💬(chat_count.png)를 이미지 URL 리스트로 변환
            chat_count = chat_data["count"]
            chat_count_images = [
                url_for('static', filename='img/chat_count.png')
            ] * (15 - chat_count) + [
                url_for('static', filename='img/chat_complete.png')
            ] * chat_count

            return jsonify({
                "response": bot_reply,
                "history": [
                    {"role": entry["role"], "content": entry["content"]}
                    for entry in conversation_db[session_id][current_date]
                ],
                "chat_count_images": chat_count_images  # ✅ URL 형태로 반환
            })

        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return jsonify({"error": "Internal Server Error"}), 500


@app.route('/chat/images', methods=['GET'])
def get_chat_images():
    chat_data = get_chat_count_for_ip()
    chat_count = chat_data["count"]

    chat_count_images = [
        url_for('static', filename='img/chat_count.png')
    ] * (15 - chat_count) + [
        url_for('static', filename='img/chat_complete.png')
    ] * chat_count

    return jsonify({"chat_count_images": chat_count_images})

# Flask-APISpec 등록
chat_view = ChatResource.as_view('chatresource')  # MethodView 적용
app.add_url_rule('/chat', view_func=chat_view, methods=['POST'])
docs.register(ChatResource)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)