// The svg for map
// Existing code
const widthMap = window.innerWidth;
console.log("widthMap", widthMap);
const heightMap = window.innerHeight;
const svgBar = d3
  .select("#svgmap")
  .attr("width", widthMap)
  .attr("height", heightMap);

// Add a class to the SVG
svgBar.attr("class", "mySvg");
const widthBar = 350; // specify the width of the bar chart SVG
const heightBar = 30; // specify the height of the bar chart SVG
// Define the width and height of the gradient bar
const gradientWidth = 300;
const gradientHeight = 20;

// Create the SVG for the gradient bar
const svgGradient = d3
  .select("body")
  .append("svg")
  .attr("width", gradientWidth)
  .attr("height", gradientHeight)
  .style("position", "absolute")
  .style("right", "0px")
  .style("bottom", "0px");

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

Promise.all([
  // Load external data and boot for map
  d3.json("dataset/world.geojson"),
  d3.json("http://localhost:4000/alldata"),
]).then(function ([topoData, alldata]) {
  //topoData = world.geojson, populationData = world_population.csv
  topoData.features = topoData.features.filter(function (feature) {
    return (
      feature.properties.name !== "Antarctica" &&
      feature.properties.name !== "French Southern and Antarctic Lands" &&
      feature.properties.name !== "Taiwan" &&
      feature.properties.name !== "New Caledonia"
    );
  });
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
  const minOutputMap = 50; // Minimum rectangle width
  const maxOutputMap = 500; // Maximum rectangle width
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

  // Add the gradient bar
  svgGradient
    .append("rect")
    .attr("width", gradientWidth)
    .attr("height", gradientHeight)
    .style("fill", "url(#gradient)");

  // Add the min and max labels
  svgGradient
    .append("text")
    .attr("x", 0)
    .attr("y", gradientHeight + 20)
    .text(minSunPotential);

  svgGradient
    .append("text")
    .attr("x", gradientWidth)
    .attr("y", gradientHeight + 20)
    .attr("text-anchor", "end")
    .text(maxSunPotential);
  function mouseClickMap(d) {
    // Calculate min and max total values
    const minTotalMap = d3.min(
      Array.from(dataMap.values()).filter((value) => value > 50000)
    );
    const maxTotalMap = d3.max(Array.from(dataMap.values()));
    // Create the scale
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

        div.append("h1").text("Indhold");

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
          .style("position", "fixed");

        d3.select("#contentText") // Add the name of the country to the content div
          .attr("x", widthMap / 1.25) // Position it at the center of the SVG
          .attr("y", 50) // A little bit down from the top
          .attr("text-anchor", "middle") // Center the text
          .style("font-size", "24px") // Make the text a bit larger
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
          .attr("width", widthBar) //lav en ny funktion som tager landets sol potentiale
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "darkblue")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgBar //bar for land energi forbrug
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 0)
          .attr("class", "energiConsBar")
          .attr("width", widthBar - 20) //denne skal ændres til en ny funktion som tager landets energi forbrug
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "yellow")
          .transition()
          .duration(500)
          .style("opacity", 1);

        svgBar // bar for sol produktion
          .append("rect") // Append a rectangle to the SVG
          .attr("x", 0)
          .attr("y", 0)
          .attr("class", "sunProdBar")
          .attr("width", widthBar - 50) //denne skal ændres til en ny funktion som tager landets sol produktion
          .attr("height", 50)
          .style("opacity", 0)
          .style("fill", "orange")
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
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
  .style("margin-top", "10000px");

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
