(function () {
  function cache() {
    return {
      body: document.getElementById('countryTableBody'),
      search: document.getElementById('searchInput'),
      filter: document.getElementById('continentFilter'),
      empty: document.getElementById('emptyState'),
      toggleView: document.getElementById('toggleView'),
      cardView: document.getElementById('cardView'),
      tableView: document.getElementById('tableView'),
      importInput: document.getElementById('importFileInput'),
      exportBtn: document.getElementById('exportButton'),
      importBtn: document.getElementById('importButton')
    };
  }

  let allCountries = [];
  let sortBy = null;
  let sortDir = 'asc';

  function renderTable(countries) {
    const tbody = document.getElementById('countryTableBody');
    if (!tbody) return;
    tbody.replaceChildren();
    countries.forEach((country) => tbody.appendChild(createRow(country)));
  }

  function createRow(country) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="flag-wrap"><img class="flag-image" src="${country.flagURL}" alt="${country.countryName} flag"/></div></td>
      <td class="country-name">${country.countryName}</td>
      <td>${country.capital}</td>
      <td>${window.CountryUI.formatPopulation(country.population)}</td>
      <td>${country.currency}</td>
      <td>${country.continent}</td>
      <td>
        <div class="action-group">
          <button class="action-button" data-action="view" data-id="${country.id}">View</button>
          <a class="action-button" href="country-details.html?id=${country.id}">Edit</a>
          <button class="action-button danger" data-action="delete" data-id="${country.id}">Delete</button>
          <button class="action-button" data-action="fav" data-id="${country.id}">${window.Common.favorites.has(country.id) ? 'Unfav' : 'Fav'}</button>
        </div>
      </td>
    `;
    return tr;
  }

  function renderCards(countries) {
    const grid = document.getElementById('cardView');
    grid.replaceChildren();
    countries.forEach((c) => {
      const card = document.createElement('article');
      card.className = 'stat-card';
      card.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;">
          <div class="flag-wrap" style="width:72px;height:48px"><img class="flag-image" src="${c.flagURL}"/></div>
          <div>
            <strong>${c.countryName}</strong>
            <div>${c.capital} • ${c.continent}</div>
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          <a class="secondary-button" href="country-details.html?id=${c.id}">Edit</a>
          <button class="secondary-button" data-action="fav" data-id="${c.id}">${window.Common.favorites.has(c.id) ? 'Unfav' : 'Fav'}</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function loadAndRender() {
    allCountries = window.CountryStorage.getCountries();
    const visible = getVisibleCountries();
    renderTable(visible);
    renderCards(visible);
    const emptyEl = document.getElementById('emptyState');
    if (emptyEl) emptyEl.hidden = visible.length > 0;
    const favEl = document.getElementById('favoritesCount');
    if (favEl) favEl.textContent = String(window.Common.favorites.list().length);
  }

  function getVisibleCountries() {
    const els = cache();
    let list = (allCountries || []).slice();
    const q = els.search?.value?.trim().toLowerCase();
    const continent = els.filter?.value;
    if (q) {
      list = list.filter(c=>{
        return [c.countryName, c.capital, c.currency, c.continent].join(' ').toLowerCase().includes(q);
      });
    }
    if (continent && continent !== 'all') list = list.filter(c=>c.continent===continent);
    if (sortBy) {
      list.sort((a,b)=>{
        const av = a[sortBy]||0; const bv = b[sortBy]||0;
        return sortDir==='asc' ? (av-bv) : (bv-av);
      });
    }
    return list;
  }

  function attachEvents() {
    const els = cache();
    document.getElementById('countryTableBody').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'delete') {
        if (!confirm('Delete this country?')) return;
        const list = window.CountryStorage.getCountries().filter((c) => c.id !== id);
        window.CountryStorage.saveCountries(list);
        window.Common.activity.add && window.Common.activity.add('delete', `Deleted ${id}`);
        loadAndRender();
      } else if (btn.dataset.action === 'fav') {
        if (window.Common.favorites.has(id)) window.Common.favorites.remove(id);
        else window.Common.favorites.add(id);
        loadAndRender();
      } else if (btn.dataset.action === 'view') {
        location.href = `country-details.html?id=${id}`;
      }
    });

    document.getElementById('toggleView')?.addEventListener('click', (e) => {
      const btn = e.target;
      const card = document.getElementById('cardView');
      const table = document.getElementById('tableView');
      if (card.hidden) {
        card.hidden = false; table.hidden = true; btn.textContent = 'Table View';
      } else { card.hidden = true; table.hidden = false; btn.textContent = 'Card View'; }
    });

    document.getElementById('exportButton')?.addEventListener('click', () => window.Common.exportCountries());
    document.getElementById('importButton')?.addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      window.Common.importCountriesFile(file, (err, res) => {
        if (err) alert(err); else { alert(`Imported ${res.imported} (skipped ${res.skipped})`); loadAndRender(); }
      });
      e.target.value = '';
    });

    // search / filter
    const searchEl = document.getElementById('searchInput');
    const filterEl = document.getElementById('continentFilter');
    let searchTimer = null;
    searchEl?.addEventListener('input', (e)=>{
      clearTimeout(searchTimer);
      searchTimer = setTimeout(()=>{
        const v = e.target.value.trim(); if (v) window.Common.search.add(v);
        loadAndRender();
      }, 300);
    });
    filterEl?.addEventListener('change', ()=>{ loadAndRender(); });

    // simple sort by population when clicking header
    const popHeader = Array.from(document.querySelectorAll('.country-table th')).find(th=>th.textContent.toLowerCase().includes('population'));
    if (popHeader) popHeader.style.cursor='pointer';
    popHeader?.addEventListener('click', ()=>{
      if (sortBy==='population') sortDir = sortDir==='asc'?'desc':'asc'; else { sortBy='population'; sortDir='desc'; }
      loadAndRender();
    });
  }

  function init() {
    // require auth and set up shell
    window.Common.setUpShell();
    window.Common.requireAuth();
    loadAndRender();
    attachEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
