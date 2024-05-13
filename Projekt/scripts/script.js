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
const svgMap = d3.select("#svgmap"), // The svg for map
  widthMap = +svgMap.attr("width"),
  heightMap = +svgMap.attr("height");

const projectionMap = d3 // Map and projection
  .geoMercator()
  .scale(200)
  .center([0, 20])
  .translate([widthMap / 2, heightMap / 2]);
const pathMap = d3.geoPath().projection(projectionMap);

const dataMap = new Map(); // Data for map
const colorScaleMap = d3 //midlertidig farve skala
  .scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(["#FFFF00", "#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FF0000"]);
const minOutputMap = 50; // Minimum rectangle width
const maxOutputMap = 500; // Maximum rectangle width
function colorGradientMap(d) {
  // Denne funktion skal tage landets sol potentiale og returnere en farve
  return "red"; //Vi mangler data til denne funktion
}
Promise.all([
  // Load external data and boot for map
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  ),
  d3.csv(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"
  ),
]).then(function ([topoData, populationData]) {
  topoData.features = topoData.features.filter(function (feature) {
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"
  ),
]).then(function ([topoData, populationData]) {
  //topoData = world.geojson, populationData = world_population.csv
  topoData.features = topoData.features.filter(function (feature) {
    return feature.properties.name !== "Antarctica";
  });

  // Process population data
  populationData.forEach(function (d) {
    dataMap.set(d.code, +d.pop);
  });


  // Process population data
  populationData.forEach(function (d) {
    dataMap.set(d.code, +d.pop);
  });

  // Draw the map
  svgMap
  svgMap
    .selectAll("path")
    .data(topoData.features)
    .data(topoData.features)
    .enter()
    .append("path")
    .attr("d", pathMap)
    .attr("d", pathMap)
    .attr("fill", function (d) {
      d.total = dataMap.get(d.id) || 0;
      return colorScaleMap(d.total);
      d.total = dataMap.get(d.id) || 0;
      return colorScaleMap(d.total);
    })
    .style("stroke", "transparent")
    .attr("class", "Country");
    .attr("class", "Country");

  svgMap.attr("preserveAspectRatio", "none");
  svgMap.attr("preserveAspectRatio", "none");

  function mouseClickMap(d) {
  function mouseClickMap(d) {
    // Calculate min and max total values
    const minTotalMap = d3.min(
      Array.from(dataMap.values()).filter((value) => value > 50000)
    const minTotalMap = d3.min(
      Array.from(dataMap.values()).filter((value) => value > 50000)
    );
    const maxTotalMap = d3.max(Array.from(dataMap.values()));
    // Create the scale
    const scaleMap = d3
    const scaleMap = d3
      .scaleLinear()
      .domain([minTotalMap, maxTotalMap])
      .range([minOutputMap, maxOutputMap]);
    const dataCountry = d3.select(this).datum();
    // Calculate the bounding box of the clicked country
    const bboxMap = this.getBBox(); //bboxMap = {x, y, width, height} bounding box laver den mindste firkant omkring landet
    const bboxWidthMap = bboxMap.width;
    const bboxHeightMap = bboxMap.height;
    // Calculate the scale factor based on the size of the country
    const scaleFactorMap =
      0.8 / Math.max(bboxWidthMap / widthMap, bboxHeightMap / heightMap);
    // Calculate the centroid of the clicked country
    const centroidMap = pathMap.centroid(dataCountry); //centroidMap = [x, y] - midten af landet
    // Calculate the translation to center the clicked country
    const xMap = widthMap / 2 - scaleFactorMap * centroidMap[0]; //map x position
    const yMap = heightMap / 2 - scaleFactorMap * centroidMap[1]; //map y position
    //gør alle lande usynlige
    d3.selectAll(".Country")
      .transition()
      .duration(750)
      .attr("transform", "")
      .style("opacity", 0)
      .attr("translate", "scale(0)");
    // gør det valgte land synligt og gør det stort, samt få det til at være i midten
    d3.select(this)
      .transition()
      .duration(750)
      .attr(
        "transform",
        "translate(" + xMap + "," + yMap + ")scale(" + scaleFactorMap + ")"
      )
      .on("end", function (d) {
        // After the transition ends...
        svgMap // Append a text element to the SVG
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
        svgMap //bar for max sol potentiale
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 500)
          .attr("width", scaleMap(sunMaxMap(dataCountry))) //lav en ny funktion som tager landets sol potentiale
          .attr("height", 50)
          .style("opacity", 0)
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgMap //bar for land energi forbrug
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 500)
          .attr("width", scaleMap(energiConsMap(dataCountry)) - 20) //denne skal ændres til en ny funktion som tager landets energi forbrug
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "red")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgMap // bar for sol produktion
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 500)
          .attr("width", scaleMap(sunProdMap(dataCountry)) - 50) //denne skal ændres til en ny funktion som tager landets sol produktion
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "blue")
          .transition()
          .duration(500)
          .style("opacity", 1);
      });
    function sunMaxMap(d) {
      //Denne funktion skal retunere landets sol potentiale
      return d.total; //Vi mangler data til denne funktion
    }
    function sunProdMap(d) {
      //Denne funktion skal retunere landets sol produktion
      return d.total; //Vi mangler data til denne funktion
    }
    function energiConsMap(d) {
      //Denne funktion skal retunere landets energi forbrug
      return d.total; //Vi mangler data til denne funktion
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
      .duration(1000)
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
});
//Start på chart
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
