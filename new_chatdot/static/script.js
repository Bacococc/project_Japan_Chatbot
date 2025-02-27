let conversationHistory = [];
let chatCount = 0;

// 🌟 서버에서 채팅 상태(대화 내역 + 채팅 횟수) 불러오기
async function fetchChatStatus() {
    try {
        const response = await fetch("/chat/status");
        if (!response.ok) throw new Error("서버 응답 오류");

        const data = await response.json();
        console.log("✅ 서버에서 받은 채팅 상태:", data);

        // 서버에서 불러온 데이터 반영
        conversationHistory = data.history || [];
        chatCount = data.chat_count || 0;

        updateChatWindow();

        if (chatCount >= 10) {
            document.getElementById("sendButton").disabled = true;
            appendMessage("오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!", "bot", true);
        }

        // 채팅 횟수 아이콘 업데이트
        updateChatImages(data.chat_count_images || []);
    } catch (error) {
        console.error("🚨 채팅 상태 불러오기 실패:", error);
    }
}

// 🌟 서버에서 채팅 횟수 아이콘 업데이트
async function fetchAndUpdateChatImages() {
    try {
        const response = await fetch("/chat/images");
        if (!response.ok) throw new Error("서버 응답 오류");

        const data = await response.json();
        console.log("✅ 서버에서 받은 데이터:", data.chat_count_images);

        updateChatImages(data.chat_count_images);
    } catch (error) {
        console.error("🚨 채팅 이미지 불러오기 실패:", error);
    }
}

// 🌟 메시지 전송
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

        if (chatCount >= 10) {
            document.getElementById("sendButton").disabled = true;
            appendMessage("오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!", "bot", true);
        }

        // ✅ 채팅 횟수 아이콘 실시간 반영
        updateChatImages(data.chat_count_images || []);
    } catch (error) {
        console.error("Fetch error:", error);
        appendMessage("Something went wrong! Please try again.", "bot");
    }

    document.getElementById("userInput").value = "";
}

// 🌟 채팅창 업데이트
function updateChatWindow() {
    const chatWindow = document.getElementById("chatBox");
    chatWindow.innerHTML = "";

    conversationHistory.forEach(item => {
        appendMessage(item.content, item.role);
    });

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 🌟 채팅 횟수 아이콘 업데이트
function updateChatImages(imageList) {
    console.log("📌 updateChatImages 호출됨! imageList 값:", imageList);

    if (!Array.isArray(imageList)) {
        console.error("❌ 오류: imageList가 배열이 아닙니다!", imageList);
        return;
    }

    const chatEmojisDisplay = document.getElementById("chatEmojisDisplay");
    chatEmojisDisplay.innerHTML = "";

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

// 🌟 채팅 메시지 추가
function appendMessage(content, sender, isSpecial = false) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");

    messageElement.classList.add("chat-message");

    if (isSpecial) {
        messageElement.classList.add("completed-chat-message");
    } else {
        messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
    }

    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.textContent = content;

    messageElement.appendChild(messageText);
    messageElement.style.marginBottom = "12px";

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 🌟 이벤트 리스너 추가
document.getElementById("sendButton").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// 🌟 페이지 로드 시 서버에서 채팅 상태 불러오기
document.addEventListener("DOMContentLoaded", fetchChatStatus);
