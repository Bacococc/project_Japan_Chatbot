from flask import Flask, jsonify, request
import logging
from flask_cors import CORS  # CORS 추가
from services.openai_service import get_openai_response

app = Flask(__name__)

# CORS 활성화 (모든 출처에서 오는 요청 허용)
CORS(app)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    conversation_history = request.json.get("messages", [])
    
    if not conversation_history:
        logger.warning("Received empty messages.")
        return jsonify({"error": "Messages cannot be empty."}), 400

    try:
        # 동기 호출: OpenAI API 응답 받기
        response = get_openai_response(conversation_history)
        
        # 응답 내용 로깅
        logger.info(f"Response from OpenAI: {response}")

        return jsonify({"response": response})

    except Exception as e:
        logger.error(f"Error occurred during OpenAI request: {str(e)}")
        return jsonify({"error": "Internal Server Error. Please try again later."}), 500

# 서버 실행
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)