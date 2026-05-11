document.addEventListener('DOMContentLoaded', ()=>{
  window.Common.setUpShell();
  window.Common.requireAuth();
  const data = window.CountryStorage.getCountries();
  document.getElementById('totalCountries') && (document.getElementById('totalCountries').textContent = data.length);
  const totalPop = data.reduce((s,c)=>s+Number(c.population||0),0);
  document.getElementById('totalPopulation') && (document.getElementById('totalPopulation').textContent = window.CountryUI.formatPopulation(totalPop));
  document.getElementById('favoritesCount') && (document.getElementById('favoritesCount').textContent = window.Common.favorites.list().length);
  document.getElementById('recentActivityCount') && (document.getElementById('recentActivityCount').textContent = window.Common.activity.list().length);
  // top populated
  const top = data.slice().sort((a,b)=>b.population-a.population).slice(0,5);
  const ul = document.getElementById('topPopList');
  if (ul) ul.innerHTML = top.map(c=>`<li>${c.countryName} — ${window.CountryUI.formatPopulation(c.population)}</li>`).join('');
  const searches = window.Common.search.list();
  const rs = document.getElementById('recentSearches'); if (rs) rs.innerHTML = searches.map(s=>`<li><button class="secondary-button" data-search="${s}">${s}</button></li>`).join('');
  document.getElementById('recentSearches')?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-search]'); if (!btn) return; const term = btn.dataset.search; window.Common.search.add(term); location.href='countries.html';
  });
});
