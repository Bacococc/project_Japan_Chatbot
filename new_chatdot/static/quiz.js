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

let currentIndex = 0; 
const cardElement = document.getElementById('card');  //카드 요소
const wordListElement = document.getElementById('wordList');  //단어 목록 요소

//단어를 표시하는 함수
function displayWord(index) {
    const word = words[index].word;
    const meaning = words[index].meaning;

    cardElement.innerHTML = ''; 

    const wordElement = document.createElement('div');
    wordElement.classList.add('word');
    wordElement.textContent = word;

    const meaningElement = document.createElement('div');
    meaningElement.classList.add('definition');
    meaningElement.textContent = meaning;

    // 처음에는 단어만 보이게
    meaningElement.style.display = 'none';

    cardElement.appendChild(wordElement);
    cardElement.appendChild(meaningElement);
}

//단어 목록 생성
function generateWordList() {
    const wordListContainer = document.querySelector(".word-list");
    wordListContainer.innerHTML = ""; // 기존 목록 초기화

    words.forEach(item => {
        const wordItem = document.createElement("div");
        wordItem.classList.add("word-item");

        wordItem.innerHTML = `
            <div class="word">${item.word}</div>
            <div class="word-meaning">${item.meaning}</div>
        `;

        wordListContainer.appendChild(wordItem);
    });
}

//단어 리스트
document.addEventListener("DOMContentLoaded", generateWordList);

//카드 클릭 시 뜻을 보이도록
cardElement.addEventListener('click', () => {
    const wordElement = cardElement.querySelector('.word');
    const meaningElement = cardElement.querySelector('.definition');

    //단어와 뜻을 보이게 
    if (wordElement.style.display === 'none') {
        wordElement.style.display = 'block'; 
        meaningElement.style.display = 'none';  
    } else {
        wordElement.style.display = 'none';  
        meaningElement.style.display = 'block';  
    }
});

//다음 버튼 클릭 시
document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % words.length;
    displayWord(currentIndex);
});

//이전전버튼 클릭 시
document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + words.length) % words.length; 
    displayWord(currentIndex);
});

//첫 번째 단어를 초기화 시 표시
displayWord(currentIndex);
generateWordList();

//단어 뜻 퀴즈로 이동
function meaningQuiz() {
    window.location.href = "meaningquiz.html";
}

//연결 퀴즈로 이동
function matchingQuiz() {
    window.location.href = "matchingquiz.html";
}
