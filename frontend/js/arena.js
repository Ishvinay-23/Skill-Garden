// Arena JS — mock data, renderers, and challenge start behavior
// All server interactions should use the fetch-like functions below so they can be replaced later.

const mockArenaChallenges = [
  { id: 201, title: 'Optimize Sorting Routine', type: 'Speed Run', description: 'Improve runtime and memory for large inputs within 10 minutes.', difficulty: 'Hard', rewardXP: 200 },
  { id: 202, title: 'Fix Unit Tests', type: 'Bug Hunt', description: 'Identify and fix failing tests in a small codebase.', difficulty: 'Medium', rewardXP: 120 },
  { id: 203, title: 'Tiny Algorithms', type: 'Speed Run', description: 'Solve micro-algorithm tasks under time pressure.', difficulty: 'Medium', rewardXP: 100 }
];

function fetchArenaChallenge(type){
  // Mock API: returns a Promise resolving to a challenge for the given type.
  return new Promise((resolve) => {
    setTimeout(() => {
      const candidates = mockArenaChallenges.filter(c => c.type === type);
      resolve(candidates[Math.floor(Math.random() * candidates.length)]);
    }, 180);
  });
}

function startChallenge(challengeId){
  // Mock starting a challenge: in future, call startArenaChallenge(challengeId) -> returns session info
  return new Promise((resolve) => {
    setTimeout(() => resolve({ sessionId: 'sess_' + Date.now(), challengeId }), 400);
  });
}

// Use shared SG.el helper
function el(tag, attrs={}, children=[]){
  return SG.el(tag, attrs, children);
}

// Using SG.showToast from js/config.js

function renderChallenge(challenge){
  const container = document.getElementById('arena-challenge');
  container.innerHTML = '';

  const metaRow = el('div', { class: 'challenge-meta' }, []);
  metaRow.appendChild(el('div', { class: 'tag', text: challenge.type }));
  metaRow.appendChild(el('div', { class: 'meta', text: `${challenge.difficulty} • ${challenge.rewardXP} XP` }));

  const desc = el('p', { class: 'challenge-desc', text: challenge.description });
  const startBtn = el('button', { class: 'btn start-btn important', text: 'Start Challenge' });

  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';
    startChallenge(challenge.id).then(session => {
      startBtn.textContent = 'In Progress';
      SG.showToast(`Challenge started — session ${session.sessionId}`);
      // TODO: navigate to live challenge session page/modal when backend is ready
    }).catch(err => {
      console.error('Failed to start challenge', err);
      SG.showToast('Failed to start challenge');
      startBtn.disabled = false;
      startBtn.textContent = 'Start Challenge';
    });
  });

  const card = el('article', { class: 'card' }, []);
  card.appendChild(el('h3', { text: challenge.title }));
  card.appendChild(metaRow);
  card.appendChild(desc);
  card.appendChild(startBtn);

  container.appendChild(card);
}

function setActiveType(type){
  document.querySelectorAll('.type').forEach(b => {
    const sel = b.getAttribute('data-type') === type;
    b.setAttribute('aria-selected', sel);
  });
}

function init(){
  document.getElementById('year').textContent = new Date().getFullYear();

  // Wire up challenge type buttons
  document.querySelectorAll('.type').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      setActiveType(type);
      fetchArenaChallenge(type).then(renderChallenge);
    });
  });

  // load default
  const defaultType = document.querySelector('.type[aria-selected="true"]')?.getAttribute('data-type') || 'Speed Run';
  setActiveType(defaultType);
  fetchArenaChallenge(defaultType).then(renderChallenge);
}

document.addEventListener('DOMContentLoaded', init);
