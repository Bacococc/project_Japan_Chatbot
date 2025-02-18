// 페이지가 로드될 때 단어 목록을 불러옵니다.
document.addEventListener('DOMContentLoaded', loadWords);

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
    event.preventDefault();
    const kanji = document.getElementById('kanji').value;
    const hiragana = document.getElementById('hiragana').value;
    const meaning = document.getElementById('meaning').value;
    const table = document.querySelector('tbody');
    const newRow = table.insertRow();
    const kanjiCell = newRow.insertCell(0);
    const hiraganaCell = newRow.insertCell(1);
    const meaningCell = newRow.insertCell(2);
    const checkCell = newRow.insertCell(3);
    const actionCell = newRow.insertCell(4);
    kanjiCell.textContent = kanji;
    hiraganaCell.textContent = hiragana;
    meaningCell.textContent = meaning;
    checkCell.innerHTML = '<input type="checkbox" onclick="toggleLearned(this)">';
    actionCell.innerHTML = '<button class="edit-btn" onclick="editWord(this)">수정</button>';
    document.getElementById('kanji').value = '';
    document.getElementById('hiragana').value = '';
    document.getElementById('meaning').value = '';

    saveWordToLocalStorage(kanji, hiragana, meaning, false);
}

// 단어를 검색하는 함수
function searchWord() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const table = document.querySelector('tbody');
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const kanji = cells[0].textContent.toLowerCase();
        const hiragana = cells[1].textContent.toLowerCase();
        const meaning = cells[2].textContent.toLowerCase();

        if (kanji.includes(searchInput) || hiragana.includes(searchInput) || meaning.includes(searchInput)) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

// 단어를 수정하는 함수
function editWord(button) {
    const row = button.parentNode.parentNode;
    const kanjiCell = row.cells[0];
    const hiraganaCell = row.cells[1];
    const meaningCell = row.cells[2];
    const actionCell = row.cells[4];

    const kanji = kanjiCell.textContent;
    const hiragana = hiraganaCell.textContent;
    const meaning = meaningCell.textContent;

    kanjiCell.innerHTML = `<input type="text" value="${kanji}" id="edit-kanji">`;
    hiraganaCell.innerHTML = `<input type="text" value="${hiragana}" id="edit-hiragana">`;
    meaningCell.innerHTML = `<input type="text" value="${meaning}" id="edit-meaning">`;
    actionCell.innerHTML = '<button onclick="saveWord(this)">저장</button>';
}

// 단어를 저장하는 함수
function saveWord(button) {
    const row = button.parentNode.parentNode;
    const kanjiCell = row.cells[0];
    const hiraganaCell = row.cells[1];
    const meaningCell = row.cells[2];
    const checkCell = row.cells[3];
    const actionCell = row.cells[4];

    const kanji = document.getElementById('edit-kanji').value;
    const hiragana = document.getElementById('edit-hiragana').value;
    const meaning = document.getElementById('edit-meaning').value;
    const isLearned = checkCell.querySelector('input[type="checkbox"]').checked;

    kanjiCell.textContent = kanji;
    hiraganaCell.textContent = hiragana;
    meaningCell.textContent = meaning;
    checkCell.innerHTML = `<input type="checkbox" onclick="toggleLearned(this)" ${isLearned ? 'checked' : ''}>`;
    actionCell.innerHTML = '<button class="edit-btn" onclick="editWord(this)">수정</button>';

    updateWordInLocalStorage(kanji, hiragana, meaning, isLearned);
}

// 단어를 로컬 스토리지에 저장하는 함수
function saveWordToLocalStorage(kanji, hiragana, meaning, isLearned) {
    const words = JSON.parse(localStorage.getItem('words')) || [];
    words.push({ kanji, hiragana, meaning, isLearned });
    localStorage.setItem('words', JSON.stringify(words));
}

// 로컬 스토리지에서 단어를 업데이트하는 함수
function updateWordInLocalStorage(kanji, hiragana, meaning, isLearned) {
    const words = JSON.parse(localStorage.getItem('words')) || [];
    const index = words.findIndex(word => word.kanji === kanji);
    if (index !== -1) {
        words[index].hiragana = hiragana;
        words[index].meaning = meaning;
        words[index].isLearned = isLearned;
    } else {
        words.push({ kanji, hiragana, meaning, isLearned });
    }
    localStorage.setItem('words', JSON.stringify(words));
}

// 로컬 스토리지에서 단어를 불러오는 함수
function loadWords() {
    const words = JSON.parse(localStorage.getItem('words')) || [];
    const table = document.querySelector('tbody');
    table.innerHTML = ''; // 기존 단어 목록 초기화

    words.forEach(word => {
        const newRow = table.insertRow();
        const kanjiCell = newRow.insertCell(0);
        const hiraganaCell = newRow.insertCell(1);
        const meaningCell = newRow.insertCell(2);
        const checkCell = newRow.insertCell(3);
        const actionCell = newRow.insertCell(4);
        kanjiCell.textContent = word.kanji;
        hiraganaCell.textContent = word.hiragana;
        meaningCell.textContent = word.meaning;
        checkCell.innerHTML = `<input type="checkbox" onclick="toggleLearned(this)" ${word.isLearned ? 'checked' : ''}>`;
        actionCell.innerHTML = '<button class="edit-btn" onclick="editWord(this)">수정</button>';
    });
}

// 단어 외움 여부를 토글하는 함수
function toggleLearned(checkbox) {
    const row = checkbox.parentNode.parentNode;
    const kanji = row.cells[0].textContent;
    const hiragana = row.cells[1].textContent;
    const meaning = row.cells[2].textContent;
    const isLearned = checkbox.checked;

    updateWordInLocalStorage(kanji, hiragana, meaning, isLearned);
}

// 단어 목록을 초기화하는 함수
function clearWords() {
    localStorage.removeItem('words');
    loadWords();
}