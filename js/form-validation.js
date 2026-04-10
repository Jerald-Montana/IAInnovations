/**
 * Form Validation Module
 * Provides client-side form validation for contact forms
 */

function initializeFormValidation() {
  const forms = document.querySelectorAll('.contact-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!validateForm(this)) {
        e.preventDefault();
        return false;
      }
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

function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
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
      case 'textarea':
        if (value.length < 10) {
          isValid = false;
          errorMessage = 'Message must be at least 10 characters';
        }
        break;
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
