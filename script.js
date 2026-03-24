const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const dropdownLinks = document.querySelectorAll(".dropdown > a");
const allNavLinks = document.querySelectorAll(".nav-menu a");
const sections = document.querySelectorAll(".hero-section");

/* =========================
   TOGGLE MOBILE MENU
   ========================= */
if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("active");

    const isExpanded = hamburger.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  });

  hamburger.addEventListener("keypress", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      hamburger.click();
    }
  });
}

/* =========================
   MOBILE DROPDOWN TOGGLE
   ========================= */
dropdownLinks.forEach((item) => {
  item.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();

      const parent = item.parentElement;

      document.querySelectorAll(".dropdown").forEach((dropdown) => {
        if (dropdown !== parent) {
          dropdown.classList.remove("active");
        }
      });

      parent.classList.toggle("active");
    }
  });
});

/* =========================
   CLOSE MOBILE MENU WHEN LINK IS CLICKED
   ========================= */
allNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (
      window.innerWidth <= 768 &&
      !link.parentElement.classList.contains("dropdown")
    ) {
      navMenu.classList.remove("active");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");

      document.querySelectorAll(".dropdown").forEach((dropdown) => {
        dropdown.classList.remove("active");
      });
    }
  });
});

/* =========================
   TYPING EFFECT
   ========================= */
function typeParagraph(paragraph, speed = 16) {
  if (!paragraph || paragraph.dataset.typed === "true") return;

  const fullText = paragraph.dataset.text || paragraph.textContent.trim();
  const section = paragraph.closest(".hero-section");
  const button = section ? section.querySelector(".reveal-btn") : null;

  paragraph.textContent = "";
  paragraph.classList.add("is-typing");
  paragraph.dataset.typed = "true";

  let i = 0;

  function type() {
    if (i < fullText.length) {
      paragraph.textContent += fullText.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      paragraph.classList.remove("is-typing");

      if (paragraph.classList.contains("accent-after")) {
        paragraph.classList.add("finished");
      }

      if (button) {
        setTimeout(() => {
          button.classList.add("show-btn");
        }, 500);
      }
    }
  }

  type();
}

/* =========================
   HERO SECTION ANIMATION + TYPING
   ========================= */
if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");

          const paragraph = entry.target.querySelector(".typing-text");
          typeParagraph(paragraph, 16);
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* =========================
   TYPE FIRST SECTION ON LOAD IF VISIBLE
   ========================= */
window.addEventListener("load", () => {
  const firstSection = document.querySelector(".hero-section");
  if (!firstSection) return;

  const rect = firstSection.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    firstSection.classList.add("show");
    const paragraph = firstSection.querySelector(".typing-text");
    typeParagraph(paragraph, 16);
  }
});

/* =========================
   RESET MENU ON RESIZE
   ========================= */
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    if (navMenu) navMenu.classList.remove("active");
    if (hamburger) {
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  }
});

/* =========================
   MAP / IMAGE TOGGLE
   ========================= */
const mapToggleBox = document.getElementById("mapToggleBox");
const liveMap = document.getElementById("liveMap");
const mapImage = document.getElementById("mapImage");

if (mapToggleBox && liveMap && mapImage) {
  mapToggleBox.addEventListener("dblclick", () => {
    liveMap.classList.toggle("active-view");
    mapImage.classList.toggle("active-view");
  });
}

/* =========================
   CONTACT FORM SUCCESS POPUP
   Works when redirected with ?submitted=1
   ========================= */
const successPopup = document.getElementById("successPopup");
const closeSuccessPopup = document.getElementById("closeSuccessPopup");

if (successPopup) {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("submitted") === "1") {
    successPopup.classList.add("show");
  }

  if (closeSuccessPopup) {
    closeSuccessPopup.addEventListener("click", () => {
      successPopup.classList.remove("show");

      const url = new URL(window.location);
      url.searchParams.delete("submitted");
      window.history.replaceState({}, document.title, url.pathname);
    });
  }

  successPopup.addEventListener("click", (e) => {
    if (e.target === successPopup) {
      successPopup.classList.remove("show");

      const url = new URL(window.location);
      url.searchParams.delete("submitted");
      window.history.replaceState({}, document.title, url.pathname);
    }
  });
}