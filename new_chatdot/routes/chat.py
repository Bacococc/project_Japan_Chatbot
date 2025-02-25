from flask import Blueprint, request, jsonify, session
import sys
import datetime
import os
import json

# 서비스 경로 설정 (openai_service 모듈 포함)
sys.path.append('/Users/hyojin/Desktop/japanese-learning/new_chatdot')
from services.openai_service import get_openai_response

chat_bp = Blueprint('chat', __name__)

# 세션 ID와 대화 기록을 저장할 디렉토리 설정
HISTORY_DIR = "chat_history"
if not os.path.exists(HISTORY_DIR):
    os.makedirs(HISTORY_DIR)

def get_today_date():
    today = datetime.datetime.now()
    return today.strftime("%Y年 %m月 %d日")

# 로그인 확인
def check_login():
    if 'nickname' not in session:
        return jsonify({"error": "로그인 필요"}), 403
    return None

@chat_bp.route('/chat', methods=['POST'])
def chat():
    # # 로그인 확인
    # login_check = check_login()
    # if login_check:
    #     return login_check

    # if request.headers['Content-Type'] != 'application/json':
    #     return jsonify({"error": "Content-Type must be application/json"}), 400

    # data = request.json
    # user_input = data.get("input", "").strip()
    # conversation_history = data.get("history", [])

    # if not user_input:
    #     return jsonify({"error": "입력이 비어 있습니다."}), 400

    # 세션 ID 추출
    session_id = session.get('session_id', None)
    if not session_id:
        session['session_id'] = str(datetime.datetime.now().timestamp())  # 새로운 세션 ID 생성

    # 오늘 날짜 가져오기
    today_date = get_today_date()

    # 기본 프롬프트 추가 (대화 기록의 첫 번째로)
    default_prompt = [
        {"role": "system", "content": "あなたはユーザーの日本語会話学習を手伝うチャットボット、「アシ助」です。"},
        {"role": "system", "content": "ユーザーが最初に挨拶する場合は、挨拶と自己紹介をしてすぐに質問を始めてください。質問は答えやすい日常的な質問から始まりください。（ex.好きな色は何ですか？　好きな食べ物はなんですか？など...)"},
        {"role": "system", "content": "あなたはJLPT N3レベルの語彙だけを使用する必要があり、ユーザーが会話の練習をスピードアップできるように、各文の最後に質問する必要があります。"},
        {"role": "system", "content": "日本語学習に不要な過度の情報（exウェブサイトの住所、機密情報など）を与えてはいけません。"},
        {"role": "system", "content": "丁寧ですが、文章の最後に絵文字を書くようにしてください。"}
    ]
    conversation_history = default_prompt + conversation_history  # 기본 프롬프트를 대화 기록에 추가

    # 대화 처리 (개발 중에는 더미 텍스트를 반환하도록 설정)
    bot_reply = get_openai_response(conversation_history, use_dummy=True)

    # 대화 저장
    save_conversation(session['session_id'], today_date, conversation_history)

    return jsonify({"reply": bot_reply, "history": conversation_history})

# 대화 저장 함수 예시
def save_conversation(session_id, date, conversation_history):
    file_path = os.path.join(HISTORY_DIR, f"{session_id}_{date}.json")
    with open(file_path, 'w') as f:
        json.dump(conversation_history, f, ensure_ascii=False, indent=4)