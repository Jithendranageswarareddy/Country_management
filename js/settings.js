(function(){
  const KEY = 'cm_settings';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)||'{}'); } catch { return {}; } }
  function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }

  document.addEventListener('DOMContentLoaded', ()=>{
    window.Common.setUpShell();
    window.Common.requireAuth();
    const btn = document.getElementById('themeToggleSmall');
    const anim = document.getElementById('animToggle');
    const reset = document.getElementById('resetBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const impFile = document.getElementById('impFile');
    const s = Object.assign({animations:true, view:'cards'}, load());
    anim.checked = !!s.animations;

    btn?.addEventListener('click', ()=>{ document.getElementById('themeToggle')?.click(); s.theme = document.documentElement.getAttribute('data-theme'); save(s); });
    anim?.addEventListener('change', ()=>{ s.animations = anim.checked; save(s); document.documentElement.style.setProperty('--animations', s.animations? '1':'0'); });
    reset?.addEventListener('click', ()=>{ if(confirm('Reset countries to defaults?')){ localStorage.removeItem('country-management-records'); location.reload(); } });
    exportBtn?.addEventListener('click', ()=>window.Common.exportCountries());
    importBtn?.addEventListener('click', ()=>impFile.click());
    impFile?.addEventListener('change',(e)=>{ const f = e.target.files[0]; window.Common.importCountriesFile(f,(err,res)=>{ if(err) alert(err); else { alert(`Imported ${res.imported} (skipped ${res.skipped})`); location.reload(); } }); e.target.value=''; });
  });
})();
