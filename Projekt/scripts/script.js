// Globale variables for the map,svgbar and searchbox.
const widthMap = window.innerWidth - 25;
const searchBox = d3.select("#search-box");
const dropdown = d3.select("#dropdown");
const heightMap = window.innerHeight + 100;
const svgBar = d3
  .select("#svgmap")
  .attr("width", widthMap)
  .attr("height", heightMap);
// Add a class to the SVG
svgBar.attr("class", "mySvg");
const widthBar = 350;
const heightBar = 300;
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

// Loading data, promise.all is used to load multiple data sources at the same time and will first run when both data is loaded.
Promise.all([
  d3.json("dataset/world.geojson"),
  d3.json("https://solarenergy-xkhs.onrender.com/Alldata"),
]).then(function ([topoData, alldata]) {
  allData = alldata;
  //topoData = world.geojson, allData = http://localhost:4000/alldata

  // Filter out countries that have no relevance for the visualization
  topoData.features = topoData.features.filter(function (feature) {
    return (
      feature.properties.name !== "Antarctica" &&
      feature.properties.name !== "French Southern and Antarctic Lands" &&
      feature.properties.name !== "Taiwan" &&
      feature.properties.name !== "New Caledonia" &&
      feature.properties.name !== "Greenland"
    );
  });
  // Initialize an empty object to store e.g the solar production data by country
  let sunProdByCountry = {};
  let energyConsByCountry = {};
  let sunPotentialByCountry = {};

//Convert the data to numbers
  alldata.forEach((d) => {
    sunPotentialByCountry[d.country] = +d.sunpotentialkwhyearm2; // convert to number
  });
  alldata.forEach((d) => {
    sunProdByCountry[d.country] = +d.solarproductionterawatthoursyear; // convert to number
  });
  alldata.forEach((d) => {
    energyConsByCountry[d.country] = +d.energyproductionkwhyear; // convert to number
  });

  // Convert the object to an array of objects
  let barChartDataSunProd = Object.entries(sunProdByCountry).map(
    ([country, value]) => ({ country, value })
  );
  let barChartDataEnergiCons = Object.entries(energyConsByCountry).map(
    ([country, value]) => ({ country, value })
  );

  // Sort data in descending order and limit to top 20
  barChartDataSunProd.sort((a, b) => d3.descending(a.value, b.value));
  barChartDataSunProd = barChartDataSunProd.slice(0, 20);
  barChartDataEnergiCons.sort((a, b) => d3.descending(a.value, b.value));
  barChartDataEnergiCons = barChartDataEnergiCons.slice(0, 20);

  // Create the scales
  const margin = { top: 20, right: 20, bottom: 70, left: 200 };
  const widthBar = 700 - margin.left - margin.right;
  const heightBar = 500 - margin.top - margin.bottom;
  
  // Create divs for the charts
  if (window.location.href.endsWith("chart.html")) {
    //Only create the charts if the URL ends with chart.html
    const chartDivs = d3 //template for the charts
      .select("body")
      .append("div")
      .attr("class", "chart-container")
      .selectAll("div")
      .data(["barchartSunProd", "barchartEnergyCons"])
      .enter()
      .append("div")
      .attr("id", (d) => d)
      .attr("class", "barchart");

    chartDivs.each(function (d, i) {
      //Put each chart inside the divs
      const svg = d3
        .select(this)
        .append("svg")
        .attr("width", "100%")
        .attr("height", heightBar + margin.top + margin.bottom + 50)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      if (i === 0) {
        // This is the SVG for solar production
        svgBarChartSunProd = svg;
      } else {
        // This is the SVG for energy consumption
        svgBarChartEnergiCons = svg;
      }
    });

    // Apply the flex styles to the parent div
    d3.select(".chart-container")
      .style("display", "flex")
      .style("flex-direction", "row")
      .style("justify-content", "center")
      .style("align-items", "center");

    // Set the width of the .barchart divs to 50%
    d3.selectAll(".barchart")
      .style("width", "50%")
      .style("margin-bottom", "50px")
      .style("margin-left", "50px");

  
   // Create scales
const yScaleSunProd = d3.scaleBand().range([0, heightBar]).padding(0.4);
const yScaleEnergiCons = d3.scaleBand().range([0, heightBar]).padding(0.4);
const xScaleSunProd = d3.scaleLinear().range([0, widthBar]);
const xScaleEnergiCons = d3.scaleLinear().range([0, widthBar]);

//define the domains
yScaleSunProd.domain(barChartDataSunProd.map((d) => d.country));
yScaleEnergiCons.domain(barChartDataEnergiCons.map((d) => d.country));
xScaleSunProd.domain([0, d3.max(barChartDataSunProd, (d) => d.value)]);
xScaleEnergiCons.domain([0, d3.max(barChartDataEnergiCons, (d) => d.value)]);

// Add X-axis to the first SVG and add the suffix
svgBarChartSunProd
  .append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${heightBar})`)
  .call(d3.axisBottom(xScaleSunProd).tickFormat((d) => `${d} TWh`));

// Add Y-axis to the first SVG
svgBarChartSunProd
  .append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(yScaleSunProd));

// Add X-axis to the second SVG and add the suffix
svgBarChartEnergiCons
  .append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${heightBar})`)
  .call(d3.axisBottom(xScaleEnergiCons).tickFormat((d) => `${d * 1e-12} PWh`))
  .selectAll("text")
  .attr("transform", "rotate(-45)")
  .style("text-anchor", "end");

// Add Y-axis to the second SVG
svgBarChartEnergiCons
  .append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(yScaleEnergiCons));

