const countries = [
  {
    name: "India",
    states: [
      {
        name: "Andhra Pradesh",
        cities: ["Vijayawada", "Guntur"]
      }
    ]
  }
];


// ==========================
// RENDER FUNCTION
// ==========================

function renderData(){

  const app = document.getElementById("app");

  app.innerHTML = "";

  countries.forEach((country, countryIndex)=>{

    const countryDiv = document.createElement("div");

    countryDiv.className = "country-card";

    countryDiv.innerHTML = `
      <h2>${country.name}</h2>

      <button class="edit-btn"
        onclick="editCountry(${countryIndex})">
        Edit
      </button>

      <button class="delete-btn"
        onclick="deleteCountry(${countryIndex})">
        Delete
      </button>

      <h3 class="section-title">States</h3>

      <button class="add-btn"
        onclick="addState(${countryIndex})">
        Add State
      </button>
    `;


    // ==========================
    // STATES
    // ==========================

    country.states.forEach((state, stateIndex)=>{

      const stateDiv = document.createElement("div");

      stateDiv.className = "state-card";

      stateDiv.innerHTML = `
        <h3>${state.name}</h3>

        <button class="edit-btn"
          onclick="editState(${countryIndex}, ${stateIndex})">
          Edit
        </button>

        <button class="delete-btn"
          onclick="deleteState(${countryIndex}, ${stateIndex})">
          Delete
        </button>

        <button class="add-btn"
          onclick="addCity(${countryIndex}, ${stateIndex})">
          Add City
        </button>

        <div class="cities">
          <h4>Cities</h4>
          <ul id="city-list-${countryIndex}-${stateIndex}"></ul>
        </div>
      `;


      // ==========================
      // CITIES
      // ==========================

      const cityList = stateDiv.querySelector(
        `#city-list-${countryIndex}-${stateIndex}`
      );

      state.cities.forEach((city, cityIndex)=>{

        const cityItem = document.createElement("li");

        cityItem.className = "city-item";

        cityItem.innerHTML = `
          ${city}

          <button class="delete-btn"
            onclick="deleteCity(${countryIndex}, ${stateIndex}, ${cityIndex})">
            Delete
          </button>
        `;

        cityList.appendChild(cityItem);

      });

      countryDiv.appendChild(stateDiv);

    });

    app.appendChild(countryDiv);

  });

}



// ==========================
// COUNTRY FUNCTIONS
// ==========================

function addCountry(){

  const countryName = prompt("Enter country name:");

  if(countryName){

    countries.push({
      name: countryName,
      states:[]
    });

    renderData();

  }

}


function editCountry(index){

  const newName = prompt(
    "Edit country name:",
    countries[index].name
  );

  if(newName){

    countries[index].name = newName;

    renderData();

  }

}


function deleteCountry(index){

  const confirmDelete = confirm(
    "Are you sure you want to delete this country?"
  );

  if(confirmDelete){

    countries.splice(index, 1);

    renderData();

  }

}



// ==========================
// STATE FUNCTIONS
// ==========================

function addState(countryIndex){

  const stateName = prompt("Enter state name:");

  if(stateName){

    countries[countryIndex].states.push({
      name: stateName,
      cities:[]
    });

    renderData();

  }

}


function editState(countryIndex, stateIndex){

  const newName = prompt(
    "Edit state name:",
    countries[countryIndex].states[stateIndex].name
  );

  if(newName){

    countries[countryIndex].states[stateIndex].name = newName;

    renderData();

  }

}


function deleteState(countryIndex, stateIndex){

  const confirmDelete = confirm(
    "Are you sure you want to delete this state?"
  );

  if(confirmDelete){

    countries[countryIndex].states.splice(stateIndex,1);

    renderData();

  }

}



// ==========================
// CITY FUNCTIONS
// ==========================

function addCity(countryIndex, stateIndex){

  const cityName = prompt("Enter city name:");

  if(cityName){

    countries[countryIndex]
      .states[stateIndex]
      .cities.push(cityName);

    renderData();

  }

}


function deleteCity(countryIndex, stateIndex, cityIndex){

  const confirmDelete = confirm(
    "Are you sure you want to delete this city?"
  );

  if(confirmDelete){

    countries[countryIndex]
      .states[stateIndex]
      .cities.splice(cityIndex,1);

    renderData();

  }

}



// ==========================
// INITIAL RENDER
// ==========================

renderData();