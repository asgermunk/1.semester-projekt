// The svg for map
const svgMap = d3.select("#svgmap"),
  widthMap = +svgMap.attr("width"),
  heightMap = +svgMap.attr("height");
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
    const centroidMap = pathMap.centroid(d1);

    // Calculate the translation to center the clicked country
    const xMap = widthMap / 2 - scaleFactorMap * centroidMap[0];
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
        // After the transition ends...
        svgMap
          .append("text") // Append a text element to the SVG
          .attr("x", widthMap / 2) // Position it at the center of the SVG
          .attr("y", 50) // A little bit down from the top
          .attr("text-anchor", "middle") // Center the text
          .style("font-size", "24px") // Make the text a bit larger
          .style("fill", "black") // Make the text black
          .style("opacity", 0) // Set the opacity to 0
          .text(d.properties.name)
          .transition()
          .duration(500)
          .style("opacity", 1); // Set the text to the name of the country
        svgMap
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 500)
          .attr("width", scaleMap(sunMaxMap(d1))) // Use the scale here

          .attr("height", 50)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .style("opacity", 1);
        svg //bar for land energi forbrug
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 500)
          .attr("width", scale(sunMax(dataCountry)) - 20) //denne skal ændres til en ny funktion som tager landets energi forbrug
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "red")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svg
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 500)
          .attr("width", scale(sunMax(dataCountry)) - 50) // Use the scale here
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
    console.log("this is d1", sunMaxMap(d1));
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
  });

  console.log(sunMaxMap());
  function sunMinMap() {
    return d3.min(Array.from(dataMap.values(), (d) => d));
  }
  console.log(sunMinMap());
});

// The svg for chart
const svgChart = d3.select("#svgchart"),
  widthChart = +svgChart.attr("width"),
  heightChart = +svgChart.attr("height"),
  margin = { top: 100, right: 0, bottom: 0, left: 0 },
  width = widthChart - margin.left - margin.right,
  height = heightChart - margin.top - margin.bottom,
  innerRadius = 90,
  outerRadius = Math.min(width, height) / 2;

const svg = svgChart
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv(
  "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum.csv"
).then(function (dataChart) {
  // X scale: common for 2 data series
  var x = d3
    .scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(
      dataChart.map(function (d) {
        return d.Country;
      })
    );

  // Y scale outer variable
  var y = d3.scaleRadial().range([innerRadius, outerRadius]).domain([0, 13000]);

  // Second barplot Scales
  var ybis = d3.scaleRadial().range([innerRadius, 5]).domain([0, 13000]);

  // Add the bars
  svg
    .append("g")
    .selectAll("path")
    .data(dataChart)
    .enter()
    .append("path")
    .attr("fill", "#69b3a2")
    .attr("class", "yo")
    .attr(
      "d",
      d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(function (d) {
          return y(d["Value"]);
        })
        .startAngle(function (d) {
          return x(d.Country);
        })
        .endAngle(function (d) {
          return x(d.Country) + x.bandwidth();
        })
        .padAngle(0.01)
        .padRadius(innerRadius)
    );

  // Add the labels
  svg
    .append("g")
    .selectAll("g")
    .data(dataChart)
    .enter()
    .append("g")
    .attr("text-anchor", function (d) {
      return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
        Math.PI
        ? "end"
        : "start";
    })
    .attr("transform", function (d) {
      return (
        "rotate(" +
        (((x(d.Country) + x.bandwidth() / 2) * 180) / Math.PI - 90) +
        ")" +
        "translate(" +
        (y(d["Value"]) + 10) +
        ",0)"
      );
    })
    .append("text")
    .text(function (d) {
      return d.Country;
    })
    .attr("transform", function (d) {
      return (x(d.Country) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
        Math.PI
        ? "rotate(180)"
        : "rotate(0)";
    })
    .style("font-size", "11px")
    .attr("alignment-baseline", "middle");

  // Add the second series
  svg
    .append("g")
    .selectAll("path")
    .data(dataChart)
    .enter()
    .append("path")
    .attr("fill", "red")
    .attr(
      "d",
      d3
        .arc()
        .innerRadius(function (d) {
          return ybis(0);
        })
        .outerRadius(function (d) {
          return ybis(d["Value"]);
        })
        .startAngle(function (d) {
          return x(d.Country);
        })
        .endAngle(function (d) {
          return x(d.Country) + x.bandwidth();
        })
        .padAngle(0.01)
        .padRadius(innerRadius)
    );
});
