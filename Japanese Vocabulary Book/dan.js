// 페이지가 로드될 때 단어 목록을 불러오는 함수 호출
document.addEventListener("DOMContentLoaded", loadWords);

// 한자를 변환하는 함수
function convertKanji() {
  const kanji = document.getElementById("kanji").value;
  if (kanji) {
    fetch('/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ kanji: kanji })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("meaning").value = data.meaning;
      document.getElementById("hiragana").value = data.hiragana;
    })
    .catch(error => console.error('Error:', error));
  }
}

// 단어를 추가하는 함수
function addWord(event) {
  event.preventDefault(); // 폼 제출 기본 동작 방지
  const kanji = document.getElementById("kanji").value; // 한자 입력값 가져오기
  const hiragana = document.getElementById("hiragana").value; // 히라가나 입력값 가져오기
  const meaning = document.getElementById("meaning").value; // 뜻 입력값 가져오기
  const table = document.querySelector("tbody"); // 테이블의 tbody 요소 선택
  const newRow = table.insertRow(); // 새로운 행 추가
  const kanjiCell = newRow.insertCell(0); // 첫 번째 셀 추가 (한자)
  const hiraganaCell = newRow.insertCell(1); // 두 번째 셀 추가 (히라가나)
  const meaningCell = newRow.insertCell(2); // 세 번째 셀 추가 (뜻)
  const checkCell = newRow.insertCell(3); // 네 번째 셀 추가 (외움 체크박스)
  const actionCell = newRow.insertCell(4); // 다섯 번째 셀 추가 (수정 버튼)
  kanjiCell.textContent = kanji; // 한자 셀에 입력값 설정
  hiraganaCell.textContent = hiragana; // 히라가나 셀에 입력값 설정
  meaningCell.textContent = meaning; // 뜻 셀에 입력값 설정
  checkCell.innerHTML =
    '<input type="checkbox" onclick="toggleLearned(this)">'; // 외움 체크박스 추가
  actionCell.innerHTML =
    '<button class="edit-btn" onclick="editWord(this)">수정</button>'; // 수정 버튼 추가
  document.getElementById("kanji").value = ""; // 한자 입력 필드 초기화
  document.getElementById("meaning").value = ""; // 뜻 입력 필드 초기화

  saveWordToLocalStorage(kanji, hiragana, meaning, false); // 로컬 스토리지에 단어 저장
}

// 단어를 검색하는 함수
function searchWord() {
  const searchInput = document
    .getElementById("search")
    .value.toLowerCase(); // 검색어 입력값 가져오기
  const table = document.querySelector("tbody"); // 테이블의 tbody 요소 선택
  const rows = table.getElementsByTagName("tr"); // 모든 행 가져오기

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td"); // 각 행의 셀 가져오기
    const kanji = cells[0].textContent.toLowerCase(); // 한자 셀의 텍스트 가져오기
    const hiragana = cells[1].textContent.toLowerCase(); // 히라가나 셀의 텍스트 가져오기
    const meaning = cells[2].textContent.toLowerCase(); // 뜻 셀의 텍스트 가져오기

    // 검색어가 한자, 히라가나 또는 뜻에 포함되어 있는지 확인
    if (
      kanji.includes(searchInput) ||
      hiragana.includes(searchInput) ||
      meaning.includes(searchInput)
    ) {
      rows[i].style.display = ""; // 포함되어 있으면 행을 표시
    } else {
      rows[i].style.display = "none"; // 포함되어 있지 않으면 행을 숨김
    }
  }
}

// 단어를 수정하는 함수
function editWord(button) {
  const row = button.parentNode.parentNode; // 버튼의 부모 요소인 행 가져오기
  const kanjiCell = row.cells[0]; // 첫 번째 셀 (한자) 가져오기
  const hiraganaCell = row.cells[1]; // 두 번째 셀 (히라가나) 가져오기
  const meaningCell = row.cells[2]; // 세 번째 셀 (뜻) 가져오기
  const actionCell = row.cells[4]; // 다섯 번째 셀 (수정 버튼) 가져오기

  const kanji = kanjiCell.textContent; // 한자 셀의 텍스트 가져오기
  const hiragana = hiraganaCell.textContent; // 히라가나 셀의 텍스트 가져오기
  const meaning = meaningCell.textContent; // 뜻 셀의 텍스트 가져오기

  // 한자, 히라가나, 뜻을 입력 필드로 변경
  kanjiCell.innerHTML = `<input type="text" value="${kanji}" id="edit-kanji">`;
  hiraganaCell.innerHTML = `<input type="text" value="${hiragana}" id="edit-hiragana">`;
  meaningCell.innerHTML = `<input type="text" value="${meaning}" id="edit-meaning">`;
  actionCell.innerHTML = '<button onclick="saveWord(this)">저장</button>'; // 저장 버튼 추가
}

