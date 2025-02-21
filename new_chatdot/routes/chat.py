import logging
from flask import Blueprint, request, jsonify
from services.openai_service import get_openai_response  # OpenAI API 호출

# Blueprint 생성
chat_bp = Blueprint('chat', __name__)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    if request.headers['Content-Type'] != 'application/json':
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON format"}), 400

    user_input = data.get("input", "").strip()
    conversation_history = data.get("history", [])

    if not user_input:
        return jsonify({"error": "入力が空です。"}), 400

    if not conversation_history:
        conversation_history = [
            {"role": "system", "content": "あなたはフレンドリーな日本語教師’アシ助’です。"},
            {"role": "system", "content": "会話はJLPT N3レベルの単語のみを使い、シンプルで自然な日本語にしてください。"},
            {"role": "system", "content": "ユーザーの回答に基づいて、関連する質問をして会話を続けてください。"},
            {"role": "system", "content": "ユーザーに毎回質問をし、質問과会話は短く（1文）、できるだけ会話が自然に流れるようにします。"}
        ]

    # 사용자 입력 추가
    conversation_history.append({"role": "user", "content": user_input})

    try:
        # OpenAI 서비스 호출
        bot_reply = get_openai_response(conversation_history)  # ✅ response 대신 바로 bot_reply 반환

        # 대화 기록에 봇의 답변 추가
        conversation_history.append({"role": "assistant", "content": bot_reply})

        return jsonify({"reply": bot_reply, "history": conversation_history})

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500