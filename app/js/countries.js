/**
 * Countries Api
 * Web Course Lab
 * By: Sebastián Bermúdez Acuña
 * 2023 - 12 - 28
 * 
 * API Reference: https://restcountries.com/
 */

document.addEventListener("DOMContentLoaded", () => {

    // Get Elements
    const countryInput = document.getElementById("inptCountryName");
    const spanSearch = document.getElementById("spanSearch");
    const searchInTableInput = document.getElementById("inptSearchTable");

    // Handle search elements
    const handleCountryInputKeyUp = (event) => {
        if (event.keyCode === 13) { // 'Return' key
            searchInTableInput.value = "";
            createTable(countryInput.value);
        }
    };

    countryInput.addEventListener("keyup", handleCountryInputKeyUp);

    spanSearch.addEventListener("click", () => {
        searchInTableInput.value = "";
        createTable(countryInput.value);
    });

    searchInTableInput.addEventListener("keyup", () => {
      searchInTable("inptSearchTable", "countriesTableID");
    });
});

// From `https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table`
const sortTable = (tableID, columnNumber) => {
  let table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById(tableID);
  switching = true;

  while (switching) {
    switching = false;
    rows = table.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[columnNumber];
      y = rows[i + 1].getElementsByTagName("TD")[columnNumber];

      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        shouldSwitch = true;
        break;
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
};

//From: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_filter_table
const searchInTable = (inputId, tableId) => {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById(inputId);
  filter = input.value.toUpperCase();
  table = document.getElementById(tableId);
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
};

// Modal when country not found at Country API
const showCountryNotFoundModal = () => {
    const countryNotFoundModal = new bootstrap.Modal(document.getElementById('modalCountryNotFound'));
    countryNotFoundModal.show();
};


// Receives an input and returns the JSON with the response from the API
// If not success, returns undefined.
const obtainCountries = async (userInput) => {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  const url = `https://restcountries.com/v3.1/name/${userInput}`;

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      // If not success
      throw new Error("Recurso no encontrado");
    }
    const result_1 = await response.text();
    const countriesInfo = JSON.parse(result_1);
    return countriesInfo;
  } catch (error) {
    console.error("error", error.message);
    return undefined;
  }
};

// Format number for better visualization.
// ex. 2445223 => 2.445.223
const formatNumberWithDots = (number) => {
  let numberString = number.toString(); // just in case
  let groups = [];

  for (let i = numberString.length; i > 0; i -= 3) { // Separate each 3 digits backwards
    groups.unshift(numberString.slice(Math.max(0, i - 3), i));
  }

  return groups.join('.'); // Join by '.'
};

// Gets the country names receiving its code.
// Used to obtain bordering countries name, since their original info are codes.
const obtainCountryNameByCode = async (code) => {
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  // SAME API, different URL
  const url = `https://restcountries.com/v3.1/alpha/${code}`;

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      // If not success
      throw new Error("Resource not found");
    }
    const result_1 = await response.text();
    const countriesInfo = JSON.parse(result_1);
    return countriesInfo;
  } catch (error) {
    console.error("error", error.message);
    return undefined;
  }
};

// Creates the html for the bordering countries list.
const listBorderCountriesHTML = async (borderCountries) => {
  let htmlContent = "";

  if (borderCountries !== undefined){
    await Promise.all(
      borderCountries.map(async (countryCode) => {
        try {
          const countriesInfo = await obtainCountryNameByCode(countryCode);
          if (countriesInfo !== undefined) {
            htmlContent += `<div class="row"> <p class="fw-normal">• ${countriesInfo[0].name.common}</p> </div>`;
          }
        } catch (error) {
          console.error("Error obtaining countries:", error);
        }
      })
    );
  } else {
    htmlContent += `<div class="row"> <p class="fw-normal">This country does not have bordering countries.</p> </div>`;
  }

  return htmlContent;
};

// Makes the call to create the modal of the country details.
// Handles the promise from 'obtainCountries'
const callCountryDetailsModal = (countryName) => {
  obtainCountries(countryName) // Promise handle
    .then((countriesInfo) => {
      if (countriesInfo !== undefined) {
        countriesInfo.forEach((country) => {
          createCountryDetailsModal({ // Country Details info needed
            flagSource: country.flags.png,
            name: country.name.common,
            officialName: country.name.official,
            region: country.region,
            subregion: country.subregion,
            continents: country.continents,
            population: country.population,
            borderCountries: country.borders
          })
        });
      } else {
        showCountryNotFoundModal();
      }
    })
    .catch((error) => {
      console.error("Error obtaining countries:", error);
    });
};

