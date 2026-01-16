// Skill Garden API Helper
// This file provides a reusable fetch wrapper for API calls.
// It automatically handles authentication, content-type, and error responses.

window.SG = window.SG || {};

/**
 * Reusable API fetch helper for Skill Garden
 * @param {string} endpoint - The API endpoint path (relative to SG.API_BASE)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {object} [body] - Optional request body to JSON.stringify
 * @returns {Promise<object>} - Parsed JSON response from the API
 * @throws {Error} - If the response is not ok or JSON parsing fails
 */
SG.apiFetch = async function(endpoint, method = 'GET', body = null) {
  // Construct the full URL using the base API URL
  const url = `${SG.API_BASE}${endpoint}`;

  // Prepare headers with Content-Type
  const headers = {
    'Content-Type': 'application/json'
  };

  // Add Authorization header if token is available
  const token = SG.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepare fetch options
  const options = {
    method: method,
    headers: headers
  };

  // Add body if provided (for POST, PUT, etc.)
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    // Make the fetch request
    const response = await fetch(url, options);

    // Handle 401 Unauthorized by logging out
    if (response.status === 401) {
      SG.logout();
      throw new Error('Unauthorized - logged out');
    }

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    // Re-throw the error for the caller to handle
    throw error;
  }
};