// bar chart for sol potentiale
svgBarChartSunProd
  .selectAll(".barChart")
  .data(barChartDataSunProd)
  .enter()
  .append("rect")
  .attr("y", (d) => yScaleSunProd(d.country))
  .attr("x", 0) // Start from the left of the chart
  .attr("height", yScaleSunProd.bandwidth())
  .attr("width", 0) // Initial width is 0
  .transition() // Start a transition
  .duration(600) // Transition duration
  .delay((d, i) => (barChartDataSunProd.length - i) * 100) // Delay to start top to bottom
  .attr("width", (d) => xScaleSunProd(d.value)); // End at the correct width

//Barchart for energi forbrug
svgBarChartEnergiCons
  .selectAll(".barChart")
  .data(barChartDataEnergiCons)
  .enter()
  .append("rect")
  .attr("y", (d) => yScaleEnergiCons(d.country))
  .attr("x", 0) // Start from the left of the chart
  .attr("height", yScaleEnergiCons.bandwidth())
  .attr("width", 0) // Initial width is 0
  .transition() // Start a transition
  .duration(600) // Transition duration
  .delay((d, i) => (barChartDataEnergiCons.length - i) * 100) // Delay to start top to bottom
  .attr("width", (d) => xScaleEnergiCons(d.value)); // End at the correct width
  }
  // Create SVG for solar production and energy consumption

  //define the scales
  let sunPotentialValues = Object.values(sunPotentialByCountry);
  let minSunPotential = d3.min(sunPotentialValues.filter((value) => value > 0));
  let maxSunPotential = d3.max(sunPotentialValues);
  let sunProdValues = Object.values(sunProdByCountry); 
  let minSunProd = d3.min(sunProdValues.filter((value) => value > 0)); 
  let maxSunProd = d3.max(sunProdValues); 
  let energyConsValues = Object.values(energyConsByCountry);
  let minEnergiCons = d3.min(energyConsValues.filter((value) => value > 0));
  let maxEnergiCons = d3.max(energyConsValues);

  // Create the color scale for the map
  const colorScaleMap = d3
    .scaleSequential()
    .domain([minSunPotential, maxSunPotential]) // Set the domain to the min and max sun potential values
    .interpolator(d3.interpolateYlOrRd); // Use the YlOrRd color scheme

  // Process population data
  alldata.forEach(function (d) {
    dataMap.set(d.country, +d.sunpotentialkwhyearm2);
  }); //

 
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
    if (filteredCountries.length) {
      dropdown.style("display", "block");
    } else {
      dropdown.style("display", "none");
    }

    // Add the filtered countries to the dropdown menu as list items
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
  // Add the dropdown event listener
  document
    .getElementById("dropdown")
    .addEventListener("change", function (event) {
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
      if (sunPotential > 0) {
        return colorScaleMap(sunPotential);
      } else {
        return "grey"; // Return grey for non-positive values
      }
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
  document.getElementById("minText").className = "bold-text";

  document.getElementById("maxText").innerText =
    maxSunPotential + " kWh/year/m2";
  document.getElementById("maxText").className = "bold-text";

  // Function to handle displaying data for a country
  function displayCountryData(
    clickedCountryData,
    clickedCountryName,
    countryCode
  ){}
  // Function for when a country is clicked
  function mouseClickMap(d) {
    const dataCountry = d3.select(this).datum();
    resetMap(); // Nulstil kortet først
    // Find the data for the clicked country
    const clickedCountryName = dataCountry.properties.name;
    const clickedCountryData = alldata.filter(
      (data) => data.country === clickedCountryName
    )[0];
 
    // Update the flag and display the country data
    const countryCode = mapCountryNameCode(clickedCountryName);
    if (countryCode) {
      updateFlag(countryCode);
      displayCountryData(clickedCountryData, clickedCountryName, countryCode);
    } else {
      console.log("Landekode ikke fundet for", clickedCountryName);
    }
    // Calculate the bounding box of the clicked country
    const bboxMap = this.getBBox(); //bboxMap = {x, y, width, height} bounding box creates a rectangle around the country
    const bboxWidthMap = bboxMap.width;
    const bboxHeightMap = bboxMap.height;
    // Calculate the scale factor based on the size of the country
    const scaleFactorMap =
      0.6 / Math.max(bboxWidthMap / widthMap, bboxHeightMap / heightMap);
    // Calculate the centroid of the clicked country
    const centroidMap = pathMap.centroid(dataCountry); //centroidMap = [x, y]
    // Calculate the translation to center the clicked country
    const xMap = widthMap / 1.45 - scaleFactorMap * centroidMap[0]; //map x position
    const yMap = heightMap / 2 - scaleFactorMap * centroidMap[1]; //map y position
    // Transition all countries to the back and set their opacity to 0
    d3.selectAll(".Country")
      .transition()
      .duration(750)
      .attr("transform", "")
      .style("opacity", 0)
      .attr("transform", "scale(0)");
    // Fade out the welcome heading
    d3.select("#welcome-heading")
      .transition()
      .duration(750)
      .style("opacity", 0)
      .on("end", function () {
        d3.select(this).style("display", "none");
      });

    // Transition the clicked country to the center of the map and scale it
    d3.select(this)
      .transition()
      .duration(750)
      .attr(
        "transform",
        "translate(" + xMap + "," + yMap + ")scale(" + scaleFactorMap + ")"
      )
      //After the transition is complete, display the content div
      .on("end", function (d) {
        let div = d3
          .select("body")
          .append("div")
          .attr("id", "content")
          .attr("class", "content")
          .style("position", "fixed")
          .style("left", "50px")
          .style("top", "1px")
          .style("width", widthBar + 50 + "px")
          .style("height", "90%")
          .style("opacity", 0);

        div.append("p").text("").attr("id", "contentText");
        div.transition().duration(750).style("opacity", 1);
        
// Add the name of the country to the content div
        d3.select("#contentText") 
          .attr("x", widthMap / 1.25) 
          .attr("y", 50) 
          .attr("text-anchor", "middle") 
          .style("font-size", "48px") 
          .style("fill", "black") 
          .style("opacity", 0) 
          .text(d.properties.name)
          .transition()
          .duration(500)
          .style("opacity", 1); 

        // Create a container for the buttons
        const buttonContainer = d3
          .select("#content")
          .append("div")
          .attr("class", "button-container");
        
          // Add the buttons
        buttonContainer
          .append("button")
          .attr("id", "solarPotentialButton")
          .text("Solar Potential")
          .on("click", () => showSolarPotential(dataCountry));

        buttonContainer
          .append("button")
          .attr("id", "energyConsumptionButton")
          .text("Energy Consumption")
          .on("click", () => showEnergyConsumption(dataCountry));

        buttonContainer
          .append("button")
          .attr("id", "solarProductionButton")
          .text("Solar Production")
          .on("click", () => showSolarProduction(dataCountry));
        // Create a function to clear the SVG
        function clearSVG() {
          d3.select("#svgbar").selectAll("*").remove();
        }
        // Create a function to display the solar potential
        function showSolarPotential(data) {
          clearSVG();
          // Create a rectangle for the solar potential
          svgBar
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "maxBar")
            .attr("width", 0)
            .attr("height", 30)
            .style("opacity", 0)
            .style("fill", "Yellow")
            .style("margin-bottom", "100px")
            .transition()
            .duration(1000)
            .attr("width", sunPotentialBarScale(data))
            .style("opacity", 1);

          var sunPotentialValue = sunPotential(data);
          // Add the text for the solar potential
          svgBar
            .append("text")
            .attr("x", sunPotentialBarScale(data) + 10 + "px")
            .attr("y", 22)
            .attr("class", "maxBarText")
            .style("fill", "black")
            .text(
              sunPotentialValue === null || sunPotentialValue === 0
                ? "No data available"
                : sunPotentialValue + " PWh"
            );

          svgBar
            .append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("class", "info-text")
            .style("fill", "black")
            .text("The theoretical solar production potential of ")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.4em")
            .text(clickedCountryName + " in PWh per year.")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "2em")
            .style("font-weight", "bold") // Make this text bold
            .text("Note that this is a theoretical value, and would require ")
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.4em")
            .style("font-weight", "bold") // Make this text bold
            .text(" 100% of the area to be covered with solar panels.");
        }
        // Create a function to display the energy consumption
        function showEnergyConsumption(data) {
          clearSVG();
          // Create a rectangle for the energy consumption
          svgBar
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "energiConsBar")
            .attr("width", 0)
            .attr("height", 30)
            .style("opacity", 0)
            .style("fill", "Orange")
            .transition()
            .duration(1000)
            .attr("width", +energiConsBarScale(data))
            .style("opacity", 1);

          var energiConsValue = energiConsMap(data);
          // Add the text for the energy consumption
          svgBar
            .append("text")
            .attr("x", energiConsBarScale(data) + 10 + "px")
            .attr("y", 22)
            .attr("class", "energiConsText")
            .style("fill", "black")
            .text(
              energiConsValue === null || energiConsValue === 0
                ? "No data available"
                : energiConsValue + " PWh"
            );

          svgBar
            .append("text")
            .attr("class", "info-text")
            .attr("x", 0)
            .attr("y", 60)
            .style("fill", "black")
            .text("The total energy consumption from all sources in PWh");
        }
        // Create a function to display the solar production
        function showSolarProduction(data) {
          clearSVG();
          // Create a rectangle for the solar production
          svgBar
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "sunProdBar")
            .attr("width", 0)
            .attr("height", 30)
            .style("opacity", 0)
            .style("fill", "Red")
            .transition()
            .duration(1000)
            .attr("width", sunProdBarScale(data))
            .style("opacity", 1);

          var sunProdValue = sunProdMap(data);
          // Add the text for the solar production
          svgBar
            .append("text")
            .attr("x", sunProdBarScale(data) + 10 + "px")
            .attr("y", 22)
            .attr("class", "sunProdText")
            .style("fill", "black")
            .text(
              sunProdValue === null || sunProdValue === 0
                ? "No data available"
                : sunProdValue + " TWh"
            );

          svgBar
            .append("text")
            .attr("class", "info-text") // Add a class for styling
            .attr("x", 0)
            .attr("y", 60)
            .style("fill", "black")
            .text("The total solar energy production in TWh");
        }

        const svgBar = d3
          .select("#content")
          .append("svg")
          .attr("id", "svgbar")
          .attr("class", "mySvgBar")
          .attr("width", widthBar)
          .attr("height", heightBar)
          .style("position", "flex");

       
        showSolarPotential(dataCountry);

        // Create a container for the flag
        const flagContainer = d3
          .select("#content")
          .append("div")
          .attr("id", "flag-container")
          .style("position", "absolute")
          .style("left", "50%")
          .style("bottom", "40px")
          .style("transform", "translateX(-50%)")
          .style("text-align", "center")
          .style("margin", "20px 0px")
          .style("display", "block")
          .style("visibility", "visible");

        // add the flag image
        const flagURL = `photos/flags/${countryCode.toLowerCase()}.png`;
        flagContainer
          .append("img")
          .attr("id", "flag")
          .attr("alt", `${clickedCountryName} Flag`)
          .attr("src", flagURL)
          .style("width", "250px")
          .style("height", "auto")
          .style("border", "3px solid black");

          // Add a close button
          div.append("button")
            .text("Close")
            .attr("id", "closeButton") 
            .on("click", resetMap);
                });

    function sunPotentialBarScale(d) {
      // This function returns the width of the rectangle based on the sun potential
      const result = clickedCountryData.sunpotentialkwhyearm2;
      const scale = d3
        .scaleLinear()
        .domain([minSunPotential, maxSunPotential])
        .range([minOutputMap, maxOutputMap]); // Create a linear scale
      return scale(result); // Return the width of the rectangle
    }

    function sunProdBarScale(d) {
      // This function returns the width of the rectangle based on the sun production
      const result = clickedCountryData.solarproductionterawatthoursyear;
      const scale = d3
        .scaleLinear()
        .domain([minSunProd, maxSunProd])
        .range([minOutputMap, maxOutputMap]); // Create a linear scale
      return scale(result); // Return the width of the rectangle
    }

    function energiConsBarScale(d) {
      // This function returns the width of the rectangle based on the energy consumption
      const result = clickedCountryData.energyproductionkwhyear;
      const scale = d3
        .scaleLinear()
        .domain([minEnergiCons, maxEnergiCons])
        .range([minOutputMap, maxOutputMap]); // Create a linear scale
      return scale(result); // Return the width of the rectangle
    }

    function sunPotential(d) {
      // This function returns the country's solar potential in PWh
      const result =
        clickedCountryData.sunpotentialkwhyearm2 *
        1000000 *
        clickedCountryData.countryareakm2;

      const resultInPWh = parseInt(Math.floor(result) * 1e-12); // Convert kWh to PWh and remove decimals

      return resultInPWh;
    }

    function sunProdMap(d) {
      //This function returns the country's solar production in PWh
      const result = clickedCountryData.solarproductionterawatthoursyear;
      return result;
    }

    function energiConsMap(d) {
      //This function returns the country's energy consumption in PWh
      const result = clickedCountryData.energyproductionkwhyear;

      const resultInPWh = result * 1e-12; // Convert kWh to PWh

      return resultInPWh;
    }
  }

  // Attach the mouseClick function to the click event
  svgBar.selectAll(".Country").on("click", mouseClickMap);
  // Add mouseover and mouseout event listeners
  svgBar
    .selectAll(".Country")
    .on("mouseover", function () {
      d3.select(this)
        .style("stroke-width", "1.5") // Set the border thickness
        .style("stroke", "black"); // Set the border color
    })
    .on("mouseout", function () {
      d3.select(this)
        .style("stroke-width", "1") // Reset the border thickness
        .style("stroke", "none"); // Reset the border color
    });
  // Add an event listener for a double click event
  svgBar.on("dblclick",resetMap)
});
//Function to reset the map
function resetMap() {
  // Reset the map
  d3.selectAll(".Country")
      .transition()
      .duration(1000)
      .attr("transform", "scale(1)")
      .style("opacity", 0.8)
      .attr("stroke-width", 0.5);
    // Remove the content div
    svgBar
      .selectAll("text")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();
    // re-add the welcome heading
    d3.select("#welcome-heading")
      .transition()
      .duration(1000)
      .style("display", "flex")
      .attr("transform", "scale(1)")
      .style("opacity", 1);
    //remove the bars
    svgBar
      .selectAll("rect")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();
    // Remove the content div
    d3.select("#content")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove();
}
// Create a new SVG element for the map
const popupBox = document.getElementById("popup");
popupBox.addEventListener("click", function () {
  this.style.display = "none";
});

