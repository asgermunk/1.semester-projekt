// // The svg
// const svg = d3.select("#svgmap"),
//   width = +svg.attr("width"),
//   height = +svg.attr("height");

// // Map and projection
// const path = d3.geoPath();
// const projection = d3.geoMercator()
//   .scale(200)
//   .center([0,20])
//   .translate([width / 2, height / 2]);

// // Data and color scale
// const data = new Map();
// const colorScale = d3.scaleThreshold()
//   .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
//   .range(["#FFFF00", "#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FF0000"]);

// // Load external data and boot
// Promise.all([
// d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
// d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) {
//     data.set(d.code, +d.pop)
// })]).then(function(loadData){
//     let topo = loadData[0]
//     topo.features = topo.features.filter(function(feature) {
//         return feature.properties.name !== 'Antarctica';
//       });
//       let mouseOver = function(d) {
//         d3.selectAll(".Country")
//           .transition()
//           .duration(200)
//           .style("opacity", .5)
//         d3.select(this)
//           .transition()
//           .duration(200)
//           .style("opacity", 1)
//           .style("stroke", "black")
//       }
    
//       let mouseLeave = function(d) {
//         d3.selectAll(".Country")
//           .transition()
//           .duration(200)
//             .style("opacity", .8)
//             .style("stroke", "transparent")
//         d3.select(this)
//           .transition()
//           .duration(200)
//           .style("stroke", "transparent")
//       }
      
//   // Draw the map
//   svg.append("g")
//     .selectAll("path")
//     .data(topo.features)
//     .enter()
//     .append("path")
//       // draw each country
//       .attr("d", d3.geoPath()
//         .projection(projection)
//       )
//       // set the color of each country
//       .attr("fill", function (d) {
//         d.total = data.get(d.id) || 0;
//         return colorScale(d.total);
//       })
//       .style("stroke", "transparent")
//       .attr("class", function(d){ return "Country" } )
//       .style("opacity", .8)
//       .on("mouseover", mouseOver )
//       .on("mouseleave", mouseLeave )

//       svg.attr("preserveAspectRatio", "none");

//       function mouseClick(d) {
//         // Scale all other countries to 0 pixels
//         d3.selectAll(".Country")
//           .transition()
//           .duration(200)
//           .style("opacity", 0)
      
//         // Scale the clicked country to fill the screen
//         d3.select(this)
//           .transition()
//           .duration(200)
//           .attr("transform", "scale(10)")
//           .style("opacity", 1)
          
//       }
      
//       // Attach the mouseClick function to the click event
//       d3.selectAll(".Country").on("click", mouseClick);
// })



// The svg
// The svg
// The svg
const svg = d3.select("#svgmap"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
let projection = d3.geoMercator()
  .scale(200)
  .center([0,20])
  .translate([width / 2, height / 2]);

let path = d3.geoPath().projection(projection);

// Data and color scale
const data = new Map();
const colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(["#FFFF00", "#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FF0000"]);

// Load external data and boot
Promise.all([
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) {
    data.set(d.code, +d.pop)
})]).then(function(loadData){
    let topo = loadData[0]
    topo.features = topo.features.filter(function(feature) {
        return feature.properties.name !== 'Antarctica';
      });
      
      let mouseOver = function(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", .5)
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black")
      }
    
      let mouseLeave = function(d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
            .style("opacity", .8)
            .style("stroke", "transparent")
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "transparent")
      }

      function mouseClick(d) {
        // Compute the new map center
        const centroid = path.centroid(d);
        const lonLat = projection.invert(centroid);
      
        // Update the existing projection to center on the clicked country
        projection.center(lonLat)
          .scale(1000); // Increase the scale
      
        // Update the path generator
        path = d3.geoPath().projection(projection);
      
        // Redraw the map
        svg.selectAll("path")
          .attr("d", d => {
            const p = path(d);
            return p ? p : "";
          });
      }

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", path)
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
      .on("click", mouseClick);

      svg.attr("preserveAspectRatio", "none");
})