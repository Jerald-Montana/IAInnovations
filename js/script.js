/* =========================
   GLOBAL VARIABLES
   ========================= */
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const dropdownLinks = document.querySelectorAll(".dropdown > a");
const allNavLinks = document.querySelectorAll(".nav-menu a");
const sections = document.querySelectorAll(".hero-section");

function normalizePath(pathname) {
  if (!pathname) return "/";

  const normalized = pathname.replace(/\\/g, "/").replace(/\/+/g, "/").toLowerCase();
  return normalized.endsWith("/") && normalized.length > 1
    ? normalized.slice(0, -1)
    : normalized;
}

function applyCurrentNavigationState() {
  const currentUrl = new URL(window.location.href);
  const currentPath = normalizePath(currentUrl.pathname);
  const currentHash = currentUrl.hash.toLowerCase();

  document.querySelectorAll(".nav-menu a, .topbar-menu a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#" || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    let targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch (error) {
      return;
    }

    const targetPath = normalizePath(targetUrl.pathname);
    const targetHash = targetUrl.hash.toLowerCase();
    const isCurrentPage = targetPath === currentPath && (!targetHash || targetHash === currentHash);

    if (isCurrentPage) {
      link.classList.add("is-current");
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll(".nav-menu .dropdown").forEach((dropdown) => {
    const trigger = dropdown.querySelector(":scope > a");
    const activeChild = dropdown.querySelector(".dropdown-menu a.is-current");

    if (trigger && activeChild) {
      trigger.classList.add("is-current-section");
      trigger.setAttribute("aria-current", "page");
    }
  });
}

applyCurrentNavigationState();

function releaseDocumentScrollLock() {
  document.documentElement.style.overflow = "";
  document.documentElement.style.overflowY = "";
  document.body.style.overflow = "";
  document.body.style.overflowY = "";
}

releaseDocumentScrollLock();

/* =========================
   TOGGLE MOBILE MENU
   ========================= */
if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("active");

    const isExpanded = hamburger.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isExpanded ? "true" : "false");

    if (!isExpanded) {
      releaseDocumentScrollLock();
    }
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
      releaseDocumentScrollLock();

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

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  paragraph.textContent = "";
  paragraph.classList.add("is-typing");
  paragraph.dataset.typed = "true";

  if (reducedMotion) {
    paragraph.textContent = fullText;
    paragraph.classList.remove("is-typing");
    return;
  }

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
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px"
    }
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
  releaseDocumentScrollLock();

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
const toggleViewBtn = document.getElementById("toggleViewBtn");
const liveMap = document.getElementById("liveMap");
const mapImage = document.getElementById("mapImage");

if (toggleViewBtn && liveMap && mapImage) {
  toggleViewBtn.addEventListener("click", () => {
    liveMap.classList.toggle("active-view");
    mapImage.classList.toggle("active-view");
  });
}

/* =========================
   AUTO-SCROLL ON PAGE LOAD
   ========================= */
window.addEventListener("load", () => {
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1); 
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);
    }
  }
});

/* =========================
   BULLETPROOF CONTACT FORM (Hidden Iframe Method)
   ========================= */
/* =========================
   BULLETPROOF CONTACT FORM (Hidden Iframe Method)
   ========================= */
// document.addEventListener("DOMContentLoaded", () => {
//   const contactForm = document.getElementById("ajaxContactForm");
//   const successPopup = document.getElementById("successPopup");
//   const closeSuccessPopup = document.getElementById("closeSuccessPopup");
//   const hiddenIframe = document.getElementById("hidden_iframe");
//   const messageTextarea = document.querySelector('textarea[name="message"]');

//   let isSubmitting = false;

//   // Custom Form Validation
//   if (messageTextarea) {
//     messageTextarea.addEventListener('invalid', (e) => {
//       if (e.target.validity.tooShort) {
//         e.target.setCustomValidity('Please provide a more detailed message (minimum 20 characters).');
//       }
//     });
//     messageTextarea.addEventListener('input', (e) => {
//       e.target.setCustomValidity('');
//     });
//   }

//   // Ensure popup is hidden on load
//   if (successPopup) successPopup.style.display = "none";

//   if (contactForm && hiddenIframe) {
//     // When the user clicks Send
//     contactForm.addEventListener("submit", function() {
//       isSubmitting = true;
//       const submitBtn = this.querySelector(".contact-btn");
//       submitBtn.innerText = "Sending..."; 
//     });

//     // When the invisible iframe catches that weird JSON text
//     hiddenIframe.addEventListener("load", function() {
//       if (isSubmitting) {
//         // Show the beautiful popup!
//         if (successPopup) successPopup.style.display = "flex";
        
//         // Reset the form and button
//         contactForm.reset();
//         const submitBtn = contactForm.querySelector(".contact-btn");
//         if (submitBtn) submitBtn.innerText = "Send Message";
        
//         isSubmitting = false; // Reset the flag
//       }
//     });
//   }

//   // Handle Closing the Popup
//   if (closeSuccessPopup && successPopup) {
//     closeSuccessPopup.addEventListener("click", () => {
//       successPopup.style.display = "none";
//     });

//     successPopup.addEventListener("click", (e) => {
//       if (e.target === successPopup) {
//         successPopup.style.display = "none";
//       }
//     });
//   }
// });
/* =========================
   REUSABLE CARD SLIDER (Bulletproof Swipe & Drag)
   ========================= */
document.addEventListener("DOMContentLoaded", function () {
  const sliders = document.querySelectorAll(".reusable-card-slider");

  sliders.forEach((slider) => {
    const track = slider.querySelector(".reusable-card-slider-track");
    const dotsContainer = slider.querySelector(".reusable-card-slider-dots");
    
    if (!track || !dotsContainer) return;

    // Find the actual cards (ignores accidental wrappers)
    const cards = track.querySelectorAll("article, .career-card, .service-card, .contact-card");
    if (cards.length === 0) return;

    const firstCard = cards[0];

    // 1. Create Dots Dynamically based on total cards
    let dots = Array.from(dotsContainer.querySelectorAll(".reusable-slider-dot"));
    if (dots.length === 0) {
      const totalDots = cards.length > 1 ? cards.length - 1 : 1; 
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("button");
        dot.classList.add("reusable-slider-dot");
        if (i === 0) dot.classList.add("active");
        dotsContainer.appendChild(dot);
      }
      dots = Array.from(dotsContainer.querySelectorAll(".reusable-slider-dot"));
    }

    // Helper function to safely calculate swipe distance
    function getScrollStep() {
      const gap = parseInt(window.getComputedStyle(track).gap) || 24;
      return firstCard.offsetWidth + gap;
    }

    // 2. Click Dots to Scroll
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        track.scrollTo({
          left: getScrollStep() * index,
          behavior: 'smooth'
        });
      });
    });

    // 3. Highlight Correct Dot on Native Swipe/Scroll
    track.addEventListener("scroll", () => {
      let currentIndex = Math.round(track.scrollLeft / getScrollStep());
      currentIndex = Math.max(0, Math.min(currentIndex, dots.length - 1));

      dots.forEach((dot) => dot.classList.remove("active"));
      if (dots[currentIndex]) {
        dots[currentIndex].classList.add("active");
      }
    });

    // 4. MOUSE DRAG TO SCROLL (For Desktop Users)
    let isDown = false;
    let startX;
    let scrollLeft;

    track.style.cursor = 'grab';

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.style.cursor = 'grabbing';
      track.style.scrollSnapType = 'none'; // Disable snap while dragging
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.style.cursor = 'grab';
      track.style.scrollSnapType = 'x mandatory'; 
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.style.cursor = 'grab';
      track.style.scrollSnapType = 'x mandatory'; 
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault(); 
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5; // Drag speed multiplier
      track.scrollLeft = scrollLeft - walk;
    });
  });
});

