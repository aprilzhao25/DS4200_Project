// Load the data
const healthcare = d3.csv("boxplot.csv");

// Once the data is loaded, proceed with plotting
healthcare.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d['Billing Amount'] = +d['Billing Amount'];
    });

    // Define the dimensions and margins for the SVG
    let
      width = 800,
      height = 400;
      
    let margin = {
      top: 40,
      bottom: 30,
      left: 50,
      right: 30
    };

    // Create the SVG container
    let svg = d3
      .select('#boxplot')
      .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Set up scales for x and y axes
    function drawBoxPlot(groupBy) {

      // Erase the visualization elements before drawing a new one
      svg.selectAll("*").remove();

        // Add scales     
      let yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d['Billing Amount']), d3.max(data, d => d['Billing Amount'])])
      .range([height - margin.bottom, margin.top]);
    
      let unique = [...new Set(data.map(d => d[groupBy]))];
      let xScale = d3.scaleBand()
        .domain(unique)
        .range([margin.left, width - margin.right])
        .padding(0.5);

      // Add x-axis label
      let xAxis = svg
        .append('g')
          .attr('transform', `translate(0, ${height - margin.bottom})`)
          .call(d3.axisBottom().scale(xScale));

      xAxis
        .append('text')
          .attr('x', margin.right + 700)
          .attr('y', 25)
          .style('stroke', 'black')
          .text(groupBy);

      // Add y-axis label
      let yAxis = svg
        .append('g')
          .attr('transform', `translate(${margin.left},0)`)
          .call(d3.axisLeft().scale(yScale));

      yAxis
        .append('text')
          .attr('y', 30)
          .attr('x', 20)
          .style('stroke', 'black')
          .text('Billing Amount');
      

      const rollupFunction = function(groupData) {
          const values = groupData.map(d => d['Billing Amount']).sort(d3.ascending);
          const min = d3.min(values); 
          const q1 = d3.quantile(values, 0.25);
          const median = d3.median(values);
          const q3 = d3.quantile(values, 0.75);
          const max = d3.max(values);
          return {min, q1, median, q3, max};
        };

      // group the species data and apply aggregations given by the rollup function
      const quantilesByGroups = d3.rollup(data, rollupFunction, d => d[groupBy]);

      // iterate through the quantiles and species and determine the x position and width of each value
      quantilesByGroups.forEach((quantiles, category) => {
          const x = xScale(category);
          const boxWidth = xScale.bandwidth();

          // Draw vertical lines
          svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

          // Draw box
          svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", height - margin.bottom - (yScale(quantiles.q1) - yScale(quantiles.q3)))
            .attr("fill", "#fdb462")
            .attr("stroke", "black");


          // Draw median line
          svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "darkgreen")
            .attr("stroke-width", 3);
      });
    }

  // Create boxplot groupings
  drawBoxPlot("Insurance Provider");

  // Update data aggregates based on the chosen grouping
  document.getElementById("groupSelect").addEventListener("change", function(){
    drawBoxPlot(this.value);
  });

});