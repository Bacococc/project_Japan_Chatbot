const quizData = [
  {
    question:
      "<ruby>昔<rt>むかし</rt></ruby>の<ruby>彼<rt>かれ</rt></ruby>の<ruby>写真<rt>しゃしん</rt></ruby>（　　　）、<ruby>捨<rt>す</rt></ruby>ててしまいましょう。",
    options: ["なんて", "なんか", "など", "なんだか"],
    correct: 1,
  },
  {
    question:
      "アンケート<ruby>調査<rt>ちょうさ</rt></ruby>（　　　）、<ruby>消費者<rt>しょうひしゃ</rt></ruby>の<ruby>考<rt>かんが</rt></ruby>えがよくわかりました。",
    options: [
      "によって",
      "にとって",
      "について",
      "に<ruby>関<rt>かん</rt></ruby>して",
    ],
    correct: 0,
  },
  {
    question:
      "<ruby>道<rt>みち</rt></ruby>が<ruby>込<rt>こ</rt></ruby>んでいた（　　　）、<ruby>予定<rt>よてい</rt></ruby>より<ruby>時間<rt>じかん</rt></ruby>がかかってしまった。",
    options: ["ため", "せいで", "おかげで", "わけで"],
    correct: 0,
  },
  {
    question:
      "<ruby>彼女<rt>かのじょ</rt></ruby>は（　　　）な<ruby>性格<rt>せいかく</rt></ruby>で、いつも<ruby>周<rt>まわ</rt></ruby>りの<ruby>人<rt>ひと</rt></ruby>を<ruby>笑顔<rt>えがお</rt></ruby>にさせます。",
    options: [
      "<ruby>陰気<rt>いんき</rt></ruby>",
      "<ruby>朗<rt>ほが</rt></ruby>らか",
      "<ruby>無口<rt>むくち</rt></ruby>",
      "<ruby>几帳面<rt>きちょうめん</rt></ruby>",
    ],
    correct: 1,
  },
  {
    question:
      "<ruby>彼<rt>かれ</rt></ruby>は（　　　）な<ruby>人<rt>ひと</rt></ruby>で、いつも<ruby>正直<rt>しょうじき</rt></ruby>です。",
    options: [
      "<ruby>優<rt>やさ</rt></ruby>しい",
      "<ruby>厳<rt>きび</rt></ruby>しい",
      "<ruby>無口<rt>むくち</rt></ruby>",
      "<ruby>几帳面<rt>きちょうめん</rt></ruby>",
    ],
    correct: 0,
  },
  {
    question:
      "<ruby>彼女<rt>かのじょ</rt></ruby>は（　　　）な<ruby>料理<rt>りょうり</rt></ruby>ができて、いつも<ruby>家族<rt>かぞく</rt></ruby>を<ruby>喜<rt>よろこ</rt></ruby>ばせます。",
    options: [
      "<ruby>美味<rt>おい</rt></ruby>しい",
      "<ruby>簡単<rt>かんたん</rt></ruby>",
      "<ruby>難<rt>むずか</rt></ruby>しい",
      "<ruby>健康的<rt>けんこうてき</rt></ruby>",
    ],
    correct: 0,
  },
  {
    question:
      "<ruby>彼<rt>かれ</rt></ruby>は（　　　）な<ruby>スポーツ<rt>すぽーつ</rt></ruby>が<ruby>得意<rt>とくい</rt></ruby>で、いつも<ruby>試合<rt>しあい</rt></ruby>で<ruby>活躍<rt>かつやく</rt></ruby>しています。",
    options: [
      "<ruby>速<rt>はや</rt></ruby>い",
      "<ruby>強<rt>つよ</rt></ruby>い",
      "<ruby>技術的<rt>ぎじゅつてき</rt></ruby>",
      "<ruby>戦略的<rt>せんりゃくてき</rt></ruby>",
    ],
    correct: 1,
  },
  {
    question:
      "<ruby>彼女<rt>かのじょ</rt></ruby>は（　　　）な<ruby>服装<rt>ふくそう</rt></ruby>を<ruby>好<rt>す</rt></ruby>み、いつも<ruby>スタイル<rt>すたいる</rt></ruby>が<ruby>良<rt>よ</rt></ruby>いです。",
    options: [
      "<ruby>カジュアル<rt>かじゅある</rt></ruby>",
      "<ruby>フォーマル<rt>ふぉーまる</rt></ruby>",
      "<ruby>モダン<rt>もだん</rt></ruby>",
      "レトロ",
    ],
    correct: 0,
  },
  {
    question:
      "<ruby>彼<rt>かれ</rt></ruby>は（　　　）な<ruby>仕事<rt>しごと</rt></ruby>を<ruby>選<rt>えら</rt></ruby>びましたが、<ruby>満足<rt>まんぞく</rt></ruby>しています。",
    options: [
      "<ruby>安定<rt>あんてい</rt></ruby>した",
      "<ruby>刺激<rt>しげき</rt></ruby>のある",
      "<ruby>創造的<rt>そうぞうてき</rt></ruby>",
      "<ruby>責任<rt>せきにん</rt></ruby>のある",
    ],
    correct: 1,
  },
];

let availableQuestions = [...Array(quizData.length).keys()];
let questionCount = 0;

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

  let html = `
      <p>${question.question}</p>
      <div class="options">
    `;

  question.options.forEach((option, index) => {
    html += `<button onclick="checkAnswer(${
      index === question.correct
    }, this)">${index + 1}. ${option}</button>`;
  });

  html += "</div>";
  quizContainer.innerHTML = html;
}

function checkAnswer(isCorrect, button) {
  if (isCorrect) {
    button.style.backgroundColor = "#34C759";
  } else {
    button.classList.add("incorrect");
    setTimeout(() => {
      button.classList.remove("incorrect");
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", function () { //addEventListener
  displayQuestion();
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
      handleButtonClick(event);
    }
  });
});

function nextQuestion() {
  questionCount++;
  if (questionCount < 9) {
    displayQuestion();
  } else {
    alert("문제를 모두 풀었습니다");
    questionCount = 0; // 문제 다시 시작
  }
  const buttons = document.querySelectorAll("button"); //배경색 초기화
  buttons.forEach((button) => {
    button.style.backgroundColor = "";
  });
}

function toggleHiragana() {
  document.body.classList.toggle("show-hiragana");
}

document.addEventListener("DOMContentLoaded", displayQuestion);
