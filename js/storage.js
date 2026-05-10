(function () {
  const STORAGE_KEY = "country-management-records";

  const DEFAULT_COUNTRIES = [
    { id: "1", countryName: "India", capital: "New Delhi", population: 1380004385, currency: "Indian Rupee", continent: "Asia", flagURL: "https://flagcdn.com/in.svg" },
    { id: "2", countryName: "Canada", capital: "Ottawa", population: 38008005, currency: "Canadian Dollar", continent: "Americas", flagURL: "https://flagcdn.com/ca.svg" },
    { id: "3", countryName: "Germany", capital: "Berlin", population: 83783942, currency: "Euro", continent: "Europe", flagURL: "https://flagcdn.com/de.svg" },
    { id: "4", countryName: "Brazil", capital: "Brasília", population: 212559417, currency: "Brazilian Real", continent: "Americas", flagURL: "https://flagcdn.com/br.svg" },
    { id: "5", countryName: "Australia", capital: "Canberra", population: 25687041, currency: "Australian Dollar", continent: "Oceania", flagURL: "https://flagcdn.com/au.svg" },
    { id: "6", countryName: "Kenya", capital: "Nairobi", population: 53771296, currency: "Kenyan Shilling", continent: "Africa", flagURL: "https://flagcdn.com/ke.svg" }
  ];

  const CURRENCY_BY_COUNTRY = {
    India: "Indian Rupee",
    Canada: "Canadian Dollar",
    Germany: "Euro",
    Brazil: "Brazilian Real",
    Australia: "Australian Dollar",
    Kenya: "Kenyan Shilling"
  };

  function normalizeCountry(country) {
    if (!country || typeof country !== "object") {
      return null;
    }

    const countryName = String(country.countryName || country.name || "").trim();
    const capital = String(country.capital || "").trim();
    const population = Number(country.population || 0);
    const continent = String(country.continent || country.region || "").trim();
    const currencyValue = String(country.currency || "").trim();
    const currency = currencyValue.length > 3 ? currencyValue : String(CURRENCY_BY_COUNTRY[countryName] || currencyValue).trim();
    const code = String(country.code || country.countryCode || countryName).trim().slice(0, 2).toLowerCase();
    const flagURL = String(country.flagURL || (code ? `https://flagcdn.com/${code}.svg` : "")).trim();

    if (!countryName || !capital || !continent || !currency || !flagURL) {
      return null;
    }

    return {
      id: String(country.id || Date.now()),
      countryName,
      capital,
      population,
      currency,
      continent,
      flagURL
    };
  }

  function normalizeCollection(items) {
    if (!Array.isArray(items)) {
      return DEFAULT_COUNTRIES.slice();
    }

    const normalized = items.map(normalizeCountry).filter(Boolean);
    return normalized.length ? normalized : DEFAULT_COUNTRIES.slice();
  }

  function getCountries() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COUNTRIES));
        return DEFAULT_COUNTRIES.slice();
      }

      const parsed = JSON.parse(stored);
      const normalized = normalizeCollection(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      return DEFAULT_COUNTRIES.slice();
    }
  }

  function saveCountries(countries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countries));
  }

  function seedCountries() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      saveCountries(DEFAULT_COUNTRIES);
    }
  }

  window.CountryStorage = { getCountries, saveCountries, seedCountries };
})();
