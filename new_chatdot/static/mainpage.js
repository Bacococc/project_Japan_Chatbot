// 애니메이션이 시작될 요소들을 감지하는 IntersectionObserver 설정
const fadeInElements = document.querySelectorAll('.fade-in');
const observerOptions = {
  threshold: 0.5, // 요소가 50% 이상 보일 때 애니메이션 시작
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, observerOptions);

// 모든 fade-in 클래스가 적용된 요소들을 옵저버에 등록
fadeInElements.forEach(element => observer.observe(element));

// 스크롤이 끝까지 내려가면 버튼 표시
const startButtonContainer = document.getElementById('startButtonContainer');

// 페이지 끝까지 스크롤 시 버튼 보이기
window.addEventListener('scroll', () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.documentElement.scrollHeight;

  // 콘솔로 스크롤 위치 확인
  console.log(scrollPosition, documentHeight);

  if (scrollPosition >= documentHeight) {
    startButtonContainer.style.display = 'flex';  // display 속성을 변경하여 버튼을 보이게 함
  }
});

document.getElementById("startButton").addEventListener("click", function() {
    window.location.href = "/chat";  // Flask의 /chat 엔드포인트로 이동
});