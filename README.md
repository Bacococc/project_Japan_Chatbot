# 📝 아시스케(アシ助) - 일본어 대화 연습 챗봇 + 퀴즈, 단어장

## 📌 프로젝트 소개
아시스케(アシ助)는 JLPT N3 수준의 일본어 학습자를 위한 챗봇입니다.  
OpenAI의 API를 활용해 대화를 진행하며, 대화의 흐름을 유지하고 새로운 질문을 생성할 수 있습니다.

## 🚀 주요 기능
- 일본어 챗봇과 대화 (JLPT N3 수준)
- 사용자의 답변에 따라 자연스러운 질문 생성
- 간단한 REST API (`Flask` 사용)
- Swagger UI 문서화 (`http://localhost:5002/apidocs/`)
- N3 레벨의 단어 퀴즈로 어휘 학습
- 



## 📂 프로젝트 구조
├── app.py                 # Flask 서버의 엔트리 포인트
├── requirements.txt       # 프로젝트에 필요한 Python 패키지 목록
├── .env                   # 환경 변수 파일 (API 키 등)
├── services               # OpenAI API와의 통신을 처리하는 서비스 모듈
│   └── openai_service.py  # OpenAI API 호출 및 응답 처리
├── routes
|   └── chat.py            # Flask 애플리케이션의 Blueprint를 사용하여 대화 API 정의
├── config
|   └── config.py          # 환경 변수 로드
├── static                 # 정적 파일 (CSS, JS, 이미지 등)
│   └── style.css          # 기본 스타일 파일
│   └── script.js          # 클라이언트 사이드 JavaScript 코드
|   └── index.html         # 메인 페이지 HTML 파일
└── README.md              # 프로젝트 설명 및 사용법

## 🛠️ 기술 스택
- 프론트엔드: HTML, CSS, JavaScript
- 백엔드: Flask
- API: OpenAI API
- 문서화: Swagger UI
- 기타: dotenv, CORS, Python (Flask), Fetch API, etc.