// register.js - Registration page integration for Skill Garden
// This file handles the registration form submission using the SG.apiFetch helper.
// It validates inputs, sends registration data, and manages post-registration flow.

window.SG = window.SG || {};

document.addEventListener('DOMContentLoaded', function() {
  // Auto-redirect already logged-in users
  if (SG.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // Set current year in footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Find the registration form
  const registerForm = document.getElementById('register-form');

  if (!registerForm) {
    return;
  }

  // Handle form submission
  registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get input values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Client-side validation
    if (!name) {
      SG.showToast('Please enter your name');
      document.getElementById('name').focus();
      return;
    }

    if (!email) {
      SG.showToast('Please enter your email');
      document.getElementById('email').focus();
      return;
    }

    if (!password) {
      SG.showToast('Please enter a password');
      document.getElementById('password').focus();
      return;
    }

    // Disable submit button to prevent double submission
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    try {
      // Call the registration API endpoint
      const response = await SG.apiFetch('/auth/register', 'POST', {
        name: name,
        email: email,
        password: password
      });

      // Check if registration was successful
      if (response.success) {
        // Store authentication token
        localStorage.setItem('token', response.token);

        // Store user object
        localStorage.setItem('user', JSON.stringify(response.user));

        // Show success message
        SG.showToast('Account created successfully! Redirecting...');

        // Redirect to dashboard
        setTimeout(function() {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        // Show error message from backend
        SG.showToast(response.message || 'Registration failed');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    } catch (error) {
      // Handle network or unexpected errors
      console.error('Registration error:', error);
      SG.showToast('Registration failed. Please try again.');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});
