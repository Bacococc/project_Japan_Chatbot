from flask import Blueprint, request, jsonify, session
import os
import json
import datetime
import sys

# 서비스 경로 설정 (openai_service 모듈 포함)
sys.path.append('/Users/hyojin/Desktop/japanese-learning/new_chatdot')
from services.openai_service import get_openai_response

chat_bp = Blueprint('chat', __name__)

# 세션 ID와 대화 기록을 저장할 디렉토리 설정
HISTORY_DIR = "chat_history"
if not os.path.exists(HISTORY_DIR):
    os.makedirs(HISTORY_DIR)

def get_today_date():
    return datetime.datetime.now().strftime("%Y年 %m月 %d日")

@chat_bp.route('/chat', methods=['POST'])
def chat():
    session_id = session.get('session_id')
    if not session_id:
        session_id = str(datetime.datetime.now().timestamp())  # 새로운 세션 ID 생성
        session['session_id'] = session_id

    today_date = get_today_date()

    # 클라이언트에서 전송된 데이터 가져오기
    data = request.get_json()
    conversation_history = data.get("messages", [])  # 기본값으로 빈 리스트 설정

    # 기본 프롬프트 추가
    default_prompt = [
        {"role": "system", "content": "あなたはユーザーの日本語会話学習を手伝うチャットボット、「アシ助」です。"},
        {"role": "system", "content": "ユーザーが最初に挨拶する場合は、挨拶と自己紹介をしてすぐに質問を始めてください。質問は答えやすい日常的な質問から始まりください。（ex.好きな色は何ですか？　好きな食べ物はなんですか？など...)"},
        {"role": "system", "content": "あなたはJLPT N3レベルの語彙だけを使用する必要があり、ユーザーが会話の練習をスピードアップできるように、各文の最後に質問する必要があります。"},
        {"role": "system", "content": "日本語学習に不要な過度の情報（exウェブサイトの住所、機密情報など）を与えてはいけません。"},
        {"role": "system", "content": "ユーザーが間違った文法を使用している場合は、簡単にフィットする表現をお勧めします。"},
        {"role": "system", "content": "丁寧ですが、文章の最後に絵文字を書くようにしてください。"}
    ]

    # 프롬프트와 사용자 대화 이력을 합쳐서 전달
    full_conversation = default_prompt + conversation_history

    # 모델 응답 생성 (실제 OpenAI 호출)
    bot_reply = get_openai_response(full_conversation, use_dummy=False)

    # 대화 저장
    save_conversation(session_id, today_date, full_conversation)

    return jsonify({"reply": bot_reply, "history": full_conversation})

# 대화 저장 함수
def save_conversation(session_id, date, conversation_history):
    file_path = os.path.join(HISTORY_DIR, f"{session_id}_{date}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(conversation_history, f, ensure_ascii=False, indent=4)