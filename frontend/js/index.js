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

  // Fetch and render resources on the dashboard
  fetchAndRenderResources();

  // Set up resource creation form
  setupDashboardAddResourceForm();

  // Fetch and render weekly leaderboard
  fetchAndRenderLeaderboard();

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

/**
 * Fetches resources from the backend and renders them on the dashboard
 * Shows featured resources as a preview with links to the full resources page
 */
async function fetchAndRenderResources() {
  // Get the resources preview container
  const resourcesPreview = document.getElementById('resources-preview');
  
  if (!resourcesPreview) {
    console.error('Resources preview container not found in DOM');
    return;
  }

  // Show loading state
  resourcesPreview.innerHTML = '<p class="loading-msg">Loading resources...</p>';
  console.log('Fetching resources from backend...');

  try {
    // Fetch resources from the backend API
    const response = await SG.apiFetch('/resources', 'GET');
    
    // Check if the response is successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch resources');
    }

    const resources = response.resources;
    console.log(`Successfully fetched ${resources.length} resources from backend`);

    // Handle empty state - no resources available
    if (!resources || resources.length === 0) {
      resourcesPreview.innerHTML = '<p class="empty-msg">No resources available yet. <a href="resources.html">Add one!</a></p>';
      return;
    }

    // Clear the container and render featured resources (limit to 3 for dashboard preview)
    resourcesPreview.innerHTML = '';
    
    // Show the first 3 resources as a preview
    const featuredResources = resources.slice(0, 3);
    
    featuredResources.forEach(resource => {
      const resourceItem = createResourcePreviewItem(resource);
      resourcesPreview.appendChild(resourceItem);
    });

    // Add link to full resources page if there are more resources
    if (resources.length > 3) {
      const viewMoreLink = document.createElement('p');
      viewMoreLink.className = 'view-more-link';
      viewMoreLink.innerHTML = `<a href="resources.html">View all ${resources.length} resources →</a>`;
      resourcesPreview.appendChild(viewMoreLink);
    }

    console.log('Resources rendered successfully on dashboard');

  } catch (error) {
    // Handle error state
    console.error('Error fetching resources:', error);
    resourcesPreview.innerHTML = '<p class="error-msg">Failed to load resources. Please try again later.</p>';
  }
}

/**
 * Creates a resource preview item for the dashboard
 * Displays title, category, and optional link
 * @param {object} resource - The resource data object
 * @returns {HTMLElement} - The resource preview item element
 */
function createResourcePreviewItem(resource) {
  // Safely extract resource properties with fallbacks
  const resourceTitle = resource.title || 'Untitled Resource';
  const resourceCategory = resource.category || 'Unknown';
  const resourceLink = resource.link && resource.link !== '#' ? resource.link : null;

  // Create the resource item container
  const item = document.createElement('div');
  item.className = 'resource-preview-item';
  item.style.padding = '1rem';
  item.style.borderBottom = '1px solid #eee';
  item.style.display = 'flex';
  item.style.justifyContent = 'space-between';
  item.style.alignItems = 'center';

  // Create left section with title and category
  const leftSection = document.createElement('div');
  
  const title = document.createElement('h4');
  title.className = 'resource-title';
  title.textContent = escapeHtml(resourceTitle);
  title.style.margin = '0 0 0.25rem 0';
  
  const category = document.createElement('span');
  category.className = `resource-category-badge category-${resourceCategory}`;
  category.textContent = capitalizeCategory(resourceCategory);
  category.style.fontSize = '0.75rem';
  category.style.display = 'inline-block';
  category.style.padding = '0.25rem 0.5rem';
  category.style.borderRadius = '0.25rem';
  category.style.backgroundColor = getCategoryColor(resourceCategory);
  category.style.color = '#fff';

  leftSection.appendChild(title);
  leftSection.appendChild(category);

  // Create right section with action link
  const rightSection = document.createElement('div');
  
  if (resourceLink) {
    const link = document.createElement('a');
    link.href = resourceLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open';
    link.className = 'resource-link-btn';
    link.style.color = '#0066cc';
    link.style.textDecoration = 'none';
    link.style.fontSize = '0.875rem';
    
    rightSection.appendChild(link);
  }

  // Assemble the item
  item.appendChild(leftSection);
  item.appendChild(rightSection);

  return item;
}

/**
 * Gets the color for a category badge
 * @param {string} category - The resource category
 * @returns {string} - A hex color code
 */
