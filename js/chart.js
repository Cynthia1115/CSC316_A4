class Chart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }



    initVis(){
        let vis = this;
        vis.margin = {top: 40, right: 200, bottom: 50, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - 200;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height + 400;

        vis.svg = d3.select("#" + vis.parentElement)
                    .append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        
        
        vis.x = d3.scaleBand()
                    .domain(vis.data.map(d => d.Year))
                    .range([0, vis.width])
                    .padding(0.2);
        
                    
        vis.yLeft = d3.scaleLinear()
                        .domain([
                            d3.min(vis.data, d => d.TempAnomaly) - 0.4,
                            d3.max(vis.data, d => d.TempAnomaly) + 0.1
                        ])
                        .range([vis.height, 0]);

        vis.yRight = d3.scaleLinear()
                        .domain([
                            d3.min(vis.data, d => d.CO2ppm) - 10,
                            d3.max(vis.data, d => d.CO2ppm) + 10
                        ])
                        .range([vis.height, 0]);
        
        vis.xAxis = d3.axisBottom(vis.x).tickValues(vis.x.domain().filter((d, i) => !(i % 5)));
        vis.yAxisLeft = d3.axisLeft(vis.yLeft).ticks(6);
        vis.yAxisRight = d3.axisRight(vis.yRight).ticks(6);


        vis.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + vis.height + ")");
        
        vis.svg.append("g")
                .attr("class", "y-axis-left");
        
        vis.svg.append("g")
                .attr("class", "y-axis-right")
                .attr("transform", "translate(" + vis.width + ",0)");


        vis.line = d3.line()
                    .x(d => vis.x(d.Year) + vis.x.bandwidth() / 2)
                    .y(d => vis.yRight(d.CO2ppm));

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;
        vis.displayData = vis.data;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Temperture Anomalies Bars
        let bars = vis.svg.selectAll(".bar")
                        .data(vis.displayData, d => d.Year);
        
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.x(d.Year))
            .attr("width", vis.x.bandwidth())
            .attr("y", vis.yLeft(0))
            .attr("height", 0)
            .merge(bars)
            .transition()
            .duration(800)
            .attr("y", d => d.TempAnomaly >= 0 ? vis.yLeft(d.TempAnomaly) : vis.yLeft(0))
            .attr("height", d => Math.abs(vis.yLeft(d.TempAnomaly) - vis.yLeft(0)))
            .attr("fill", d => d.TempAnomaly >= 0 ? "#e41a1c" : "#67a2d3ff")
            .attr("opacity", 0.8);

         bars.exit().remove();

        // CO2 line
        let linePath = vis.svg.selectAll(".co2-line")
                                .data([vis.displayData]);

        linePath.enter()
            .append("path")
            .attr("class", "co2-line")
            .merge(linePath)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("d", vis.line)


        linePath.exit().remove();

        // Axes
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis-left").call(vis.yAxisLeft);
        vis.svg.select(".y-axis-right").call(vis.yAxisRight);

        vis.svg.append("text")
            .attr("class", "y-label-left")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -vis.height / 2)
            .style("text-anchor", "middle")
            .style("font-family", "Roboto, sans-serif") 
            .style("font-weight", "700")               
            .style("font-size", "14px")               
            .text("Temperature Anomaly (°C)");

        vis.svg.append("text")
            .attr("class", "y-label-right")
            .attr("transform", "rotate(90)")
            .attr("y", -vis.width - 40)
            .attr("x", vis.height / 2)
            .style("text-anchor", "middle")
            .style("font-family", "Roboto, sans-serif") 
            .style("font-weight", "700")               
            .style("font-size", "14px")             
            .text("CO₂ (ppm)");

        vis.svg.append("text")
            .attr("class", "x-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 10)
            .style("text-anchor", "middle")
            .style("font-family", "Roboto, sans-serif")
            .style("font-weight", "700")
            .style("font-size", "14px")
            .text("Year");


        // CO2 Label
        let lastPoint = vis.displayData[vis.displayData.length - 1]; 
        vis.svg.selectAll(".co2-line-label").remove();

        vis.svg.append("text")
            .attr("class", "co2-line-label")
            .attr("x", vis.x(lastPoint.Year) + vis.x.bandwidth() - 100) 
            .attr("y", vis.yRight(lastPoint.CO2ppm) - 10)
            .attr("text-anchor", "start")
            .style("font-family", "Roboto, sans-serif")
            .style("font-weight", "700")
            .style("font-size", "12px")
            .style("fill", "#000000")
            .text("Carbon Dioxide");

        vis.svg.append("text")
            .attr("class", "bar-label")
            .attr("x", vis.width / 2 - 300)    
            .attr("y", -vis.margin.top / 2 + 250) 
            .style("text-anchor", "middle")
            .style("font-family", "Roboto, sans-serif")
            .style("font-weight", "700")
            .style("font-size", "14px")
            .style("fill", "#818181ff")
            .text("Temperature Anomalies");
    }

}