// darkmode
function darkMode() {
  var element = document.body;
  element.classList.toggle("dark-mode");
}
//function to open and close the popup
function popupOpen() {
  document.getElementById("popup").style.display = "block";
}
function popupClose() {
  document.getElementById("popup").style.display = "none";
}

//Define a global variable to store the country information
let countriesData;
// Funktion for loading the data inside the countries.json file
function loadCountriesData() {
  fetch("scripts/countries.json")
    .then((response) => response.json())
    .then((data) => {
      countriesData = data;
      // saving the data inside the countriesData variable
      console.log("Landeoplysninger indlæst:", countriesData);
    })
    .catch((error) =>
      console.error("Fejl ved indlæsning af landeoplysninger:", error)
    );
}
// console.log = import data succes/failure


//Funktion to map country names to country codes
function mapCountryNameCode(countryName) {
  console.log("Landenavn før mapping til kode:", countryName);


  // Checking if countriesData is defined and not null or undefined
  if (countriesData && typeof countriesData === "object") {
    //Checking if the country name exists in the countriesData
    const countryCode = Object.keys(countriesData).find(
      (key) => countriesData[key].toLowerCase() === countryName.toLowerCase()
    );


    //If the country code exists, return it
    if (countryCode) {
      console.log("Countrycode from countries.json:", countryCode);
      return countryCode;
    } else {
      // If the country name does not exist, print an error message
      console.log("Countryname couldn't be found");
      return
    }
  } else {
    // If countriesData is not defined or not an object, print an error message
    console.error("CountriesData is not defined or not an object.");
    return
  }
}


