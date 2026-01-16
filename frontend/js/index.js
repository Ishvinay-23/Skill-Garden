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

  // Load and render user information on the dashboard
  renderUserInfo();

  // Fetch and render teams on the dashboard
  fetchAndRenderTeams();

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

/**
 * Renders user information (name, level, XP) on the dashboard
 * Retrieves user data from localStorage and safely handles missing or invalid data
 */
function renderUserInfo() {
  // Get the XP card container where user info will be displayed
  const xpCard = document.getElementById('xp-card');
  
  if (!xpCard) {
    console.error('XP card container not found in DOM');
    return;
  }

  // Retrieve user data from localStorage
  const userDataString = localStorage.getItem('user');
  
  // Handle case where user data doesn't exist in localStorage
  if (!userDataString) {
    console.warn('No user data found in localStorage');
    xpCard.innerHTML = '<h2>Your Progress</h2><p class="error-msg">User data not available</p>';
    return;
  }

  // Parse the JSON string safely with try-catch
  let userData;
  try {
    userData = JSON.parse(userDataString);
  } catch (error) {
    console.error('Failed to parse user data from localStorage:', error);
    xpCard.innerHTML = '<h2>Your Progress</h2><p class="error-msg">Invalid user data</p>';
    return;
  }

  // Validate that required user fields exist
  if (!userData || typeof userData !== 'object') {
    console.error('User data is not a valid object');
    xpCard.innerHTML = '<h2>Your Progress</h2><p class="error-msg">Invalid user data format</p>';
    return;
  }

  // Extract user information with fallback values for missing fields
  const userName = userData.name || userData.username || 'User';
  const userLevel = userData.level !== undefined ? userData.level : 1;
  const userXP = userData.xp !== undefined ? userData.xp : 0;
  const nextLevelXP = userData.nextLevelXP || userData.nextLevel || (userLevel + 1) * 200;

  // Calculate progress percentage for XP bar
  const progressPercent = Math.min(100, Math.round((userXP / nextLevelXP) * 100));

  // Build the user info HTML
  const userInfoHTML = `
    <h2>Your Progress</h2>
    <div class="user-stats">
      <p class="user-name"><strong>${escapeHtml(userName)}</strong></p>
      <p class="user-level">Level ${userLevel}</p>
      <div class="xp-bar-container">
        <div class="xp-bar" style="width: ${progressPercent}%"></div>
      </div>
      <p class="user-xp">${userXP} / ${nextLevelXP} XP</p>
    </div>
  `;

  // Render the user info into the XP card
  xpCard.innerHTML = userInfoHTML;

  console.log('User info rendered successfully:', { userName, userLevel, userXP });
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Fetches teams from the backend and renders them on the dashboard
 * Handles loading state, error state, and empty state
 */
async function fetchAndRenderTeams() {
  // Get the teams list container where teams will be displayed
  const teamsList = document.getElementById('teams-list');
  
  if (!teamsList) {
    console.error('Teams list container not found in DOM');
    return;
  }

  // Show loading state
  teamsList.innerHTML = '<p class="loading-msg">Loading teams...</p>';
  console.log('Fetching teams from backend...');

  try {
    // Fetch teams from the backend API
    const response = await SG.apiFetch('/teams', 'GET');
    
    // Check if the response is successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch teams');
    }

    const teams = response.teams;
    console.log(`Successfully fetched ${teams.length} teams`);

    // Handle empty state - no teams available
    if (!teams || teams.length === 0) {
      teamsList.innerHTML = '<p class="empty-msg">No teams available at the moment. Check back later!</p>';
      return;
    }

    // Clear the container and render teams
    teamsList.innerHTML = '';
    
    // Render each team
    teams.forEach((team, index) => {
      const teamCard = createTeamCard(team);
      teamsList.appendChild(teamCard);
    });

    console.log('Teams rendered successfully');

  } catch (error) {
    // Handle error state
    console.error('Error fetching teams:', error);
    teamsList.innerHTML = '<p class="error-msg">Failed to load teams. Please try again later.</p>';
  }
}

/**
 * Creates a team card element for displaying team information
 * @param {object} team - The team data object
 * @returns {HTMLElement} - The team card DOM element
 */
function createTeamCard(team) {
  // Safely extract team properties with fallbacks
  const teamName = team.name || 'Unnamed Team';
  const teamDescription = team.description || 'No description available';
  const teamStatus = team.status || 'Open';
  const memberCount = team.members ? team.members.length : 0;
  const teamNeeds = team.needs || 0;
  const teamTags = team.tags && team.tags.length > 0 ? team.tags : [];

  // Determine status class for styling (open/closed)
  const statusClass = teamStatus.toLowerCase().includes('open') || teamStatus.toLowerCase().includes('need') ? 'status-open' : 'status-closed';

  // Create the team card container
  const card = document.createElement('article');
  card.className = 'team-card';

  // Create team header with name and status
  const header = document.createElement('div');
  header.className = 'team-header';
  
  const title = document.createElement('h3');
  title.className = 'team-name';
  title.textContent = escapeHtml(teamName);
  
  const statusBadge = document.createElement('span');
  statusBadge.className = `team-status ${statusClass}`;
  statusBadge.textContent = escapeHtml(teamStatus);
  
  header.appendChild(title);
  header.appendChild(statusBadge);

  // Create team body with description
  const body = document.createElement('div');
  body.className = 'team-body';
  
  const description = document.createElement('p');
  description.className = 'team-description';
  description.textContent = escapeHtml(teamDescription);
  body.appendChild(description);

  // Add tags if available
  if (teamTags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'team-tags';
    
    teamTags.forEach(tag => {
      const tagBadge = document.createElement('span');
      tagBadge.className = 'tag-badge';
      tagBadge.textContent = escapeHtml(tag);
      tagsContainer.appendChild(tagBadge);
    });
    
    body.appendChild(tagsContainer);
  }

  // Create team footer with member count and needs
  const footer = document.createElement('div');
  footer.className = 'team-footer';
  
  const memberInfo = document.createElement('p');
  memberInfo.className = 'team-members';
  memberInfo.innerHTML = `<strong>Members:</strong> ${memberCount}`;
  
  if (teamNeeds > 0) {
    memberInfo.innerHTML += ` <span class="team-needs">(Need ${teamNeeds} more)</span>`;
  }
  
  footer.appendChild(memberInfo);

  // Assemble the card
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
}
