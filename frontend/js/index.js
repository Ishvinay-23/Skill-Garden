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

  // Set up team creation form
  setupTeamCreationForm();

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
 * Retrieves the logged-in user's ID from localStorage
 * @returns {string|null} - The user ID or null if not found
 */
function getUserId() {
  try {
    const userDataString = localStorage.getItem('user');
    if (!userDataString) {
      return null;
    }
    
    const userData = JSON.parse(userDataString);
    return userData._id || userData.id || null;
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    return null;
  }
}

/**
 * Sets up the team creation form and its submit handler
 * Creates a form dynamically and inserts it before the teams list
 */
function setupTeamCreationForm() {
  // Get the teams section container
  const teamsSection = document.getElementById('recommended-teams');
  
  if (!teamsSection) {
    console.error('Teams section not found in DOM');
    return;
  }

  // Check if form already exists to prevent duplicates
  if (document.getElementById('create-team-form')) {
    return;
  }

  // Create the form container
  const formContainer = document.createElement('div');
  formContainer.className = 'create-team-container';
  formContainer.style.marginBottom = '1.5rem';

  // Create the form
  const form = document.createElement('form');
  form.id = 'create-team-form';
  form.className = 'create-team-form';

  // Create form title
  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Create New Team';
  formTitle.style.marginBottom = '1rem';

  // Create team name input
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Team Name *';
  nameLabel.htmlFor = 'team-name-input';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'team-name-input';
  nameInput.name = 'name';
  nameInput.placeholder = 'Enter team name';
  nameInput.required = true;
  nameInput.style.width = '100%';
  nameInput.style.marginBottom = '1rem';

  // Create description textarea
  const descLabel = document.createElement('label');
  descLabel.textContent = 'Description (optional)';
  descLabel.htmlFor = 'team-desc-input';
  
  const descInput = document.createElement('textarea');
  descInput.id = 'team-desc-input';
  descInput.name = 'description';
  descInput.placeholder = 'Enter team description';
  descInput.rows = 3;
  descInput.style.width = '100%';
  descInput.style.marginBottom = '1rem';

  // Create submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Create Team';
  submitButton.className = 'btn-primary';

  // Append elements to form
  form.appendChild(formTitle);
  form.appendChild(nameLabel);
  form.appendChild(nameInput);
  form.appendChild(descLabel);
  form.appendChild(descInput);
  form.appendChild(submitButton);

  formContainer.appendChild(form);

  // Insert form before the teams list
  const teamsList = document.getElementById('teams-list');
  teamsSection.insertBefore(formContainer, teamsList);

  // Add form submit handler
  form.addEventListener('submit', handleCreateTeam);

  console.log('Team creation form initialized');
}

/**
 * Handles team creation form submission
 * @param {Event} event - The form submit event
 */
async function handleCreateTeam(event) {
  // Prevent default form submission
  event.preventDefault();

  // Get form inputs
  const nameInput = document.getElementById('team-name-input');
  const descInput = document.getElementById('team-desc-input');
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Get values and trim whitespace
  const teamName = nameInput.value.trim();
  const teamDescription = descInput.value.trim();

  // Basic validation
  if (!teamName) {
    SG.showToast('Team name is required');
    return;
  }

  if (teamName.length < 2) {
    SG.showToast('Team name must be at least 2 characters');
    return;
  }

  // Disable submit button to prevent double submission
  submitButton.disabled = true;
  submitButton.textContent = 'Creating...';

  console.log('Creating team:', { name: teamName, description: teamDescription });

  try {
    // Call the API to create team
    const response = await SG.apiFetch('/teams', 'POST', {
      name: teamName,
      description: teamDescription
    });

    // Check if creation was successful
    if (response.success) {
      console.log('Team created successfully:', response.team);
      SG.showToast('Team created successfully!');

      // Clear the form
      nameInput.value = '';
      descInput.value = '';

      // Refresh the teams list to show the new team
      await fetchAndRenderTeams();
    } else {
      throw new Error(response.message || 'Failed to create team');
    }
  } catch (error) {
    console.error('Error creating team:', error);
    SG.showToast('Failed to create team. Please try again.');
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = 'Create Team';
  }
}

/**
 * Handles joining a team when Join Team button is clicked
 * @param {string} teamId - The ID of the team to join
 * @param {string} teamName - The name of the team (for display)
 */
async function handleJoinTeam(teamId, teamName) {
  if (!teamId) {
    console.error('Team ID is required to join a team');
    return;
  }

  console.log('Attempting to join team:', { teamId, teamName });

  // Find the button that was clicked to disable it
  const button = document.querySelector(`button[data-team-id="${teamId}"]`);
  
  if (button) {
    button.disabled = true;
    button.textContent = 'Joining...';
  }

  try {
    // Call the API to join the team
    const response = await SG.apiFetch(`/teams/${teamId}/join`, 'POST');

    // Check if join was successful
    if (response.success) {
      console.log('Successfully joined team:', teamName);
      SG.showToast(`Successfully joined ${teamName}!`);

      // Refresh the teams list to show updated member count
      await fetchAndRenderTeams();
    } else {
      // Handle specific error messages from backend
      const errorMessage = response.message || 'Failed to join team';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error joining team:', error);
    
    // Show user-friendly error message
    const errorMessage = error.message.includes('Already a member')
      ? 'You are already a member of this team'
      : 'Failed to join team. Please try again.';
    
    SG.showToast(errorMessage);

    // Re-enable button on error
    if (button) {
      button.disabled = false;
      button.textContent = 'Join Team';
    }
  }
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

    // Get logged-in user ID for membership checking
    const userId = getUserId();

    // Clear the container and render teams
    teamsList.innerHTML = '';
    
    // Render each team
    teams.forEach((team, index) => {
      const teamCard = createTeamCard(team, userId);
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
 * @param {string} userId - The logged-in user's ID for membership checking
 * @returns {HTMLElement} - The team card DOM element
 */
function createTeamCard(team, userId) {
  // Safely extract team properties with fallbacks
  const teamName = team.name || 'Unnamed Team';
  const teamDescription = team.description || 'No description available';
  const teamStatus = team.status || 'Open';
  const memberCount = team.members ? team.members.length : 0;
  const teamNeeds = team.needs || 0;
  const teamTags = team.tags && team.tags.length > 0 ? team.tags : [];

  // Check if the logged-in user is already a member of this team
  // This prevents duplicate join requests and improves UX by showing membership status
  const isMember = userId && team.members && team.members.includes(userId);

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

  // Show either Join button or membership status based on user's membership
  if (isMember) {
    // User is already a member - show status label instead of join button
    const memberBadge = document.createElement('span');
    memberBadge.className = 'member-badge';
    memberBadge.textContent = 'You are a member';
    memberBadge.style.color = '#4caf50';
    memberBadge.style.fontWeight = 'bold';
    footer.appendChild(memberBadge);
  } else {
    // User is not a member - show Join Team button
    const joinButton = document.createElement('button');
    joinButton.className = 'btn-join-team';
    joinButton.textContent = 'Join Team';
    joinButton.setAttribute('data-team-id', team._id);
    
    // Add click handler for joining team
    joinButton.addEventListener('click', function() {
      handleJoinTeam(team._id, team.name);
    });
    
    footer.appendChild(joinButton);
  }

  // Assemble the card
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
}
