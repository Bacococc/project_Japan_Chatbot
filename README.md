# 📝 아시스케(アシ助) - 일본어 대화 연습 챗봇 + 퀴즈, 단어장

## 📌 프로젝트 소개
아시스케(アシ助)는 JLPT N3 수준의 일본어 학습자를 위한 회화 연습 챗봇입니다.  
일본어를 공부하는 많은 학습자들이 회화 연습 기회가 부족하다는 공통된 어려움을 겪고 있습니다. 교재나 문법 학습만으로는 실제 대화 능력을 키우기 어렵고, 원어민과 직접 대화할 기회도 많지 않습니다. 특히 혼자 공부하는 학습자들은 자연스럽게 일본어로 대화를 나눌 수 있는 환경을 찾기 힘듭니다.

이러한 문제를 해결하기 위해, 언제 어디서든 부담 없이 일본어 회화를 연습할 수 있는 AI 챗봇을 개발하게 되었습니다. 사용자가 실제 일본어 대화처럼 연습할 수 있도록 챗봇이 대화를 이끌어주고, 적절한 피드백과 추가 질문을 제공하여 지속적인 연습이 가능하도록 설계되었습니다.

이를 통해 더 많은 사람들이 일본어 회화 실력을 자연스럽게 향상시키고, 보다 자신감 있게 일본어를 사용할 수 있도록 돕는 것이 프로젝트의 목표입니다. 🚀
OpenAI의 API를 활용해 대화를 진행하며, 대화의 흐름을 유지하고 새로운 질문을 생성할 수 있습니다.


## 🚀 주요 기능
- 일본어 챗봇과 대화 (JLPT N3 수준)
- 사용자의 답변에 따라 자연스러운 질문 생성
- 간단한 REST API (`Flask` 사용)
- Swagger UI 문서화 (`수정 중`)
- N3 레벨의 단어/문장 퀴즈로 추가적인 어휘 학습
- 단어장 기능 제공


## 📂 프로젝트 구조

📌 **Flask 서버의 엔트리 포인트**  
- `app.py` : Flask 애플리케이션의 진입점

📌 **환경 설정 파일**  
- `.env` : 환경 변수 파일 (API 키 등)  
- `requirements.txt` : 프로젝트에 필요한 Python 패키지 목록  

📌 **서비스 모듈 (API 호출 처리)**  
- `services/openai_service.py` : OpenAI API와의 통신을 담당

📌 **라우트 모듈 (API 엔드포인트 정의)**  
- `routes/chat.py` : Flask의 Blueprint를 사용하여 대화 API 정의  

📌 **설정 파일**  
- `config/config.py` : 환경 변수 로드 및 설정  

📌 **정적 파일 (`static/`)**  
- `img/` : 이미지 파일 저장 폴더  
- **CSS 파일**  
  - `danstyles.css` : 단어장 페이지 스타일  
  - `mainpage.css` : 메인 페이지 스타일  
  - `quiz.css` : 퀴즈 페이지 스타일  
  - `quizSen.css` : 문장 퀴즈 스타일
  - `meaningquiz.css` : 뜻 퀴즈 스타일
  - `matchigquiz.css` : 매칭 퀴즈 스타일
  - `quiz.css` : 단어 퀴즈 관련 스타일
  - `styles.css` : 채팅 스타일
 
- **JavaScript 파일**
  - `script.js` : 채팅창 관련 JS  
  - `dan.js` : 단어장 페이지 관련 JS  
  - `mainpage.js` : 메인 페이지 관련 JS  
  - `matchingquiz.js` : 매칭 퀴즈 관련 JS  
  - `meaningquiz.js` : 뜻 퀴즈 관련 JS  
  - `quiz.js` : 단어 퀴즈 관련 JS  
  - `quizSen.js` : 문장 퀴즈 관련 JS  

📌 **템플릿 (HTML 파일, `templates/`)**  
- `chat.html` : 채팅 페이지  
- `dan.html` : 단어장 페이지  
- `mainpage.html` : 메인 페이지  
- `matchingquiz.html` : 매칭 퀴즈 페이지  
- `meaningquiz.html` : 뜻 퀴즈 페이지  
- `quiz.html` : 퀴즈 페이지  
- `quizSen.html` : 문장 퀴즈 페이지  

📌 **기타**  
- `README.md` : 프로젝트 설명 및 사용법  

## 🛠️ 기술 스택
- 프론트엔드: HTML, CSS, JavaScript
- 백엔드: Flask
- API: OpenAI API
- 문서화: Swagger UI
- 기타: dotenv, CORS, Python (Flask), Fetch API, etc.
