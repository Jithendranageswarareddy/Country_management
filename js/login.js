(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    // If already logged in, redirect
    if (window.Common && window.Common.currentSession && window.Common.currentSession()) { location.href='index.html'; return; }
    const form = document.getElementById('loginForm');
    const toggle = document.getElementById('togglePass');
    const credentials = {
      admin: { password: 'admin123', role: 'Admin' },
      user: { password: 'user123', role: 'User' }
    };
    toggle?.addEventListener('click', ()=>{
      const p = document.getElementById('password'); p.type = p.type === 'password' ? 'text' : 'password'; toggle.textContent = p.type === 'password' ? 'Show' : 'Hide';
    });
    form?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      const error = document.getElementById('loginError');
      const userKey = u.toLowerCase();
      const record = credentials[userKey];

      if (!u || !p) {
        error.textContent = 'Enter username and password';
        return;
      }

      if (!record || record.password !== p) {
        error.textContent = 'Invalid credentials. Use admin/admin123 or user/user123.';
        return;
      }

      window.Common.login(userKey, record.role, false);
      error.textContent = '';
      location.href = 'index.html';
    });
  });
})();
