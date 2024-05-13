// The svg for map
// Existing code
const svgMap = d3.select("#svgmap"),
  widthMap = +svgMap.attr("width"),
  heightMap = +svgMap.attr("height");

// Add a class to the SVG
svgMap.attr("class", "mySvg").style("z-index", "0");
const widthBar = 500; // specify the width of the bar chart SVG
const heightBar = 500; // specify the height of the bar chart SVG
// Add a class to the SVG bar chart

// Add a class to the div

// Map and projection
const projectionMap = d3
  .geoMercator()
  .scale(200)
  .center([0, 20])
  .translate([widthMap / 2, heightMap / 2]);

const pathMap = d3.geoPath().projection(projectionMap);

// Data and color scale for map
const dataMap = new Map();
const colorScaleMap = d3
  .scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(["#FFFF00", "#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FF0000"]);

// Load external data and boot for map
Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"
  ),
]).then(function ([topoData, populationData]) {
  topoData.features = topoData.features.filter(function (feature) {
    return feature.properties.name !== "Antarctica";
  });

  // Process population data
  populationData.forEach(function (d) {
    dataMap.set(d.code, +d.pop);
  });

  // Draw the map
  svgMap
    .selectAll("path")
    .data(topoData.features)
    .enter()
    .append("path")
    .attr("d", pathMap)
    .attr("fill", function (d) {
      d.total = dataMap.get(d.id) || 0;
      return colorScaleMap(d.total);
    })
    .style("stroke", "transparent")
    .attr("class", "Country");

  svgMap.attr("preserveAspectRatio", "none");

  function mouseClickMap(d) {
    // Calculate min and max total values
    const minTotalMap = d3.min(
      Array.from(dataMap.values()).filter((value) => value > 50000)
    );

    const maxTotalMap = d3.max(Array.from(dataMap.values()));
    console.log("minTotal:", minTotalMap);
    console.log("maxTotal:", maxTotalMap);
    // Define your output range
    const minOutputMap = 50; // Minimum rectangle width
    const maxOutputMap = 200; // Maximum rectangle width

    // Create the scale
    const scaleMap = d3
      .scaleLinear()
      .domain([minTotalMap, maxTotalMap])
      .range([minOutputMap, maxOutputMap]);
    console.log("mouseClick d:", d);
    const dataCountry = d3.select(this).datum();
    console.log("this:", dataCountry.total);

    console.log("mouseClick d:", d);
    console.log("this:", dataCountry.total);

    console.log("Country clicked:", dataCountry);

    // Calculate the bounding box of the clicked country
    const bboxMap = this.getBBox();
    const bboxWidthMap = bboxMap.width;
    const bboxHeightMap = bboxMap.height;

    // Calculate the scale factor based on the size of the country
    const scaleFactorMap =
      0.8 / Math.max(bboxWidthMap / widthMap, bboxHeightMap / heightMap);

    // Calculate the centroid of the clicked country
    const centroidMap = pathMap.centroid(dataCountry);

    // Calculate the translation to center the clicked country
    const xMap = widthMap / 1.25 - scaleFactorMap * centroidMap[0];
    const yMap = heightMap / 2 - scaleFactorMap * centroidMap[1];

    // Transition all countries back to their original scale and set their opacity back to 0.8
    d3.selectAll(".Country")
      .transition()
      .duration(750)
      .attr("transform", "")
      .style("opacity", 0);

    // Scale up the clicked country and set its opacity back to 1
    d3.select(this)
      .transition()
      .duration(750)
      .attr(
        "transform",
        "translate(" + xMap + "," + yMap + ")scale(" + scaleFactorMap + ")"
      )
      .on("end", function (d) {
        // After the transition ends... s

        let svgWidth = document
          .querySelector("svg")
          .getBoundingClientRect().width;
        let bodyWidth = document.body.getBoundingClientRect().width;
        let remainingWidth = bodyWidth - svgWidth;
        /* positionering af div */
        let divWidth;
        if (remainingWidth > svgWidth) {
          divWidth = svgWidth;
        } else {
          divWidth = remainingWidth;
        }
        console.log("divWidth", divWidth);
        let div = d3
          .select("body")
          .append("div")
          .attr("id", "content")
          .attr("class", "content")
          .style("position", "fixed") // Position it fixed
          .style("left", "150px") // Position it to the left of the SVG
          .style("top", "150px") // Position it at the top of the page
          .style("width", divWidth + "px") // Limit the width to the remaining space or the SVG width, whichever is smaller
          .style("height", "80%") // Make it take up 80% of the height
          .style("opacity", 0); // Start with an opacity of 0
        // .style("z-index", "2"); // Set the z-index to 2

        div.append("h1").text("Indhold");

        div.append("p").text("").attr("id", "contentText");

        div
          .transition() // Start a transition
          .duration(750) // Make the transition last 0.75 seconds
          .style("opacity", 1); // End with an opacity of 1

        //   let svgWrapper = d3.select("body").append("div")
        //   .style("position", "relative")
        //   .style("z-index", "3");

        // // Append the SVGs to the wrapper div
        // let svg = svgWrapper.append("svgMap")
        const svgBar = d3
          .select("#content")
          .append("svg")
          .attr("id", "svgbar")
          .attr("class", "mySvgBar")
          .attr("width", widthBar)
          .attr("height", heightBar)
          .style("position", "fixed");

        div;
        d3.select("#contentText")

          // .attr("x", widthMap / 1.25) // Position it at the center of the SVG
          // .attr("y", 50) // A little bit down from the top
          .attr("text-anchor", "middle") // Center the text
          .style("font-size", "24px") // Make the text a bit larger
          .style("fill", "black") // Make the text black
          .style("opacity", 1) // Set the opacity to 0
          .text(d.properties.name)
          .transition()
          .duration(500)
          .style("z-index", "2");
        // .style("opacity", 1); // Set the text to the name of the country
        svgBar
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 450)
          .attr("width", scaleMap(sunMaxMap(dataCountry))) // Use the scale here
          .attr("height", 50)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .style("opacity", 1);
        svgBar //bar for land energi forbrug
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 450)
          .attr("width", scaleMap(sunMaxMap(dataCountry)) - 20) //denne skal ændres til en ny funktion som tager landets energi forbrug
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "red")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgBar
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 450)
          .attr("width", scaleMap(sunMaxMap(dataCountry)) - 50) // Use the scale here
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "blue")
          .transition()
          .duration(500)
          .style("opacity", 1);
      });
    function sunMaxMap(d) {
      return d.total;
    }
    console.log("this is d1", sunMaxMap(dataCountry));
  }

  // Attach the mouseClick function to the click event
  svgMap.selectAll(".Country").on("click", mouseClickMap);

  // Add an event listener for a double click event
  svgMap.on("dblclick", function () {
    // Transition all countries back to their original scale and set their opacity back to 0.8
    d3.selectAll(".Country")
      .transition()
      .duration(750)
      .attr("transform", "scale(1)")
      .style("opacity", 0.8)
      .attr("stroke-width", 0.5);
    svgMap
      .selectAll("text")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();

    svgMap
      .selectAll("rect")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();

    d3.select(".content")
      .transition()
      .duration(750) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent
      .on("end", function () {
        d3.select(".content").remove();
      }); // remove the div after the transition is complete
  });

  function sunMinMap() {
    return d3.min(Array.from(dataMap.values(), (d) => d));
  }
  console.log(sunMinMap());
});
