document.addEventListener('DOMContentLoaded', loadWordsFromLocalStorage);

// 단어 추가
function addWord(event) {
    event.preventDefault();
    const kanji = document.getElementById('kanji').value.trim();
    const hiragana = document.getElementById('hiragana').value.trim();
    const meaning = document.getElementById('meaning').value.trim();

    if (!kanji || !hiragana || !meaning) return alert("모든 필드를 입력하세요.");

    addRowToTable({ kanji, hiragana, meaning, isLearned: false });
    saveWordsToLocalStorage();

    // 입력 필드 초기화
    document.getElementById('kanji').value = '';
    document.getElementById('hiragana').value = '';
    document.getElementById('meaning').value = '';
}

// 테이블에 행 추가
function addRowToTable(word) {
    const table = document.querySelector('tbody');
    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td class="kanji">${word.kanji}</td>
        <td class="hiragana">${word.hiragana}</td>
        <td class="meaning">${word.meaning}</td>
        <td><input type="checkbox" ${word.isLearned ? 'checked' : ''} onchange="toggleLearned(this)"></td>
        <td><button onclick="editWord(this.parentElement.parentElement)">수정</button></td>
    `;
}

// 단어 검색
function searchWord() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const [kanjiCell, hiraganaCell, meaningCell] = row.cells;
        const match = [kanjiCell.textContent, hiraganaCell.textContent, meaningCell.textContent]
            .some(text => text.toLowerCase().includes(searchInput));
        row.style.display = match ? '' : 'none';
    });
}

// 단어 수정
function editWord(row) {
    const kanji = row.querySelector(".kanji").innerText;
    const hiragana = row.querySelector(".hiragana").innerText;
    const meaning = row.querySelector(".meaning").innerText;

    row.innerHTML = `
        <td><input type="text" value="${kanji}" class="edit-kanji" /></td>
        <td><input type="text" value="${hiragana}" class="edit-hiragana" /></td>
        <td><input type="text" value="${meaning}" class="edit-meaning" /></td>
        <td><button onclick="saveWord(this)">저장</button></td>
    `;

    // 기존 입력 칸과 동일한 스타일 적용
    const inputs = row.querySelectorAll("input");
    inputs.forEach(input => {
        input.style.padding = "8px"; // 패딩을 줄여서 크기를 조정
        input.style.borderRadius = "5px";
        input.style.border = "1px solid #bbb";
        input.style.fontSize = "14px"; // 폰트 크기를 줄여서 크기를 조정
        input.style.width = "80px"; // 입력 칸의 너비를 조정
    });
}

// 단어 저장
function saveWord(button) {
    const row = button.parentElement.parentElement;
    const kanji = row.querySelector(".edit-kanji").value;
    const hiragana = row.querySelector(".edit-hiragana").value;
    const meaning = row.querySelector(".edit-meaning").value;

    if (!kanji || !hiragana || !meaning) return alert("모든 필드를 입력하세요.");

    row.innerHTML = `
        <td class="kanji">${kanji}</td>
        <td class="hiragana">${hiragana}</td>
        <td class="meaning">${meaning}</td>
        <td><input type="checkbox" onchange="toggleLearned(this)"></td>
        <td><button onclick="editWord(this.parentElement.parentElement)">수정</button></td>
    `;

    saveWordsToLocalStorage();
}

// 로컬 스토리지 저장
function saveWordsToLocalStorage() {
    const words = [];
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach(row => {
        const kanji = row.querySelector(".kanji").innerText;
        const hiragana = row.querySelector(".hiragana").innerText;
        const meaning = row.querySelector(".meaning").innerText;
        words.push({ kanji, hiragana, meaning });
    });
    localStorage.setItem('words', JSON.stringify(words));
}

// 로컬 스토리지 불러오기
function loadWordsFromLocalStorage() {
    const words = JSON.parse(localStorage.getItem('words')) || [];
    const tbody = document.querySelector("table tbody");
    words.forEach(word => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="kanji">${word.kanji}</td>
            <td class="hiragana">${word.hiragana}</td>
            <td class="meaning">${word.meaning}</td>
            <td><input type="checkbox" ${word.isLearned ? 'checked' : ''} onchange="toggleLearned(this)"></td>
            <td><button onclick="editWord(this.parentElement.parentElement)">수정</button></td>
        `;
        tbody.appendChild(row);
    });
}

// 외움 여부 토글
function toggleLearned(checkbox) {
    const row = checkbox.closest('tr');
    const [kanjiCell] = row.cells;
    
    updateWordInLocalStorage(kanjiCell.textContent, null, null);
}

function clearWords() {
    if (confirm("정말로 초기화하시겠습니까?")) {
        // 로컬 스토리지 초기화
        localStorage.removeItem('words');
        
        // 단어 목록 초기화
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = "";
    }
}


