// The svg
const svg = d3.select("#svgmap"),
  width = +svg.attr("width"),
  height = +svg.attr("height");
// Map and projection
const projection = d3
  .geoMercator()
  .scale(200)
  .center([0, 20])
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Data and color scale
const data = new Map();
const colorScale = d3
  .scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(["#FFFF00", "#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FF0000"]);

// Load external data and boot
Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",
    function (d) {
      data.set(d.code, +d.pop);
    }
  ),
]).then(function (loadData) {
  let topo = loadData[0];
  topo.features = topo.features.filter(function (feature) {
    return feature.properties.name !== "Antarctica";
  });
  // Draw the map
  svg
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath().projection(projection))
    // set the color of each country
    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    })
    .style("stroke", "transparent")
    .attr("class", function (d) {
      return "Country";
    });

  svg.attr("preserveAspectRatio", "none");

  function mouseClick(d) {
    // Calculate min and max total values
    const minTotal = d3.min(Array.from(data.values()));
    const maxTotal = d3.max(Array.from(data.values()));

    // Define your output range
    const minOutput = 100; // Minimum rectangle width
    const maxOutput = 1000; // Maximum rectangle width

    // Create the scale
    const scale = d3
      .scaleLinear()
      .domain([minTotal, maxTotal])
      .range([minOutput, maxOutput]);
    console.log("mouseClick d:", d);
    const d1 = d3.select(this).datum();
    console.log("this:", d1.total);

    console.log("mouseClick d:", d);
    console.log("this:", d1.total);

    console.log("Country clicked:", d1);

    // Calculate the bounding box of the clicked country
    const bbox = this.getBBox();
    const bboxWidth = bbox.width;
    const bboxHeight = bbox.height;

    // Calculate the scale factor based on the size of the country
    const scaleFactor = 0.8 / Math.max(bboxWidth / width, bboxHeight / height);

    // Calculate the centroid of the clicked country
    const centroid = path.centroid(d1);

    // Calculate the translation to center the clicked country
    const x = width / 2 - scaleFactor * centroid[0];
    const y = height / 2 - scaleFactor * centroid[1];

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
        "translate(" + x + "," + y + ")scale(" + scaleFactor + ")"
      )
      .on("end", function (d) {
        // After the transition ends...
        svg
          .append("text") // Append a text element to the SVG
          .attr("x", width / 2) // Position it at the center of the SVG
          .attr("y", 50) // A little bit down from the top
          .attr("text-anchor", "middle") // Center the text
          .style("font-size", "24px") // Make the text a bit larger
          .style("fill", "black") // Make the text black
          .style("opacity", 0) // Set the opacity to 0
          .text(d.properties.name)
          .transition()
          .duration(500)
          .style("opacity", 1); // Set the text to the name of the country
        svg
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 20)
          .attr("y", 500)
          .attr("width", scale(sunMax(d1))) // Use the scale here

          .attr("height", 50)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .style("opacity", 1);
      });
    function sunMax(d) {
      return d.total;
    }
    console.log("this is d1", sunMax(d1));
  }

  // Attach the mouseClick function to the click event
  d3.selectAll(".Country").on("click", mouseClick);

  // Add an event listener for a double click event
  svg.on("dblclick", function () {
    // Transition all countries back to their original scale and set their opacity back to 0.8
    d3.selectAll(".Country")
      .transition()
      .duration(750)
      .attr("transform", "scale(1)")
      .style("opacity", 0.8)
      .attr("stroke-width", 0.5);
    svg
      .selectAll("text")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();

    svg
      .selectAll("rect")
      .transition()
      .duration(1000) // duration of transition in milliseconds
      .style("opacity", 0) // transition to transparent before removing
      .remove();
  });

  console.log(sunMax());
  function sunMin() {
    return d3.min(Array.from(data.values(), (d) => d));
  }
  console.log(sunMin());
});
