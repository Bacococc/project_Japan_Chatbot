from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from services.openai_service import get_openai_response
from flask_apispec import FlaskApiSpec, MethodResource, doc
from flask.views import MethodView
from datetime import datetime
import os
from dotenv import load_dotenv
import logging

# 환경 변수 로드
load_dotenv()

# Flask 앱 설정
app = Flask(__name__)

# .env 파일에서 SECRET_KEY 가져오기
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key')

# CORS 활성화
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 로깅 설정
logging.basicConfig(level=logging.INFO, filename='app.log', filemode='a', format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Flask-APISpec 설정
app.config['APISPEC_SWAGGER_UI_URL'] = '/swagger/'
docs = FlaskApiSpec(app)

def get_today_date():
    return datetime.now().strftime("%Y-%m-%d")

# 세션 기반 채팅 횟수 확인
def get_chat_count_for_user():
    if 'chat_count' not in session:
        session['chat_count'] = 0
        session['chat_date'] = get_today_date()  # 날짜도 같이 저장
    return session['chat_count']

# 채팅 횟수 초기화 (날짜가 바뀌면 0으로 리셋)
def reset_chat_count():
    if session.get('chat_date') != get_today_date():
        session['chat_count'] = 0
        session['chat_date'] = get_today_date()

# 채팅 횟수 업데이트
def update_chat_count():
    session['chat_count'] = get_chat_count_for_user() + 1

@app.route('/')
def index():
    current_date = datetime.now().strftime("%Y年 %m月 %d日")

    if 'chat_count' not in session:
        session['chat_count'] = 0

    if session['chat_count'] >= 10:
        return render_template('mainpage.html', current_date=current_date, chat_limit_reached=True)

    return render_template('mainpage.html', current_date=current_date)

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/quiz2')
def quiz2():
    return render_template('quizSen.html')

@app.route('/quiz3')
def quiz3():
    return render_template('meaningquiz.html')

@app.route('/quiz4')
def quiz4():
    return render_template('matchingquiz.html')

@app.route('/vocab')
def vocab():
    return render_template('dan.html')

class ChatResource(MethodResource, MethodView):
    @doc(description="Chat with the AI bot")
    def post(self):
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        try:
            reset_chat_count()

            if get_chat_count_for_user() >= 10:
                return jsonify({
                    "response": "오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!",
                    "chat_count_images": ["chat_complete.png"] * 10 + ["chat_count.png"]
                }), 400

            conversation_history = request.get_json().get("messages", [])
            if not conversation_history:
                return jsonify({"error": "대화 내역이 없습니다."}), 400

            # ✅ 대화 기록을 세션에 저장
            if 'conversation_history' not in session:
                session['conversation_history'] = []

            bot_reply = get_openai_response(conversation_history, use_dummy=False)

            session['conversation_history'].append({"role": "user", "content": conversation_history[-1]['content']})
            session['conversation_history'].append({"role": "assistant", "content": bot_reply})

            update_chat_count()

            # 🌸(chat_complete.png)와 💬(chat_count.png)를 이미지 URL 리스트로 변환
            chat_count = get_chat_count_for_user()
            chat_count_images = [
                url_for('static', filename='img/chat_count.png')
            ] * (10 - chat_count) + [
                url_for('static', filename='img/chat_complete.png')
            ] * chat_count

            return jsonify({
                "response": bot_reply,
                "history": session['conversation_history'],
                "chat_count_images": chat_count_images
            })

        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return jsonify({"error": "Internal Server Error"}), 500

@app.route('/chat/images', methods=['GET'])
def get_chat_images():
    chat_count = get_chat_count_for_user()

    chat_count_images = [
        url_for('static', filename='img/chat_count.png')
    ] * (10 - chat_count) + [
        url_for('static', filename='img/chat_complete.png')
    ] * chat_count

    return jsonify({"chat_count_images": chat_count_images})

# Flask-APISpec 등록
chat_view = ChatResource.as_view('chatresource')
app.add_url_rule('/chat', view_func=chat_view, methods=['POST'])
docs.register(ChatResource)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
