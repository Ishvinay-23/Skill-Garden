// Leaderboard JS — renders weekly leaderboard, supports sorting
// All backend calls are abstracted as Promise-returning functions for easy replacement later

const mockLeaderboard = [
  { id: 1, name: 'Ava Green', team: 'Frontend Sprouts', xp: 1760 },
  { id: 2, name: 'Diego Park', team: 'Bug Busters', xp: 1890 },
  { id: 3, name: 'Lina Shen', team: 'DSA Garden', xp: 2100 },
  { id: 4, name: 'Maya Singh', team: 'UI Tenders', xp: 1250 },
  { id: 5, name: 'Tom Rivers', team: 'Backend Bloom', xp: 980 }
];

function fetchLeaderboard(){
  // Mock API: will be replaced by real fetchLeaderboard() later
  return new Promise(resolve => setTimeout(()=> resolve(mockLeaderboard.slice()), 180));
}

// Use shared SG.el helper
function el(tag, attrs={}, children=[]){
  return SG.el(tag, attrs, children);
}

function sortList(list, mode){
  const copy = list.slice();
  if(mode === 'xp_desc') return copy.sort((a,b)=> b.xp - a.xp);
  if(mode === 'xp_asc') return copy.sort((a,b)=> a.xp - b.xp);
  if(mode === 'name_asc') return copy.sort((a,b)=> a.name.localeCompare(b.name));
  return copy;
}

function renderAsCards(list){
  const container = document.getElementById('leaderboard-container');
  container.innerHTML = '';
  list.forEach((p, idx) => {
    const item = el('div', { class: 'leader-item' }, []);
    item.appendChild(el('div', { class: 'leader-rank', text: `#${idx+1}` }));
    const meta = el('div', { class: 'leader-meta' }, []);
    meta.appendChild(el('div', { class: 'leader-name', text: p.name }));
    meta.appendChild(el('div', { class: 'leader-team', text: p.team }));
    item.appendChild(meta);
    item.appendChild(el('div', { class: 'leader-xp', text: `${p.xp} XP` }));
    container.appendChild(item);
  });
}

function renderAsTable(list){
  const container = document.getElementById('leaderboard-container');
  container.innerHTML = '';
  const table = el('table', { class: 'leader-table' }, []);
  const thead = el('thead', {}, []);
  const headRow = el('tr', {}, []);
  headRow.appendChild(el('th', { text: 'Rank' }));
  headRow.appendChild(el('th', { text: 'Name' }));
  headRow.appendChild(el('th', { text: 'Team' }));
  headRow.appendChild(el('th', { text: 'XP' }));
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody', {}, []);
  list.forEach((p, idx) => {
    const tr = el('tr', {}, []);
    tr.appendChild(el('td', { text: `#${idx+1}` }));
    tr.appendChild(el('td', { text: p.name }));
    tr.appendChild(el('td', { text: p.team }));
    tr.appendChild(el('td', { text: p.xp + ' XP' }));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function render(list){
  // responsive: on narrow screens use cards; wider screens show table
  if(window.innerWidth >= 800) renderAsTable(list);
  else renderAsCards(list);
}

function init(){
  document.getElementById('year').textContent = new Date().getFullYear();

  const select = document.getElementById('sort-select');
  let currentMode = select.value;

  function refresh(){
    fetchLeaderboard().then(raw => {
      const sorted = sortList(raw, currentMode);
      render(sorted);
    }).catch(err => console.error('Failed to load leaderboard', err));
  }

  select.addEventListener('change', (e) => {
    currentMode = e.target.value;
    refresh();
  });

  // re-render on resize to switch between card/table
  window.addEventListener('resize', () => fetchLeaderboard().then(raw => render(sortList(raw, currentMode))));

  // initial load
  refresh();
}

document.addEventListener('DOMContentLoaded', () => {
  // Route protection ensures only authenticated users can access the leaderboard
  if (!SG.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  init();
});
