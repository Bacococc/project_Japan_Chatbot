from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os
import time
from dotenv import load_dotenv
from openai import OpenAIError, RateLimitError

# 환경 변수 로드
load_dotenv()

# OpenAI API 키 설정
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # .env 파일에서 가져오기

# OpenAI 클라이언트 생성 (최신 방식)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # CORS 설정

# 재시도 로직
def send_request_with_retry(request_function, retries=3, delay=5):
    for i in range(retries):
        try:
            return request_function()  # 실제 API 호출
        except RateLimitError as e:
            if i < retries - 1:
                print(f"Rate limit exceeded, retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("Maximum retries reached. Could not complete the request.")
                raise e
        except OpenAIError as e:
            print(f"OpenAI API Error: {e}")
            raise e
        except Exception as e:
            print(f"Unexpected error: {e}")
            raise e

# /chat API 처리
@app.route('/chat', methods=['POST'])
def chat():
    if request.headers['Content-Type'] != 'application/json':
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.json
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

    conversation_history.append({"role": "user", "content": user_input})

    # API 호출 함수 정의
    def get_openai_response():
        return client.chat.completions.create(  # 최신 방식 사용
            model="gpt-3.5-turbo",
            messages=conversation_history,
            max_tokens=40,
            temperature=0.7
        )

    try:
        # 재시도 로직을 통해 API 호출
        response = send_request_with_retry(get_openai_response)

        # 봇의 답변
        bot_reply = response.choices[0].message.content.strip()

        # 대화 기록에 봇의 답변 추가
        conversation_history.append({"role": "assistant", "content": bot_reply})

        return jsonify({"reply": bot_reply, "history": conversation_history})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)})

# HTML 파일 서빙
@app.route('/')
def serve_html():
    return send_from_directory(os.getcwd(), 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)