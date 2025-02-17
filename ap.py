import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)
CORS(app)  # CORS 설정
swagger = Swagger(app)  # Swagger 설정

# 모델과 토크나이저 로드
model_name = "rinna/japanese-gpt-1b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# 사용자별 대화 히스토리를 저장할 딕셔너리
chat_history = {}

def generate_reply(prompt):
    """ 모델을 통해 응답을 생성하는 함수 """
    # 입력 텍스트를 토큰화 (attention_mask 추가)
    inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=512)
    
    # attention_mask 처리
    attention_mask = inputs['attention_mask'] if 'attention_mask' in inputs else None
    
    # 모델로부터 응답 생성
    outputs = model.generate(
        inputs['input_ids'], 
        max_length=100, 
        num_return_sequences=1, 
        pad_token_id=tokenizer.eos_token_id,
        attention_mask=attention_mask,  # attention_mask 전달
        temperature=0.7,  # 응답 품질 제어
        top_p=0.9,  # 응답 다양성 제어
        top_k=50  # 응답 다양성 제어
    )
    
    reply = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return reply

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        if 'nickname' not in data:
            return jsonify({'reply': "こんにちは！あなたの名前を教えてください。"})

        user_input = data['input'].strip()
        if not user_input:
            return jsonify({'error': '입력값이 올바르지 않습니다.'}), 400

        user_name = data['nickname']

        # 사용자의 이전 대화 히스토리를 가져옴 (없으면 빈 리스트 생성)
        if user_name not in chat_history:
            chat_history[user_name] = []

        # 최근 3개의 대화만 유지 (너무 길어지지 않게)
        chat_context = "\n".join(chat_history[user_name][-3:])

        # 챗봇 응답 생성
        prompt = f"""
            あなたは日本語N3レベルの会話練習をサポートするAIアシスタント「アシたん」です。
            以下のルールを守って会話してください。

                1. 返答は1文、長くても3文までにしてください。
                2. ユーザーの発言に関連する自然な返答をしてください。同じ質問を繰り返さないでください。
                3. もし初対面なら、1回だけ「はじめまして」と言って、その後は繰り返さないでください。
                4. 日本語以外の言語は使用しないでください。
                5. 「あなたの名前は？」と聞かれた場合、"私はアシたんです！よろしくね！" と答えて、それ以上は繰り返さないでください。
                6. ユーザーの返答に応じて、新しい質問をしてください。
                
            {chat_context}
            ユーザー: {user_input}
            アシたん:
        """

        bot_reply = generate_reply(prompt)

        # 챗봇 응답을 한 문장만 반환
        sentences = bot_reply.split("。")
        reply = "。".join(sentences[:1]).strip()

        # 최신 대화 기록 저장 (최대 5개 유지)
        chat_history[user_name].append(f"ユーザー: {user_input}\nアシたん: {reply}")
        if len(chat_history[user_name]) > 5:
            chat_history[user_name].pop(0)

        return jsonify({'reply': reply})

    except Exception as e:
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)