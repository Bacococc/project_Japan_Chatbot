import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = Flask(__name__)
CORS(app)

# Qwen 2.5 모델 로드
model_name = "Qwen/Qwen2.5-0.5B"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", torch_dtype=torch.float16)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def generate_response(user_input, max_new_tokens=30):
    """ 
    일본어 대화를 자연스럽게 생성하는 함수 (문법 설명 제거 강화) 
    """
    system_prompt = (
        "あなたはフレンドリーな日本語教師です。"
        "JLPT N3レベルの語彙を使い、短く自然な日本語で会話してください。"
        "ユーザーの会話を続けるような質問をしてください。"
        "以下のような説明は不要です: 文法解説、言葉の定義、選択肢の提示。"
        "自然な会話を続けてください。"
    )

    full_prompt = f"{system_prompt}\nユーザー: {user_input}\nAI: "

    inputs = tokenizer(full_prompt, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs, 
            max_new_tokens=max_new_tokens,  # 응답 길이 제한
            num_return_sequences=1,
            temperature=0.7,  
            top_k=40,  
            top_p=0.85,  
            repetition_penalty=1.5,  # 반복 억제
            do_sample=True
        )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    # 불필요한 패턴 제거
    response = response.replace(system_prompt, "").strip()
    response = response.replace("ユーザー:", "").strip()
    response = response.replace("AI:", "").strip()
    
    # 입력 문장을 그대로 따라 하면 제거
    if user_input in response:
        response = response.replace(user_input, "").strip()

    # 영어 제거
    response = re.sub(r'[A-Za-z]+', '', response)

    # 문법 설명 스타일 제거
    response = re.sub(r'\d+\.\s', '', response)  # "1. " 같은 형식 제거
    response = re.sub(r'\(答え\)', '', response)  # "(答え)" 같은 패턴 제거

    return response.strip()

@app.route('/chat', methods=['POST'])
def chat():
    """ 
    사용자의 POST 요청을 받아 챗봇 응답을 반환하는 엔드포인트 
    """
    data = request.json
    user_input = data.get('input', '')

    if not user_input:
        return jsonify({"error": "入力が空です。"}), 400

    response = generate_response(user_input)

    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)