// 수정된 단어를 저장하는 함수
function saveWord(button) {
  const row = button.parentNode.parentNode; // 버튼의 부모 요소인 행 가져오기
  const kanjiCell = row.cells[0]; // 첫 번째 셀 (한자) 가져오기
  const hiraganaCell = row.cells[1]; // 두 번째 셀 (히라가나) 가져오기
  const meaningCell = row.cells[2]; // 세 번째 셀 (뜻) 가져오기
  const checkCell = row.cells[3]; // 네 번째 셀 (외움 체크박스) 가져오기
  const actionCell = row.cells[4]; // 다섯 번째 셀 (수정 버튼) 가져오기

  const kanji = document.getElementById("edit-kanji").value; // 수정된 한자 값 가져오기
  const hiragana = document.getElementById("edit-hiragana").value; // 수정된 히라가나 값 가져오기
  const meaning = document.getElementById("edit-meaning").value; // 수정된 뜻 값 가져오기
  const isLearned = checkCell.querySelector(
    'input[type="checkbox"]'
  ).checked; // 외움 체크박스 상태 가져오기

  kanjiCell.textContent = kanji; // 한자 셀에 수정된 값 설정
  hiraganaCell.textContent = hiragana; // 히라가나 셀에 수정된 값 설정
  meaningCell.textContent = meaning; // 뜻 셀에 수정된 값 설정
  checkCell.innerHTML = `<input type="checkbox" onclick="toggleLearned(this)" ${
    isLearned ? "checked" : ""
  }>`; // 외움 체크박스 상태 설정
  actionCell.innerHTML =
    '<button class="edit-btn" onclick="editWord(this)">수정</button>'; // 수정 버튼 추가

  updateWordInLocalStorage(kanji, hiragana, meaning, isLearned); // 로컬 스토리지 업데이트
}

// 단어를 로컬 스토리지에 저장하는 함수
function saveWordToLocalStorage(kanji, hiragana, meaning, isLearned) {
  const words = JSON.parse(localStorage.getItem("words")) || []; // 로컬 스토리지에서 단어 목록 가져오기
  words.push({ kanji, hiragana, meaning, isLearned }); // 새로운 단어 추가
  localStorage.setItem("words", JSON.stringify(words)); // 로컬 스토리지에 저장
}

// 로컬 스토리지의 단어를 업데이트하는 함수
function updateWordInLocalStorage(kanji, hiragana, meaning, isLearned) {
  const words = JSON.parse(localStorage.getItem("words")) || []; // 로컬 스토리지에서 단어 목록 가져오기
  const index = words.findIndex((word) => word.kanji === kanji); // 수정할 단어의 인덱스 찾기
  if (index !== -1) {
    words[index].hiragana = hiragana; // 히라가나 업데이트
    words[index].meaning = meaning; // 뜻 업데이트
    words[index].isLearned = isLearned; // 외움 상태 업데이트
  } else {
    words.push({ kanji, hiragana, meaning, isLearned }); // 단어가 없으면 새로운 단어 추가
  }
  localStorage.setItem("words", JSON.stringify(words)); // 로컬 스토리지에 저장
}

// 로컬 스토리지에서 단어를 불러와 테이블에 표시하는 함수
function loadWords() {
  const words = JSON.parse(localStorage.getItem("words")) || []; // 로컬 스토리지에서 단어 목록 가져오기
  const table = document.querySelector("tbody"); // 테이블의 tbody 요소 선택
  table.innerHTML = ""; // 기존 단어 목록 초기화

  words.forEach((word) => {
    const newRow = table.insertRow(); // 새로운 행 추가
    const kanjiCell = newRow.insertCell(0); // 첫 번째 셀 추가 (한자)
    const hiraganaCell = newRow.insertCell(1); // 두 번째 셀 추가 (히라가나)
    const meaningCell = newRow.insertCell(2); // 세 번째 셀 추가 (뜻)
    const checkCell = newRow.insertCell(3); // 네 번째 셀 추가 (외움 체크박스)
    const actionCell = newRow.insertCell(4); // 다섯 번째 셀 추가 (수정 버튼)
    kanjiCell.textContent = word.kanji; // 한자 셀에 값 설정
    hiraganaCell.textContent = word.hiragana; // 히라가나 셀에 값 설정
    meaningCell.textContent = word.meaning; // 뜻 셀에 값 설정
    checkCell.innerHTML = `<input type="checkbox" onclick="toggleLearned(this)" ${
      word.isLearned ? "checked" : ""
    }>`; // 외움 체크박스 상태 설정
    actionCell.innerHTML =
      '<button class="edit-btn" onclick="editWord(this)">수정</button>'; // 수정 버튼 추가
  });
}

// 외움 상태를 토글하는 함수
function toggleLearned(checkbox) {
  const row = checkbox.parentNode.parentNode; // 체크박스의 부모 요소인 행 가져오기
  const kanji = row.cells[0].textContent; // 한자 셀의 텍스트 가져오기
  const hiragana = row.cells[1].textContent; // 히라가나 셀의 텍스트 가져오기
  const meaning = row.cells[2].textContent; // 뜻 셀의 텍스트 가져오기
  const isLearned = checkbox.checked; // 외움 체크박스 상태 가져오기

  updateWordInLocalStorage(kanji, hiragana, meaning, isLearned); // 로컬 스토리지 업데이트
}

// 단어 목록을 초기화하는 함수
function clearWords() {
  localStorage.removeItem("words"); // 로컬 스토리지에서 단어 목록 제거
  const table = document.querySelector("tbody"); // 테이블의 tbody 요소 선택
  table.innerHTML = ""; // 테이블 초기화
}