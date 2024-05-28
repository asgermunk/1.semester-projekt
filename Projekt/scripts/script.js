// The svg for map
// Existing code
const widthMap = window.innerWidth - 25;
const searchBox = d3.select("#search-box");
const dropdown = d3.select("#dropdown");
const heightMap = window.innerHeight + 50;
const svgBar = d3
  .select("#svgmap")
  .attr("width", widthMap)
  .attr("height", heightMap);

// Add a class to the SVG
svgBar.attr("class", "mySvg");
const widthBar = 350; // specify the width of the bar chart SVG
const heightBar = 300; // specify the height of the bar chart SVG
// Define the width and height of the gradient bar
const gradientWidth = 500;
const gradientHeight = 20;
const gradientMargin = 40;

// Create the SVG for the gradient bar
const svgGradient = d3
  .select("#gradientBar")
  .append("svg")
  .attr("width", gradientWidth)
  .attr("height", gradientHeight)
  .style("position", "fixed")
  .style("right", gradientMargin + "px")
  .style("bottom", gradientMargin - 20 + "px");

// Define the gradient
const gradient = svgGradient
  .append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0%");

const projectionMap = d3 // Map and projection
  .geoMercator()
  .center([0, 20])
  .translate([widthMap / 2, heightMap / 2]);
const pathMap = d3.geoPath().projection(projectionMap);
const dataMap = new Map(); // Data for map
const minOutputMap = 50; // Minimum rectangle width
const maxOutputMap = 300; // Maximum rectangle width
let allData;

