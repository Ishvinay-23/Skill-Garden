// index.js - Dashboard page protection and initialization for Skill Garden
// This file ensures only authenticated users can access the dashboard.
// It checks login status on page load and redirects unauthenticated users to login.

// Wait for the DOM to be fully loaded before checking authentication
document.addEventListener('DOMContentLoaded', function() {
  // Check if the user is logged in by verifying the presence of an authentication token
  if (!SG.isLoggedIn()) {
    // User is NOT logged in - redirect to the login page and stop execution
    console.warn('Unauthorized access attempt - redirecting to login page');
    window.location.href = '/frontend/login.html';
    return; // Stop any further code execution
  }

  // User IS logged in - allow the dashboard to load normally
  console.log('Dashboard access granted - user is authenticated');

  // Set up logout button functionality
  // When clicked, clears authentication data and redirects to login page
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
      event.preventDefault();
      SG.logout();
    });
  }
});