function getCategoryColor(category) {
  const colors = {
    'notes': '#4a90e2',
    'books': '#50c878',
    'equipment': '#ff9500'
  };
  return colors[category] || '#999';
}

/**
 * Capitalizes the first letter of a category name
 * @param {string} category - The category (notes, books, equipment)
 * @returns {string} - Capitalized category name
 */
function capitalizeCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Sets up the dashboard's "Add Resource" form and its submit handler
 * Allows users to quickly add resources from the dashboard
 */
function setupDashboardAddResourceForm() {
  const form = document.getElementById('dashboard-add-resource-form');
  
  if (!form) {
    console.error('Dashboard add resource form not found in DOM');
    return;
  }

  form.addEventListener('submit', handleDashboardAddResource);
  console.log('Dashboard add resource form initialized');
}

/**
 * Handles form submission for adding a new resource from the dashboard
 * @param {Event} event - The form submit event
 */
async function handleDashboardAddResource(event) {
  // Prevent default form submission
  event.preventDefault();

  // Get form inputs
  const titleInput = document.getElementById('dashboard-resource-title');
  const categorySelect = document.getElementById('dashboard-resource-category');
  const linkInput = document.getElementById('dashboard-resource-link');
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Get values and trim whitespace
  const title = titleInput.value.trim();
  const category = categorySelect.value.trim().toLowerCase();
 let link = linkInput.value.trim();

// Remove accidental "Link:" prefix if present
if (link.toLowerCase().startsWith('link:')) {
  link = link.replace(/^link:\s*/i, '');
}


  // Basic validation
  if (!title) {
    SG.showToast('Resource title is required');
    return;
  }

  if (!category) {
    SG.showToast('Please select a category');
    return;
  }

  if (title.length < 2) {
    SG.showToast('Title must be at least 2 characters');
    return;
  }

  // Validate category is one of the allowed values
  const validCategories = ['notes', 'books', 'equipment'];
  if (!validCategories.includes(category)) {
    SG.showToast('Invalid category selected');
    return;
  }

  // Disable submit button to prevent double submission
  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Adding...';

  console.log('Adding resource from dashboard:', { title, category, link });

  try {
    // Prepare resource data
    const resourceData = {
      title: title,
      category: category
    };

    // Only include link if provided
    if (link) {
      resourceData.link = link;
    }

    // Call the API to create resource
    const response = await SG.apiFetch('/resources', 'POST', resourceData);

    // Check if creation was successful
    if (response.success) {
      console.log('Resource created successfully from dashboard:', response.resource);
      SG.showToast('Resource added successfully!');

      // Clear the form
      titleInput.value = '';
      categorySelect.value = '';
      linkInput.value = '';

      // Refresh the resource list to show the new resource
      await fetchAndRenderResources();
    } else {
      // Handle backend error response
      const errorMessage = response.message || 'Failed to add resource';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error adding resource from dashboard:', error);
    
    // Show user-friendly error message
    const displayMessage = error.message.includes('validation')
      ? 'Please check your input and try again'
      : 'Failed to add resource. Please try again.';
    
    SG.showToast(displayMessage);
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

/**
 * Fetches weekly leaderboard data from the backend and renders it on the dashboard
 * Highlights the logged-in user's position in the leaderboard
 */
async function fetchAndRenderLeaderboard() {
  // Get the leaderboard list container
  const leaderboardList = document.getElementById('leaderboard-list');
  
  if (!leaderboardList) {
    console.error('Leaderboard list container not found in DOM');
    return;
  }

  // Show loading state
  leaderboardList.innerHTML = '<p class="loading-msg">Loading leaderboard...</p>';
  console.log('Fetching leaderboard from backend...');

  try {
    // Fetch leaderboard data from the backend API
    const response = await SG.apiFetch('/leaderboard/weekly', 'GET');
    
    // Check if the response is successful
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch leaderboard');
    }

    const leaderboard = response.leaderboard || [];
    console.log(`Successfully fetched ${leaderboard.length} users from leaderboard`);

    // Handle empty state - no users in leaderboard
    if (leaderboard.length === 0) {
      leaderboardList.innerHTML = '<p class="empty-msg">No leaderboard data available yet.</p>';
      return;
    }

    // Get logged-in user ID to highlight them in the leaderboard
    const currentUserId = getUserId();

    // Clear the container and render leaderboard
    leaderboardList.innerHTML = '';
    
    // Create leaderboard table/list
    const leaderboardTable = document.createElement('div');
    leaderboardTable.className = 'leaderboard-table';
    leaderboardTable.style.display = 'flex';
    leaderboardTable.style.flexDirection = 'column';
    leaderboardTable.style.gap = '0.5rem';

    // Render each user in the leaderboard
    leaderboard.forEach((user, index) => {
      const rank = index + 1;
      const isCurrentUser = currentUserId && user._id === currentUserId;
      const leaderboardRow = createLeaderboardRow(user, rank, isCurrentUser);
      leaderboardTable.appendChild(leaderboardRow);
    });

    leaderboardList.appendChild(leaderboardTable);
    console.log('Leaderboard rendered successfully on dashboard');

  } catch (error) {
    // Handle error state
    console.error('Error fetching leaderboard:', error);
    leaderboardList.innerHTML = '<p class="error-msg">Failed to load leaderboard. Please try again later.</p>';
  }
}

/**
 * Creates a leaderboard row element for a single user
 * @param {object} user - The user data object
 * @param {number} rank - The user's rank in the leaderboard
 * @param {boolean} isCurrentUser - Whether this is the logged-in user
 * @returns {HTMLElement} - The leaderboard row element
 */
function createLeaderboardRow(user, rank, isCurrentUser) {
  // Safely extract user properties with fallbacks
  const userName = user.name || 'Anonymous';
  const userXP = user.xp !== undefined ? user.xp : 0;
  const userLevel = user.level !== undefined ? user.level : 1;

  // Create the row container
  const row = document.createElement('div');
  row.className = 'leaderboard-row';
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'space-between';
  row.style.padding = '0.75rem 1rem';
  row.style.borderRadius = '0.25rem';
  row.style.transition = 'background-color 0.2s';

  // Highlight the current user with a different background color
  if (isCurrentUser) {
    row.style.backgroundColor = '#fff3cd';
    row.style.border = '2px solid #ffc107';
    row.style.fontWeight = 'bold';
  } else {
    row.style.backgroundColor = '#f9f9f9';
    row.style.border = '1px solid #e0e0e0';
  }

  // Create left section with rank and name
  const leftSection = document.createElement('div');
  leftSection.style.display = 'flex';
  leftSection.style.alignItems = 'center';
  leftSection.style.gap = '1rem';

  // Rank badge
  const rankBadge = document.createElement('span');
  rankBadge.className = 'leaderboard-rank';
  rankBadge.textContent = `#${rank}`;
  rankBadge.style.fontSize = '1.1rem';
  rankBadge.style.fontWeight = 'bold';
  rankBadge.style.minWidth = '2.5rem';
  rankBadge.style.textAlign = 'center';
  
  // Special styling for top 3
  if (rank === 1) {
    rankBadge.style.color = '#FFD700'; // Gold
  } else if (rank === 2) {
    rankBadge.style.color = '#C0C0C0'; // Silver
  } else if (rank === 3) {
    rankBadge.style.color = '#CD7F32'; // Bronze
  } else {
    rankBadge.style.color = '#666';
  }

  // User name
  const nameSpan = document.createElement('span');
  nameSpan.className = 'leaderboard-name';
  nameSpan.textContent = escapeHtml(userName);
  
  if (isCurrentUser) {
    nameSpan.textContent += ' (You)';
  }

  leftSection.appendChild(rankBadge);
  leftSection.appendChild(nameSpan);

  // Create right section with level and XP
  const rightSection = document.createElement('div');
  rightSection.style.display = 'flex';
  rightSection.style.alignItems = 'center';
  rightSection.style.gap = '1.5rem';
  rightSection.style.fontSize = '0.9rem';

  // Level
  const levelSpan = document.createElement('span');
  levelSpan.className = 'leaderboard-level';
  levelSpan.innerHTML = `<strong>Lvl:</strong> ${userLevel}`;
  levelSpan.style.color = '#555';

  // XP
  const xpSpan = document.createElement('span');
  xpSpan.className = 'leaderboard-xp';
  xpSpan.innerHTML = `<strong>XP:</strong> ${userXP}`;
  xpSpan.style.color = '#555';

  rightSection.appendChild(levelSpan);
  rightSection.appendChild(xpSpan);

  // Assemble the row
  row.appendChild(leftSection);
  row.appendChild(rightSection);

  return row;
}
