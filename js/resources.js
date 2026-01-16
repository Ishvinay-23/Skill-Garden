// Resources JS — handles rendering and creation of Notes / Books / Equipment resources
// Fetches resources from backend via GET /api/resources
// Allows authenticated users to add new resources via POST /api/resources

// Store all resources fetched from the backend
let allResources = [];

// Current active category filter
let activeCategory = 'all';

/**
 * Initializes the resources page with auth check and event listeners
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  if (!SG.isLoggedIn()) {
    console.warn('Unauthorized access attempt - redirecting to login page');
    window.location.href = '/login.html';
    return;
  }

  console.log('Resources page - user is authenticated');

  // Set year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Set up logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
      event.preventDefault();
      SG.logout();
    });
  }

  // Set up category tabs
  setupCategoryTabs();

  // Set up resource add form
  setupAddResourceForm();

  // Fetch and render resources
  fetchAndRenderResources('all');
});

/**
 * Sets up category tab click handlers
 */
function setupCategoryTabs() {
  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', function() {
      const category = this.getAttribute('data-tab');
      setActiveTab(category);
      renderResourcesByCategory(category);
    });
  });
}

/**
 * Sets the active tab and updates aria attributes
 * @param {string} category - The category to set as active
 */
function setActiveTab(category) {
  document.querySelectorAll('.tab').forEach(button => {
    const isActive = button.getAttribute('data-tab') === category;
    button.setAttribute('aria-selected', isActive);
  });
  activeCategory = category;
}

/**
 * Fetches resources from the backend and stores them globally
 * @param {string} category - The category to fetch (or 'all' for no filter)
 */
async function fetchAndRenderResources(category) {
  const container = document.getElementById('resources-list');
  
  if (!container) {
    console.error('Resources list container not found');
    return;
  }

  // Show loading state
  container.innerHTML = '<p class="loading-msg">Loading resources...</p>';
  console.log(`Fetching resources from backend...`);

  try {
    // Build query parameter if specific category requested
    let endpoint = '/resources';
    if (category !== 'all') {
      endpoint += `?category=${encodeURIComponent(category)}`;
    }

    // Fetch resources from backend
    const response = await SG.apiFetch(endpoint, 'GET');

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch resources');
    }

    const resources = response.resources || [];
    console.log(`Successfully fetched ${resources.length} resources`);

    // If not fetching all, store for current category; otherwise replace all
    if (category === 'all') {
      allResources = resources;
    }

    // Handle empty state
    if (resources.length === 0) {
      container.innerHTML = '<p class="empty-msg">No resources in this category yet.</p>';
      return;
    }

    // Clear container and render resources
    container.innerHTML = '';
    resources.forEach(resource => {
      const card = createResourceCard(resource);
      container.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    container.innerHTML = '<p class="error-msg">Failed to load resources. Please try again later.</p>';
  }
}

/**
 * Renders resources filtered by the specified category
 * @param {string} category - The category to filter by ('all' shows all)
 */
function renderResourcesByCategory(category) {
  const container = document.getElementById('resources-list');
  
  if (!container) {
    console.error('Resources list container not found');
    return;
  }

  // Filter resources based on category
  let filteredResources;
  if (category === 'all') {
    filteredResources = allResources;
  } else {
    filteredResources = allResources.filter(r => r.category === category);
  }

  console.log(`Rendering ${filteredResources.length} resources for category: ${category}`);

  // Handle empty state
  if (filteredResources.length === 0) {
    container.innerHTML = '<p class="empty-msg">No resources in this category yet.</p>';
    return;
  }

  // Clear and render filtered resources
  container.innerHTML = '';
  filteredResources.forEach(resource => {
    const card = createResourceCard(resource);
    container.appendChild(card);
  });
}

/**
 * Creates a resource card DOM element
 * @param {object} resource - The resource data object
 * @returns {HTMLElement} - The resource card element
 */
function createResourceCard(resource) {
  const card = document.createElement('article');
  card.className = 'card resource-card';
  card.setAttribute('data-id', resource._id);

  // Title
  const title = document.createElement('h3');
  title.textContent = escapeHtml(resource.title);
  card.appendChild(title);

  // Category badge
  const categoryBadge = document.createElement('span');
  categoryBadge.className = `category-badge category-${resource.category}`;
  categoryBadge.textContent = capitalizeCategory(resource.category);
  card.appendChild(categoryBadge);

  // Description (if available)
  if (resource.description) {
    const desc = document.createElement('p');
    desc.className = 'resource-description';
    desc.textContent = escapeHtml(resource.description);
    card.appendChild(desc);
  }

  // Link (if available)
  if (resource.link && resource.link !== '#') {
    const linkContainer = document.createElement('div');
    linkContainer.className = 'resource-link';
    
    const linkEl = document.createElement('a');
    linkEl.href = resource.link;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
    linkEl.textContent = 'Open Resource';
    linkEl.className = 'btn';
    
    linkContainer.appendChild(linkEl);
    card.appendChild(linkContainer);
  }

  return card;
}

/**
 * Sets up the "Add Resource" form and its submit handler
 */
function setupAddResourceForm() {
  const form = document.getElementById('add-resource-form');
  
  if (!form) {
    console.error('Add resource form not found');
    return;
  }

  form.addEventListener('submit', handleAddResource);
  console.log('Add resource form initialized');
}

/**
 * Handles form submission for adding a new resource
 * @param {Event} event - The form submit event
 */
async function handleAddResource(event) {
  event.preventDefault();

  const titleInput = document.getElementById('resource-title');
  const categorySelect = document.getElementById('resource-category');
  const linkInput = document.getElementById('resource-link');
  const descriptionInput = document.getElementById('resource-description');
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Get and validate form values
  const title = titleInput.value.trim();
  const category = categorySelect.value.trim();
  const link = linkInput.value.trim();
  const description = descriptionInput.value.trim();

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

  // Disable button to prevent double submission
  submitButton.disabled = true;
  submitButton.textContent = 'Adding...';

  console.log('Adding resource:', { title, category, link, description });

  try {
    // Prepare resource data
    const resourceData = {
      title: title,
      category: category,
      description: description
    };

    // Only include link if provided
    if (link) {
      resourceData.link = link;
    }

    // Call API to create resource
    const response = await SG.apiFetch('/resources', 'POST', resourceData);

    if (response.success) {
      console.log('Resource created successfully:', response.resource);
      SG.showToast('Resource added successfully!');

      // Clear the form
      titleInput.value = '';
      categorySelect.value = '';
      linkInput.value = '';
      descriptionInput.value = '';

      // Refresh the resource list
      await fetchAndRenderResources('all');
      
      // Reset tab to 'all' to see new resource
      setActiveTab('all');
      renderResourcesByCategory('all');
    } else {
      throw new Error(response.message || 'Failed to add resource');
    }
  } catch (error) {
    console.error('Error adding resource:', error);
    SG.showToast('Failed to add resource. Please try again.');
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = 'Add Resource';
  }
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Capitalizes the first letter of a category name
 * @param {string} category - The category (notes, books, equipment)
 * @returns {string} - Capitalized category name
 */
function capitalizeCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