// Call the function to load the country information.
loadCountriesData();


// Function to update the flag based on the country code
function updateFlag(countryCode) {
  console.log("Received country code:", countryCode);
  //If the countryCode is a string, it will find the right flag .png image which is based on countrycode
  if (typeof countryCode === "string") {
    const flagURL = `photos/flags/${countryCode.toLowerCase()}.png`;
    console.log("Constructed flag URL:", flagURL);
    d3.select("#flag").attr("src", flagURL); // This line updates the flag image source


  } else {
    console.log("Invalid country code.");
  }
}

// Function for handling a connection between the dropdownmenu and the countrycode.
function selectCountryFromDropdown(countryName) {
  
  resetMap(); // Reset the map before selecting a new country

  // Finding the countryCode for the selected country
  const countryCode = mapCountryNameCode(countryName);

  // Check if the countryCode exists
  if (countryCode) {
    // Update the flag with the country code
    updateFlag(countryCode);

    // Simulate a mouse click on the map element for the country
    mouseClickMap.call(d3.select("#" + countryCode).node());
  } else {
    // writing out a message in console if the country code wasn't found
    console.log("Country code couldn't be found for", countryName);
  }
}

// Function to handle selecting a country from the search box
function selectCountryFromSearchBox() {
  // Get the value entered in the search input box
  const countryName = document.getElementById("search").value;

  // Check if the search input is not empty
  if (countryName !== "") {
    // Call the function to select the country from the dropdown
    selectCountryFromDropdown(countryName);
  }
}

