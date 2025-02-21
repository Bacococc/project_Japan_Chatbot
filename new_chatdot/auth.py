# auth.py

from flask import Blueprint, request, jsonify, session, current_app as app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mysqldb import MySQL
import bcrypt
import logging

# 로깅 설정
logger = logging.getLogger(__name__)

# Blueprint 생성
auth_bp = Blueprint('auth', __name__)

# MySQL 연결 설정
mysql = MySQL()

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
            cursor = mysql.connection.cursor()
            cursor.execute("SELECT * FROM users WHERE nickname = %s", (nickname,))
            existing_user = cursor.fetchone()

            if existing_user:
                cursor.close()
                logger.warning(f"Duplicate nickname: {nickname}")
                return jsonify({"error": "이미 사용 중인 닉네임입니다."}), 400
        except Exception as e:
            app.logger.error(f"SQL error during SELECT: {str(e)}")  # MySQL 오류 로깅
            return jsonify({"error": "Database query failed."}), 500

        try:
            cursor.execute("INSERT INTO users (nickname, password) VALUES (%s, %s)", (nickname, hashed_password))
            mysql.connection.commit()
        except Exception as e:
            mysql.connection.rollback()
            app.logger.error(f"SQL error during SELECT: {str(e)}")  # MySQL 오류 로깅
            return jsonify({"error": "Database commit failed."}), 500
        finally:
            cursor.close()

        logger.info(f"User signed up successfully: {nickname}")
        return jsonify({"message": "회원가입 성공!"}), 201

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

        try:
            cursor = mysql.connection.cursor()
            cursor.execute("SELECT * FROM users WHERE nickname = %s", (nickname,))
            user = cursor.fetchone()

            if not user or not check_password_hash(user[2], password):
                cursor.close()
                logger.warning(f"Invalid login attempt: {nickname}")
                return jsonify({"error": "잘못된 닉네임 또는 비밀번호입니다."}), 401
        except Exception as e:
            app.logger.error(f"SQL error during SELECT: {str(e)}")  # MySQL 오류 로깅
            return jsonify({"error": "Database query failed."}), 500

        session['nickname'] = nickname
        cursor.close()

        logger.info(f"User logged in: {nickname}")
        return jsonify({"message": "로그인 성공!"}), 200

    except Exception as e:
        logger.error(f"Error during login process: {str(e)}")
        return jsonify({"error": "Internal Server Error. Please try again later."}), 500

# 로그아웃
@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        session.pop('nickname', None)
        logger.info(f"User logged out: {session.get('nickname', 'Unknown')}")
        return jsonify({"message": "로그아웃 되었습니다."}), 200
    except Exception as e:
        logger.error(f"Error during logout process: {str(e)}")
        return jsonify({"error": "Internal Server Error. Please try again later."}), 500