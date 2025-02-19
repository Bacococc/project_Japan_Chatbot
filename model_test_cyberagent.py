from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import random

app = Flask(__name__)

#모델 로드
model_name = "cyberagent/open-calm-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# 간단한 대화 패턴
simple_patterns = {
    "こんにちは": ["こんにちは！お元気ですか？", "こんにちは！今日はいい天気ですね。"],
    "元気": ["それは良かったです！", "元気が一番ですね！"],
    "気分": ["今日の気分はどうですか？", "気分転換には散歩がおすすめです。"],
    "食事": ["最近、美味しい物は食べましたか？", "バランスの良い食事は大切ですね。"],
    "趣味": ["趣味は何ですか？", "新しい趣味を見つけるのも楽しいですよ。"],
}

def simple_response(input_text):
    for key, responses in simple_patterns.items():
        if key in input_text:
            return random.choice(responses)
    return None

def generate_response(prompt, max_length=50):
    inputs = tokenizer.encode(prompt, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            inputs, 
            max_length=max_length, 
            num_return_sequences=1,
            temperature=0.7,
            top_k=50,
            top_p=0.95,
            do_sample=True
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.split(prompt)[-1].strip()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('input', '')
    
    if not user_input:
        return jsonify({"error": "入力が空です。"}), 400
    
    # 간단한 패턴 매칭 시도
    simple_reply = simple_response(user_input)
    if simple_reply:
        return jsonify({"response": simple_reply})
    
    # 패턴 매칭 실패 시 모델 사용
    prompt = f"ユーザー: {user_input}\nAI: "
    response = generate_response(prompt)
    
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)