Promise.all([
  // Load external data and boot for map
  d3.json("dataset/world.geojson"),
  d3.json("http://localhost:4000/alldata"),
]).then(function ([topoData, alldata]) {
  allData = alldata;
  //topoData = world.geojson, populationData = world_population.csv
  topoData.features = topoData.features.filter(function (feature) {
    return (
      feature.properties.name !== "Antarctica" &&
      feature.properties.name !== "French Southern and Antarctic Lands" &&
      feature.properties.name !== "Taiwan" &&
      feature.properties.name !== "New Caledonia"
    );
  });
  let sunProdByCountry = {};
  let energyConsByCountry = {};
  let sunPotentialByCountry = {};

  alldata.forEach((d) => {
    sunPotentialByCountry[d.country] = +d.sunpotentialkwhyearm2; // convert to number
  });
  console.log("this is sunpotentialbycountry", sunPotentialByCountry);
  alldata.forEach((d) => {
    sunProdByCountry[d.country] = +d.solarproductionterawatthoursyear; // convert to number
  });

  alldata.forEach((d) => {
    energyConsByCountry[d.country] = +d.energyproductionkwhyear; // convert to number
  });
  console.log(allData);
  let sunPotentialValues = Object.values(sunPotentialByCountry);
  console.log("this is sunpotentialvalues", sunPotentialValues);
  let minSunPotential = d3.min(sunPotentialValues.filter((value) => value > 0));
  let maxSunPotential = d3.max(sunPotentialValues);

  let sunProdValues = Object.values(sunProdByCountry);
  let minSunProd = d3.min(sunProdValues.filter((value) => value > 0));
  let maxSunProd = d3.max(sunProdValues);

  let energyConsValues = Object.values(energyConsByCountry);
  let minEnergiCons = d3.min(energyConsValues.filter((value) => value > 0));
  let maxEnergiCons = d3.max(energyConsValues);
  const colorScaleMap = d3
    .scaleSequential()
    .domain([minSunPotential, maxSunPotential])
    .interpolator(d3.interpolateYlOrRd);
  // Process population data
  alldata.forEach(function (d) {
    dataMap.set(d.country, +d.sunpotentialkwhyearm2);
  });

  console.log("this is dataMap", dataMap);
  // Listen for changes in the input field
  searchBox.on("input", function () {
    resetMap();
    // Save the input field's value in lowercase
    const searchTerm = searchBox.property("value").toLowerCase();

    // Filter countries based on the input field's value
    const filteredCountries = topoData.features
      .map((d) => d.properties.name)
      .filter((name) => name.toLowerCase().startsWith(searchTerm));

    // Update the dropdown menu with the filtered countries
    updateDropdown(filteredCountries);

    // If the input field is empty, call the function to reset the dropdown menu
    if (!searchTerm) {
      resetDropdown();
      resetMap(); // You can also choose to reset the map if the input field is empty
    }
  });

  // Function to update the dropdown menu with filtered countries
  function updateDropdown(filteredCountries) {
    // Remove all existing elements from the dropdown menu
    dropdown.selectAll("li").remove();

    // Show or hide the dropdown menu based on the number of filtered countries
    dropdown.style("display", filteredCountries.length ? "block" : "none");

    // Add the filtered countries to the dropdown menu
// Your existing dropdown script
dropdown
  .selectAll("li")
  .data(filteredCountries)
  .enter()
  .append("li")
  .attr("id", "dropdown-item")
  .text((d) => d)
  .on("click", function (event, d) {
    resetMap(); 
    const country = d;
    const countryPath = svgBar
      .selectAll("path")
      .filter((d) => d.properties.name === country)
      .node();

        // If the country exists, perform the click action on the map
        if (countryPath) {
          mouseClickMap.call(countryPath, countryPath.__data__);
        }

        // Autofill the input field with the selected country
        searchBox.property("value", country);

        // Hide the dropdown menu
        dropdown.style("display", "none");
      });
  }

  // Function to reset the dropdown menu
  function resetDropdown() {
    dropdown.selectAll("li").remove(); // Remove all elements from the dropdown menu
    dropdown.style("display", "none"); // Hide the dropdown menu
  }

  // Function to reset the map
  function resetMap() {
    d3.selectAll(".Country")
        .transition()
        .duration(750)
        .attr("transform", "scale(1)")
        .style("opacity", 0.8)
        .attr("stroke-width", 0.5);

    d3.select("#welcome-heading")
        .transition()
        .duration(750)
        .style("display", "flex")
        .style("opacity", 1);

    d3.select("#content")
        .transition()
        .duration(750)
        .style("opacity", 0)
        .remove();
}
document.getElementById('dropdown').addEventListener('change', function(event) {
  let selectedCountry = event.target.value;
  resetMap(); 
  updateMap(selectedCountry); 
});
  // Draw the map
  svgBar
    .selectAll("path")
    .data(topoData.features)
    .enter()
    .append("path")
    .attr("d", pathMap)

    .attr("fill", function (d) {
      let sunPotential = sunPotentialByCountry[d.properties.name] || 0;
      // Set the color based on the sun potential
      return sunPotential > 0 ? colorScaleMap(sunPotential) : "grey"; // Return grey for non-positive values
    })
    .style("stroke", "transparent")
    .attr("class", "Country");
  // Define the start of the gradient
  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScaleMap(minSunPotential));

  // Define the end of the gradient
  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScaleMap(maxSunPotential));

  // Add the gradient bar
  // Add the gradient bar
  svgGradient
    .append("rect")
    .attr("width", gradientWidth)
    .attr("height", gradientHeight)
    .style("fill", "url(#gradient)")

    .style("stroke-width", 2)
    .style("filter", "url(#dropshadow)");
  // Add the min and max labels
  document.getElementById("minText").innerText =
    minSunPotential + " kWh/year/m2";
  document.getElementById("maxText").innerText =
    maxSunPotential + " kWh/year/m2";
    function resetDisplayedData() {
      d3.select("#content") // Select the content div
          .transition()
          .duration(500)
          .style("opacity", 0) // Fade out the content
          .remove(); // Remove the content
  }
  
  // Function to handle displaying data for a country
  function displayCountryData(clickedCountryData, clickedCountryName, countryCode) {
      // Display the data for the selected country here
      // This function can be used to update the content div with the relevant data
  }
  function mouseClickMap(d) {
    const dataCountry = d3.select(this).datum();
    resetMap(); // Nulstil kortet først

    const clickedCountryName = dataCountry.properties.name;
    const clickedCountryData = alldata.filter(
        (data) => data.country === clickedCountryName
    )[0];
    console.log("this is the clicked country data", clickedCountryData);

    const countryCode = mapCountryNameCode(clickedCountryName);
    if (countryCode) {
        updateFlag(countryCode);
        displayCountryData(clickedCountryData, clickedCountryName, countryCode);
    } else {
        console.log("Landekode ikke fundet for", clickedCountryName);
    }
    // Calculate the bounding box of the clicked country
    const bboxMap = this.getBBox(); //bboxMap = {x, y, width, height} bounding box laver den mindste firkant omkring landet
    const bboxWidthMap = bboxMap.width;
    const bboxHeightMap = bboxMap.height;
    // Calculate the scale factor based on the size of the country
    const scaleFactorMap =
      0.6 / Math.max(bboxWidthMap / widthMap, bboxHeightMap / heightMap);
    // Calculate the centroid of the clicked country
    const centroidMap = pathMap.centroid(dataCountry); //centroidMap = [x, y] - midten af landet
    // Calculate the translation to center the clicked country
    const xMap = widthMap / 1.45 - scaleFactorMap * centroidMap[0]; //map x position
    const yMap = heightMap / 2 - scaleFactorMap * centroidMap[1]; //map y position
    //gør alle lande usynlige
    d3.selectAll(".Country")
      .transition()
      .duration(750)
      .attr("transform", "")
      .style("opacity", 0)
      .attr("transform", "scale(0)");

    d3.select("#welcome-heading")
      .transition()
      .duration(750)
      .style("opacity", 0)
      .on("end", function () {
        d3.select(this).style("display", "none");
      });

    // gør det valgte land synligt og gør det stort, samt få det til at være i midten
    d3.select(this)
      .transition()
      .duration(750)
      .attr(
        "transform",
        "translate(" + xMap + "," + yMap + ")scale(" + scaleFactorMap + ")"
      )
      .on("end", function (d) {
        let div = d3
          .select("body")
          .append("div")
          .attr("id", "content")
          .attr("class", "content")
          .style("position", "absolute") // Position it fixed
          .style("left", "50px") // Position it to the left of the SVG
          .style("top", "50px") // Position it at the top of the page
          .style("width", widthBar + 50 + "px") // Limit the width to the remaining space or the SVG width, whichever is smaller
          .style("height", "70%") // Make it take up 80% of the height
          .style("opacity", 0); // Start with an opacity of 0
        // .style("z-index", "2"); // Set the z-index to 2
        div.append("p").text("").attr("id", "contentText");
        div
          .transition() // Start a transition
          .duration(750) // Make the transition last 0.75 seconds
          .style("opacity", 1); // End with an opacity of 1

        const svgBar = d3
          .select("#content")
          .append("svg")
          .attr("id", "svgbar")
          .attr("class", "mySvgBar")
          .attr("width", widthBar)
          .attr("height", heightBar)
          .style("position", "flexc");

        d3.select("#contentText") // Add the name of the country to the content div
          .attr("x", widthMap / 1.25) // Position it at the center of the SVG
          .attr("y", 50) // A little bit down from the top
          .attr("text-anchor", "middle") // Center the text
          .style("font-size", "48px") // Make the text a bit larger
          .style("fill", "black") // Make the text black
          .style("opacity", 0) // Set the opacity to 0
          .text(d.properties.name)
          .transition()
          .duration(500)
          .style("opacity", 1); // Set the text to the name of the country
        svgBar //bar for sol potentiale
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 0)
          .attr("class", "maxBar")
          .attr("width", sunPotentialBarScale(dataCountry)) //lav en ny funktion som tager landets sol potentiale
          .attr("height", 30)
          .style("opacity", 0)
          .style("fill", "darkblue")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgBar //bar for land energi forbrug
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 80)
          .attr("class", "energiConsBar")
          .attr("width", +energiConsBarScale(dataCountry)) //denne skal ændres til en ny funktion som tager landets energi forbrug widthBar - scaleMap(energiConsMap(dataCountry)) - 20
          .attr("height", 30)
          .style("opacity", 0)
          .style("fill", "yellow")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgBar // bar for sol produktion
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 160)
          .attr("class", "sunProdBar")
          .attr("width", sunProdBarScale(dataCountry)) //denne skal ændres til en ny funktion som tager landets sol produktion
          .attr("height", 30)
          .style("opacity", 0)
          .style("fill", "orange")
          .transition()
          .duration(500)
          .style("opacity", 1);

        // For solar potential
        var sunPotentialValue = sunPotential(dataCountry);
        svgBar
          .append("text")
          .attr("x", sunPotentialBarScale(dataCountry) + "px")
          .attr("y", 15)
          .attr("class", "maxBarText")
          .style("fill", "black")
          .text(
            sunPotentialValue === null || sunPotentialValue === 0
              ? "No data available"
              : sunPotentialValue + " PWh"
          );

        // For energy consumption
        var energiConsValue = energiConsMap(dataCountry);
        svgBar
          .append("text")
          .attr("x", energiConsBarScale(dataCountry))
          .attr("y", 100)
          .attr("class", "energiConsText")
          .style("fill", "black")
          .text(
            energiConsValue === null || energiConsValue === 0
              ? "No data available"
              : energiConsValue + " PWh"
          );

        // For sun energy production
        var sunProdValue = sunProdMap(dataCountry);
        svgBar
          .append("text")
          .attr("x", sunProdBarScale(dataCountry))
          .attr("y", 180)
          .attr("class", "sunProdText")
          .style("fill", "black")
          .text(
            sunProdValue === null || sunProdValue === 0
              ? "No data available"
              : sunProdValue + " TWh"
          );

        var svgWidth = svgBar.node().getBoundingClientRect().width; // Get the width of the SVG

        svgBar // Description for solar potential
          .append("text")
          .attr("x", 0)
          .attr("y", 45)
          .style("fill", "black")
          .text("The theoretical solar production potential of ")
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.2em")
          .text(clickedCountryName);

        svgBar // Line under the text
          .append("line")
          .attr("x1", 0)
          .attr("y1", 70)
          .attr("x2", svgWidth)
          .attr("y2", 70)
          .style("stroke", "black")
          .style("stroke-width", 2);

        svgBar // Description for energy consumption
          .append("text")
          .attr("x", 0)
          .attr("y", 130)
          .style("fill", "black")
          .text("The total energy consumption ")
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.2em")
          .text("from all sources in PWh");

        svgBar // Line under the text
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", svgWidth)
          .attr("y2", 0)
          .style("stroke", "black")
          .style("stroke-width", 2);

        svgBar // Line under the text
          .append("line")
          .attr("x1", 0)
          .attr("y1", 155)
          .attr("x2", svgWidth)
          .attr("y2", 155)
          .style("stroke", "black")
          .style("stroke-width", 2);

        svgBar // Description for solar production
          .append("text")
          .attr("x", 0)
          .attr("y", 210)
          .style("fill", "black")
          .text("The total solar energy production ")
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.2em")
          .text("in TWh");

        svgBar // Line under the text
          .append("line")
          .attr("x1", 0)
          .attr("y1", 235)
          .attr("x2", svgWidth)
          .attr("y2", 235)
          .style("stroke", "black")
          .style("stroke-width", 2);
