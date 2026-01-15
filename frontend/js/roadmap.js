// Roadmap JS — renders roadmap cards and controls progress
// Mock data and Promise-based getters for easy backend swap

const mockRoadmaps = [
  { id: 'c', name: 'C Programming', description: 'Systems-level programming fundamentals and memory management.', percent: 42, topics: ['Pointers','Memory','IO'] },
  { id: 'python', name: 'Python', description: 'Scripting, data, and fast prototyping.', percent: 68, topics: ['Basics','Data Structures','Web'] },
  { id: 'dsa', name: 'DSA', description: 'Algorithms & Data Structures for interviews and performance.', percent: 31, topics: ['Arrays','Graphs','DP'] }
];

function fetchRoadmaps(){
  // Replace with real API fetchRoadmaps() later
  return new Promise(resolve => setTimeout(()=> resolve(mockRoadmaps), 180));
}

// Use shared SG.el helper
function el(tag, attrs={}, children=[]){
  return SG.el(tag, attrs, children);
}

function createRoadmapCard(r){
  const card = el('article', { class: 'card roadmap-card', 'data-id': r.id });
  card.appendChild(el('h3', { text: r.name }));
  card.appendChild(el('p', { class: 'meta', text: r.description }));

  // topics/tags
  const topics = el('div', { class: 'roadmap-topics' }, []);
  r.topics.forEach(t => topics.appendChild(el('span', { class: 'tag', text: t })));
  card.appendChild(topics);

  // progress row
  const progressRow = el('div', { class: 'progress-row' }, []);
  const meta = el('div', { class: 'progress-meta', text: r.percent + '%' });
  const bar = el('div', { class: 'progress-bar', role: 'progressbar', 'aria-valuemin':'0', 'aria-valuemax':'100', 'aria-valuenow': r.percent }, []);
  const fill = el('div', { class: 'progress-fill' }, []);
  bar.appendChild(fill);
  progressRow.appendChild(meta);
  progressRow.appendChild(bar);
  card.appendChild(progressRow);

  // controls to simulate progress
  const controls = el('div', { class: 'card-controls' }, []);
  const practice = el('button', { class: 'btn', text: 'Practice +5%' });
  const reset = el('button', { class: 'btn secondary', text: 'Reset' });

  practice.addEventListener('click', () => {
    // In future, call an API: updateRoadmapProgress(r.id, delta)
    r.percent = Math.min(100, r.percent + 5);
    meta.textContent = r.percent + '%';
    bar.setAttribute('aria-valuenow', r.percent);
    requestAnimationFrame(()=> fill.style.width = r.percent + '%');
  });

  reset.addEventListener('click', () => {
    r.percent = 0;
    meta.textContent = r.percent + '%';
    bar.setAttribute('aria-valuenow', r.percent);
    requestAnimationFrame(()=> fill.style.width = r.percent + '%');
  });

  controls.appendChild(practice);
  controls.appendChild(reset);
  card.appendChild(controls);

  // init animated width
  requestAnimationFrame(()=> fill.style.width = r.percent + '%');
  return card;
}

function renderRoadmaps(list){
  const container = document.getElementById('roadmaps');
  container.innerHTML = '';
  list.forEach(r => container.appendChild(createRoadmapCard(r)));
}

function init(){
  document.getElementById('year').textContent = new Date().getFullYear();

  fetchRoadmaps().then(roadmaps => {
    renderRoadmaps(roadmaps);
  }).catch(err => {
    console.error('Failed to load roadmaps', err);
  });
}

document.addEventListener('DOMContentLoaded', init);
