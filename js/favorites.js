(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    window.Common.setUpShell();
    window.Common.requireAuth();
    const container = document.getElementById('favoritesList');
    if (!container) return;
    let favIds = window.Common.favorites.list();
    const all = window.CountryStorage.getCountries();
    function render() {
      favIds = window.Common.favorites.list();
      const list = all.filter(c=>favIds.includes(String(c.id)));
      if (!list.length) { container.innerHTML = '<p class="favorite-empty">No favorites yet.</p>'; return; }
      container.innerHTML = `
        <div class="favorites-controls"><button id="viewToggle" class="secondary-button" type="button">Toggle View</button></div>
        <div id="favCards" class="card-grid"></div>
        <table id="favTable" class="data-table" hidden><thead><tr><th>Flag</th><th>Name</th><th>Capital</th><th>Population</th><th>Actions</th></tr></thead><tbody id="favTableBody"></tbody></table>
      `;
      const grid = document.getElementById('favCards');
      const tbody = document.getElementById('favTableBody');
      grid.replaceChildren(); tbody.replaceChildren();
      list.forEach(c=>{
        const card = document.createElement('article'); card.className='stat-card favorite-card';
        card.innerHTML = `<div class="favorite-card-head"><div class="flag-wrap"><img src="${c.flagURL}" alt="${c.countryName} flag"/></div><div class="favorite-card-title"><strong>${c.countryName}</strong><span class="favorite-card-meta">${c.capital} • ${c.continent}</span></div></div><div class="favorite-card-actions"><button class="secondary-button remove-btn" data-id="${c.id}" type="button">Remove</button> <a class="secondary-button" href="country-details.html?id=${c.id}">View</a></div>`;
        grid.appendChild(card);
        const tr = document.createElement('tr'); tr.innerHTML = `<td><img class="flag-image" src="${c.flagURL}" alt="${c.countryName} flag"/></td><td>${c.countryName}</td><td>${c.capital}</td><td>${window.CountryUI.formatPopulation(c.population)}</td><td><button class="secondary-button remove-btn" data-id="${c.id}" type="button">Remove</button> <a class="secondary-button" href="country-details.html?id=${c.id}">View</a></td>`;
        tbody.appendChild(tr);
      });
      document.getElementById('viewToggle').addEventListener('click', ()=>{
        const favCards = document.getElementById('favCards');
        const favTable = document.getElementById('favTable');
        if (favCards.hidden) { favCards.hidden = false; favTable.hidden = true; } else { favCards.hidden = true; favTable.hidden = false; }
      });
      container.querySelectorAll('.remove-btn').forEach(b=>b.addEventListener('click',(e)=>{ const id = e.target.dataset.id; window.Common.favorites.remove(id); render(); }));
    }
    render();
  });
})();
