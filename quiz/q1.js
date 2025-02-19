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
]

let initialQuestions = [...words];  // 전체 문제 목록
let currentQuestions = [];  // 선택된 4개의 문제
let count = 0;  // 맞춘 문제 수

// 문제를 로딩하는 함수
function loadQuestion() {
    // 처음에 문제 4개를 로드
    if (currentQuestions.length === 0) {
        currentQuestions = getRandomQuestions(4);  // 문제 4개를 선택
    }

    // 문제의 순서는 섞고, 단어와 뜻을 각각 섞기
    const shuffledWords = [...currentQuestions];  // 문제 순서는 그대로
    const shuffledMeanings = shuffleArray(currentQuestions.map(item => item.meaning));  // 뜻만 섞기

    const word = document.getElementById("word");
    const meaning = document.getElementById("meaning");

    word.innerHTML = ""; // 기존 단어 버튼 초기화
    meaning.innerHTML = ""; // 기존 뜻 버튼 초기화

    // 단어를 선택지로 만들어 버튼을 추가
    shuffledWords.forEach(item => {
        const button = document.createElement("button");
        button.innerText = item.word;
        button.onclick = () => selectWord(item); // 단어 선택
        word.appendChild(button);
    });

    // 뜻을 선택지로 만들어 버튼을 추가
    shuffledMeanings.forEach(item => {
        const button = document.createElement("button");
        button.innerText = item;
        button.onclick = () => selectMeaning(item); // 뜻 선택
        meaning.appendChild(button);
    });

    // "퀴즈 종료" 메시지 없애기
    document.getElementById("result").innerText = ""; 
}

// 4개의 무작위 문제를 선택하는 함수
function getRandomQuestions(count) {
    // 무작위로 문제를 선택 (이미 선택된 문제 제외)
    const shuffledQuestions = shuffleArray([...initialQuestions]);
    return shuffledQuestions.slice(0, count);  // 4개 문제 선택
}

// 단어를 선택한 경우
function selectWord(word) {
    selectedWord = word;
    checkAnswer();  // 답을 확인
}

// 뜻을 선택한 경우
function selectMeaning(meaning) {
    selectedMeaning = meaning;
    checkAnswer();  // 답을 확인
}

// 선택된 단어와 뜻이 맞는지 확인
function checkAnswer() {
    const resultDiv = document.getElementById("result");

    if (selectedWord && selectedMeaning) {
        // 정답을 비교: 단어와 뜻이 일치하는지 확인
        const correctItem = currentQuestions.find(item => item.word === selectedWord.word && item.meaning === selectedMeaning);

        if (correctItem) {
            resultDiv.innerText = "정답입니다!";
            count++;  // 맞춘 문제 수 증가
            removeCorrectAnswer(correctItem);  // 맞춘 단어와 뜻을 화면에서 삭제
        } else {
            resultDiv.innerText = "틀렸습니다. 다시 시도해 보세요!";
        }
    }
}

// 맞춘 단어와 뜻을 화면에서 삭제
function removeCorrectAnswer(correctItem) {
    // 남은 문제 목록에서 정답 제거
    currentQuestions = currentQuestions.filter(item => item !== correctItem);

    // 선택된 단어와 뜻 초기화
    selectedWord = null;
    selectedMeaning = null;

    // 만약 모든 문제가 풀렸다면 바로 퀴즈 종료
    if (currentQuestions.length === 0) {
        document.getElementById("result").innerText = "퀴즈 종료!";
        document.getElementById("word").innerHTML = "";
        document.getElementById("meaning").innerHTML = "";

        // '다시 풀기' 버튼 추가 (문제를 다시 풀 수 있게)
        const retryButton = document.createElement("button");
        retryButton.innerText = "다시 풀기";
        retryButton.onclick = resetQuiz;
        document.getElementById("result").appendChild(retryButton);
    } else {
        // 새로운 문제 로딩
        loadQuestion();
    }
}

// 퀴즈를 초기화하는 함수 (다시 풀기 버튼을 눌렀을 때)
function resetQuiz() {
    // 초기화
    currentQuestions = [];
    count = 0;
    loadQuestion();  // 문제를 다시 로드
}

// 배열을 랜덤하게 섞는 함수
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// 처음 문제 로딩
loadQuestion();



