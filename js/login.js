(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    // If already logged in, redirect
    if (window.Common && window.Common.currentSession && window.Common.currentSession()) { location.href='index.html'; return; }
    const form = document.getElementById('loginForm');
    const toggle = document.getElementById('togglePass');
    toggle?.addEventListener('click', ()=>{
      const p = document.getElementById('password'); p.type = p.type === 'password' ? 'text' : 'password'; toggle.textContent = p.type === 'password' ? 'Show' : 'Hide';
    });
    form?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      const r = document.getElementById('role').value;
      if (!u || !p) { document.getElementById('loginError').textContent = 'Enter username and password'; return; }
      // fake auth - store in sessionStorage
      window.Common.login(u, r, false);
      location.href = 'index.html';
    });
  });
})();
