from flask import Blueprint, request, jsonify
from services.openai_service import get_openai_response  # OpenAI API 호출
import datetime

chat_bp = Blueprint('chat', __name__)

# 날짜 포맷
def get_today_date():
    return datetime.datetime.now().strftime("%Y-%m-%d")

# 채팅 제한 개수
CHAT_LIMIT_PER_DAY = 10

# 사용자별 채팅 횟수를 저장할 딕셔너리 (서버 재시작 시 초기화됨)
chat_counts = {}

@chat_bp.route('/chat', methods=['POST'])
def chat():
    user_ip = request.remote_addr  # 사용자의 IP 주소 가져오기

    # 오늘 날짜 확인
    today_date = get_today_date()

    # 채팅 횟수 확인 및 초기화
    if user_ip not in chat_counts or chat_counts[user_ip]["date"] != today_date:
        chat_counts[user_ip] = {"date": today_date, "count": 0}

    # 채팅 횟수 초과 확인
    if chat_counts[user_ip]["count"] >= CHAT_LIMIT_PER_DAY:
        return jsonify({"error": f"{today_date}의 채팅 횟수를 초과했습니다."}), 403

    data = request.json
    user_input = data.get("input", "").strip()
    conversation_history = data.get("history", [])

    if not user_input:
        return jsonify({"error": "입력이 비어 있습니다."}), 400

    # OpenAI 응답 생성
    bot_reply = get_openai_response(conversation_history)

    # 채팅 횟수 증가
    chat_counts[user_ip]["count"] += 1

    return jsonify({"reply": bot_reply, "history": conversation_history, "remaining_chats": CHAT_LIMIT_PER_DAY - chat_counts[user_ip]["count"]})