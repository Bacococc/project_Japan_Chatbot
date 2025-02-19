from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging
import concurrent.futures
import random

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

model_name = "rinna/japanese-gpt2-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

tokenizer.pad_token = tokenizer.eos_token
model.config.pad_token_id = model.config.eos_token_id

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

logger.info(f"Model loaded successfully. Using device: {device}")

conversation_history = []

simple_topics = [
    "今日の天気はどうですか？",
    "休日は何をしますか？",
    "好きな食べ物は何ですか？",
    "日本語を勉強している理由は何ですか？",
    "最近見た映画はありますか？",
]

def generate_reply_with_timeout(prompt, history, timeout=30):
    def generate():
        try:
            full_prompt = f"""
以下は、日本語学習者とチャットする会話です。

{history}

ユーザー: {prompt}
チャットボット: 
""".strip()

            inputs = tokenizer(full_prompt, return_tensors="pt", padding=True, truncation=True, max_length=512)
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=100,
                    num_return_sequences=1,
                    do_sample=True,
                    temperature=0.7,
                    top_k=50,
                    top_p=0.95,
                    no_repeat_ngram_size=2,  # 반복 방지
                )
            
            reply = tokenizer.decode(outputs[0], skip_special_tokens=True)
            reply = reply.split("チャットボット: ")[-1].strip()
            
            if reply == prompt:
                return "申し訳ありません。もう少し詳しく教えていただけますか？"
            
            return reply
        except Exception as e:
            logger.error(f"Error in generate function: {str(e)}")
            return "エラーが発生しました。もう一度お試しください。"

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(generate)
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            return "申し訳ありませんが、応答の生成に時間がかかっています。もう一度お試しください。"

@app.route('/chat', methods=['POST'])
def chat():
    logger.info(f"Received request: {request.data}")
    global conversation_history
    data = request.get_json()
    
    if data is None:
        logger.error("Invalid JSON received")
        return jsonify({'error': 'Invalid JSON'}), 400
    
    user_input = data.get('input', '').strip()
    logger.info(f"User input: {user_input}")

    if not user_input:
        initial_topic = random.choice(simple_topics)
        bot_reply = f"こんにちは！日本語で話しましょう。{initial_topic}"
    else:
        conversation_history.append(f"ユーザー: {user_input}")
        history = "\n".join(conversation_history[-5:])
        bot_reply = generate_reply_with_timeout(user_input, history)

        conversation_history.append(f"チャットボット: {bot_reply}")
        conversation_history = conversation_history[-10:]

    logger.info(f"Bot reply: {bot_reply}")
    return jsonify({'reply': bot_reply})

if __name__ == "__main__":
    app.run(debug=True, port=5001)