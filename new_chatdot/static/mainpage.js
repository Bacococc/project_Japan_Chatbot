document.addEventListener("DOMContentLoaded", () => {
    // fade-in 요소들 감지
    const fadeInElements = document.querySelectorAll('.fade-in');
  
    // IntersectionObserver 설정
    const observerOptions = {
      threshold: 0.5, // 요소가 50% 이상 보일 때 애니메이션 시작
    };
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 요소가 화면에 보일 때, fade-in 클래스를 추가하여 애니메이션 실행
          entry.target.classList.add('visible'); // 'visible' 클래스를 추가하여 애니메이션 활성화
          observer.unobserve(entry.target); // 애니메이션이 한 번 실행되면 더 이상 감지하지 않음
        }
      });
    }, observerOptions);
  
    // fade-in 클래스를 가진 요소들을 옵저버에 등록
    fadeInElements.forEach(element => observer.observe(element));
  
    // 페이지 끝까지 스크롤 시 버튼을 서서히 나타나게 하기 위한 IntersectionObserver 설정
    const startButtonContainer = document.getElementById('startButtonContainer');
    
    // 버튼 나타날 시 'fade-in' 클래스 추가
    const buttonObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startButtonContainer.classList.add('fade-in'); // 버튼이 화면에 보이면 'fade-in' 클래스 추가
          entry.target.style.display = 'flex'; // 버튼을 화면에 보이게 설정
        }
      });
    }, { threshold: 1.0 }); // 100% 보일 때 트리거
  
    // 버튼을 옵저버에 등록
    buttonObserver.observe(startButtonContainer);
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    
    const startButtonContainer = document.getElementById('startButtonContainer');
    
    // 스크롤 이벤트를 사용해 버튼 등장 제어
    window.addEventListener('scroll', () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 페이지 끝에 거의 도달하면 버튼이 서서히 나타나도록 (문서 끝에서 50px 전부터)
      if (scrollPosition >= documentHeight - 50) {
        startButtonContainer.classList.add('fade-in');
      } else {
        startButtonContainer.classList.remove('fade-in');
      }
    });
  
    // 'アシ助スタート' 버튼 클릭 시 /chat으로 이동
    document.getElementById("startButton").addEventListener("click", function() {
      window.location.href = "/chat";
    });
  });
  
  