let conversationHistory = [];  // 대화 기록을 저장할 변수
let chatCount = 0;  // 채팅 횟수 변수

// 메시지 전송 함수
function sendMessage() {
    const message = document.getElementById("messageInput").value;
    
    if (message.trim() === "") {
        return;
    }

    // 사용자 메시지 추가
    conversationHistory.push({ role: "user", content: message });

    // 서버로 메시지 전송
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory }),
    })
    .then(response => response.json())
    .then(data => {
        // 서버 응답 처리
        const assistantResponse = data.response;

        // 채팅 횟수 처리: 최대 10회 초과 시, 봇 메시지 변경
        if (chatCount >= 10) {
            assistantResponse = "오늘의 채팅량을 달성하셨습니다! 왼쪽의 퀴즈 버튼을 눌러 퀴즈를 풀어보세요!";
        } else {
            chatCount++;
        }

        // 채팅 기록에 봇의 응답 추가
        conversationHistory.push({ role: "assistant", content: assistantResponse });

        // 메시지 출력
        updateChatWindow();
        updateChatEmojis();
    })
    .catch(error => console.error('Error:', error));
}

// 대화창 업데이트
function updateChatWindow() {
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.innerHTML = ''; // 기존 대화 지우기

    // 대화 기록을 화면에 출력
    conversationHistory.forEach(item => {
        const messageElement = document.createElement('div');
        messageElement.classList.add(item.role);
        messageElement.textContent = item.content;
        chatWindow.appendChild(messageElement);
    });
}

// 채팅 횟수에 맞춰 이모지 업데이트
function updateChatEmojis() {
    const chatEmojisDisplay = document.getElementById("chatEmojisDisplay");
    const maxChats = 10;
    let emojis = "🌸".repeat(maxChats - chatCount) + "💬".repeat(chatCount);
    chatEmojisDisplay.textContent = emojis;

    // 전송 버튼 비활성화
    const sendButton = document.getElementById("sendButton");
    if (chatCount >= maxChats) {
        sendButton.disabled = true;  // 채팅 횟수 초과 시 버튼 비활성화
    } else {
        sendButton.disabled = false; // 채팅 횟수 미달 시 버튼 활성화
    }
}

// 메시지 UI에 추가
function appendMessage(content, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
    messageElement.textContent = content;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 서버로 메시지 전송
async function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    if (!userInput) return;

    appendMessage(userInput, "user");

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

            // 채팅 횟수 이모지 업데이트
            document.getElementById("chatEmojisDisplay").textContent = data.chat_count_emojis;

            conversationHistory.push({ "role": "assistant", "content": botReply });
        } else {
            appendMessage("Error: " + data.error, "bot");
        }
    } catch (error) {
        appendMessage("Something went wrong! Please try again.", "bot");
        console.error(error);
    }

    document.getElementById("userInput").value = "";  // 입력창 초기화
}

// "전송" 버튼 클릭 이벤트 추가
document.getElementById("sendButton").addEventListener("click", sendMessage);

// 엔터키 입력 시 메시지 전송
document.getElementById("userInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {  // Shift+Enter 시 줄바꿈
        event.preventDefault();
        sendMessage();
    }
});

// 페이지 로드 후 UI 업데이트
document.addEventListener("DOMContentLoaded", function() {
    updateChatEmojis();  // 페이지 로드 시 채팅 횟수에 맞는 이모지 초기화
});