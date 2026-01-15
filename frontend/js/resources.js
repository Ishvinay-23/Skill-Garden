// Resources JS — handles rendering Notes / Books / Equipment from mock data
// All server interactions are represented as Promise-returning functions so they can be replaced easily.

const mockResources = {
  notes: [
    { id: 'n1', title: 'JS Event Loop Cheat Sheet', description: 'Concise notes on the event loop and microtasks/macrotasks.', tags: ['JS', 'Concurrency'], link: '#' },
    { id: 'n2', title: 'CSS Layouts Tips', description: 'Practical patterns for flexbox and grid in real apps.', tags: ['CSS','Layout'], link: '#' }
  ],
  books: [
    { id: 'b1', title: 'Clean Code', description: 'A handbook of agile software craftsmanship.', author: 'Robert C. Martin', tags: ['Best Practices'], link: '#' },
    { id: 'b2', title: 'Introduction to Algorithms', description: 'Comprehensive algorithms reference (CLRS).', author: 'Cormen et al.', tags: ['Algorithms'], link: '#' }
  ],
  equipment: [
    { id: 'e1', title: 'Mechanical Keyboard Guide', description: 'Choosing switches, layout, and keycaps for comfort and speed.', tags: ['Hardware'], link: '#' },
    { id: 'e2', title: 'Useful Monitoring Tools', description: 'Tools for profiling CPU and memory during development.', tags: ['Tools','DevOps'], link: '#' }
  ]
};

function fetchResources(category){
  // Mocked API call that returns resources for a given category
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if(mockResources[category]) resolve(mockResources[category]);
      else reject(new Error('Unknown category'));
    }, 150);
  });
}

// Use shared SG.el helper
function el(tag, attrs={}, children=[]){
  return SG.el(tag, attrs, children);
}

function createResourceCard(r, category){
  const card = el('article', { class: 'card resource-card', 'data-id': r.id });
  card.appendChild(el('h3', { text: r.title }));
  const meta = el('div', { class: 'resource-meta' }, []);
  const left = el('div', { class: 'resource-left' }, []);
  if(r.author) left.appendChild(el('div', { class: 'meta', text: r.author }));
  if(r.tags) {
    const tags = el('div', { class: 'meta' }, []);
    r.tags.forEach(t => tags.appendChild(el('span', { class: 'tag', text: t })));
    left.appendChild(tags);
  }
  meta.appendChild(left);
  meta.appendChild(el('div', { class: 'meta', text: category }));
  card.appendChild(meta);

  card.appendChild(el('p', { class: 'resource-desc', text: r.description }));

  const actions = el('div', { class: 'resource-actions' }, []);
  const open = el('a', { class: 'btn', text: 'Open', href: r.link, target: '_blank', rel: 'noopener' });
  const save = el('button', { class: 'btn secondary', text: 'Save' });

  save.addEventListener('click', () => {
    save.disabled = true;
    save.textContent = 'Saved';
    SG.showToast(`Saved: ${r.title}`);
    // TODO: call saveResource(r.id) backend API when ready
  });

  actions.appendChild(open);
  actions.appendChild(save);
  card.appendChild(actions);
  return card;
}

// Use shared SG.showToast helper
// Using SG.showToast from js/config.js

function setActiveTab(name){
  document.querySelectorAll('.tab').forEach(b => {
    const sel = b.getAttribute('data-tab') === name;
    b.setAttribute('aria-selected', sel);
  });
}

function renderCategory(name){
  const container = document.getElementById('resources-list');
  container.innerHTML = '';
  fetchResources(name).then(items => {
    if(items.length === 0) container.appendChild(el('p', { text: 'No resources yet.' }));
    items.forEach(i => container.appendChild(createResourceCard(i, name)));
  }).catch(err => {
    container.appendChild(el('p', { text: 'Failed to load resources.' }));
    console.error('fetchResources error', err);
  });
}

function init(){
  document.getElementById('year').textContent = new Date().getFullYear();

  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      setActiveTab(tab);
      renderCategory(tab);
    });
  });

  // default
  setActiveTab('notes');
  renderCategory('notes');
}

document.addEventListener('DOMContentLoaded', init);
