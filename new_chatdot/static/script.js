let conversationHistory = [];
let chatCount = 0;

// 페이지 로드 시 저장된 대화 기록 불러오기
document.addEventListener("DOMContentLoaded", async function () {
    const savedHistory = localStorage.getItem("conversationHistory");
    const savedChatCount = localStorage.getItem("chatCount");

    if (savedHistory) {
        conversationHistory = JSON.parse(savedHistory);
        updateChatWindow(); // 기존 대화 복원
    }

    if (savedChatCount) {
        chatCount = parseInt(savedChatCount, 10);
    }

    if (chatCount >= 10) {
        document.getElementById("sendButton").disabled = true;
        appendMessage("오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!", "bot", true); // 스타일 다르게 적용
    }

    // 서버에서 이미지 불러오기 (초기화)
    await fetchAndUpdateChatImages();
});

// 채팅 횟수 아이콘을 서버에서 가져와서 업데이트
async function fetchAndUpdateChatImages() {
    try {
        const response = await fetch("/chat/images");
        if (!response.ok) throw new Error("서버 응답 오류");

        const data = await response.json();
        console.log("✅ 서버에서 받은 데이터:", data.chat_count_images);

        updateChatImages(data.chat_count_images); // 🎯 이미지 즉시 반영
    } catch (error) {
        console.error("🚨 채팅 이미지 불러오기 실패:", error);
    }
}

// 메시지 전송
async function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    if (chatCount >= 10) {
        appendMessage("오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!", "bot", true);
        document.getElementById("sendButton").disabled = true;
        return;
    }

    appendMessage(userInput, "user");
    conversationHistory.push({ role: "user", content: userInput });

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: conversationHistory })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const data = await response.json();
        if (!data.response) throw new Error("Invalid response from server.");

        let botReply = data.response.trim();
        appendMessage(botReply, "bot");

        chatCount++;
        conversationHistory.push({ role: "assistant", content: botReply });

        localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
        localStorage.setItem("chatCount", chatCount.toString());

        if (chatCount >= 10) {
            document.getElementById("sendButton").disabled = true;
            appendMessage("오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!", "bot", true); // 스타일 다르게 적용
        }

        // ✅ 채팅 횟수 아이콘 실시간 반영
        updateChatImages(data.chat_count_images || []);
    } catch (error) {
        console.error("Fetch error:", error);
        appendMessage("Something went wrong! Please try again.", "bot");
    }

    document.getElementById("userInput").value = ""; // 입력창 초기화
}

// 채팅창 업데이트
function updateChatWindow() {
    const chatWindow = document.getElementById("chatBox");
    chatWindow.innerHTML = ""; // Clear the chat window

    conversationHistory.forEach(item => {
        appendMessage(item.content, item.role);
    });

    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
}

// 채팅 횟수 아이콘 업데이트
function updateChatImages(imageList) {
    console.log("📌 updateChatImages 호출됨! imageList 값:", imageList);

    if (!Array.isArray(imageList)) {
        console.error("❌ 오류: imageList가 배열이 아닙니다!", imageList);
        return;
    }

    const chatEmojisDisplay = document.getElementById("chatEmojisDisplay");
    chatEmojisDisplay.innerHTML = ""; // 기존 내용 초기화

    imageList.forEach(imageSrc => {
        console.log("🔍 이미지 경로 확인:", imageSrc);

        let imgElement = document.createElement("img");
        imgElement.src = imageSrc;
        imgElement.alt = imageSrc.split("/").pop();
        imgElement.classList.add("emoji-icon");

        chatEmojisDisplay.appendChild(imgElement);
    });

    console.log("✅ 이미지 업데이트 완료");
}

// 채팅 메시지 추가
// 채팅 메시지 추가 함수
function appendMessage(content, sender, isSpecial = false) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");

  messageElement.classList.add("chat-message");

  // 특별 메시지 처리 (예: "오늘의 채팅량을 달성하셨습니다!" 메시지)
  if (isSpecial) {
    messageElement.classList.add("completed-chat-message");
  } else {
    messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
  }

  // 메시지 텍스트를 위한 div 요소 생성
  const messageText = document.createElement("div");
  messageText.classList.add("message-text");
  messageText.textContent = content;

  messageElement.appendChild(messageText);
  messageElement.style.marginBottom = "12px";  // ✅ 강제로 간격 유지

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;  // 자동 스크롤
}


// 이벤트 리스너 추가
document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

function resetChat() {
  localStorage.removeItem("conversationHistory"); // 대화 내역 초기화
  localStorage.removeItem("chatCount"); // 채팅 횟수 초기화
  document.getElementById("chatBox").innerHTML = ""; // 채팅창 초기화
  document.getElementById("sendButton").disabled = false; // 전송 버튼 활성화
  location.reload(); // 새로고침
}
