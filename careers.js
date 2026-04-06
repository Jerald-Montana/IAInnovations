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
  document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll('.career-process-step');

  // Ensure the very first circle is lit up blue by default
  if(steps.length > 0) steps[0].classList.add('active-node');

  steps.forEach((step, index) => {
    // Triggers the cascading animation on hover or tap
    step.addEventListener('mouseenter', () => animateArrows(index));
    step.addEventListener('click', () => animateArrows(index));
  });

  function animateArrows(targetIndex) {
    // First, instantly clear all colors back to default grey
    steps.forEach(s => {
      s.classList.remove('active-node');
      s.classList.remove('active-arrow');
    });

    // Loop through and sequentially light up the arrows
    steps.forEach((s, i) => {
      
      // Light up the circles up to the target step
      if (i <= targetIndex) {
        s.classList.add('active-node');
      }

      // Add a cascading delay to the arrows so they "travel"
      if (i < targetIndex) {
        setTimeout(() => {
          s.classList.add('active-arrow');
        }, i * 150); // 150ms delay creates the ~0.5s effect when traveling to step 4
      }
    });
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

    document.addEventListener("DOMContentLoaded", function () {
      const journey = document.querySelector("#animated-hiring-journey");
      if (!journey) return;

      const visual = journey.querySelector(".career-process-visual");
      const steps = Array.from(journey.querySelectorAll(".career-process-step"));
      const svg = journey.querySelector(".career-process-svg");
      if (!visual || !svg || steps.length < 4) return;

      const basePaths = [
        svg.querySelector(".career-arch-base.arch-1"),
        svg.querySelector(".career-arch-base.arch-2"),
        svg.querySelector(".career-arch-base.arch-3")
      ];

      const activePaths = [
        svg.querySelector(".career-arch-glow.arch-1"),
        svg.querySelector(".career-arch-glow.arch-2"),
        svg.querySelector(".career-arch-glow.arch-3")
      ];

      function getStepAnchor(step) {
        const visualRect = visual.getBoundingClientRect();
        const numberRect = step.querySelector(".career-step-number").getBoundingClientRect();

        return {
          x: numberRect.left - visualRect.left + numberRect.width / 2,
          y: numberRect.top - visualRect.top + numberRect.height / 2 - 8
        };
      }

      function buildArchPath(start, end, lift) {
        const distance = end.x - start.x;
        const curveLift = Math.max(52, Math.min(120, Math.abs(distance) * 0.22 + lift * 0.18));
        const cp1x = start.x + distance * 0.28;
        const cp2x = start.x + distance * 0.72;
        const cpY = Math.min(start.y, end.y) - curveLift;

        return `M ${start.x} ${start.y} C ${cp1x} ${cpY}, ${cp2x} ${cpY}, ${end.x} ${end.y}`;
      }

      function drawPaths() {
        if (window.innerWidth <= 1100) return;

        const points = steps.map(getStepAnchor);

        for (let i = 0; i < 3; i++) {
          const pathData = buildArchPath(points[i], points[i + 1], 92 + i * 10);
          basePaths[i].setAttribute("d", pathData);
          activePaths[i].setAttribute("d", pathData);
        }
      }

      function setActiveStep(stepNumber) {
        steps.forEach((step, index) => {
          const current = index + 1;
          step.classList.toggle("is-active", current === stepNumber);
          step.classList.toggle("is-complete", current < stepNumber);
        });

        activePaths.forEach((path, index) => {
          path.classList.toggle("is-visible", index < stepNumber - 1);
        });
      }

      steps.forEach((step, index) => {
        const stepNumber = index + 1;

        step.addEventListener("mouseenter", () => setActiveStep(stepNumber));
        step.addEventListener("focus", () => setActiveStep(stepNumber));
        step.addEventListener("click", () => setActiveStep(stepNumber));
      });

      journey.addEventListener("mouseleave", () => setActiveStep(1));

      journey.addEventListener("focusout", (event) => {
        if (!journey.contains(event.relatedTarget)) {
          setActiveStep(1);
        }
      });

      let resizeTimer;
      function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          drawPaths();
          setActiveStep(1);
        }, 120);
      }

      window.addEventListener("resize", handleResize);

      drawPaths();
      setActiveStep(1);
    });
  
