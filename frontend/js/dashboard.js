// Dashboard JS — handles rendering, interactions, and mock data
// All API calls are mocked as Promise-returning functions so they can be swapped later.

// Mock data
const mockUser = {
  id: 1,
  name: 'Ava Green',
  level: 7,
  xp: 1420,
  nextLevelXP: 1800
};

const mockDailyChallenge = {
  id: 101,
  title: 'Optimize Sorting Routine',
  type: 'Speed Run',
  description: 'Refactor and optimize a sorting routine for large inputs under time limits.',
  rewardXP: 150
};

const mockTeams = [
  { id: 1, name: 'Frontend Sprouts', members: 3, needs: 2, tags: ['HTML','CSS'], status: 'Need Members' },
  { id: 2, name: 'Bug Busters', members: 5, needs: 1, tags: ['Debugging','JS'], status: 'Join Team' },
  { id: 3, name: 'DSA Garden', members: 10, needs: 0, tags: ['Algorithms'], status: 'Join Team' }
];

// Simulated API functions (replace with real backend later)
function fetchDashboardData(){
  return new Promise(resolve => {
    setTimeout(() => resolve({ user: mockUser, challenge: mockDailyChallenge, teams: mockTeams }), 250);
  });
}

function fetchTeams(){
  // Example fetch function to be replaced with a real API call
  return new Promise(resolve => setTimeout(()=> resolve(mockTeams), 200));
}

// Render helpers
// Use shared SG.el helper from js/config.js
function el(tag, attrs={}, children=[]){
  return SG.el(tag, attrs, children);
}

function formatXP(user){
  const percent = Math.min(100, Math.round((user.xp / user.nextLevelXP) * 100));
  return {
    percent,
    text: `${user.level} • ${user.xp}/${user.nextLevelXP} XP`
  };
}

// Use shared SG.createCard helper
function createCard(title, bodyNodes=[], footerNode=null){
  return SG.createCard(title, bodyNodes, footerNode);
}

// Renderers
function renderXPCard(user){
  const container = document.getElementById('xp-card');
  container.innerHTML = '';

  const info = formatXP(user);
  const title = el('div', { class: 'meta', text: info.text });
  const xpWrap = el('div', { class: 'xp-wrap', role: 'progressbar', 'aria-valuenow': info.percent, 'aria-valuemin': 0, 'aria-valuemax': 100 }, []);
  const xpFill = el('div', { class: 'xp-fill' }, []);
  xpWrap.appendChild(xpFill);

  const levelBadge = el('div', { class: 'tag', text: `Level ${user.level}` });

  container.appendChild(levelBadge);
  container.appendChild(title);
  container.appendChild(xpWrap);

  // Animate fill
  requestAnimationFrame(() => {
    xpFill.style.width = info.percent + '%';
  });
}

function renderDailyChallenge(challenge){
  const container = document.getElementById('daily-challenge');
  container.innerHTML = '';

  const title = el('p', { class: 'meta', text: `${challenge.type} — ${challenge.rewardXP} XP` });
  const desc = el('p', { text: challenge.description });
  const startBtn = el('button', { class: 'btn', text: 'Start Challenge', 'aria-label': 'Start challenge' });

  startBtn.addEventListener('click', () => {
    // TODO: integrate with challenge/session API later
    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';
    setTimeout(()=>{
      startBtn.textContent = 'In Progress';
      SG.showToast(`Challenge started: ${challenge.title}`);
    }, 600);
  });

  const card = createCard(challenge.title, [title, desc], startBtn);
  container.appendChild(card);
}

function renderRecommendedTeams(teams){
  const list = document.getElementById('teams-list');
  list.innerHTML = '';

  teams.forEach(team => {
    const tagRow = el('div', { class: 'meta' }, []);
    team.tags.forEach(t => tagRow.appendChild(el('span', { class: 'tag', text: t })));

    const members = el('div', { class: 'meta', text: `${team.members} members` });
    const joinBtn = el('button', { class: 'btn secondary', text: team.status === 'Need Members' ? 'Join Team' : 'Request to Join' });

    joinBtn.addEventListener('click', () => {
      // TODO: call joinTeam(team.id) API
      joinBtn.disabled = true;
      joinBtn.textContent = 'Joined';
      SG.showToast(`Joined ${team.name}`);
    });

    const card = createCard(team.name, [tagRow, members], joinBtn);
    list.appendChild(card);
  });
}

// Use SG.showToast directly (provided by js/config.js)

// Initialization
function init(){
  document.getElementById('year').textContent = new Date().getFullYear();

  // Fetch and populate dashboard data
  fetchDashboardData().then(({ user, challenge, teams }) => {
    renderXPCard(user);
    renderDailyChallenge(challenge);
    renderRecommendedTeams(teams);
  }).catch(err => {
    console.error('Failed to load dashboard data', err);
    showToast('Failed to load dashboard.');
  });

  // Additional event wiring (kept minimal here for clarity)
}

// Wait for DOM ready
document.addEventListener('DOMContentLoaded', init);