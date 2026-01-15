// Global config and helpers for Skill Garden
// This file exposes a small global `SG` object with utility helpers used across pages.
// It intentionally avoids modules for simple static hosting; when migrating to bundlers this can be converted.

window.SG = window.SG || {};

// Simple element creator: tag, attributes, children
SG.el = function(tag, attrs={}, children=[]){
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if(k === 'class') node.className = v;
    else if(k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if(!c) return; if(typeof c === 'string') node.appendChild(document.createTextNode(c)); else node.appendChild(c);
  });
  return node;
};

// Reusable card creator to keep markup consistent
SG.createCard = function(title, bodyNodes=[], footerNode=null){
  const card = SG.el('article', { class: 'card' }, []);
  if(title) card.appendChild(SG.el('h3', { text: title }));
  const body = SG.el('div', { class: 'card-body' }, []);
  (Array.isArray(bodyNodes) ? bodyNodes : [bodyNodes]).forEach(n => body.appendChild(n));
  card.appendChild(body);
  if(footerNode) card.appendChild(SG.el('div', { class: 'card-footer' }, [footerNode]));
  return card;
};

// Small non-intrusive toast used by pages
SG.showToast = function(msg, opts = {}){
  let toast = document.getElementById('simple-toast');
  if(!toast){
    toast = SG.el('div', { id: 'simple-toast', class: 'card' }, []);
    toast.style.position = 'fixed';
    toast.style.right = '1rem';
    toast.style.bottom = '1rem';
    toast.style.zIndex = 9999;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  // allow option to change duration
  const duration = typeof opts.duration === 'number' ? opts.duration : 1800;
  setTimeout(()=>{ toast.style.opacity = '0'; }, duration);
};

// Export a small helper to attach if needed (no-op for now)
SG.config = {
  theme: 'green',
};
