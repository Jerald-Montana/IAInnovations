/**
 * Form Validation Module
 * Provides client-side form validation for contact forms
 */

const MIN_SECONDS_TO_SUBMIT = 4;
const SUBMIT_COOLDOWN_SECONDS = 45;
const LAST_SUBMIT_KEY = 'ia_contact_last_submit';

function initializeFormValidation() {
  const forms = document.querySelectorAll('.contact-form');
  
  forms.forEach(form => {
    const openedAtField = form.querySelector('input[name="_form_opened_at"]');
    if (openedAtField) {
      openedAtField.value = String(Date.now());
    }

    form.addEventListener('submit', function(e) {
      if (!validateForm(this)) {
        e.preventDefault();
        return false;
      }

      if (!passesAntiSpamChecks(this)) {
        e.preventDefault();
        return false;
      }

      lockSubmitButton(this);
      rememberSubmissionTime();

      if (typeof window.showPopup === 'function') {
        window.showPopup();
      }

      return true;
    });

    // Real-time validation on input
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });

      input.addEventListener('input', function() {
        if (this.classList.contains('error')) {
          validateField(this);
        }
      });
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const fields = form.querySelectorAll('input[required], textarea[required]');

  fields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  return isValid;
}

function passesAntiSpamChecks(form) {
  const honeypotField = form.querySelector('input[name="_honey"]');
  if (honeypotField && honeypotField.value.trim() !== '') {
    return false;
  }

  const openedAtField = form.querySelector('input[name="_form_opened_at"]');
  if (openedAtField) {
    const openedAt = Number(openedAtField.value);
    const elapsedMs = Date.now() - openedAt;
    if (!Number.isFinite(openedAt) || elapsedMs < MIN_SECONDS_TO_SUBMIT * 1000) {
      alert('Please wait a few seconds before submitting your message.');
      return false;
    }
  }

  const lastSubmission = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
  const cooldownMs = SUBMIT_COOLDOWN_SECONDS * 1000;
  if (Date.now() - lastSubmission < cooldownMs) {
    alert('Please wait before sending another message.');
    return false;
  }

  return true;
}

function lockSubmitButton(form) {
  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  if (!submitButton) {
    return;
  }

  submitButton.disabled = true;
  setTimeout(() => {
    submitButton.disabled = false;
  }, 6000);
}

function rememberSubmissionTime() {
  localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
}

function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const tagName = field.tagName.toLowerCase();
  let isValid = true;
  let errorMessage = '';

  // Clear previous error
  removeFieldError(field);

  // Check if field is empty
  if (!value) {
    isValid = false;
    errorMessage = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required`;
  } else {
    // Type-specific validation
    switch (type) {
      case 'email':
        if (!isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'text':
        if (field.name === 'name' && value.length < 2) {
          isValid = false;
          errorMessage = 'Name must be at least 2 characters';
        } else if (field.name === 'subject' && value.length < 3) {
          isValid = false;
          errorMessage = 'Subject must be at least 3 characters';
        }
        break;
    }

    if (tagName === 'textarea' && value.length < 20) {
      isValid = false;
      errorMessage = 'Message must be at least 20 characters';
    }
  }

  // Show error if validation fails
  if (!isValid) {
    showFieldError(field, errorMessage);
  }

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Create or update error message element
  let errorElement = field.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('error-message')) {
    errorElement = document.createElement('div');
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }
  
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

function removeFieldError(field) {
  field.classList.remove('error');
  
  const errorElement = field.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.style.display = 'none';
  }
}

// Initialize validation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFormValidation);
} else {
  initializeFormValidation();
}
