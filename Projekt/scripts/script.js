// The svg
const svg = d3.select("#svgmap"),
  width = +svg.attr("width"),
  height = +svg.attr("height");
  const continents = {
    'Africa': ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
    'Asia': ['Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'],
    'Europe': ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'],
    'North America': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'],
    'South America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
    'Oceania': ['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu']
  };

// Map and projection
const projection = d3.geoMercator()
  .scale(200)
  .center([0,20])
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

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
      // let mouseOver = function(d) {
      //   d3.selectAll(".Country")
      //     .transition()
      //     .duration(200)
      //     .style("opacity", .5)
      //   d3.select(this)
      //     .transition()
      //     .duration(200)
      //     .style("opacity", 1)
      //     .style("stroke", "black")
      // }
    
      // let mouseLeave = function(d) {
      //   d3.selectAll(".Country")
      //     .transition()
      //     .duration(200)
      //       .style("opacity", .8)
      //       .style("stroke", "transparent")
      //   d3.select(this)
      //     .transition()
      //     .duration(200)
      //     .style("stroke", "transparent")
      // }

  // Draw the map
  svg.selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      // .on("mouseover", mouseOver )
      // .on("mouseleave", mouseLeave )

      svg.attr("preserveAspectRatio", "none");

    function mouseClick(d) {
  const d1 = d3.select(this).datum();
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
  d3.selectAll(".Country").transition()
    .duration(750)
    .attr("transform", "")
    .style("opacity", 0);

  // Scale up the clicked country and set its opacity back to 1
  d3.select(this).transition()
    .duration(750)
    .attr("transform", "translate(" + x + "," + y + ")scale(" + scaleFactor + ")");

  svg.selectAll(".Country")
    
}

      // Attach the mouseClick function to the click event
      d3.selectAll(".Country").on("click", mouseClick);

      // Add an event listener for a double click event
svg.on("dblclick", function() {
  // Transition all countries back to their original scale and set their opacity back to 0.8
  d3.selectAll(".Country").transition()
    .duration(750)
    .attr("transform", "scale(1)")
    .style("opacity", 0.8)
    .attr("stroke-width", 0.5);
});
})