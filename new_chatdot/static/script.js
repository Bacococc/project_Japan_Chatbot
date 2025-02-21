// 대화 히스토리를 저장할 배열
let conversationHistory = [
  {"role": "system", "content": "会話を初めて始めるときは、ぜひ「こんにちは、私はあなたの絵画を助けてくれるアシ助です！ 同じ挨拶をしてください"},
  {"role": "system", "content": "あなたはフレンドリーな日本語教師’アシ助’です。"},
  {"role": "system", "content": "会話はJLPT N3レベルの単語のみを使い、シンプルで自然な日本語にしてください。"},
  {"role": "system", "content": "ユーザーの回答に基づいて、関連する質問をして会話を続けてください。"},
  {"role": "system", "content": "ユーザーに毎回質問をし、質問と会話は短く（1文）、できるだけ会話が自然に流れるようにします。"}
];

// 채팅 메시지 출력 함수
function appendMessage(content, sender) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");
  messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
  messageElement.textContent = content;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;  // 스크롤을 맨 아래로 내리기
}

// 메시지 전송 함수
document.getElementById("sendButton").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value;
  if (!userInput) return;

  appendMessage(userInput, "user");  // 사용자가 보낸 메시지 표시

  // 대화 내역에 사용자 입력 추가
  conversationHistory.push({"role": "user", "content": userInput});

  try {
    // Flask 서버로 POST 요청 보내기
    const response = await fetch('http://127.0.0.1:5002/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    if (response.ok) {
      const data = await response.json();  // JSON 응답 처리
      const botReply = data.response.trim();
      appendMessage(botReply, "bot");  // 봇의 응답 표시

      // 대화 내역에 봇의 응답 추가
      conversationHistory.push({"role": "assistant", "content": botReply});
    } else {
      const errorData = await response.json();  // 오류 응답 처리
      appendMessage("Error: " + errorData.error, "bot");
    }
  } catch (error) {
    appendMessage("Something went wrong! Please try again.", "bot");
    console.error(error);
  }

  document.getElementById("userInput").value = "";  // 입력창 초기화
});