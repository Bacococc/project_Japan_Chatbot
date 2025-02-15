from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from flasgger import Swagger, swag_from

app = Flask(__name__)
CORS(app)  # CORS 설정
swagger = Swagger(app)  # Swagger 설정

API_URL = "http://localhost:11434/api/generate"  # Ollama API URL

def query_ollama(prompt):
    """ Ollama에 요청을 보내서 응답을 받음 """
    response = requests.post(API_URL, json={"model": "mistral", "prompt": prompt, "stream": False})
    
    if response.status_code != 200:
        return {"error": f"API 요청 실패: {response.text}"}
    
    return response.json()

@app.route('/chat', methods=['POST'])
@swag_from({
    "summary": "일본어 학습 챗봇",
    "description": "사용자의 입력을 받아 챗봇이 응답하는 API",
    "parameters": [
        {
            "name": "input",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "input": {
                        "type": "string",
                        "example": "こんにちは"
                    }
                }
            }
        }
    ],
    "responses": {
        "200": {
            "description": "챗봇 응답 및 후속 질문",
            "schema": {
                "type": "object",
                "properties": {
                    "reply": {
                        "type": "string",
                        "example": "こんにちは！元気ですか？"
                    },
                    "follow_up_question": {
                        "type": "string",
                        "example": "最近読んだ本は何ですか？"
                    }
                }
            }
        },
        "400": {
            "description": "잘못된 요청 (입력값 없음)",
            "schema": {
                "type": "object",
                "properties": {
                    "error": {
                        "type": "string",
                        "example": "입력값이 없습니다."
                    }
                }
            }
        },
        "500": {
            "description": "서버 오류",
            "schema": {
                "type": "object",
                "properties": {
                    "error": {
                        "type": "string",
                        "example": "서버 오류 발생"
                    }
                }
            }
        }
    }
})
def chat():
    try:
        data = request.get_json()
        if not data or 'input' not in data:
            return jsonify({'error': '입력값이 없습니다.'}), 400

        user_input = data['input'].strip()
        if not user_input:
            return jsonify({'error': '입력값이 올바르지 않습니다.'}), 400

        # 사용자의 닉네임을 묻는 첫 질문
        if 'nickname' not in data:
            return jsonify({
                'reply': "こんにちは！あなたの名前を教えてください。",
                'follow_up_question': "名前を教えてくださいね！"
            })

        # 사용자의 이름을 기억하고 그 이름으로 대화하기
        user_name = data['nickname']

        # Ollama로 챗봇 응답 생성
        prompt = f"ユーザー: {user_input}\nAI:"
        result = query_ollama(prompt)

        if "error" in result:
            return jsonify({"reply": "申し訳ありませんが、現在対応できません。", "follow_up_question": "最近読んだ本は何ですか？"})

        bot_reply = result["response"].strip()  # 일본어만 반환하도록 처리
        follow_up_question = "最近読んだ本は何ですか？"  # 후속 질문도 일본어로 설정

        # 한국어 의미를 추가
        reply_meaning = "예시 한국어 뜻"  # 나중에 DeepL API 등을 사용해 번역 처리
        follow_up_question_meaning = "예시 한국어 뜻"

        return jsonify({
            'reply': f"{user_name}さん、{bot_reply}",
            'follow_up_question': follow_up_question,
            'reply_meaning': reply_meaning,
            'follow_up_question_meaning': follow_up_question_meaning
        })

    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)