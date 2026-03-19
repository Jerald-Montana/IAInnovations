const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});


const dropdowns = document.querySelectorAll(".dropdown > a");

dropdowns.forEach(item => {
  item.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parent = item.parentElement;
      parent.classList.toggle("active");
    }
  });
});


const sections = document.querySelectorAll(".hero-section");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.3 });

sections.forEach(section => observer.observe(section));s