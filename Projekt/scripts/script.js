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
  // Convert the object to an array of objects
  let barChartDataSunProd = Object.entries(sunProdByCountry).map(
    ([country, value]) => ({ country, value })
  );

  let barChartDataEnergiCons = Object.entries(energyConsByCountry).map(
    ([country, value]) => ({ country, value })
  );
  // Sort data in descending order and limit to top 10
  barChartDataSunProd.sort((a, b) => d3.descending(a.value, b.value));
  barChartDataSunProd = barChartDataSunProd.slice(0, 20);
  console.log("this is barChartDataSunProd", barChartDataSunProd);
  barChartDataEnergiCons.sort((a, b) => d3.descending(a.value, b.value));
  barChartDataEnergiCons = barChartDataEnergiCons.slice(0, 20);
  console.log("this is barChartDataEnergiCons", barChartDataEnergiCons);
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
    const xScaleSunProd = d3.scaleBand().range([0, widthBar]).padding(0.4);
    const xScaleEnergiCons = d3.scaleBand().range([0, widthBar]).padding(0.4);
    const yScaleSunProd = d3.scaleLinear().range([heightBar, 0]);
    const yScaleEnergiCons = d3.scaleLinear().range([heightBar, 0]);
    //define the domains
    xScaleSunProd.domain(barChartDataSunProd.map((d) => d.country));
    xScaleEnergiCons.domain(barChartDataEnergiCons.map((d) => d.country));
    yScaleSunProd.domain([0, d3.max(barChartDataSunProd, (d) => d.value)]);
    yScaleEnergiCons.domain([
      0,
      d3.max(barChartDataEnergiCons, (d) => d.value),
    ]);

    // Add Y-axis to the first SVG and add the suffix
    svgBarChartSunProd
      .append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScaleSunProd).tickFormat((d) => `${d} TWh`));

    // Add X-axis to the first SVG
    svgBarChartSunProd
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${heightBar})`)
      .call(d3.axisBottom(xScaleSunProd))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y-axis to the second SVG and add the suffix
    svgBarChartEnergiCons
      .append("g")
      .attr("class", "axis")
      .call(
        d3.axisLeft(yScaleEnergiCons).tickFormat((d) => `${d * 1e-12} PWh`)
      );

    // Add X-axis to the second SVG
    svgBarChartEnergiCons
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${heightBar})`)
      .call(d3.axisBottom(xScaleEnergiCons))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // bar chart for sol potentiale
    svgBarChartSunProd
      .selectAll(".barChart")
      .data(barChartDataSunProd)
      .enter()
      .append("rect")
      .attr("x", (d) => xScaleSunProd(d.country))
      .attr("y", heightBar) // Start from the bottom of the chart
      .attr("width", xScaleSunProd.bandwidth())
      .attr("height", 0) // Initial height is 0
      .transition() // Start a transition
      .duration(600) // Transition duration
      .delay((d, i) => (barChartDataSunProd.length - i) * 100) // Delay to start right to left
      .attr("y", (d) => yScaleSunProd(d.value)) // End at the correct y position
      .attr("height", (d) => heightBar - yScaleSunProd(d.value)); // End at the correct height

    //Barchart for energi forbrug
    svgBarChartEnergiCons
      .selectAll(".barChart")
      .data(barChartDataEnergiCons)
      .enter()
      .append("rect")
      .attr("x", (d) => xScaleEnergiCons(d.country))
      .attr("y", heightBar) // Start from the bottom of the chart
      .attr("width", xScaleEnergiCons.bandwidth())
      .attr("height", 0) // Initial height is 0
      .transition() // Start a transition
      .duration(600) // Transition duration
      .delay((d, i) => (barChartDataEnergiCons.length - i) * 100) // Delay to start right to left
      .attr("y", (d) => yScaleEnergiCons(d.value)) // End at the correct y position
      .attr("height", (d) => heightBar - yScaleEnergiCons(d.value)); // End at the correct height
  }
  // Create SVG for solar production and energy consumption

  //define the scales
  let sunPotentialValues = Object.values(sunPotentialByCountry);
  let minSunPotential = d3.min(sunPotentialValues.filter((value) => value > 0));
  let maxSunPotential = d3.max(sunPotentialValues);

  let sunProdValues = Object.values(sunProdByCountry); // Get the values of the sun production
  let minSunProd = d3.min(sunProdValues.filter((value) => value > 0)); // Find the minimum value
  let maxSunProd = d3.max(sunProdValues); // Find the maximum value

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
  ) {
    // Display the data for the selected country here
    // This function can be used to update the content div with the relevant data
  }
  // Function for when a country is clicked
  function mouseClickMap(d) {
    const dataCountry = d3.select(this).datum();
    resetMap(); // Nulstil kortet først
    // Find the data for the clicked country
    const clickedCountryName = dataCountry.properties.name;
    const clickedCountryData = alldata.filter(
      (data) => data.country === clickedCountryName
    )[0];
    console.log("this is the clicked country data", clickedCountryData);
    // Update the flag and display the country data
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

    // gør det valgte land synligt og gør det stort, samt få det til at være i midten
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

        const buttonContainer = d3
          .select("#content")
          .append("div")
          .attr("class", "button-container");

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

        function clearSVG() {
          d3.select("#svgbar").selectAll("*").remove();
        }

        function showSolarPotential(data) {
          clearSVG();

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

        function showEnergyConsumption(data) {
          clearSVG();

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

        function showSolarProduction(data) {
          clearSVG();

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

        // Initial display (could be either one of the data types or empty)
        showSolarPotential(dataCountry);

        // Create a container for the flag
        const flagContainer = d3
          .select("#content")
          .append("div")
          .attr("id", "flag-container")
          .style("position", "absolute")
          .style("left", "50%")
          .style("bottom", "0")
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
  svgBar.on("dblclick", function () {
    // Transition all countries back to their original scale and set their opacity back to 0.8
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
  });
});
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

// Funktion til at indlæse countries.json og oprette mapping fra landenavne til landekoder
// Definér en global variabel til at gemme landeoplysningerne
let countriesData;
// Funktion til at indlæse landeoplysninger fra JSON-filen
function loadCountriesData() {
  // Foretag en HTTP-anmodning for at indlæse countries.json
  // Her er et eksempel på, hvordan du kan gøre det med fetch API
  fetch("scripts/countries.json")
    .then((response) => response.json())
    .then((data) => {
      // Gem landeoplysningerne i countriesData
      countriesData = data;
      console.log("Landeoplysninger indlæst:", countriesData);
    })
    .catch((error) =>
      console.error("Fejl ved indlæsning af landeoplysninger:", error)
    );
}

// Funktion til at mappe landenavne til landekoder
function mapCountryNameCode(countryName) {
  console.log("Landenavn før mapping til kode:", countryName);

  // Tjek om countriesData er defineret og ikke null eller undefined
  if (countriesData && typeof countriesData === "object") {
    // Tjek om landenavnet findes i countriesData
    const countryCode = Object.keys(countriesData).find(
      (key) => countriesData[key].toLowerCase() === countryName.toLowerCase()
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
  if (typeof countryCode === "string") {
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