// Creates the country deatils modal html and shows it.
// Receives the info of the country.
const createCountryDetailsModal = async (countryInfo) => {
  let continents = "";
  countryInfo.continents.forEach((element) => { // For countries with 2 continents
      continents += element + ", ";
  });

  // Obtain the HTML content for its bordering countries
  let borderCountriesHTML = await listBorderCountriesHTML(countryInfo.borderCountries);

  // Where the modals are located in countries.html
  let modalDiv = document.getElementById("modalsDivID")
  
  let modalHTML = 
  `<div class="modal fade" id="${countryInfo.name}ModalID" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${countryInfo.name}ModalLabel" aria-hidden="true">`+
  `<div class="modal-dialog modal-dialog-centered">` +
  `<div class="modal-content">` +
  `<div class="modal-header">
      <h1 class="modal-title fs-5" id="${countryInfo.name}ModalLabel">Country Info</h1>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>` +
  `<div class="modal-body">
      <div class="container">
        <div class="row mb-3">
          <div class="col text-center">
            <img src="${countryInfo.flagSource}" class="img-fluid border">
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="row"> <p class="fw-bold">Name</p> </div>
            <div class="row mb-2"> <p class="fw-normal">${countryInfo.name}</p> </div>

            <div class="row"> <p class="fw-bold">Official Name</p> </div>
            <div class="row mb-2"> <p class="fw-normal">${countryInfo.officialName}</p> </div>

            <div class="row"> <p class="fw-bold">Region</p> </div>
            <div class="row mb-2"> <p class="fw-normal">${countryInfo.region}</p> </div>

            <div class="row"> <p class="fw-bold">Subregion</p> </div>
            <div class="row mb-2"> <p class="fw-normal">${countryInfo.subregion}</p> </div>

            <div class="row"> <p class="fw-bold">Continent</p> </div>
            <div class="row mb-2"> <p class="fw-normal">${continents.slice(0, -2)}</p> </div>

          </div>
          <div class="col">
            <div class="row"> <p class="fw-bold">Population</p> </div>
            <div class="row mb-2"> <p class="fw-normal">${formatNumberWithDots(countryInfo.population)}</p> </div>

            <div class="row"> <p class="fw-bold">Bordering Countries</p> </div>
            ${borderCountriesHTML}
            
          </div>
        </div>
      </div>
  </div> ` +
  `<div class="modal-footer">
      <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Close</button>
  </div>` +
  `</div> </div> </div>`;

  modalDiv.innerHTML = modalHTML;

  const countrieInfoModal = new bootstrap.Modal(document.getElementById(`${countryInfo.name}ModalID`));
  countrieInfoModal.show();

};

// Displays the info of the countries in the table.
// Receives the info.
const displayTableInfo = (countriesInfo) => {
  let tbody = document.getElementById("countriesTableBodyID");

  tbody.innerHTML = ""; // Re-start the table
  countriesInfo.forEach((country) => {
    let tr = document.createElement("tr");

    continents = "";
    capitals = "";

    country.capital.forEach((element) => {
      capitals += element + ", ";
    });

    country.continents.forEach((element) => {
      continents += element + ", ";
    });
    
    
    tr.innerHTML = 
      `<td class="text-center">${country.name.common}</td>` +
      `<td class="text-center">${country.name.official}</td>` +
      `<td class="text-center">${continents.slice(0, -2)}</td>` +
      `<td class="text-center">${country.cca3}</td>` +
      `<td class="text-center">${capitals.slice(0, -2)}</td>` +
      `<td class="text-center">${country.region}</td>` +
      `<td class="text-center"><span><button id="btn${country.cca3}id" type="button" class="btn btn-secondary">See details</button></span></td>`
    tbody.appendChild(tr);

    // See details button
    const btn = document.getElementById(`btn${country.cca3}id`);

    // Calling country details modal
    btn.addEventListener("click", () => {
      callCountryDetailsModal(`${country.name.common}`);
    });
  });
}

// Requests the info and handes the promise to pass it to the display of the table
const createTable = (userInput) => {
  obtainCountries(userInput) // Promise handle
    .then((countriesInfo) => {
      if (countriesInfo !== undefined) {
        displayTableInfo(countriesInfo);
      } else {
        showCountryNotFoundModal();
      }
    })
    .catch((error) => {
      console.error("Error obtaining countries:", error);
    });

};