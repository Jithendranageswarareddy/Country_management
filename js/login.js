(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    // If already logged in, redirect
    if (window.Common && window.Common.currentSession && window.Common.currentSession()) { location.href='index.html'; return; }
    const form = document.getElementById('loginForm');
    const toggle = document.getElementById('togglePass');
    const passwordInput = document.getElementById('password');
    const credentials = {
      admin: { password: 'admin123', role: 'Admin' },
      user: { password: 'user123', role: 'User' }
    };
    
    // Password visibility toggle
    toggle?.addEventListener('click', (e)=>{
      e.preventDefault();
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggle.classList.toggle('visible', !isPassword);
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
        error.textContent = 'Invalid credentials. Use admin / admin123 or user / user123';
        return;
      }

      // Auto-detect role from credentials
      window.Common.login(userKey, record.role, false);
      error.textContent = '';
      location.href = 'index.html';
    });
  });
})();
