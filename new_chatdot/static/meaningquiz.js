const words = [
    { word: "明日", meaning: "내일" },
    { word: "学校", meaning: "학교" },
    { word: "食べる", meaning: "먹다" },
    { word: "遊ぶ", meaning: "놀다" },
    { word: "勉強", meaning: "공부" },
    { word: "大きい", meaning: "크다" },
    { word: "小さい", meaning: "작다" },
    { word: "親切", meaning: "친절" },
    { word: "大切", meaning: "중요하다" },
    { word: "楽しい", meaning: "즐겁다" },
    { word: "早い", meaning: "빠르다" },
    { word: "遅い", meaning: "느리다" },
    { word: "静か", meaning: "조용하다" },
    { word: "うるさい", meaning: "시끄럽다" },
    { word: "元気", meaning: "건강하다" },
    { word: "綺麗", meaning: "예쁘다" },
    { word: "長い", meaning: "길다" },
    { word: "短い", meaning: "짧다" },
    { word: "新しい", meaning: "새롭다" },
    { word: "古い", meaning: "오래되다" },
    { word: "忙しい", meaning: "바쁘다" },
    { word: "簡単", meaning: "간단하다" },
    { word: "難しい", meaning: "어렵다" },
    { word: "きれい", meaning: "깔끔하다" },
    { word: "面白い", meaning: "재미있다" },
    { word: "暖かい", meaning: "따뜻하다" },
    { word: "寒い", meaning: "차가운" },
    { word: "暑い", meaning: "덥다" },
    { word: "涼しい", meaning: "시원하다" },
    { word: "大丈夫", meaning: "괜찮다" },
    { word: "有名", meaning: "유명하다" },
    { word: "知らない", meaning: "모르다" },
    { word: "使う", meaning: "사용하다" },
    { word: "話す", meaning: "말하다" },
    { word: "聞く", meaning: "듣다" },
    { word: "見る", meaning: "보다" },
    { word: "書く", meaning: "쓰다" },
    { word: "読む", meaning: "읽다" },
    { word: "待つ", meaning: "기다리다" },
    { word: "歩く", meaning: "걷다" },
    { word: "乗る", meaning: "타다" },
    { word: "起きる", meaning: "일어나다" },
    { word: "寝る", meaning: "자다" },
    { word: "助ける", meaning: "돕다" },
    { word: "買う", meaning: "사다" },
    { word: "売る", meaning: "팔다" },
    { word: "立つ", meaning: "서다" },
    { word: "座る", meaning: "앉다" },
    { word: "遊びに行く", meaning: "놀러 가다" },
    { word: "結婚する", meaning: "결혼하다" }
];

let i = 0; // 문제 푼 수
let current = 0;
let count = 0;

function question() {
    const random = Math.floor(Math.random() * words.length);
    current = random;

    const questionMeaning = words[random].meaning;
    const correctAnswer = words[random].word;

    //문제 뜻 출력
    document.getElementById("question").innerText = `뜻이 "${questionMeaning}"인 단어는?`;

    const options = [words[random]];

    while (options.length < 4) {
        const randomOption = words[Math.floor(Math.random() * words.length)];

        //중복 체크
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }

    options.sort(() => Math.random() - 0.5);

    //선택지 배치
    for (let j = 0; j < 4; j++) {
        document.getElementById(`answer${j + 1}`).innerText = options[j].word;
    }
}

function checkAnswer(selectedOption) {
    const selectedWord = document.getElementById(`answer${selectedOption}`).innerText;
    const correctAnswer = words[current].word;

    if (selectedWord === correctAnswer) {
        document.getElementById("result").innerText = "정답입니다!";
        count++;
    } else {
        document.getElementById("result").innerText = "틀렸습니다.";
    }

    i++;

    setTimeout(() => {
        document.getElementById("result").innerText = "";

        if (i < 5) {
            question();
        } else {
            document.getElementById("question").style.display = "none"; //문제 숨김
            document.querySelector(".answer").style.display = "none"; //선택지 숨김김
            document.getElementById("result").innerText = `퀴즈 종료! 정답 개수: ${count}`;
            const retryButton = document.createElement("button");
            retryButton.innerText = "다시 풀기";
            retryButton.classList.add("retryButton");
            retryButton.onclick = resetQuiz;
            document.getElementById("result").appendChild(retryButton);
        }
    }, 500);
}

function resetQuiz() {
    i = 0; //문제 푼 횟수 초기화
    count = 0; //맞춘 개수 초기화
    document.getElementById("question").style.display = "block"; //문제 다시 보이기
    document.querySelector(".answer").style.display = "block"; //선택지 다시 보이기
    document.getElementById("result").innerText = ""; //결과 초기화

    //"다시 풀기" 버튼 제거
    const retryButton = document.getElementById("retryButton");
    if (retryButton) {
        retryButton.remove();
    }

    //새 문제 시작
    question();
}

//첫 문제
question();

