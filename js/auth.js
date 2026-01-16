// auth.js - Login page integration for Skill Garden
// This file handles the login form submission using the SG.apiFetch helper.
// It prevents default form behavior and manages authentication flow.
console.log("auth.js loaded");

window.SG = window.SG || {};

// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
   
  // Auto-redirect already logged-in users to prevent showing the login form
  if (SG.isLoggedIn()) {
    window.location.href = '/frontend/index.html';
    return;
  }

  // Find the login form by its ID
  const loginForm = document.getElementById('login-form');

  // Check if the form exists on this page (it might not on other pages)
  if (!loginForm) {
    return; // Exit early if no login form is present
  }

  // Attach event listener to the form's submit event
  loginForm.addEventListener('submit', async function(event) {
    // Prevent the browser's default form submission behavior
    event.preventDefault();

    // Get the email and password values from the input fields
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Basic client-side validation (email and password are required)
    if (!email || !password) {
      SG.showToast('Please enter both email and password');
      return;
    }

    try {
      // Call the API using the SG.apiFetch helper
      // This sends a POST request to /auth/login with the email and password
      const response = await SG.apiFetch('/auth/login', 'POST', {
        email: email,
        password: password
      });

      // Check if the login was successful (backend returns success: true)
      if (response.success) {
        // Store the authentication token in localStorage
        localStorage.setItem('token', response.token);

        // Store the user object as a JSON string in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));

        // Show success message to the user
        SG.showToast('Login successful! Redirecting...');

        // Redirect to the main dashboard page after a short delay
        setTimeout(() => {
         window.location.href = 'index.html';
        }, 1000);
      } else {
        // If success is false, show the error message from the backend
        SG.showToast(response.message || 'Login failed');
      }
    } catch (error) {
      // Handle any network errors or unexpected issues
      console.error('Login error:', error);
      SG.showToast('Login failed. Please try again.');
    }
  });
});
