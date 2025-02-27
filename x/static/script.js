let conversationHistory = [
  { "role": "system", "content": "こんにちは、私はアシ助です！" },
  { "role": "system", "content": "日本語の会話を始めましょう！" },
];

// 채팅 메시지 추가
function appendMessage(content, sender) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");
  messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
  messageElement.textContent = content;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 채팅 메시지 전송
document.getElementById("sendButton").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value;
  if (!userInput) return;

  appendMessage(userInput, "user");
  conversationHistory.push({ "role": "user", "content": userInput });

  try {
    const response = await fetch('http://127.0.0.1:5002/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    if (response.ok) {
      const data = await response.json();
      const botReply = data.response.trim();
      appendMessage(botReply, "bot");
      conversationHistory.push({ "role": "assistant", "content": botReply });
    } else {
      const errorData = await response.json();
      appendMessage("Error: " + errorData.error, "bot");
    }
  } catch (error) {
    appendMessage("Something went wrong! Please try again.", "bot");
    console.error(error);
  }

  document.getElementById("userInput").value = "";
});

// 회원가입 처리
document.getElementById("signupButton").addEventListener("click", async () => {
  const nickname = document.getElementById("nickname").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/auth/signup", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ nickname, password })
  });

  let result;
    try {
      result = await response.json();
    } catch (error) {
      alert("서버 응답 형식에 문제가 있습니다.");
      return;
    }

    if (!response.ok) {
      alert(result.error || "회원가입에 실패했습니다.");
    } else {
      alert("회원가입이 성공적으로 완료되었습니다!");
      window.location.href = "/";  // 회원가입 후 메인 페이지로 리디렉션
    }
});

// 히스토리 로드 함수
async function loadHistory() {
  const response = await fetch('http://127.0.0.1:5002/history');
  const historyData = await response.json();

  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";  // 기존 히스토리 초기화

  const todayDate = new Date().toLocaleDateString("ja-JP", { year: 'numeric', month: 'long', day: 'numeric' });

  const historyItem = document.createElement("li");
  historyItem.classList.add("history-item");
  historyItem.textContent = todayDate;  // 날짜 표시
  historyList.appendChild(historyItem);

  historyData.forEach(item => {
    const messageItem = document.createElement("li");
    messageItem.textContent = `${item.role === "user" ? "User" : "Bot"}: ${item.content}`;
    historyList.appendChild(messageItem);
  });
}

// 페이지 로드 시 히스토리 불러오기
window.onload = loadHistory;