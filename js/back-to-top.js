/**
 * Back to Top Button Module
 * Smooth scroll to top functionality with fade animations
 */

function initializeBackToTop() {
  // Create back-to-top button if it doesn't exist
  let backToTopBtn = document.getElementById('backToTopBtn');

  function getScrollTop() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function getMaxScroll() {
    const doc = document.documentElement;
    return Math.max(doc.scrollHeight - doc.clientHeight, 0);
  }

  function updateBackToTopProgress() {
    const maxScroll = getMaxScroll();
    const progress = maxScroll > 0 ? Math.min((getScrollTop() / maxScroll) * 100, 100) : 0;

    backToTopBtn.style.setProperty('--scroll-progress', progress.toFixed(2));
    backToTopBtn.classList.toggle('is-complete', progress >= 99.5);
  }
  
  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '<span class="back-to-top-icon" aria-hidden="true">↑</span>';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    // Add CSS if not already in stylesheet
    if (!document.getElementById('backToTopStyles')) {
      const styles = document.createElement('style');
      styles.id = 'backToTopStyles';
      styles.textContent = `
        .back-to-top-btn {
          --scroll-progress: 0;
          --ring-active: #bfd744;
          --ring-track: rgba(191, 215, 68, 0.25);
          --inner-bg: linear-gradient(135deg, #0171b9 0%, #012e4a 100%);
          --pulse-color: rgba(191, 215, 68, 0.45);
          position: fixed;
          bottom: 30px;
          right: 90px; /* Offset from right to avoid chatbot overlap */
          width: 50px;
          height: 50px;
          background:
            conic-gradient(var(--ring-active) calc(var(--scroll-progress) * 1%), var(--ring-track) 0) border-box,
            var(--inner-bg) padding-box;
          color: #bfd744;
          border: 2px solid transparent;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: none;
          align-items: center;
          justify-content: center;
          overflow: visible;
          z-index: 11000;
          transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
          box-shadow: 0 4px 12px rgba(1, 46, 74, 0.3);
        }

        .back-to-top-btn::before,
        .back-to-top-btn::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          pointer-events: none;
        }

        .back-to-top-btn::before {
          border: 2px solid var(--pulse-color);
          opacity: 0;
          transform: scale(0.9);
        }

        .back-to-top-btn::after {
          border: 1px solid rgba(191, 215, 68, 0.28);
          opacity: 0;
          transform: scale(0.96);
        }

        .back-to-top-icon {
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
          transform: translateY(-1px);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
          pointer-events: none;
        }

        .back-to-top-btn:hover {
          --inner-bg: linear-gradient(135deg, #012e4a 0%, #0171b9 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(1, 46, 74, 0.5);
        }

        .back-to-top-btn.is-complete {
          box-shadow: 0 0 0 3px rgba(191, 215, 68, 0.25), 0 10px 24px rgba(1, 46, 74, 0.55);
        }

        .back-to-top-btn.show::before {
          animation: ringBeat 1.15s ease-out infinite;
        }

        .back-to-top-btn.show::after {
          animation: ringBeatSoft 1.15s ease-out infinite 0.28s;
        }

        .back-to-top-btn.is-complete::before,
        .back-to-top-btn.is-complete::after {
          animation-duration: 0.9s;
        }

        .back-to-top-btn:active {
          transform: translateY(-1px);
        }

        .back-to-top-btn.show {
          display: flex !important;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ringBeat {
          0% {
            opacity: 0.56;
            transform: scale(0.9);
          }
          70% {
            opacity: 0.04;
            transform: scale(1.26);
          }
          100% {
            opacity: 0;
            transform: scale(1.26);
          }
        }

        @keyframes ringBeatSoft {
          0% {
            opacity: 0.36;
            transform: scale(0.96);
          }
          70% {
            opacity: 0.03;
            transform: scale(1.18);
          }
          100% {
            opacity: 0;
            transform: scale(1.18);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .back-to-top-btn.show::before,
          .back-to-top-btn.show::after {
            animation: none;
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .back-to-top-btn {
            bottom: 110px;
            right: 20px;
            width: 45px;
            height: 45px;
            font-size: 18px;
          }

          .back-to-top-icon {
            font-size: 21px;
          }
        }

        @media (max-width: 480px) {
          .back-to-top-btn {
            bottom: 100px;
            right: 15px;
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .back-to-top-icon {
            font-size: 19px;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  }

  function handleBackToTopVisibility() {
    const scrollTop = getScrollTop();
    const maxScroll = getMaxScroll();
    const revealThreshold = 250; // Simple fixed threshold for better reliability

    if (maxScroll > 120 && scrollTop > revealThreshold) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }

    updateBackToTopProgress();
  }

  // Show/hide button on scroll
  window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });
  document.addEventListener('scroll', handleBackToTopVisibility, { passive: true });

  window.addEventListener('resize', handleBackToTopVisibility);
  window.addEventListener('load', handleBackToTopVisibility);
  handleBackToTopVisibility();

  // Scroll to top on click
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBackToTop);
} else {
  initializeBackToTop();
}
  