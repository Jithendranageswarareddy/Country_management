(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    window.Common.setUpShell();
    window.Common.requireAuth();
    const id = window.Common.parseQuery('id');
    const container = document.getElementById('detailsContent');
    if (!container) return;
    const all = window.CountryStorage.getCountries();
    if (!id) {
      // render add form
      container.innerHTML = `
        <form id="countryFormLocal" class="country-form" novalidate>
          <input type="hidden" id="countryId" />
          <label><span>Country name</span><input id="countryName" type="text" required maxlength="60" /></label>
          <label><span>Capital</span><input id="countryCapital" type="text" required maxlength="60" /></label>
          <label><span>Population</span><input id="countryPopulation" type="number" min="0" required /></label>
          <label><span>Currency</span><input id="countryCurrency" type="text" required maxlength="40" /></label>
          <label><span>Continent</span><select id="countryContinent"><option value="">Select</option><option>Asia</option><option>Europe</option><option>Americas</option><option>Africa</option><option>Oceania</option></select></label>
          <label class="full-width"><span>Flag URL</span><input id="countryFlagURL" type="url" required/></label>
          <div class="form-actions"><button class="secondary-button" type="button" id="cancelAdd">Cancel</button><button class="primary-button" type="submit">Save Country</button></div>
        </form>
      `;
      document.getElementById('cancelAdd')?.addEventListener('click', ()=>location.href='countries.html');
      document.getElementById('countryFormLocal')?.addEventListener('submit', (e)=>{
        e.preventDefault();
        const form = e.target;
        const data = window.CountryUI.readForm(form);
        data.id = String(Date.now());
        const list = window.CountryStorage.getCountries();
        list.push(data);
        window.CountryStorage.saveCountries(list);
        window.Common.activity.add && window.Common.activity.add('create', `Added ${data.countryName}`);
        location.href='countries.html';
      });
      return;
    }
    const found = all.find(c=>c.id===id);
    if (!found) { container.innerHTML = '<p>Country not found. <a href="countries.html">Back</a></p>'; return; }
    // render details with edit option
    container.innerHTML = window.CountryUI.buildDetailsMarkup(found) + ` <div style="margin-top:12px"><button id="favBtn" class="secondary-button">${window.Common.favorites.has(found.id)?'Unfavorite':'Favorite'}</button> <button id="editBtn" class="secondary-button">Edit</button> <a class="secondary-button" href="countries.html">Back</a></div>`;
    document.getElementById('favBtn')?.addEventListener('click', ()=>{
      if (window.Common.favorites.has(found.id)) window.Common.favorites.remove(found.id); else window.Common.favorites.add(found.id);
      location.reload();
    });
    document.getElementById('editBtn')?.addEventListener('click', ()=>{
      // replace with edit form
      container.innerHTML = `
        <form id="countryFormLocal" class="country-form" novalidate>
          <input type="hidden" id="countryId" />
          <label><span>Country name</span><input id="countryName" type="text" required maxlength="60" /></label>
          <label><span>Capital</span><input id="countryCapital" type="text" required maxlength="60" /></label>
          <label><span>Population</span><input id="countryPopulation" type="number" min="0" required /></label>
          <label><span>Currency</span><input id="countryCurrency" type="text" required maxlength="40" /></label>
          <label><span>Continent</span><select id="countryContinent"><option value="">Select</option><option>Asia</option><option>Europe</option><option>Americas</option><option>Africa</option><option>Oceania</option></select></label>
          <label class="full-width"><span>Flag URL</span><input id="countryFlagURL" type="url" required/></label>
          <div class="form-actions"><button class="secondary-button" type="button" id="cancelEdit">Cancel</button><button class="primary-button" type="submit">Save Country</button></div>
        </form>
      `;
      const form = document.getElementById('countryFormLocal');
      window.CountryUI.populateForm(form, found);
      document.getElementById('cancelEdit')?.addEventListener('click', ()=>location.reload());
      form?.addEventListener('submit', (e)=>{
        e.preventDefault();
        const updated = window.CountryUI.readForm(form);
        const list = window.CountryStorage.getCountries().map(c=>c.id===updated.id?updated:c);
        window.CountryStorage.saveCountries(list);
        window.Common.activity.add && window.Common.activity.add('update', `Updated ${updated.countryName}`);
        location.href = `country-details.html?id=${updated.id}`;
      });
    });
  });
})();
