(function () {
  function formatPopulation(population) {
    return new Intl.NumberFormat("en-US").format(Number(population || 0));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function textCell(text, className) {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    cell.textContent = text;
    return cell;
  }

  function flagCell(country) {
    const cell = document.createElement("td");
    const wrap = document.createElement("div");
    wrap.className = "flag-wrap";

    const image = document.createElement("img");
    image.className = "flag-image";
    image.src = country.flagURL;
    image.alt = `${country.countryName} flag`;
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => {
      if (wrap.querySelector(".flag-fallback")) return;
      image.remove();
      const fallback = document.createElement("span");
      fallback.className = "flag-fallback";
      fallback.textContent = country.countryName.slice(0, 2).toUpperCase();
      wrap.appendChild(fallback);
    });

    wrap.appendChild(image);
    cell.appendChild(wrap);
    return cell;
  }

  function actionButton(label, action, id, danger = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = danger ? "action-button danger" : "action-button";
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.id = id;
    return button;
  }

  function row(country) {
    const tr = document.createElement("tr");
    tr.dataset.id = country.id;

    tr.appendChild(flagCell(country));
    tr.appendChild(textCell(country.countryName, "country-name"));
    tr.appendChild(textCell(country.capital));
    tr.appendChild(textCell(formatPopulation(country.population)));
    tr.appendChild(textCell(country.currency));
    tr.appendChild(textCell(country.continent));

    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group";
    group.appendChild(actionButton("View", "view", country.id));
    group.appendChild(actionButton("Edit", "edit", country.id));
    group.appendChild(actionButton("Delete", "delete", country.id, true));
    actions.appendChild(group);
    tr.appendChild(actions);

    return tr;
  }

  function renderCountries(countries) {
    const fragment = document.createDocumentFragment();
    countries.forEach((country) => fragment.appendChild(row(country)));
    return fragment;
  }

  function updateStatistics(countries, visibleCountries) {
    const totalCountries = document.getElementById("totalCountries");
    const continentCount = document.getElementById("continentCount");
    const totalPopulation = document.getElementById("totalPopulation");
    const visibleCountriesCount = document.getElementById("visibleCountries");

    if (totalCountries) totalCountries.textContent = countries.length;
    if (continentCount) continentCount.textContent = new Set(countries.map((country) => country.continent)).size;
    if (totalPopulation) {
      const total = countries.reduce((sum, country) => sum + Number(country.population || 0), 0);
      totalPopulation.textContent = formatPopulation(total);
    }
    if (visibleCountriesCount) visibleCountriesCount.textContent = visibleCountries.length;
  }

  function populateForm(form, country) {
    form.countryId.value = country?.id || "";
    form.countryName.value = country?.countryName || "";
    form.countryCapital.value = country?.capital || "";
    form.countryPopulation.value = country?.population || "";
    form.countryCurrency.value = country?.currency || "";
    form.countryContinent.value = country?.continent || "";
    form.countryFlagURL.value = country?.flagURL || "";
  }

  function readForm(form) {
    return {
      id: form.countryId.value || String(Date.now()),
      countryName: form.countryName.value.trim(),
      capital: form.countryCapital.value.trim(),
      population: Number(form.countryPopulation.value),
      currency: form.countryCurrency.value.trim(),
      continent: form.countryContinent.value,
      flagURL: form.countryFlagURL.value.trim()
    };
  }

  function buildDetailsMarkup(country) {
    return `
      <div class="details-hero">
        <img class="details-flag" src="${escapeHtml(country.flagURL)}" alt="${escapeHtml(country.countryName)} flag" loading="lazy" referrerpolicy="no-referrer" />
        <div>
          <h4>${escapeHtml(country.countryName)}</h4>
          <p>${escapeHtml(country.continent)}</p>
        </div>
      </div>
      <dl class="details-grid">
        <div><dt>Capital</dt><dd>${escapeHtml(country.capital)}</dd></div>
        <div><dt>Population</dt><dd>${formatPopulation(country.population)}</dd></div>
        <div><dt>Currency</dt><dd>${escapeHtml(country.currency)}</dd></div>
        <div><dt>Continent</dt><dd>${escapeHtml(country.continent)}</dd></div>
        <div class="details-full"><dt>Flag URL</dt><dd>${escapeHtml(country.flagURL)}</dd></div>
      </dl>
    `;
  }

  window.CountryUI = {
    renderCountries,
    updateStatistics,
    populateForm,
    readForm,
    buildDetailsMarkup,
    formatPopulation
  };
})();
