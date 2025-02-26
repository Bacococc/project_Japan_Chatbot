from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mysqldb import MySQL
import bcrypt
import logging
from flask_cors import CORS

# Blueprint 생성
auth_bp = Blueprint('auth', __name__)

# auth_bp에 CORS 적용
CORS(auth_bp, resources={r"/signup": {"origins": "http://127.0.0.1:5500"}}, supports_credentials=True)
CORS(auth_bp, resources={r"/login": {"origins": "http://127.0.0.1:5500"}}, supports_credentials=True)
CORS(auth_bp, resources={r"/logout": {"origins": "http://127.0.0.1:5500"}}, supports_credentials=True)

# 로깅 설정
logger = logging.getLogger(__name__)

# MySQL 객체 생성 (Flask 앱에서 초기화됨)
mysql = MySQL()

def init_mysql(app):
    """Flask 앱이 실행될 때 MySQL을 초기화"""
    mysql.init_app(app)

# CORS preflight 요청 처리
@auth_bp.route('/signup', methods=['OPTIONS'])
@auth_bp.route('/login', methods=['OPTIONS'])
@auth_bp.route('/logout', methods=['OPTIONS'])
def handle_options():
    """Preflight 요청 처리"""
    response = jsonify({"message": "CORS preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200

# 회원가입
@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        nickname = data.get('nickname')
        password = data.get('password')

        if not nickname or not password:
            logger.warning(f"Invalid input: nickname={nickname}, password={password}")
            return jsonify({"error": "닉네임과 비밀번호를 모두 입력해야 합니다."}), 400

        if len(nickname) > 50:
            logger.warning(f"Nickname too long: {nickname}")
            return jsonify({"error": "닉네임이 너무 깁니다."}), 400

        if len(password) < 8:
            logger.warning(f"Password too short: {password}")
            return jsonify({"error": "비밀번호는 최소 8자 이상이어야 합니다."}), 400

        # 비밀번호 해싱
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        try:
            with mysql.connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE nickname = %s", (nickname,))
                existing_user = cursor.fetchone()

                if existing_user:
                    logger.warning(f"Duplicate nickname: {nickname}")
                    return jsonify({"error": "이미 사용 중인 닉네임입니다."}), 400

                cursor.execute("INSERT INTO users (nickname, password) VALUES (%s, %s)", (nickname, hashed_password.decode('utf-8')))
                mysql.connection.commit()

            logger.info(f"User signed up successfully: {nickname}")
            return jsonify({"message": "회원가입 성공!"}), 201

        except Exception as e:
            mysql.connection.rollback()
            current_app.logger.error(f"SQL error during INSERT: {str(e)}")
            return jsonify({"error": "Database error occurred."}), 500

    except Exception as e:
        logger.error(f"Error during signup process: {str(e)}")
        return jsonify({"error": "Internal Server Error. Please try again later."}), 500

# 로그인
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        nickname = data.get('nickname')
        password = data.get('password')

        if not nickname or not password:
            logger.warning(f"Invalid login attempt: nickname={nickname}")
            return jsonify({"error": "닉네임과 비밀번호를 모두 입력해야 합니다."}), 400

        try:
            with mysql.connection.cursor() as cursor:
                cursor.execute("SELECT nickname, password FROM users WHERE nickname = %s", (nickname,))
                user = cursor.fetchone()

                if not user:
                    logger.warning(f"Invalid login attempt (nickname not found): {nickname}")
                    return jsonify({"error": "잘못된 닉네임 또는 비밀번호입니다."}), 401

                db_nickname, db_password = user

                # bcrypt 해싱된 비밀번호 검증
                if not bcrypt.checkpw(password.encode('utf-8'), db_password.encode('utf-8')):
                    logger.warning(f"Invalid login attempt (wrong password): {nickname}")
                    return jsonify({"error": "잘못된 닉네임 또는 비밀번호입니다."}), 401

            session['nickname'] = nickname

            logger.info(f"User logged in: {nickname}")
            return jsonify({"message": "로그인 성공!"}), 200

        except Exception as e:
            current_app.logger.error(f"SQL error during SELECT: {str(e)}")
            return jsonify({"error": "Database query failed."}), 500

    except Exception as e:
        logger.error(f"Error during login process: {str(e)}")
        return jsonify({"error": "Internal Server Error. Please try again later."}), 500

# 로그아웃
@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        session.pop('nickname', None)
        logger.info("User logged out.")
        return jsonify({"message": "로그아웃 되었습니다."}), 200
    except Exception as e:
        logger.error(f"Error during logout process: {str(e)}")
        return jsonify({"error": "Internal Server Error. Please try again later."}), 500