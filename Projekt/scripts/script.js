// The svg for map
// Existing code
const widthMap = window.innerWidth;
console.log("widthMap", widthMap);
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
const gradientMargin = 30;

// Create the SVG for the gradient bar
const svgGradient = d3
  .select("#gradientBar")
  .append("svg")
  .attr("width", gradientWidth)
  .attr("height", gradientHeight + gradientMargin)
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
const defs = svgGradient.append("defs");

const filter = defs
  .append("filter")
  .attr("id", "dropshadow")
  .attr("height", "130%");

filter
  .append("feGaussianBlur")
  .attr("in", "SourceAlpha")
  .attr("stdDeviation", 3)
  .attr("result", "blur");

filter
  .append("feOffset")
  .attr("in", "blur")
  .attr("dx", 2)
  .attr("dy", 2)
  .attr("result", "offsetBlur");

const feMerge = filter.append("feMerge");

feMerge.append("feMergeNode").attr("in", "offsetBlur");
feMerge.append("feMergeNode").attr("in", "SourceGraphic");

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
  //work
  console.log(alldata);
  let sunPotentialByCountry = {};
  alldata.forEach((d) => {
    sunPotentialByCountry[d.name] = +d.sunpotentialkwhyearm2; // convert to number
  });
  let sunPotentialValues = Object.values(sunPotentialByCountry);
  let minSunPotential = d3.min(sunPotentialValues.filter((value) => value > 0));
  let maxSunPotential = d3.max(sunPotentialValues);
  const colorScaleMap = d3
    .scaleSequential()
    .domain([minSunPotential, maxSunPotential])
    .interpolator(d3.interpolateYlOrRd);

  console.log(maxSunPotential);
  console.log(minSunPotential);
  console.log(sunPotentialValues);
  // Process population data
  alldata.forEach(function (d) {
    dataMap.set(d.name, +d.sunpotentialkwhyearm2);
  });

  // Process population data
  alldata.forEach(function (d) {
    dataMap.set(d.name, +d.sunpotentialkwhyearm2);
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
  console.log(colorScaleMap(minSunPotential)); // Log the color for the minimum sun potential
  console.log(colorScaleMap(maxSunPotential));
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
  svgGradient
    .append("text")
    .attr("x", 0)
    .attr("y", gradientHeight + 20)
    .text(minSunPotential + " kWh/year/m2");

  svgGradient
    .append("text")
    .attr("x", gradientWidth)
    .attr("y", gradientHeight + 20)
    .attr("text-anchor", "end")
    .text(maxSunPotential + " kWh/year/m2");
  function mouseClickMap(d) {
    const dataCountry = d3.select(this).datum();
    console.log("this is the datacountry const", dataCountry);
    const clickedCountryName = dataCountry.properties.name;
    const clickedCountryData = alldata.filter(
      (data) => data.name === clickedCountryName
    )[0];
    console.log("this is the clicked country data", clickedCountryData);
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
      .on("end", function() {
        d3.select(this).style("display", "none")
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
          .style("width", widthBar + 20 + "px") // Limit the width to the remaining space or the SVG width, whichever is smaller
          .style("height", "60%") // Make it take up 80% of the height
          .style("opacity", 0); // Start with an opacity of 0
        // .style("z-index", "2"); // Set the z-index to 2

        div.append("p").text("").attr("id", "contentText");
        div
          .transition() // Start a transition
          .duration(750) // Make the transition last 0.75 seconds
          .style("opacity", 1); // End with an opacity of 1
        div.append("h1").text("Indhold");
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
        svgBar //bar for max sol potentiale
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 0)
          .attr("class", "maxBar")
          .attr("width", "50px") //lav en ny funktion som tager landets sol potentiale
          .attr("height", 30)
          .style("opacity", 0)
          .style("fill", "darkblue")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgBar //bar for land energi forbrug
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 50)
          .attr("class", "energiConsBar")
          .attr("width", "50px") //denne skal ændres til en ny funktion som tager landets energi forbrug widthBar - scaleMap(energiConsMap(dataCountry)) - 20
          .attr("height", 30)
          .style("opacity", 0)
          .style("fill", "yellow")
          .transition()
          .duration(500)
          .style("opacity", 1);
        console.log("this is d", dataCountry);
        console.log("all data", alldata.countryareakm2);

        svgBar // bar for sol produktion
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 100)
          .attr("class", "sunProdBar")
          .attr("width", "50px") //denne skal ændres til en ny funktion som tager landets sol produktion
          .attr("height", 30)
          .style("opacity", 0)
          .style("fill", "orange")
          .transition()
          .duration(500)
          .style("opacity", 1);
        // For max sol potentiale
        svgBar
          .append("text")
          .attr("x", "50px")
          .attr("y", 15)
          .attr("class", "maxBarText")
          .style("fill", "white")
          .text(sunMaxMap(dataCountry));
      });

    function sunMaxMap(d) {
      // This function should return the country's solar potential
      const result =
        clickedCountryData.sunpotentialkwhyearm2 *
        1000000 *
        clickedCountryData.countryareakm2;
      const resultInPWh = parseInt(Math.floor(result) * 1e-12); // Convert kWh to PWh and remove decimals
      return resultInPWh;
    }
    console.log("this is sunpotential", sunMaxMap(dataCountry));
    function sunProdMap(d) {
      //Denne funktion skal retunere landets sol produktion
      const result = clickedCountryData.energysunproductionyearpj;
      const conversionFactor = 0.00027778; // Convert from PJ to PWh
      return Math.floor(result * conversionFactor); //Vi mangler data til denne funktion
    }
    console.log("this is sunprod", sunProdMap(dataCountry));
    function energiConsMap(d) {
      //Denne funktion skal retunere landets energi forbrug
      return d.total; //Vi mangler data til denne funktion
    }

    console.log("this is d1", sunMaxMap(dataCountry));
  }

  // Attach the mouseClick function to the click event
  svgBar.selectAll(".Country").on("click", mouseClickMap);
  
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