// Tilføj div til HTML-dokumentet og positioner den relativt til svgBar
const flagContainer = d3
  .select("#content") // Vælg din content div
  .append("div")
  .attr("id", "flag-container")
  .style("position", "absolute")
  .style("left", "50%")
  .style("bottom", "0") // Placer nederst
  .style("transform", "translateX(-50%)") // Center vandret
  .style("text-align", "center")
  .style("margin", "20px 0px")
  .style("display", "block")
  .style("visibility", "visible");

// Tilføj flag til flag-container
const flagURL = `photos/flags/${countryCode.toLowerCase()}.png`;
flagContainer
  .append("img")
  .attr("id", "flag")
  .attr("alt", `${clickedCountryName} Flag`)
  .attr("src", flagURL)
  .style("width", "250px")
  .style("height", "auto")
  .style("border", "3px solid black");

      });

    function sunPotentialBarScale(d) {
      // This function returns the width of the rectangle based on the sun potential
      const result = clickedCountryData.sunpotentialkwhyearm2; // Get the sun potential of the country
      const scale = d3
        .scaleLinear()
        .domain([minSunPotential, maxSunPotential])
        .range([minOutputMap, maxOutputMap]); // Create a linear scale
      return scale(result); // Return the width of the rectangle
    }
    console.log("this is sunpotentialbar", sunPotentialBarScale(dataCountry));

    function sunProdBarScale(d) {
      // This function returns the width of the rectangle based on the sun production
      const result = clickedCountryData.solarproductionterawatthoursyear; // Get the sun production of the country
      const scale = d3
        .scaleLinear()
        .domain([minSunProd, maxSunProd])
        .range([minOutputMap, maxOutputMap]); // Create a linear scale
      return scale(result); // Return the width of the rectangle
    }
    console.log("this is sunprodBar", sunProdBarScale(dataCountry));

    function energiConsBarScale(d) {
      // This function returns the width of the rectangle based on the energy consumption
      const result = clickedCountryData.energyproductionkwhyear; // Get the energy consumption of the country
      const scale = d3
        .scaleLinear()
        .domain([minEnergiCons, maxEnergiCons])
        .range([minOutputMap, maxOutputMap]); // Create a linear scale
      return scale(result); // Return the width of the rectangle
    }
    console.log("this is energiConsBar", energiConsBarScale(dataCountry));

    function sunPotential(d) {
      // This function returns the country's solar potential in PWh
      const result =
        clickedCountryData.sunpotentialkwhyearm2 *
        1000000 *
        clickedCountryData.countryareakm2;
      const resultInPWh = parseInt(Math.floor(result) * 1e-12); // Convert kWh to PWh and remove decimals
      return resultInPWh;
    }
    console.log("this is sunpotential", sunPotential(dataCountry));

    function sunProdMap(d) {
      //This function returns the country's solar production in PWh
      const result = clickedCountryData.solarproductionterawatthoursyear;
      return result;
    }
    console.log("this is sunprod", sunProdMap(dataCountry));
    function energiConsMap(d) {
      //This function returns the country's energy consumption in PWh
      const result = clickedCountryData.energyproductionkwhyear;

      const resultInPWh = result * 1e-12; // Convert kWh to PWh

      return resultInPWh;
    }

    console.log("this is energiCons", energiConsMap(dataCountry));
  }

  // Attach the mouseClick function to the click event
  svgBar.selectAll(".Country").on("click", mouseClickMap);
  // Add mouseover and mouseout event listeners
  svgBar
    .selectAll(".Country")
    .on("mouseover", function () {
      d3.select(this)
        .style("stroke-width", "3") // Set the border thickness
        .style("stroke", "black"); // Set the border color
    })
    .on("mouseout", function () {
      d3.select(this)
        .style("stroke-width", "1") // Reset the border thickness
        .style("stroke", "none"); // Reset the border color
    });
  // Add an event listener for a double click event
  svgBar.on("dblclick", function () {
    // Transition all countries back to their original scale and set their opacity back to 0.8
    d3.selectAll(".Country")
      .transition()
      .duration(1000)
      .attr("transform", "scale(1)")
      .style("opacity", 0.8)
      .attr("stroke-width", 0.5);
    svgBar
      .selectAll("text")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();

    d3.select("#welcome-heading")
      .transition()
      .duration(1000)
      .style("display", "flex")
      .attr("transform", "scale(1)")
      .style("opacity", 1);

    svgBar
      .selectAll("rect")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();

    d3.select("#content")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove();
  });
});

