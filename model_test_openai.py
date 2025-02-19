from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

app = Flask(__name__)
CORS(app)  # CORS 허용

# 환경 변수에서 API 키 불러오기
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    print(data)  # 받은 데이터 출력
    user_input = data.get("input", "").strip()
    conversation_history = data.get("history", [])
    
    if not user_input:
        return jsonify({"error": "入力が空です。"}), 400

    if not conversation_history:
        conversation_history = [
            {"role": "system", "content": "あなたはフレンドリーな日本語教師’アシ助’です。"},
            {"role": "system", "content": "会話はJLPT N3レベルの単語のみを使い、シンプルで自然な日本語にしてください。"},
            {"role": "system", "content": "ユーザーの回答に基づいて、関連する質問をして会話を続けてください。"},
            {"role": "system", "content": "ユーザーに毎回質問をし、質問と会話は短く（1文）、できるだけ会話が自然に流れるようにします。"}
        ]

    # 사용자 입력 추가
    conversation_history.append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=conversation_history,
            max_tokens=40,  # 최대 토큰을 줄여서 한 문장 + 관련 질문만 응답하도록 설정
            temperature=0.7
        )

        bot_reply = response['choices'][0]['message']['content'].strip()

        # 응답을 대화 기록에 추가
        conversation_history.append({"role": "assistant", "content": bot_reply})

        return jsonify({"reply": bot_reply, "history": conversation_history})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
