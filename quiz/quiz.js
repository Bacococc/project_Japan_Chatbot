const quizData = [
    {
        question: "<ruby>昔<rt>むかし</rt></ruby>の<ruby>彼<rt>かれ</rt></ruby>の<ruby>写真<rt>しゃしん</rt></ruby>（　　　）、<ruby>捨<rt>す</rt></ruby>ててしまいましょう。",
        options: ["なんて", "なんか", "など", "なんだか"],
        correct: 1,
    },
    {
        question: "アンケート<ruby>調査<rt>ちょうさ</rt></ruby>（　　　）、<ruby>消費者<rt>しょうひしゃ</rt></ruby>の<ruby>考<rt>かんが</rt></ruby>えがよくわかりました。",
        options: ["によって", "にとって", "について", "に<ruby>関<rt>かん</rt></ruby>して"],
        correct: 0,
    },
    {
        question: "<ruby>道<rt>みち</rt></ruby>が<ruby>込<rt>こ</rt></ruby>んでいた（　　　）、<ruby>予定<rt>よてい</rt></ruby>より<ruby>時間<rt>じかん</rt></ruby>がかかってしまった。",
        options: ["ため", "せいで", "おかげで", "わけで"],
        correct: 0,
    },
    // 他の問題を追加できます
];

let availableQuestions = [...Array(quizData.length).keys()];

function getRandomQuestion() {
    if (availableQuestions.length === 0) {
        availableQuestions = [...Array(quizData.length).keys()];
    }
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const questionIndex = availableQuestions[randomIndex];
    availableQuestions.splice(randomIndex, 1);
    return quizData[questionIndex];
}

function displayQuestion() {
    const quizContainer = document.getElementById("quiz-container");
    const question = getRandomQuestion();

    let html = `<p>${question.question}</p><div class="options">`;

    question.options.forEach((option, index) => {
        html += `<button onclick="checkAnswer(${index}, ${question.correct})">${index + 1}. ${option}</button>`;
    });

    html += "</div>";
    quizContainer.innerHTML = html;
}

function checkAnswer(selectedIndex, correctIndex) {
    if (selectedIndex === correctIndex) {
        alert("正解です！");
    } else {
        alert("不正解です。もう一度試してください。");
    }
}

function nextQuestion() {
    displayQuestion();
}

function toggleHiragana() {
    document.body.classList.toggle("show-hiragana");
}

document.addEventListener('DOMContentLoaded', displayQuestion);