const popupBox = document.getElementById("popup");
popupBox.addEventListener("click", function () {
  this.style.display = "none";
});

// darkmode
function darkMode() {
  var element = document.body;
  element.classList.toggle("dark-mode");
}
function popupOpen() {
  document.getElementById("popup").style.display = "block";
}
function popupClose() {
  document.getElementById("popup").style.display = "none";
}
// Funktion til at indlæse countries.json og oprette mapping fra landenavne til landekoder
// Definér en global variabel til at gemme landeoplysningerne
let countriesData;
// Funktion til at indlæse landeoplysninger fra JSON-filen
function loadCountriesData() {
  // Foretag en HTTP-anmodning for at indlæse countries.json
  // Her er et eksempel på, hvordan du kan gøre det med fetch API
  fetch('scripts/countries.json')
    .then(response => response.json())
    .then(data => {
      // Gem landeoplysningerne i countriesData
      countriesData = data;
      console.log('Landeoplysninger indlæst:', countriesData);
    })
    .catch(error => console.error('Fejl ved indlæsning af landeoplysninger:', error));
}

// Funktion til at mappe landenavne til landekoder
function mapCountryNameCode(countryName) {
  console.log("Landenavn før mapping til kode:", countryName);
  
  // Tjek om countriesData er defineret og ikke null eller undefined
  if (countriesData && typeof countriesData === 'object') {
    // Tjek om landenavnet findes i countriesData
    const countryCode = Object.keys(countriesData).find(
      key => countriesData[key].toLowerCase() === countryName.toLowerCase()
    );

    // Hvis landekoden findes, returner den
    if (countryCode) {
      console.log("Landekode fra kort:", countryCode);
      return countryCode;
    } else {
      // Hvis landenavnet ikke findes, udskriv en fejlmeddelelse
      console.log("Landenavnet blev ikke fundet i kortet.");
      return null; // eller hvad der er passende for din logik
    }
  } else {
    // Hvis countriesData ikke er defineret eller ikke er et objekt, udskriv en fejlmeddelelse
    console.error("countriesData er ikke defineret eller ikke et objekt.");
    return null; // eller hvad der er passende for din logik
  }
}

// Kald funktionen til indlæsning af landeoplysninger
loadCountriesData();



// Funktion til at opdatere flaget baseret på landekoden
function updateFlag(countryCode) {
  console.log("Received country code:", countryCode);
  if (typeof countryCode === 'string') {
    const flagURL = `photos/flags/${countryCode.toLowerCase()}.png`;
    console.log("Constructed flag URL:", flagURL);
    // Vælg det relevante <img> element og indstil src-attributten til flagets URL
    d3.select("#flag").attr("src", flagURL);
  } else {
    console.log("Invalid country code.");
  }
}
function selectCountryFromDropdown(countryName) {
  // Reset the map
  resetMap();

  // Find the country code for the selected country
  const countryCode = mapCountryNameCode(countryName);

  // Check if countryCode exists
  if (countryCode) {
    updateFlag(countryCode);
    mouseClickMap.call(d3.select("#" + countryCode).node());

    // Zoom and pan to the selected country
    zoomToCountry(countryCode);
  } else {
    console.log("Landekode ikke fundet for", countryName);
  }
}

// Function to handle selecting a country from the search box
function selectCountryFromSearchBox() {
  const countryName = document.getElementById("search").value;

  if (countryName !== "") {
      selectCountryFromDropdown(countryName);
  }
}
