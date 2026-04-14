/**
 * Back to Top Button Module
 * Smooth scroll to top functionality with fade animations
 */

function initializeBackToTop() {
  // Create back-to-top button if it doesn't exist
  let backToTopBtn = document.getElementById('backToTopBtn');
  
  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    // Add CSS if not already in stylesheet
    if (!document.getElementById('backToTopStyles')) {
      const styles = document.createElement('style');
      styles.id = 'backToTopStyles';
      styles.textContent = `
        .back-to-top-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #0171b9 0%, #012e4a 100%);
          color: #bfd744;
          border: 2px solid #bfd744;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 999;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(1, 46, 74, 0.3);
        }

        .back-to-top-btn:hover {
          background: linear-gradient(135deg, #012e4a 0%, #0171b9 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(1, 46, 74, 0.5);
        }

        .back-to-top-btn:active {
          transform: translateY(-1px);
        }

        .back-to-top-btn.show {
          display: flex;
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

        @media (max-width: 768px) {
          .back-to-top-btn {
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            font-size: 18px;
          }
        }

        @media (max-width: 480px) {
          .back-to-top-btn {
            bottom: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  }

  // Show/hide button on scroll
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

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
