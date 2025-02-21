from flask import Blueprint, request, jsonify, session
from services.openai_service import get_openai_response  # OpenAI API 호출
import datetime
import os
import json

chat_bp = Blueprint('chat', __name__)

# 세션 ID와 대화 기록을 저장할 디렉토리 설정
HISTORY_DIR = "chat_history"
if not os.path.exists(HISTORY_DIR):
    os.makedirs(HISTORY_DIR)

def get_today_date():
    today = datetime.datetime.now()
    return today.strftime("%Y年 %m月 %d日")

# 로그인 확인
def check_login():
    if 'nickname' not in session:
        return jsonify({"error": "로그인 필요"}), 403
    return None

@chat_bp.route('/chat', methods=['POST'])
def chat():
    # 로그인 확인
    login_check = check_login()
    if login_check:
        return login_check

    if request.headers['Content-Type'] != 'application/json':
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.json
    user_input = data.get("input", "").strip()
    conversation_history = data.get("history", [])

    if not user_input:
        return jsonify({"error": "입력이 비어 있습니다."}), 400

    # 세션 ID 추출
    session_id = session.get('session_id', None)
    if not session_id:
        session['session_id'] = str(datetime.datetime.now().timestamp())  # 새로운 세션 ID 생성

    # 오늘 날짜 가져오기
    today_date = get_today_date()

    # 대화 처리
    bot_reply = get_openai_response(conversation_history)

    # 대화 저장
    save_conversation(session['session_id'], today_date, conversation_history)

    return jsonify({"reply": bot_reply, "history": conversation_history})