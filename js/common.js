(function () {
  const STORAGE_KEYS = {
    THEME: 'cm_theme',
    SETTINGS: 'cm_settings',
    SESSION: 'cm_session',
    FAVORITES: 'cm_favorites',
    ACTIVITY: 'cm_activity',
    SEARCH_HISTORY: 'cm_search'
  };

  function renderTopbar(containerId = 'topbar-container') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <header class="topbar">
        <button class="menu-toggle" type="button" aria-label="Toggle sidebar">☰</button>
        <div><h2>Country Hub</h2></div>
        <div class="topbar-actions">
          <button id="themeToggle" class="icon-button" title="Toggle theme">🌙</button>
          <button id="goDashboard" class="secondary-button">Dashboard</button>
          <button id="logoutBtn" class="secondary-button">Logout</button>
        </div>
      </header>
    `;
  }

  function renderSidebar(containerId = 'sidebar-container') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <aside class="sidebar" aria-label="Primary navigation">
        <div class="brand">
          <div class="brand-mark">CM</div>
          <h1>Country Hub</h1>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item" href="index.html">Dashboard</a>
          <a class="nav-item" href="countries.html">Countries</a>
          <a class="nav-item" href="analytics.html">Analytics</a>
          <a class="nav-item" href="favorites.html">Favorites</a>
          <a class="nav-item" href="settings.html">Settings</a>
          <a class="nav-item" href="help.html">Help</a>
        </nav>
      </aside>
    `;
  }

  function initTheme() {
    const t = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', t);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = t === 'light' ? '🌙' : '☀️';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEYS.THEME, next);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = next === 'light' ? '🌙' : '☀️';
  }

  function setUpShell() {
    renderTopbar();
    renderSidebar();
    initTheme();
    // wire global buttons
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('goDashboard')?.addEventListener('click', () => (location.href = 'index.html'));
    document.querySelectorAll('.nav-item').forEach((a) => {
      if (a.href && a.href.endsWith(location.pathname.split('/').pop())) a.classList.add('active');
    });
  }

  function login(username, role, persist = true) {
    const session = { username: username || 'guest', role: role || 'User', loggedAt: Date.now() };
    if (persist) localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    else sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    addActivity('login', `${session.username} logged in as ${session.role}`);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    addActivity('logout', 'User logged out');
    location.href = 'login.html';
  }

  function currentSession() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SESSION) || localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
  }

  function requireAuth(allowAnonymous = false) {
    const s = currentSession();
    if (!s && !allowAnonymous) {
      location.href = 'login.html';
      return false;
    }
    return true;
  }

  function favorites() {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  function saveFavorites(list) { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list)); }

  function isFavorite(id) { return favorites().includes(String(id)); }

  function addFavorite(id) {
    const list = favorites();
    if (!list.includes(String(id))) {
      list.push(String(id));
      saveFavorites(list);
      addActivity('favorite', `Favorited ${id}`);
    }
  }

  function removeFavorite(id) {
    const list = favorites().filter((x) => x !== String(id));
    saveFavorites(list);
    addActivity('unfavorite', `Unfavorited ${id}`);
  }

  function addActivity(type, message) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
    items.unshift({ type, message, time: Date.now() });
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(items.slice(0, 50)));
  }

  function getActivity() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]'); }

  function addSearch(term) {
    if (!term) return;
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]');
    const normalized = term.trim().toLowerCase();
    const filtered = items.filter((s) => s !== normalized);
    filtered.unshift(normalized);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(filtered.slice(0, 5)));
  }

  function getSearchHistory() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]'); }

  function exportCountries() {
    try {
      const data = JSON.stringify(window.CountryStorage.getCountries(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `countries-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addActivity('export', 'Exported countries');
    } catch (e) { /* silent fail on export */ }
  }

  function importCountriesFile(file, onComplete) {
    if (!file) return onComplete && onComplete('No file');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) return onComplete && onComplete('Invalid format');
        // normalize via CountryStorage.normalizeCollection if exists
        const normalized = window.CountryStorage && window.CountryStorage.getCountries ? data : data;
        // dedupe by name
        const existing = window.CountryStorage.getCountries();
        const existingNames = new Set(existing.map((c) => c.countryName.toLowerCase()));
        let imported = 0, skipped = 0;
        for (const item of normalized) {
          if (!item.countryName) { skipped++; continue; }
          if (existingNames.has(item.countryName.toLowerCase())) { skipped++; continue; }
          existing.push(item);
          existingNames.add(item.countryName.toLowerCase());
          imported++;
        }
        window.CountryStorage.saveCountries(existing);
        addActivity('import', `Imported ${imported} countries (${skipped} skipped)`);
        onComplete && onComplete(null, { imported, skipped });
      } catch (err) {
        onComplete && onComplete('Failed to parse JSON');
      }
    };
    reader.onerror = () => onComplete && onComplete('Failed to read file');
    reader.readAsText(file);
  }

  function parseQuery(name) {
    const params = new URLSearchParams(location.search);
    return params.get(name);
  }

  window.Common = {
    setUpShell,
    requireAuth,
    login,
    logout,
    currentSession,
    favorites: { list: favorites, add: addFavorite, remove: removeFavorite, has: isFavorite },
    activity: { list: getActivity, add: addActivity },
    search: { add: addSearch, list: getSearchHistory },
    exportCountries,
    importCountriesFile,
    parseQuery
  };
})();
