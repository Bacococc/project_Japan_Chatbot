import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // 상태 관리
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false); // 로딩 상태 관리
  const [error, setError] = useState(null); // 오류 상태 관리

  // 사용자가 메시지를 보낼 때 호출되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    if (userInput.trim() === '') return; // 빈 메시지 보내지 않기
    
    // 사용자 입력을 채팅 기록에 추가
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: 'user', message: userInput }
    ]);

    // 로딩 상태 시작
    setLoading(true);
    setError(null); // 오류 상태 초기화

    try {
      // Flask 서버로 사용자 입력을 보냄
      const response = await axios.post('http://127.0.0.1:5001/chat', { input: userInput });
      const botReply = response.data.reply;

      // 챗봇의 응답을 채팅 기록에 추가
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'bot', message: botReply }
      ]);
    } catch (error) {
      // 오류가 발생하면 오류 메시지를 상태에 설정
      setError('서버와의 연결에 문제가 발생했습니다.');
      console.error('Error communicating with backend', error);
    } finally {
      // 로딩 상태 끝
      setLoading(false);
    }
    
    // 입력 필드 초기화
    setUserInput('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>일본어 챗봇</h1>
      
      {/* 채팅 내용 표시 */}
      <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'scroll' }}>
        {chatHistory.map((chat, index) => (
          <div key={index} style={{ margin: '10px 0', textAlign: chat.sender === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px', backgroundColor: chat.sender === 'user' ? '#d1f1ff' : '#f1f1f1', borderRadius: '10px' }}>
              {chat.message}
            </div>
          </div>
        ))}
      </div>

      {/* 오류 메시지 */}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      
      {/* 로딩 상태 */}
      {loading && <div>로딩 중...</div>}
      
      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ width: '80%', padding: '10px', borderRadius: '5px', marginRight: '10px' }}
        />
        <button 
          type="submit" 
          style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
          disabled={loading} // 로딩 중에는 버튼 비활성화
        >
          보내기
        </button>
      </form>
    </div>
  );
}

export default App;