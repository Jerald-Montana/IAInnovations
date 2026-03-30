document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  const dropdowns = document.querySelectorAll(".dropdown");

  if (hamburger && navMenu) {
    const toggleMenu = () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
      const expanded = hamburger.classList.contains("active");
      hamburger.setAttribute("aria-expanded", expanded ? "true" : "false");
    };

    hamburger.addEventListener("click", toggleMenu);

    hamburger.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });
  }

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector("a");

    if (!trigger) return;

    trigger.addEventListener("click", function (e) {
      if (window.innerWidth <= 980) {
        e.preventDefault();
        dropdown.classList.toggle("active");
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      navMenu?.classList.remove("active");
      hamburger?.classList.remove("active");
      hamburger?.setAttribute("aria-expanded", "false");
      dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
    }
  });

  // Typing effect
  const typingEl = document.querySelector(".typing-text");

  if (typingEl) {
    const text = typingEl.getAttribute("data-text") || "";
    let index = 0;

    typingEl.classList.add("is-typing");

    function typeText() {
      if (index < text.length) {
        typingEl.textContent += text.charAt(index);
        index++;
        setTimeout(typeText, 28);
      } else {
        typingEl.classList.remove("is-typing");
        typingEl.classList.add("finished");
      }
    }

    typeText();
  }

  // Hero reveal
  const heroSections = document.querySelectorAll(".hero-section");

  const revealOnScroll = () => {
    heroSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        section.classList.add("show");
      }
    });
  };

  revealOnScroll();
  window.addEventListener("scroll", revealOnScroll);

  // Careers slider dots
  const slider = document.getElementById("careersOfferSlider");

  if (slider) {
    const track = slider.querySelector(".reusable-card-slider-track");
    const dots = slider.querySelectorAll(".reusable-slider-dot");
    const slides = slider.querySelectorAll(".reusable-card-slide");

    if (track && dots.length && slides.length) {
      let currentSlide = 0;

      function updateSlider(index) {
        currentSlide = index;
        const slideWidth = slides[0].offsetWidth;
        track.scrollTo({
          left: slideWidth * index,
          behavior: "smooth"
        });

        dots.forEach((dot) => dot.classList.remove("active"));
        dots[index]?.classList.add("active");
      }

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          updateSlider(parseInt(dot.dataset.slide, 10));
        });
      });

      track.addEventListener("scroll", () => {
        const slideWidth = slides[0].offsetWidth;
        if (!slideWidth) return;
        const index = Math.round(track.scrollLeft / slideWidth);

        if (index !== currentSlide) {
          currentSlide = index;
          dots.forEach((dot) => dot.classList.remove("active"));
          dots[index]?.classList.add("active");
        }
      });
    }
  }
});