/* =========================
   GLOBAL SEARCH SCRIPT
   ========================= */
const allServices = [
  { category: "App Development", title: "Architecture and Design", description: "Create the composite architecture of your application to be scalable, reliable, available and manageable.", overlay: "Build scalable, reliable, and manageable application frameworks.", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/AppDevelopment.html", deepContent: "mobile app smartphone applications development customized business needs marketing technology" },
  { category: "App Development", title: "Production and Development", description: "Carefully plan the production and development stage of your application by starting with the basics, and building from the ground up.", overlay: "Carefully planned development from the ground up.", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/AppDevelopment.html", deepContent: "mobile app smartphone applications development customized business needs marketing technology" },
  { category: "App Development", title: "Integration", description: "Use the appropriate set of tools for building your software application and integrate to one or more APIs.", overlay: "Seamlessly connect software applications and APIs.", image: "https://www.deazy.com/hubfs/Cover%20Image-Apr-26-2024-03-13-32-9329-PM.jpg", link: "/IAInnovations/html/BusinessTransformation/AppDevelopment.html", deepContent: "mobile app smartphone applications development api integration" },
  { category: "App Development", title: "Deployment and Distribution", description: "Distribute your app while monitoring any changes to new platforms, operating systems, and browsers and assess encountered problems.", overlay: "Launch across platforms while monitoring performance.", image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/AppDevelopment.html", deepContent: "mobile app smartphone applications launch go live store platforms" },

  { category: "Corporate Performance Management", title: "Budget and Forecasting", description: "Lay out a financial plan for your business, and figure out where you want it to go.", overlay: "Plan ahead with structured financial roadmaps and measurable business goals.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics predictive analytics financial finances money" },
  { category: "Corporate Performance Management", title: "Financial Consolidations", description: "Combine financial data from several departments and entities within your organization.", overlay: "Bring multiple departments and entities together into one reliable reporting structure.", image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics predictive analytics financial finances money" },
  { category: "Corporate Performance Management", title: "Financial Reporting and Analytics Migrations", description: "Speed up the creation of reports and present your data in an easier-to-read executive dashboard.", overlay: "Accelerate reporting and make dashboards easier to understand.", image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics predictive analytics financial finances money" },
  { category: "Corporate Performance Management", title: "Predictive Analytics", description: "Extract information from your existing data sets and determine the patterns, to predict future outcomes.", overlay: "Discover patterns in existing data to anticipate future outcomes.", image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics predictive analytics algorithms scores trends" },
  { category: "Corporate Performance Management", title: "Data Integration, Management, and Quality", description: "Improve your firm’s productivity and grow the intelligence of your business with next-generation data integration.", overlay: "Connect, clean, and manage data so the business can move faster.", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics predictive analytics streamline quality" },
  { category: "Corporate Performance Management", title: "Profitability and Analysis", description: "Use proven calculations and formulas to provide a comprehensive measure of your company’s profitability.", overlay: "Measure performance clearly with meaningful profitability insights.", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics predictive analytics revenue cost tracking" },
  { category: "Corporate Performance Management", title: "Management Reporting and Compliance", description: "Synchronize your information and activity across governance, risk management and compliance.", overlay: "Improve visibility and coordination across governance, risk, and compliance.", image: "https://images.unsplash.com/photo-1554224155-cfa08c2a758f?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics rules regulations audit" },
  { category: "Corporate Performance Management", title: "Training and Education", description: "Come up with relevant, actionable, and flexible solutions to optimize individual, team, and organizational performance.", overlay: "Develop people and teams with practical, flexible learning.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80", link: "/IAInnovations/html/BusinessTransformation/CorporatePerformance.html", deepContent: "quantitative data performance metrics teaching staff courses" },

  { category: "Enterprise Data", title: "Information Management", description: "Manage the cycle of your organizational activities by acquiring the relevant information from different sources.", overlay: "Acquire and distribute relevant organizational information.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions customer success repositories assets" },
  { category: "Enterprise Data", title: "Strategy Assessments", description: "Comprehensively review your company’s operations and provide management with a brief assessment of corporate performance.", overlay: "Formulate and implement future growth strategies.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions customer success repositories assets" },
  { category: "Enterprise Data", title: "Advisory Services", description: "Innovate your business management services through practical experience with strong follow-through and management skills.", overlay: "Innovate management with strong follow-through skills.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions consultation advice" },
  { category: "Enterprise Data", title: "Strategic Staffing", description: "Develop an effective staffing strategy by researching employment trends, workforce data, and using current employment data.", overlay: "Research employment trends for staffing models.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions HR hiring recruitment employees" },
  { category: "Enterprise Data", title: "Solution Accelerators", description: "Customize and deploy solution accelerators with the proper tools and methodology that guarantees substantial reduction in time and cost.", overlay: "Guarantee substantial reduction in time and cost.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions rapid fast delivery deployment" },
  { category: "Enterprise Data", title: "Customer Enterprise Information Solutions", description: "Find solutions for optimal utilization of information within your organization to support decision-making processes.", overlay: "Support decision-making and day-to-day operations.", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions CRM tracking" },
  { category: "Enterprise Data", title: "Proof of Value", description: "Ensure early and absolute clarity around the business value of a proposed solution concept.", overlay: "Improve the speed and effectiveness of decision making.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions testing ROI demonstration" },
  { category: "Enterprise Data", title: "Reporting and Scorecard Applications", description: "Present the progress of your entities, such as your enterprise, employees, or business units, graphically over time.", overlay: "Monitor progress of your organizational goals.", image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseData.html", deepContent: "big data business intelligence analytical solutions charts graphs visual KPIs" },

  { category: "Enterprise Resource Planning (ERP)", title: "Strategic Assessments (ERP)", description: "Enterprise Resource Planning, Supply Chain Management, Customer Relationship Management, Business Intelligence.", overlay: "Align your ERP with your long-term business goals.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseResource.html", deepContent: "enterprise resource planning automate transform integrated suite SCM CRM" },
  { category: "Enterprise Resource Planning (ERP)", title: "Implementations and Upgrades", description: "Roadmap Assessments, Tax Technology Integrations, Application Upgrades, Technology Upgrades, Accelerate Implementations.", overlay: "Seamless transitions and powerful technology upgrades.", image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseResource.html", deepContent: "enterprise resource planning automate transform integrated suite installation software" },
  { category: "Enterprise Resource Planning (ERP)", title: "Custom Development (ERP)", description: "Integration with 3rd Party Applications, Application Extensions, Reporting Assessments, Portal Development.", overlay: "Tailored application extensions and portal development.", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseResource.html", deepContent: "enterprise resource planning automate transform integrated suite programming coding" },
  { category: "Enterprise Resource Planning (ERP)", title: "Ongoing Support (ERP)", description: "Application, Database Support, Backup & Recovery, Tuning & Security, End User Training, Onsite and Offsite full-time support.", overlay: "Reliable database support and end user training.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/EnterpriseResource.html", deepContent: "enterprise resource planning automate transform integrated suite help desk maintenance IT support" },

  { category: "Integration API", title: "Readiness Assessment (API)", description: "Create a set of actionable tasks to get the SOA process and project(s) on track to ensure proper ROI.", overlay: "Evaluate and optimize your SOA processes.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/IntegrationApi.html", deepContent: "integration api consulting flexible architectures SOA BPM EDA CEP MDM EAI" },
  { category: "Integration API", title: "Architecture Roadmap (API)", description: "Develop a Strategic Services Blueprint to specify the future state of the reusable services catalog.", overlay: "Design the future state of your service catalog.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/IntegrationApi.html", deepContent: "integration api consulting flexible architectures SOA BPM EDA CEP MDM EAI blueprint plan" },
  { category: "Integration API", title: "Service Architecture Training", description: "Develop a baseline agenda and suggested training modules for the roles within your organization.", overlay: "Empower your team with advanced technical training.", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/IntegrationApi.html", deepContent: "integration api consulting flexible architectures SOA BPM EDA CEP MDM EAI courses teaching" },
  { category: "Integration API", title: "Reusable Utility Services", description: "Ensure that all transactions are monitored and traced, and any errors are immediately notified and resolved.", overlay: "Monitor transactions and resolve errors seamlessly.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/IntegrationApi.html", deepContent: "integration api consulting flexible architectures SOA BPM EDA CEP MDM EAI backend functions" },

  { category: "Digital Experience", title: "Strategy and Online Marketing", description: "Understand the desired goals and come up with an effective core site strategy.", overlay: "Strategy and Online Marketing", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#ecommerce-section", deepContent: "e-commerce online retail products services sales shopping cart internet retailers B2B B2C" },
  { category: "Digital Experience", title: "Branding and Customer Engagement", description: "Create and develop brands that appeal to both the head and hearts of your target customers.", overlay: "Branding and Customer Engagement", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#ecommerce-section", deepContent: "e-commerce online retail products services sales shopping cart identity logo" },
  { category: "Digital Experience", title: "E-commerce Development", description: "Develop, customize, integrate, test, and maintain high volume transaction-oriented websites.", overlay: "E-commerce Development", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#ecommerce-section", deepContent: "e-commerce online retail products services sales shopping cart web design" },
  { category: "Digital Experience", title: "Hosting and Support Services", description: "Find the perfect web hosting with full support and website uptime, delivered by experienced engineers.", overlay: "Hosting and Support Services", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#ecommerce-section", deepContent: "e-commerce online retail products services servers uptime maintenance" },
  { category: "Digital Experience", title: "Email and SMS Marketing", description: "Deliver exceptional and personalized experiences for customers across different channels such as SMS, email, and more.", overlay: "Email and SMS Marketing", image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#digital-marketing-section", deepContent: "digital marketing traffic campaigns visibility conversions" },
  { category: "Digital Experience", title: "Search Engine Optimization", description: "Optimize your digital presence across search engines by improving the structure of your websites.", overlay: "Search Engine Optimization", image: "https://cdn-ilekhfa.nitrocdn.com/HTxMSNKPyObQjhXmkVOVTTHJxLEHwOVV/assets/images/optimized/rev-8c79f73/www.intellibright.com/wp-content/uploads/2025/04/Search-Engine-Optimization.jpg", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#digital-marketing-section", deepContent: "digital marketing traffic seo campaigns visibility conversions google ranking" },
  { category: "Digital Experience", title: "Digital Analytics", description: "Gain relevant customer information and insight to understand further your customers, and in turn improve their experience.", overlay: "Digital Analytics", image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#digital-marketing-section", deepContent: "digital marketing traffic seo campaigns visibility metrics tracking" },
  { category: "Digital Experience", title: "Behavior-based Marketing", description: "Use customer data and individual behaviors, collected from a variety sources, to make your marketing more personalized and engaging.", overlay: "Behavior-based Marketing", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#digital-marketing-section", deepContent: "digital marketing traffic seo campaigns visibility targeting" },
  { category: "Digital Experience", title: "Knowledge Processes", description: "Structure a facilitated dialog to extract and exchange knowledge between individuals and teams.", overlay: "Knowledge Processes", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#knowledge-management-section", deepContent: "knowledge management centralized repository wiki portals intranet" },
  { category: "Digital Experience", title: "Knowledge Roles", description: "Organize and categorize each knowledge management roles to better manage the system and come up with effective results.", overlay: "Knowledge Roles", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#knowledge-management-section", deepContent: "knowledge management centralized repository wiki portals intranet staff" },
  { category: "Digital Experience", title: "Knowledge Technology", description: "Enable effective knowledge management through applicable technology, such as search, wiki, portals, and virtual conferences.", overlay: "Knowledge Technology", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#knowledge-management-section", deepContent: "knowledge management centralized repository wiki portals intranet software" },
  { category: "Digital Experience", title: "Knowledge Governance", description: "Governance is an important component of Knowledge Management framework, to assure its usability.", overlay: "Knowledge Governance", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/DigitalExperience.html#knowledge-management-section", deepContent: "knowledge management centralized repository wiki portals intranet compliance rules" },

  { category: "Mobile & Web Solutions", title: "Strategy and Planning (Mobile)", description: "Analyze your goals by carefully planning the implementation of your mobile solutions to ensure its effectiveness.", overlay: "Strategy and Planning", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#mobile-experience-section", deepContent: "mobile web solutions smartphones tablets iphone android" },
  { category: "Mobile & Web Solutions", title: "Experience Design", description: "Create a memorable and inspiring experience for your users through wireframes, user profiling, and visual design.", overlay: "Experience Design", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#mobile-experience-section", deepContent: "mobile web solutions smartphones tablets iphone android UI UX design" },
  { category: "Mobile & Web Solutions", title: "Quality and Testing", description: "Ensure the quality of your mobile applications with proper testing methodology.", overlay: "Quality and Testing", image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#mobile-experience-section", deepContent: "mobile web solutions smartphones tablets iphone android testing QA" },
  { category: "Mobile & Web Solutions", title: "Custom Development", description: "Develop your custom mobile solutions in HTML5 or with native apps for iPhone, Android, Blackberry or Windows.", overlay: "Custom Development", image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#mobile-experience-section", deepContent: "mobile web solutions smartphones tablets iphone android coding app builder" },
  { category: "Mobile & Web Solutions", title: "Wireless Solutions", description: "We provide wireless value-added solutions through robust applications and mobile sites we build and deploy.", overlay: "Wireless Solutions", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#mobile-experience-section", deepContent: "mobile web solutions smartphones tablets iphone android wireless networking" },
  { category: "Mobile & Web Solutions", title: "Mobile Enterprise Platforms", description: "Mobile platforms can be the right choice for enterprises looking to support multiple devices or integrate existing systems.", overlay: "Mobile Enterprise Platforms", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#mobile-experience-section", deepContent: "mobile web solutions smartphones tablets iphone android enterprise systems" },
  { category: "Mobile & Web Solutions", title: "Full Lifecycle (Portals)", description: "Enable a comprehensive methodology to successfully launch portal and social sites with full lifecycle portal, collaboration, and social projects.", overlay: "Full Lifecycle", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#web-portal-section", deepContent: "web portal gateway intranet extranet platforms" },
  { category: "Mobile & Web Solutions", title: "Readiness and Planning (Portals)", description: "Avoid encountering difficulties when implementing portals by making sure you are ready to start your portal project.", overlay: "Readiness and Planning", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#web-portal-section", deepContent: "web portal gateway intranet extranet platforms planning" },
  { category: "Mobile & Web Solutions", title: "Strategy (Portals)", description: "Walk through all aspects of your enterprise portal and define the standards and approach for each aspect of your portal project.", overlay: "Strategy", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#web-portal-section", deepContent: "web portal gateway intranet extranet platforms strategy" },
  { category: "Mobile & Web Solutions", title: "Value and ROI (Portals)", description: "Foresee many different types of portal implementations and correctly identify real value among the many possibilities.", overlay: "Value and ROI", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#web-portal-section", deepContent: "web portal gateway intranet extranet platforms ROI business value" },
  { category: "Mobile & Web Solutions", title: "Records Management", description: "Reduce the time it takes to manage and update records manually, while keeping records secure through state-of-the-art encryption.", overlay: "Records Management", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#document-management-section", deepContent: "document management workflow automate files folders encryption paperless" },
  { category: "Mobile & Web Solutions", title: "Dynamic Linking", description: "Update your documents and records once by dynamically linking the existing common applications, and reduce duplicate work and double entries.", overlay: "Dynamic Linking", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#document-management-section", deepContent: "document management workflow automate files folders encryption paperless linking" },
  { category: "Mobile & Web Solutions", title: "Lite Workflow", description: "Allow simple document routing and workflows, based around the document receipt or completion, through the simple workflow tool interface.", overlay: "Lite Workflow", image: "https://images.unsplash.com/photo-1503945438517-f65904a52ce6?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#document-management-section", deepContent: "document management workflow automate files folders encryption paperless routing" },
  { category: "Mobile & Web Solutions", title: "Scalable Solution", description: "Prepare to scale with additional overhead for the next major growth in your business, with an agile document management system.", overlay: "Scalable Solution", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#document-management-section", deepContent: "document management workflow automate files folders encryption paperless growth" },
  { category: "Mobile & Web Solutions", title: "Information Access", description: "Easy information access translates to reduced time spent on searching for, recreating, and moving documents and thereby increasing productivity.", overlay: "Information Access", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#document-management-section", deepContent: "document management workflow automate files folders encryption paperless access" },
  { category: "Mobile & Web Solutions", title: "Process Control", description: "Watch and measure your business processes in real time as you discover flaws, bottlenecks, or other aspects that needs to be addressed.", overlay: "Process Control", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/DigitalExperience/MobileExperience.html#document-management-section", deepContent: "document management workflow automate files folders encryption paperless bottlenecks" },

  { category: "Industry Solutions", title: "Technology Solutions (Financial)", description: "Align your technology investments to your strategic business plan instead of simply implementing technology for the sake of keeping up with the market.", overlay: "Align technology investments to strategic plans.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#financial-services-section", deepContent: "financial services banks investment enterprise modernization digital transformation" },
  { category: "Industry Solutions", title: "Business Process Improvement", description: "Create a strategic planning methodology aimed at identifying the operations or employee skills that could be improved to encourage business efficiency.", overlay: "Create a strategic planning methodology.", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#financial-services-section", deepContent: "financial services banks investment enterprise modernization digital transformation" },
  { category: "Industry Solutions", title: "Program Cost Management", description: "Monitor your costs, and track and manage your project performance by implementing a successful, sustainable cost management program.", overlay: "Monitor your costs and track performance.", image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#financial-services-section", deepContent: "financial services banks investment enterprise modernization digital transformation" },
  { category: "Industry Solutions", title: "Client Centricity", description: "Re-define your approach in doing your business so that it focuses on your customers, to ensure that your clients are the center of your business operations.", overlay: "Focus on customers and business operations.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#financial-services-section", deepContent: "financial services banks investment enterprise modernization digital transformation" },
  { category: "Industry Solutions", title: "Risk and Regulatory Compliance (Financial)", description: "Manage reputational, regulatory, compliance, and enforcement risks in the global and domestic perspective.", overlay: "Manage reputational, regulatory, compliance, and enforcement risks.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#financial-services-section", deepContent: "financial services banks investment enterprise modernization digital transformation" },
  { category: "Industry Solutions", title: "Quality Management", description: "Oversee all activities and tasks needed to maintain a desired level of excellent, by creating and implementing quality planning and assurance.", overlay: "Oversee all activities and tasks for quality assurance.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#financial-services-section", deepContent: "financial services banks investment enterprise modernization digital transformation" },
  { category: "Industry Solutions", title: "Risk and Regulation (Consumer Markets)", description: "Navigate risk and regulatory complexity that will fundamentally impact the business and finances of your institution.", overlay: "Navigate risk and regulatory complexity.", image: "https://cdn.corporatefinanceinstitute.com/assets/business-risk.jpg", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#consumer-markets-section", deepContent: "consumer markets retail changing dynamics new business models regulatory reform" },
  { category: "Industry Solutions", title: "Investment Balance and Costing", description: "Focus on balancing investment against cost reduction, and overview your existing resources to pursue internal cost reduction.", overlay: "Balance investment against cost reduction.", image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#consumer-markets-section", deepContent: "consumer markets retail changing dynamics new business models regulatory reform" },
  { category: "Industry Solutions", title: "Business Agility", description: "Respond to rapid market changes by enhancing business agility along with finding new and improved ways to do business.", overlay: "Respond to rapid market changes with agility.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#consumer-markets-section", deepContent: "consumer markets retail changing dynamics new business models regulatory reform" },
  { category: "Industry Solutions", title: "Market Time and Quality", description: "Improve time-to-market and quality outcomes and build momentum through positive outcomes and generating process innovations.", overlay: "Improve time-to-market and quality outcomes.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#consumer-markets-section", deepContent: "consumer markets retail changing dynamics new business models regulatory reform" },
  { category: "Industry Solutions", title: "Technology Implementation (Consumer Markets)", description: "Leverage the latest and most applicable technology and enable process innovation as a key advantage against your competitors.", overlay: "Leverage the latest and most applicable technology.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#consumer-markets-section", deepContent: "consumer markets retail changing dynamics new business models regulatory reform" },
  { category: "Industry Solutions", title: "Customer Relationship Management (Public Sector)", description: "Deliver quality and value in your services to establish close partnerships with clients for long-term success.", overlay: "Establish close partnerships with clients for long-term success.", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes CRM" },
  { category: "Industry Solutions", title: "Enterprise Portals (Public Sector)", description: "Create and deliver engaging, useful, usable, and interactive web experiences for your users.", overlay: "Create and deliver engaging web experiences.", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes web portal" },
  { category: "Industry Solutions", title: "Master Data Management (Public Sector)", description: "Use advanced tools in the comprehensive management of your organization’s business information assets.", overlay: "Comprehensive management of business information assets.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes MDM" },
  { category: "Industry Solutions", title: "Enterprise Content Management (Public Sector)", description: "Manage content across your organization and deliver digital information anytime, anywhere, on any medium.", overlay: "Manage content across your organization and deliver digital information.", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes ECM" },
  { category: "Industry Solutions", title: "Business Intelligence (Public Sector)", description: "Build and deliver robust platforms comprised of cutting-edge data exploration, visualization, and analytics capabilities.", overlay: "Build robust platforms with cutting-edge analytics capabilities.", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes BI intelligence" },
  { category: "Industry Solutions", title: "Commerce (Public Sector)", description: "Rapidly connect your internal systems, allowing you to provide critical functionality and data to your customers.", overlay: "Connect internal systems to provide critical functionality.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes commerce" },
  { category: "Industry Solutions", title: "Mobile Technology (Public Sector)", description: "Use mobile technology to transform the way your organization enable workforce, satisfy clients, and extend offers.", overlay: "Transform organizations with mobile technology.", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes mobile smartphones" },
  { category: "Industry Solutions", title: "Experience and Design (Public Sector)", description: "Transform the way you do your business by improving your website usability design, digital strategy, and mobile web design.", overlay: "Improve website usability design and digital strategy.", image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#public-sector-section", deepContent: "public sector government state local cost reduction revenue generation taxes UX UI design" },
  { category: "Industry Solutions", title: "Customer Experience (General Business)", description: "Cultivate and enhance the way your business interacts with its demanding consumer base to drive satisfaction.", overlay: "Enhance business interactions to drive customer satisfaction.", image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#general-business-section", deepContent: "general business optimization industry innovator regulatory compliance market share" },
  { category: "Industry Solutions", title: "Market Share Growth", description: "Develop tailored strategies and optimization solutions designed to help your enterprise expand its presence.", overlay: "Develop tailored strategies to expand your enterprise's presence.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#general-business-section", deepContent: "general business optimization industry innovator regulatory compliance market share" },
  { category: "Industry Solutions", title: "Regulatory Compliance (General Business)", description: "Stand out as a true industry innovator by ensuring strict regulatory compliance and procedural excellence.", overlay: "Ensure strict regulatory compliance and procedural excellence.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#general-business-section", deepContent: "general business optimization industry innovator regulatory compliance market share" },
  { category: "Industry Solutions", title: "Roadmap Planning (Manufacturing)", description: "Enable your enterprise to quickly deliver the goods and services your customers demand, and allow for collaboration.", overlay: "Quickly deliver goods and services customers demand.", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#manufacturing-section", deepContent: "manufacturing automation supply chain predictability demands forecast" },
  { category: "Industry Solutions", title: "Marketing Execution (Manufacturing)", description: "Track real-time data intelligence and provide flexibility in manufacturing operation with effective execution of your marketing process.", overlay: "Track real-time data intelligence and provide operational flexibility.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#manufacturing-section", deepContent: "manufacturing automation supply chain predictability demands forecast" },
  { category: "Industry Solutions", title: "Forecasting and Pipeline Management", description: "Improve the control of your processes, and provide an objective measure of performance for more accurate sales forecasting.", overlay: "Improve process control for more accurate sales forecasting.", image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#manufacturing-section", deepContent: "manufacturing automation supply chain predictability demands forecast" },
  { category: "Industry Solutions", title: "Product Configuration & Order Management", description: "Increase your competitive advantage by improving the efficiency of your quoting, pricing, order management, and product configuration.", overlay: "Improve efficiency of quoting, pricing, and order management.", image: "https://inciflo.com/wp-content/uploads/al_opt_content/IMAGE/inciflo.com/wp-content/uploads/2024/08/inciflo-blogs-3.jpg.bv_resized_desktop.jpg.bv.webp?bv_host=inciflo.com", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#manufacturing-section", deepContent: "manufacturing automation supply chain predictability demands forecast" },
  { category: "Industry Solutions", title: "Customer Service and Analysis", description: "Process information from customer sentiments in order to improve your enterprise’s future sales and service, and lower your costs.", overlay: "Process customer sentiments to improve future sales and service.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/IndustrySolutions/FinancialServices.html#manufacturing-section", deepContent: "manufacturing automation supply chain predictability demands forecast" },

  { category: "Infrastructure Services", title: "Architecture (Cloud)", description: "Plan your cloud implementation with our cloud-centric architecture services from enterprise architecture through infrastructure architecture.", overlay: "Design scalable cloud environments.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#cloud-solutions-section", deepContent: "cloud infrastructure computing networks aws azure google scalability" },
  { category: "Infrastructure Services", title: "Assessment (Cloud)", description: "Come up with a tangible insight you can use to determine cloud computing’s role in your strategic business and IT plans.", overlay: "Determine your organization's cloud readiness.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#cloud-solutions-section", deepContent: "cloud infrastructure computing networks evaluation readiness" },
  { category: "Infrastructure Services", title: "Implementation (Cloud)", description: "Establish and migrate to a cloud foundation for the delivery of elastic, self-service infrastructure capabilities.", overlay: "Seamlessly migrate to the cloud.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#cloud-solutions-section", deepContent: "cloud infrastructure computing networks deployment setup migration" },
  { category: "Infrastructure Services", title: "Strategy and Roadmap (Cloud)", description: "Analyze your goals by carefully planning the implementation of your cloud solutions to ensure its effectiveness.", overlay: "Define your long-term cloud roadmap.", image: "https://media.nngroup.com/media/editor/2020/10/28/screen-shot-2020-10-28-at-12537-pm.png", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#cloud-solutions-section", deepContent: "cloud infrastructure computing networks strategy planning roadmap" },
  { category: "Infrastructure Services", title: "Vendor Evaluation and Selection (Cloud)", description: "Actively monitor and maintain the database of your vendors, products and services in the cloud computing market.", overlay: "Select the best cloud providers for your needs.", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#cloud-solutions-section", deepContent: "cloud infrastructure computing networks providers vendors aws gcp azure" },
  { category: "Infrastructure Services", title: "Managed Security", description: "Come up with comprehensive outsourced solutions for real-time security management including system monitoring.", overlay: "24/7 proactive monitoring and management.", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#information-security-section", deepContent: "information security cyber security firewall protection hacker threats" },
  { category: "Infrastructure Services", title: "Emergency Response", description: "Plan ahead for information security breaches or stop attacks in progress with emergency response services.", overlay: "Rapid incident mitigation and response.", image: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#information-security-section", deepContent: "information security cyber security breaches attacks hacker threats response" },
  { category: "Infrastructure Services", title: "Consulting Security", description: "Professional security services delivers expert security consulting to assist you cost-effectively reduce risk.", overlay: "Expert strategies to reduce corporate risk.", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#information-security-section", deepContent: "information security cyber security consulting strategy risks" },
  { category: "Infrastructure Services", title: "Regulatory Compliance (Security)", description: "Work with expert security consultants to calibrate your systems into compliance with industry and government regulations.", overlay: "Ensure adherence to industry compliance standards.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#information-security-section", deepContent: "information security cyber security compliance government laws rules regulations" },
  { category: "Infrastructure Services", title: "Threat Analysis", description: "Receive regular evaluations of global online threat conditions and detailed analyses tailored to your company’s needs.", overlay: "Stay ahead of global cyber threats.", image: "https://media.licdn.com/dms/image/v2/D4D12AQGb2n7b9s_1FQ/article-cover_image-shrink_720_1280/B4DZlhQRYpIEAI-/0/1758273280212?e=2147483647&v=beta&t=aKNjKxyZhjLo7aEuqVCy9dzF3fBO3tB-0x8Gp25vj4w", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#information-security-section", deepContent: "information security cyber security threat malware analysis tracking" },
  { category: "Infrastructure Services", title: "Security Systems (Surveillance)", description: "Plan your security system with motion detectors, glassbreak sensors, vibration detection sensors, remote monitoring.", overlay: "Advanced intrusion and motion detection.", image: "https://butterflymx.com/wp-content/uploads/2023/04/security-system-companies-700x466.webp", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#security-surveillance-section", deepContent: "security surveillance cameras physical alarms access control hardware cctv" },
  { category: "Infrastructure Services", title: "Surveillance Systems", description: "Our wide range of video surveillance, DVR security systems and wireless cameras help you protect your physical space.", overlay: "High-definition video monitoring.", image: "https://images.unsplash.com/photo-1549109926-58f039549485?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#security-surveillance-section", deepContent: "security surveillance cameras physical alarms access control hardware cctv video dvr" },
  { category: "Infrastructure Services", title: "Integrated Security Systems", description: "Integrate both the physical and electronic security systems in your critical infrastructure facility.", overlay: "Unified physical and electronic management.", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#security-surveillance-section", deepContent: "security surveillance cameras physical alarms access control hardware cctv electronic integration" },
  { category: "Infrastructure Services", title: "Security Planning", description: "Prevent the possible threats your organization might be vulnerable to, and protect your most valuable assets.", overlay: "Strategic asset protection planning.", image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#security-surveillance-section", deepContent: "security surveillance cameras physical alarms access control hardware cctv planning prevention" },
  { category: "Infrastructure Services", title: "Process Visibility", description: "The ability to overview end-to-end processes in both a narrow and wider context and in an intuitive way.", overlay: "Gain comprehensive end-to-end insights.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#business-management-section", deepContent: "business management operations optimization workflow metrics process" },
  { category: "Infrastructure Services", title: "Process Ownership", description: "Establish accountability for improvement of end-to-end processes across the extended enterprise.", overlay: "Establish clear operational accountability.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#business-management-section", deepContent: "business management operations optimization workflow metrics process ownership" },
  { category: "Infrastructure Services", title: "Strategic Alignment", description: "Establish a line of sight between strategy and front line operational improvement activities within your organization.", overlay: "Align daily operations with core strategies.", image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#business-management-section", deepContent: "business management operations optimization workflow metrics strategy alignment" },
  { category: "Infrastructure Services", title: "Performance Metrics", description: "Embed key performance indicators within your processes to provide immediate feedback on performance.", overlay: "Track impact with integrated KPIs.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#business-management-section", deepContent: "business management operations optimization workflow metrics KPIs dashboard" },
  { category: "Infrastructure Services", title: "Organizational Change Management", description: "Encourage your people to adopt and embrace new ways of working with the goal of organizational change to involve people.", overlay: "Drive seamless organizational adoption.", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#business-management-section", deepContent: "business management operations optimization workflow metrics change adoption" },
  { category: "Infrastructure Services", title: "Integration and Testing (DevOps)", description: "Build agility by building continuous integration and testing program development that will work for your system.", overlay: "Automate your testing and deployment cycles.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#devops-section", deepContent: "devops continuous integration testing pipelines automation software code" },
  { category: "Infrastructure Services", title: "Delivery and Improvement (DevOps)", description: "Increase the quality of production by constantly increasing the level of automation in the delivery process.", overlay: "Enhance continuous production quality.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#devops-section", deepContent: "devops continuous integration testing pipelines automation software code delivery production" },
  { category: "Infrastructure Services", title: "Automation Tools", description: "Automate continuous delivery and DevOps processes with complete traceability to improve productivity in any project scale.", overlay: "Streamline software delivery pipelines.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#devops-section", deepContent: "devops continuous integration testing pipelines automation software code tools" },
  { category: "Infrastructure Services", title: "Value Stream Mapping", description: "Implement a lean-management method for mapping the journey your products and services takes.", overlay: "Optimize the end-to-end product journey.", image: "https://www.slideegg.com/image/webpv2/670/703022-value-stream-mapping-template-670.webp", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#devops-section", deepContent: "devops continuous integration testing pipelines automation software code value stream lean" },
  { category: "Infrastructure Services", title: "Agile at Scale", description: "Implement software development methods that enable solutions to evolve through collaboration between cross-functional teams.", overlay: "Foster cross-functional team collaboration.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#devops-section", deepContent: "devops continuous integration testing pipelines automation software code agile scrum" },
  { category: "Infrastructure Services", title: "Code Reviews", description: "Systematically examine computer source code intended to find and fix mistakes overlooked in the initial process.", overlay: "Ensure robust, high-quality codebases.", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/InfrastructureServices/Infrastructure.html#devops-section", deepContent: "devops continuous integration testing pipelines automation software code review quality" },

  { category: "RPA & KINEX", title: "Operational Efficiency (RPA)", description: "Reduce operational costs and enhance energy efficiency by automating workflows and connecting assets.", overlay: "Enhance energy and operational efficiency.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/RPA.html#rpa-section", deepContent: "robotic process automation RPA digitize transform bots repetitive human tasks IoT kinex internet of things connect simplify smart transformation" },
  { category: "RPA & KINEX", title: "AI-Driven Insights", description: "Utilize real-time data from KINEX and RPA bots to make faster, smarter business decisions.", overlay: "Data-driven decision making at scale.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/RPA.html#kinex-section", deepContent: "robotic process automation RPA digitize transform bots repetitive human tasks IoT kinex internet of things connect simplify smart transformation artificial intelligence AI" },

  { category: "Management Consulting", title: "Business Analytics", description: "Our analytics services help clients make strategic decisions and implement business improvements based on insight.", overlay: "Leverage internal and external data for strategic insights.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ManagementConsulting.html", deepContent: "management consulting corporate strategy operational results technology investments enterprise change optimization advice" },
  { category: "Management Consulting", title: "Change Management", description: "We enable you to understand, accept, adapt to and integrate changes that must be made to improve performance.", overlay: "Adapt and integrate necessary changes for better performance.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ManagementConsulting.html", deepContent: "management consulting corporate strategy operational results technology investments enterprise change optimization advice" },
  { category: "Management Consulting", title: "Human Resources (Consulting)", description: "Our human resources solutions can help you create and deliver effective and efficient services to meet and exceed expectations.", overlay: "Deliver effective HR services to exceed organizational expectations.", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ManagementConsulting.html", deepContent: "management consulting corporate strategy operational results technology investments enterprise change optimization advice personnel staff HR" },
  { category: "Management Consulting", title: "Project Management (Consulting)", description: "Lead a project team through project planning, execution, and closure, and help build and staff your program management office.", overlay: "Lead projects from planning through successful execution.", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ManagementConsulting.html", deepContent: "management consulting corporate strategy operational results technology investments enterprise change optimization advice PMO" },

  { category: "Partnerships", title: "IBM Showcase", description: "IBM solutions integrate hardware, software, services and financing.", overlay: "Enterprise-grade technologies across hardware, software, services, and financing.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Silverpop Marketing", description: "Delivering powerful solutions for the changing market.", overlay: "Marketing tools focused on customer engagement and measurable campaign results.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Marketing Platform", description: "Leverage customer behaviors to automate personalized experiences.", overlay: "Enable automation and personalized digital customer journeys at scale.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Marketing Automation", description: "Get more from your marketing budget with marketing automation.", overlay: "Improve campaign performance and maximize your marketing investment.", image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Email Marketing", description: "Leverage behaviors to know who you target and when to send email.", overlay: "Use behavioral insights to send better-timed and better-targeted emails.", image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Web and Sentiment Analytics", description: "Understand your market and gain powerful insights from digital analytics.", overlay: "Discover customer trends and insights from digital interactions and sentiment data.", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Digital Analytics (Partner)", description: "Boost business with monitoring and benchmarking important and relevant data.", overlay: "Track, benchmark, and optimize critical business and marketing performance metrics.", image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Collaborative Project Management System", description: "User-friendly, collaborative and all-in-one interface for management of projects.", overlay: "Collaborative tools that help teams manage projects with clarity and efficiency.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Customer Relationship Management (Partner)", description: "Manage your company’s interaction with your current and future customers.", overlay: "Build stronger customer relationships through organized and data-driven engagement.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies CRM IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },
  { category: "Partnerships", title: "Human Resource Management System", description: "Maximize employee performance and streamline your recruitment process.", overlay: "Improve recruitment, employee engagement, and workforce performance management.", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/Partnership.html", deepContent: "partners global leaders tech core competencies HRMS IBM Advanced Business Partner PARIS Technologies Cornerstone Solutions award-winning" },

  { category: "Project Management", title: "Requirements Definition", description: "Analyze your requirements by starting with business and organizational needs, and translating them into project requirements.", overlay: "Translate organizational needs into actionable requirements.", image: "https://media.finebi.com/strapi/image_29cdb57cb7.png", link: "/IAInnovations/html/BusinessTransformation/ProjectManagement.html", deepContent: "project management plan organize motivate control resources supervision inspection commissioning live training integration" },
  { category: "Project Management", title: "Vendor Management", description: "Enable your organization to control its costs, drive service excellence, and mitigate risks.", overlay: "Drive service excellence and mitigate deal risks.", image: "https://media.licdn.com/dms/image/v2/D4E12AQGdyF4fVncV5g/article-cover_image-shrink_720_1280/B4EZYPNnznHYAI-/0/1744011955344?e=2147483647&v=beta&t=iu5HE9WhGB8JVG_a_rgboEJBkJ3fAYoL5bl2EUoSQX4", link: "/IAInnovations/html/BusinessTransformation/ProjectManagement.html", deepContent: "project management plan organize motivate control resources supervision inspection commissioning live training integration suppliers partners" },
  { category: "Project Management", title: "Configuration and Design", description: "Organize and control engineering changes involving product development documentations, such as proposals, approvals, and design changes.", overlay: "Control changes involving product and design proposals.", image: "https://images.unsplash.com/photo-1503945438517-f65904a52ce6?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ProjectManagement.html", deepContent: "project management plan organize motivate control resources supervision inspection commissioning live training integration" },
  { category: "Project Management", title: "Integration and Migration", description: "Plan your data migration activities by identifying, acquiring, and cleansing the source data, as well as building and testing the routines.", overlay: "Acquire, cleanse, and build routines for data migration.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ProjectManagement.html", deepContent: "project management plan organize motivate control resources supervision inspection commissioning live training integration transfer move" },
  { category: "Project Management", title: "Qualification and Testing", description: "Manage the test team and the testing itself throughout your organization, and make sure that the transition process is seamless.", overlay: "Ensure a seamless transition with comprehensive testing.", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ProjectManagement.html", deepContent: "project management plan organize motivate control resources supervision inspection commissioning live training integration QA" },
  { category: "Project Management", title: "Pilot and Implementation", description: "Manage the risks encountered, and assess the true performance of the design and solutions in a controlled yet live environment.", overlay: "Assess real-world performance in a controlled live environment.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/ProjectManagement.html", deepContent: "project management plan organize motivate control resources supervision inspection commissioning live training integration deployment go live" },

  { category: "Careers", title: "Senior Java Developer", description: "The Senior Software Developer is responsible for designing and developing software applications using sound, repeatable, industry best practices.", overlay: "Design, develop, and lead enterprise application development using best practices.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment software engineer coder programming backend lead senior" },
  { category: "Careers", title: "Junior Java Developer", description: "A Junior Java Developer who will be part of a team that builds enterprise-grade applications. Must adhere to programming standards.", overlay: "Build enterprise-grade applications while learning within a collaborative development team.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment software engineer coder programming backend junior entry level" },
  { category: "Careers", title: "Web Developer", description: "Responsible for writing web applications programs of moderate to significant complexity and scope. Work with business users to gather requirements.", overlay: "Create web applications and translate business requirements into working solutions.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment frontend html css javascript web design full stack" },
  { category: "Careers", title: "Senior Data Science", description: "Responsible for providing strategies and project implementation details which include analytical base table structures, modeling approach and accuracy.", overlay: "Lead analytics and modeling efforts for data science projects and business insights.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment data scientist machine learning ai analytics algorithms quantitative methods" },
  { category: "Careers", title: "System Consultant", description: "Responsible for the analysis and testing of products/solutions; direct interaction with client to discuss individual needs and objectives.", overlay: "Work with clients to analyze needs, test solutions, and implement systems effectively.", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment IT consultant business requirements implementation testing" },
  { category: "Careers", title: ".Net Developer", description: "A .Net Developer is responsible for building enterprise-grade applications. Must adhere to programming standards.", overlay: "Develop scalable enterprise-grade applications using .NET technologies and team standards.", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment c# microsoft dotnet software engineer coder programming backend" },
  { category: "Careers", title: "Business Manager", description: "Responsible for developing, implementing, and executing strategic marketing plans for various business lines of the company.", overlay: "Drive strategic marketing plans that attract customers, leads, and business opportunities.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment manager leadership marketing leads networking strategy" },
  { category: "Careers", title: "Software Sales Executive", description: "Develops and executes strategies for targeted accounts as well as mining and developing existing IA accounts; meet sales quotas.", overlay: "Build account relationships, hit sales targets, and expand customer opportunities.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment B2B sales account executive targets quota software tech sales" },
  { category: "Careers", title: "Sales and Marketing Associate", description: "Must possess an enthusiastic, career-minded individual. Responsibility for assisting with the many facets of the sales and marketing effort.", overlay: "Support sales growth, marketing programs, proposal work, and team collaboration.", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment marketing proposals assistant associate entry level support" },
  { category: "Careers", title: "Supply Chain Coordinator", description: "Responsible for managing activities related to strategic or tactical purchasing, material requirements planning, inventory control.", overlay: "Manage purchasing, inventory, planning, warehousing, and supply coordination activities.", image: "https://www.excelsior.edu/wp-content/uploads/2021/08/22-528581_What-does-a-supply-chain-manager-do_1000x568-1.jpg", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment logistics warehousing purchasing materials inventory operations" },
  { category: "Careers", title: "ELV CAD Designer", description: "Perform ELV Design works including CCTV, FDAS, Structured Cabling, Telecommunications, Data Network, Access Control and Audio-Visual layout Drawings.", overlay: "Create technical design works and schematics for ELV-related project requirements.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment autocad drafting schematic drawing engineer hardware network" },
  { category: "Careers", title: "CAD Designer", description: "Responsible for providing independent design and drafting for Structured Cabling, Telecommunications, Data Network, Access Control and Audio-Visual layout.", overlay: "Provide drafting and design support for network, AV, and structured cabling solutions.", image: "https://www.voguefashioninstitute.com/wp-content/uploads/2023/09/Certificate-Course-in-Jewellery-Design-%E2%80%93-CAD-MATRIX-Vogue-Institute-of-Art-and-Design-1024x682.jpg", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment autocad drafting schematic drawing engineer hardware network cabling" },
  { category: "Careers", title: "CCTV Technician", description: "Must have strong knowledge of access control and door hardware installation/service, structured cabling methods and standards.", overlay: "Install and service access control, door hardware, alarms, and CCTV systems.", image: "https://completesecurityrecruitment.com/wp-content/uploads/2024/05/iStock-639609376-1024x683.jpg", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment installation technician hardware security cameras alarms field worker" },
  { category: "Careers", title: "Company Driver", description: "A Company Driver must have a professional driver’s license and is expected to be familiar with the roads of Metro Manila.", overlay: "Support company transport needs with professionalism and knowledge of Metro Manila roads.", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80", link: "/IAInnovations/html/BusinessTransformation/careers.html", deepContent: "career job opening hiring employment driving logistics transport delivery metro manila vehicle" }
];

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("liveSearchInput");
  const searchIcon = document.querySelector(".search-icon");

  const defaultHomeContent = document.getElementById("default-home-content");
  const mergedSearchSection = document.getElementById("merged-search-section");
  const resultsWrapper = document.getElementById("search-results-wrapper");
  const noMatchMsg = document.getElementById("no-match-msg");
  const failedKeywordSpan = document.getElementById("failed-keyword");
  const searchTitle = document.getElementById("dynamic-search-title");
  const searchSubtitle = document.getElementById("dynamic-search-subtitle");

  function renderCards(servicesToRender) {
    let htmlContent = "";
    const groupedServices = {};

    servicesToRender.forEach(service => {
      if (!groupedServices[service.category]) {
        groupedServices[service.category] = [];
      }
      groupedServices[service.category].push(service);
    });

    for (const [category, services] of Object.entries(groupedServices)) {
      htmlContent += `
        <div class="category-group">
          <h3 class="category-title">${category}</h3>
          <div class="service-grid">
      `;

      services.forEach(service => {
        htmlContent += `
          <article class="service-card">
            <div class="service-image-wrap">
              <img src="${service.image}" alt="${service.title}" loading="lazy">
              <div class="service-overlay"><p>${service.overlay}</p></div>
            </div>
            <div class="service-card-content">
              <h3>${service.title}</h3>
              <p>${service.description}</p>
              <a href="${service.link}">Learn More</a>
            </div>
          </article>
        `;
      });

      htmlContent += `
          </div>
        </div>
      `;
    }

    if (resultsWrapper) {
      resultsWrapper.innerHTML = htmlContent;
    }
  }

  function showDefaultHome() {
    if (defaultHomeContent) defaultHomeContent.style.display = "block";
    if (mergedSearchSection) mergedSearchSection.style.display = "none";
    if (noMatchMsg) noMatchMsg.style.display = "none";
    if (resultsWrapper) {
      resultsWrapper.style.display = "block";
      resultsWrapper.innerHTML = "";
    }
  }

  function showSearchResults(rawQuery) {
    const query = rawQuery.toLowerCase().trim();

    if (query === "") {
      showDefaultHome();
      return;
    }

    const filteredResults = allServices.filter(service =>
      service.title.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      (service.deepContent && service.deepContent.toLowerCase().includes(query))
    );

    if (defaultHomeContent) defaultHomeContent.style.display = "none";
    if (mergedSearchSection) mergedSearchSection.style.display = "block";

    if (searchTitle) searchTitle.textContent = "Search Results";
    if (searchSubtitle) searchSubtitle.textContent = `Found ${filteredResults.length} result(s) for "${rawQuery}"`;

    if (filteredResults.length > 0) {
      if (noMatchMsg) noMatchMsg.style.display = "none";
      if (resultsWrapper) {
        resultsWrapper.style.display = "block";
        renderCards(filteredResults);
      }
    } else {
      if (resultsWrapper) resultsWrapper.style.display = "none";
      if (noMatchMsg) noMatchMsg.style.display = "block";
      if (failedKeywordSpan) failedKeywordSpan.textContent = rawQuery;
    }
  }

  function executeSearch() {
    if (searchInput) showSearchResults(searchInput.value);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const urlQuery = urlParams.get("query");

  if (urlQuery && searchInput) {
    searchInput.value = urlQuery;
    showSearchResults(urlQuery);
  } else {
    showDefaultHome();
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      showSearchResults(e.target.value);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeSearch();
      }
    });
  }

  if (searchIcon) {
    searchIcon.addEventListener("click", executeSearch);
    searchIcon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        executeSearch();
      }
    });
  }
});