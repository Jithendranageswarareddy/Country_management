(function () {
  const state = {
    countries: [],
    search: "",
    continent: "all",
    editId: null,
    deleteTarget: null,
    sortBy: null,
    sortDirection: "asc",
    theme: localStorage.getItem("country-dashboard-theme") || "light"
  };

  const els = {};
  const toastTimers = new Set();

  function cache() {
    els.body = document.getElementById("countryTableBody");
    els.search = document.getElementById("searchInput");
    els.filter = document.getElementById("continentFilter");
    els.empty = document.getElementById("emptyState");
    els.addBtn = document.getElementById("addCountryButton");
    els.themeToggle = document.getElementById("themeToggle");
    els.exportBtn = document.getElementById("exportButton");
    els.importBtn = document.getElementById("importButton");
    els.importFileInput = document.getElementById("importFileInput");
    els.countryModal = document.getElementById("countryModal");
    els.form = document.getElementById("countryForm");
    els.modalTitle = document.getElementById("modalTitle");
    els.formError = document.getElementById("formError");
    els.detailsModal = document.getElementById("detailsModal");
    els.details = document.getElementById("detailsContent");
    els.confirmModal = document.getElementById("confirmModal");
    els.confirmMessage = document.getElementById("confirmMessage");
    els.confirmDelete = document.getElementById("confirmDeleteButton");
    els.loading = document.getElementById("loadingOverlay");
    els.toast = document.getElementById("toastContainer");
    els.menu = document.querySelector(".menu-toggle");
    els.sidebar = document.querySelector(".sidebar");
    els.countryId = document.getElementById("countryId");
    els.countryName = document.getElementById("countryName");
    els.countryCapital = document.getElementById("countryCapital");
    els.countryPopulation = document.getElementById("countryPopulation");
    els.countryCurrency = document.getElementById("countryCurrency");
    els.countryContinent = document.getElementById("countryContinent");
    els.countryFlagURL = document.getElementById("countryFlagURL");
    els.largestPopCountry = document.getElementById("largestPopCountry");
    els.smallestPopCountry = document.getElementById("smallestPopCountry");
    els.continentMost = document.getElementById("continentMost");
    els.avgPopulation = document.getElementById("avgPopulation");
    els.sortButtons = document.querySelectorAll(".sort-button");

    if (!els.body) console.error("Critical: Country table body not found");
  }

  function visibleCountries() {
    const needle = state.search.trim().toLowerCase();
    let filtered = state.countries.filter((country) => {
      const matchesFilter = state.continent === "all" || country.continent === state.continent;
      const haystack = [country.countryName, country.capital, country.currency, country.continent, country.flagURL].join(" ").toLowerCase();
      return matchesFilter && haystack.includes(needle);
    });

    // Apply sorting
    if (state.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        if (state.sortBy === "name") {
          aVal = a.countryName.toLowerCase();
          bVal = b.countryName.toLowerCase();
        } else if (state.sortBy === "population") {
          aVal = a.population;
          bVal = b.population;
        } else if (state.sortBy === "continent") {
          aVal = a.continent.toLowerCase();
          bVal = b.continent.toLowerCase();
        }
        if (aVal < bVal) return state.sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return state.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }

  function render() {
    if (!els.body || !els.empty) return;
    const countries = visibleCountries();
    els.body.replaceChildren(CountryUI.renderCountries(countries));
    els.empty.hidden = countries.length !== 0;
    if (CountryUI && typeof CountryUI.updateStatistics === "function") {
      CountryUI.updateStatistics(state.countries, countries);
    }
    updateEnhancedStats();
    updateSortIndicators();
  }

  function setBodyLock() {
    const open = [els.countryModal, els.detailsModal, els.confirmModal].some((modal) => modal.classList.contains("open"));
    document.body.classList.toggle("no-scroll", open);
  }

  function toast(message, kind = "success") {
    if (!els.toast) return;

    const item = document.createElement("div");
    item.className = `toast toast-${kind}`;
    item.setAttribute("role", "status");
    item.innerHTML = `<div><strong>${kind === "info" ? "Info" : kind === "error" ? "Action blocked" : "Success"}</strong><p>${message}</p></div>`;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "toast-close";
    close.textContent = "×";
    close.setAttribute("aria-label", "Dismiss notification");
    close.addEventListener("click", () => removeToast(item));
    item.appendChild(close);
    els.toast.appendChild(item);
    requestAnimationFrame(() => item.classList.add("toast-show"));

    const timer = window.setTimeout(() => {
      removeToast(item);
      toastTimers.delete(timer);
    }, 2500);
    toastTimers.add(timer);
  }

  function removeToast(item) {
    if (!item || !item.isConnected) return;
    item.classList.remove("toast-show");
    window.setTimeout(() => item.remove(), 220);
  }

  function clearToastTimers() {
    toastTimers.forEach((timer) => window.clearTimeout(timer));
    toastTimers.clear();
  }

  function initTheme() {
    const savedTheme = state.theme || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeButton();
  }

  function toggleTheme() {
    state.theme = state.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem("country-dashboard-theme", state.theme);
    updateThemeButton();
    toast(`Switched to ${state.theme} mode.`, "info");
  }

  function updateThemeButton() {
    if (!els.themeToggle) return;
    els.themeToggle.textContent = state.theme === "light" ? "🌙" : "☀️";
    els.themeToggle.setAttribute("title", `Switch to ${state.theme === "light" ? "dark" : "light"} mode`);
  }

  function exportCountries() {
    if (state.countries.length === 0) {
      toast("No countries to export.", "error");
      return;
    }
    const data = JSON.stringify(state.countries, null, 2);
    const blob = new Blob([data], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `countries-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast(`Exported ${state.countries.length} countries.`);
  }

  function validateImportData(data) {
    if (!Array.isArray(data)) return "Invalid JSON format. Expected an array of countries.";
    if (data.length === 0) return "Import file is empty.";
    for (const item of data) {
      if (!item.countryName || !item.capital || !item.currency || !item.continent || !item.flagURL) {
        return "Invalid country record. Missing required fields (countryName, capital, currency, continent, flagURL).";
      }
      if (!Number.isFinite(item.population) || item.population <= 0) {
        return `Invalid population for ${item.countryName}. Population must be greater than zero.`;
      }
    }
    return "";
  }

  function importCountries(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const data = JSON.parse(content);
        const error = validateImportData(data);
        if (error) {
          toast(error, "error");
          return;
        }
        const existingIds = new Set(state.countries.map((c) => c.id));
        let imported = 0;
        let skipped = 0;
        for (const item of data) {
          if (!item.id) item.id = Date.now() + Math.random();
          if (!existingIds.has(item.id)) {
            state.countries.push(item);
            existingIds.add(item.id);
            imported++;
          } else {
            skipped++;
          }
        }
        CountryStorage.saveCountries(state.countries);
        render();
        const message = `Imported ${imported} countries${skipped > 0 ? ` (${skipped} duplicates skipped)` : ""}.`;
        toast(message);
      } catch (err) {
        toast("Failed to parse JSON file. Please check the file format.", "error");
      }
    };
    reader.onerror = () => {
      toast("Failed to read file.", "error");
    };
    reader.readAsText(file);
    els.importFileInput.value = "";
  }

  function handleSort(column) {
    if (state.sortBy === column) {
      state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
    } else {
      state.sortBy = column;
      state.sortDirection = "asc";
    }
    updateSortIndicators();
    render();
  }

  function updateSortIndicators() {
    els.sortButtons.forEach((btn) => {
      const column = btn.closest("[data-sort]")?.getAttribute("data-sort");
      if (column === state.sortBy) {
        btn.classList.add("active");
        const indicator = btn.querySelector(".sort-indicator");
        if (indicator) {
          indicator.textContent = state.sortDirection === "asc" ? "▲" : "▼";
        }
      } else {
        btn.classList.remove("active");
        const indicator = btn.querySelector(".sort-indicator");
        if (indicator) {
          indicator.textContent = "";
        }
      }
    });
  }

  function calculateStats() {
    if (state.countries.length === 0) {
      return {
        largest: { name: "—", population: 0 },
        smallest: { name: "—", population: 0 },
        continentMost: "—",
        avgPopulation: 0
      };
    }

    // Largest population
    const largest = state.countries.reduce((max, c) => (c.population > max.population ? c : max));

    // Smallest population
    const smallest = state.countries.reduce((min, c) => (c.population < min.population ? c : min));

    // Continent with most countries
    const continentCounts = {};
    state.countries.forEach((c) => {
      continentCounts[c.continent] = (continentCounts[c.continent] || 0) + 1;
    });
    const continentMost = Object.keys(continentCounts).reduce((max, continent) => 
      continentCounts[continent] > continentCounts[max] ? continent : max
    );

    // Average population
    const avgPopulation = Math.round(
      state.countries.reduce((sum, c) => sum + c.population, 0) / state.countries.length
    );

    return { largest, smallest, continentMost, avgPopulation };
  }

  function updateEnhancedStats() {
    const stats = calculateStats();
    if (els.largestPopCountry) {
      els.largestPopCountry.textContent = stats.largest.name;
      els.largestPopCountry.title = stats.largest.name !== "—" ? `${stats.largest.name}: ${CountryUI.formatPopulation(stats.largest.population)}` : "";
    }
    if (els.smallestPopCountry) {
      els.smallestPopCountry.textContent = stats.smallest.name;
      els.smallestPopCountry.title = stats.smallest.name !== "—" ? `${stats.smallest.name}: ${CountryUI.formatPopulation(stats.smallest.population)}` : "";
    }
    if (els.continentMost) {
      els.continentMost.textContent = stats.continentMost;
    }
    if (els.avgPopulation) {
      els.avgPopulation.textContent = stats.avgPopulation > 0 ? CountryUI.formatPopulation(stats.avgPopulation) : "0";
    }
  }

  function showLoading() {
    if (!els.loading) return;
    els.loading.hidden = false;
    els.loading.setAttribute("aria-hidden", "false");
    els.loading.classList.add("visible");
  }

  function hideLoading() {
    if (!els.loading) return;
    els.loading.classList.remove("visible");
    els.loading.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      els.loading.hidden = true;
    }, 180);
  }

  function validate(country) {
    if (!country.countryName || !country.capital || !country.currency || !country.continent || !country.flagURL) return "Please fill in every field before saving.";
    if (!Number.isFinite(country.population) || country.population <= 0) return "Population must be greater than zero.";
    try {
      const url = new URL(country.flagURL, window.location.href);
      if (!["http:", "https:", "file:"].includes(url.protocol)) return "Enter a valid flag URL.";
    } catch {
      return "Enter a valid flag URL.";
    }
    return "";
  }

  function openModal(country = null) {
    state.editId = country?.id || null;
    CountryUI.populateForm(els, country);
    els.formError.hidden = true;
    els.formError.textContent = "";
    els.modalTitle.textContent = country ? "Edit Country" : "Add Country";
    els.countryModal.classList.add("open");
    els.countryModal.setAttribute("aria-hidden", "false");
    setBodyLock();
    window.setTimeout(() => els.countryName.focus(), 0);
  }

  function closeModal() {
    state.editId = null;
    els.form.reset();
    CountryUI.populateForm(els, null);
    els.countryModal.classList.remove("open");
    els.countryModal.setAttribute("aria-hidden", "true");
    setBodyLock();
  }

  function openDetails(country) {
    els.details.innerHTML = CountryUI.buildDetailsMarkup(country);
    els.detailsModal.classList.add("open");
    els.detailsModal.setAttribute("aria-hidden", "false");
    setBodyLock();
    toast(`Viewing ${country.countryName} details.`, "info");
  }

  function closeDetails() {
    els.detailsModal.classList.remove("open");
    els.detailsModal.setAttribute("aria-hidden", "true");
    setBodyLock();
  }

  function openDelete(country) {
    state.deleteTarget = country;
    els.confirmMessage.textContent = `Delete ${country.countryName}? This action cannot be undone.`;
    els.confirmModal.classList.add("open");
    els.confirmModal.setAttribute("aria-hidden", "false");
    setBodyLock();
  }

  function closeDelete() {
    state.deleteTarget = null;
    els.confirmModal.classList.remove("open");
    els.confirmModal.setAttribute("aria-hidden", "true");
    setBodyLock();
  }

  function upsertCountry(country) {
    const index = state.countries.findIndex((item) => item.id === country.id);
    const action = index >= 0 ? "updated" : "added";
    if (index >= 0) state.countries[index] = country;
    else state.countries.unshift(country);
    CountryStorage.saveCountries(state.countries);
    render();
    toast(`${country.countryName} has been ${action}.`);
  }

  function submitForm(event) {
    event.preventDefault();
    const country = CountryUI.readForm(els);
    const message = validate(country);
    if (message) {
      els.formError.textContent = message;
      els.formError.hidden = false;
      toast(message, "error");
      return;
    }
    upsertCountry(country);
    closeModal();
  }

  function handleTableAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const country = state.countries.find((item) => item.id === button.dataset.id);
    if (!country) return;
    if (button.dataset.action === "view") return openDetails(country);
    if (button.dataset.action === "edit") return openModal(country);
    openDelete(country);
  }

  function initEvents() {
    // Theme toggle
    if (els.themeToggle) {
      els.themeToggle.addEventListener("click", toggleTheme);
    }

    // Export and Import
    if (els.exportBtn) {
      els.exportBtn.addEventListener("click", exportCountries);
    }
    if (els.importBtn && els.importFileInput) {
      els.importBtn.addEventListener("click", () => els.importFileInput.click());
      els.importFileInput.addEventListener("change", (event) => importCountries(event.target.files[0]));
    }

    // Sort buttons
    els.sortButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const column = btn.closest("[data-sort]")?.getAttribute("data-sort");
        if (column) handleSort(column);
      });
    });

    els.search.addEventListener("input", (event) => {
      state.search = event.target.value;
      render();
    });

    els.filter.addEventListener("change", (event) => {
      state.continent = event.target.value;
      render();
    });

    els.addBtn.addEventListener("click", () => openModal());
    els.form.addEventListener("submit", submitForm);
    els.form.addEventListener("input", () => {
      if (!els.formError.hidden) {
        els.formError.hidden = true;
        els.formError.textContent = "";
      }
    });
    els.body.addEventListener("click", handleTableAction);

    els.countryModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-close-modal]")) closeModal();
    });

    els.detailsModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-close-details]")) closeDetails();
    });

    els.confirmModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-cancel-delete]")) closeDelete();
    });

    els.confirmDelete.addEventListener("click", () => {
      if (!state.deleteTarget) return;
      const countryName = state.deleteTarget.countryName;
      state.countries = state.countries.filter((item) => item.id !== state.deleteTarget.id);
      CountryStorage.saveCountries(state.countries);
      render();
      closeDelete();
      toast(`${countryName} has been deleted.`);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (els.countryModal.classList.contains("open")) closeModal();
      if (els.detailsModal.classList.contains("open")) closeDetails();
      if (els.confirmModal.classList.contains("open")) closeDelete();
    });

    if (els.menu && els.sidebar) {
      els.menu.addEventListener("click", () => {
        const open = els.sidebar.classList.toggle("open");
        els.menu.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function init() {
    cache();
    initTheme();
    showLoading();
    window.setTimeout(() => {
      if (typeof CountryStorage === "undefined" || !CountryStorage.seedCountries) {
        console.error("CountryStorage module not loaded");
        hideLoading();
        return;
      }
      CountryStorage.seedCountries();
      state.countries = CountryStorage.getCountries();
      initEvents();
      render();
      hideLoading();
    }, 250);
  }

  window.addEventListener("beforeunload", () => {
    clearToastTimers();
  });

  document.addEventListener("DOMContentLoaded", init);
})();
