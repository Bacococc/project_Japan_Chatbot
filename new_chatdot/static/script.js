let conversationHistory = [];  // Stores the conversation history
let chatCount = 0;  // Stores the current chat count

// Function to send a message
async function sendMessage() {
  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return;

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

      // ✅ `chat_count_images`가 없거나 잘못된 경우 기본값 설정
      const imageList = Array.isArray(data.chat_count_images) ? data.chat_count_images : [];
      console.log("📌 updateChatImages 호출됨! imageList 값:", imageList);
      updateChatImages(imageList);

      // 채팅 횟수 증가 및 UI 업데이트
      chatCount++;
      conversationHistory.push({ role: "assistant", content: botReply });

      // 채팅 횟수 제한 확인
      if (chatCount >= 15) {
          document.getElementById("sendButton").disabled = true;
          appendMessage("오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!", "bot");
      }
  } catch (error) {
      console.error("Fetch error:", error);
      appendMessage("Something went wrong! Please try again.", "bot");
  }

  document.getElementById("userInput").value = "";  // 입력창 초기화
}


// Update chat window with messages
function updateChatWindow() {
    const chatWindow = document.getElementById("chatBox");
    chatWindow.innerHTML = '';  // Clear the chat window

    conversationHistory.forEach(item => {
        const messageElement = document.createElement('div');
        messageElement.classList.add("chat-message", item.role === "user" ? "user-message" : "bot-message");
        messageElement.textContent = item.content;
        chatWindow.appendChild(messageElement);
    });

    chatWindow.scrollTop = chatWindow.scrollHeight;  // Auto-scroll
}

function updateChatImages(imageList) {
  console.log("📌 updateChatImages 호출됨! imageList 값:", imageList);

  if (!Array.isArray(imageList)) {
      console.error("❌ 오류: imageList가 배열이 아닙니다!", imageList);
      return;  // 배열이 아니라면 함수 실행 중단
  }

  const chatEmojisDisplay = document.getElementById("chatEmojisDisplay");
  chatEmojisDisplay.innerHTML = "";  // 기존 내용 초기화

  imageList.forEach(imageSrc => {
      console.log("🔍 이미지 경로 확인:", imageSrc);
      
      let imgElement = document.createElement("img");
      imgElement.src = imageSrc; // 여기를 수정!
      imgElement.alt = imageSrc.split("/").pop();  
      imgElement.classList.add("emoji-icon");

      chatEmojisDisplay.appendChild(imgElement);
  });

  console.log("✅ 이미지 업데이트 완료");

  // Disable the send button if the image list has 15 chat_count.png
  document.getElementById("sendButton").disabled = (
    imageList.filter(img => img.endsWith("chat_count.png")).length >= 15
  );
}

// Append message to the chat box
function appendMessage(content, sender) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  
  messageElement.classList.add("chat-message");
  messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
  
  messageElement.textContent = content;
  chatBox.appendChild(messageElement);
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Event listeners for sending messages
document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

document.addEventListener("DOMContentLoaded", async function() {
  try {
      const response = await fetch("/chat/images");  // ✅ GET 요청으로 변경
      if (!response.ok) throw new Error("서버 응답 오류");

      const data = await response.json();
      console.log("✅ 서버에서 받은 데이터:", data.chat_count_images);

      updateChatImages(data.chat_count_images);  // 🎯 받은 데이터를 전달
  } catch (error) {
      console.error("🚨 채팅 이미지 불러오기 실패:", error);
  }
});


