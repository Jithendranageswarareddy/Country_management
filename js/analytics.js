(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    window.Common.setUpShell();
    window.Common.requireAuth();
    const data = window.CountryStorage.getCountries();
    if (!data || !data.length) return;
    const largest = data.reduce((a,b)=>b.population>a.population?b:a);
    const smallest = data.reduce((a,b)=>b.population<a.population?b:a);
    const avg = Math.round(data.reduce((s,c)=>s+Number(c.population||0),0)/data.length);
    document.getElementById('largest') && (document.getElementById('largest').textContent = `${largest.countryName} — ${window.CountryUI.formatPopulation(largest.population)}`);
    document.getElementById('smallest') && (document.getElementById('smallest').textContent = `${smallest.countryName} — ${window.CountryUI.formatPopulation(smallest.population)}`);
    document.getElementById('avg') && (document.getElementById('avg').textContent = window.CountryUI.formatPopulation(avg));
    const counts = {};
    data.forEach(c=>counts[c.continent]=(counts[c.continent]||0)+1);
    const pc = document.getElementById('perContinent');
    if (pc) {
      pc.innerHTML = Object.keys(counts).map(k=>{
        const pct = Math.round((counts[k]/data.length)*100);
        return `<div class="cont-row"><strong>${k}</strong><div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div><small>${counts[k]} (${pct}%)</small></div>`;
      }).join('');
    }
    // favorites count
    const favCount = window.Common.favorites.list().length;
    const favEl = document.getElementById('favoritesCount');
    if (favEl) favEl.textContent = String(favCount);
  });
})();
