// Team Finder JS
// Handles tabbing, fetching mock teams, and join actions

const mockTeams = [
  { id: 1, name: 'Frontend Sprouts', members: 3, needs: 2, tags: ['HTML','CSS'], status: 'Need Members' },
  { id: 2, name: 'Bug Busters', members: 5, needs: 1, tags: ['Debugging','JS'], status: 'Join Team' },
  { id: 3, name: 'DSA Garden', members: 10, needs: 0, tags: ['Algorithms'], status: 'Join Team' },
  { id: 4, name: 'UI Tenders', members: 2, needs: 3, tags: ['Design','UX'], status: 'Need Members' }
];

function fetchTeams(){
  // Mocked API function — returns a Promise resolving to teams
  return new Promise(resolve => setTimeout(()=> resolve(mockTeams), 150));
}

function createTeamCard(team){
  const name = el('strong', { text: team.name });
  const tags = el('div', { class: 'meta' }, []);
  team.tags.forEach(t => tags.appendChild(el('span', { class: 'tag', text: t })));
  const members = el('div', { class: 'meta', text: `${team.members} members • needs ${team.needs}` });
  const btn = el('button', { class: 'btn', text: team.status === 'Need Members' ? 'Join Team' : 'Request' });

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'Requested';
    SG.showToast(`Requested to join ${team.name}`);
  });

  const card = createCard(team.name, [tags, members], btn);
  return card;
}

// Use shared SG.el helper
function el(tag, attrs={}, children=[]){
  return SG.el(tag, attrs, children);
}

// Use shared SG.createCard helper
function createCard(title, bodyNodes=[], footerNode=null){
  return SG.createCard(title, bodyNodes, footerNode);
}

// Use shared SG.showToast helper
// Using SG.showToast from js/config.js

function setActiveTab(name){
  document.querySelectorAll('.tab').forEach(b => {
    const sel = b.getAttribute('data-tab') === name;
    b.setAttribute('aria-selected', sel);
  });
}

function renderList(filter){
  const container = document.getElementById('tab-content');
  container.innerHTML = '';
  fetchTeams().then(teams => {
    let list = teams;
    if(filter === 'need') list = teams.filter(t => t.status === 'Need Members');
    if(filter === 'join') list = teams.filter(t => t.status === 'Join Team');
    list.forEach(t => container.appendChild(createTeamCard(t)));
  });
}

function init(){
  document.getElementById('year').textContent = new Date().getFullYear();

  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      setActiveTab(tab);
      renderList(tab);
    });
  });

  // initialize default
  setActiveTab('need');
  renderList('need');
}

document.addEventListener('DOMContentLoaded', init);