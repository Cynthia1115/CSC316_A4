// === Tooltip helpers (shared) ===
const tt = d3.select("#tooltip");
function showTT(html, event) {
    tt.classed("hidden", false)
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY - 28) + "px")
        .select("p").html(html);
}
function hideTT(){ tt.classed("hidden", true); }

class Chart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.fullData = data;
        this.currentMetricMode = "both";
        this.smoothing = 0;
        this.startPercent = 0;
        this.endPercent = 100;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 200, bottom: 50, left: 100 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - 200;
        vis.height = 400;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales
        vis.x = d3.scaleBand().padding(0.2).range([0, vis.width]);
        vis.yLeft = d3.scaleLinear().range([vis.height, 0]);
        vis.yRight = d3.scaleLinear().range([vis.height, 0]);

        // Axes
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxisLeftGroup = vis.svg.append("g").attr("class", "y-axis-left");
        vis.yAxisRightGroup = vis.svg.append("g")
            .attr("class", "y-axis-right")
            .attr("transform", "translate(" + vis.width + ",0)");

        // Line generator (for CO2)
        vis.line = d3.line()
            .x(d => vis.x(d.Year) + vis.x.bandwidth() / 2)
            .y(d => vis.yRight(d.CO2ppm));

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.map(d => ({ ...d }));

        if (vis.smoothing > 1) {
            vis.displayData = vis.displayData.map((d, i, arr) => {
                let start = Math.max(0, i - Math.floor(vis.smoothing / 2));
                let end = Math.min(arr.length, i + Math.floor(vis.smoothing / 2) + 1);
                let slice = arr.slice(start, end);
                return {
                    ...d,
                    TempAnomaly: d3.mean(slice, s => s.TempAnomaly),
                    CO2ppm: d3.mean(slice, s => s.CO2ppm)
                };
            });
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update domains
        vis.x.domain(vis.displayData.map(d => d.Year));

        // Dynamic Y-axis scaling
        const hasTemp = vis.currentMetricMode === "TempAnomaly" || vis.currentMetricMode === "both";
        const hasCO2 = vis.currentMetricMode === "CO2ppm" || vis.currentMetricMode === "both";

        if (hasTemp) {
            vis.yLeft.domain([
                d3.min(vis.displayData, d => d.TempAnomaly) - 0.4,
                d3.max(vis.displayData, d => d.TempAnomaly) + 0.1
            ]);
        }
        if (hasCO2) {
            vis.yRight.domain([
                d3.min(vis.displayData, d => d.CO2ppm) - 10,
                d3.max(vis.displayData, d => d.CO2ppm) + 10
            ]);
        }

        // Transition axes
        vis.xAxisGroup
            .transition().duration(800)
            .call(d3.axisBottom(vis.x).tickValues(vis.x.domain().filter((d, i) => !(i % 5))));

        if (hasTemp) {
            vis.yAxisLeftGroup
                .transition().duration(800)
                .call(d3.axisLeft(vis.yLeft))
                .style("opacity", 1);
        } else {
            vis.yAxisLeftGroup.transition().duration(500).style("opacity", 0);
        }

        if (hasCO2) {
            vis.yAxisRightGroup
                .transition().duration(800)
                .call(d3.axisRight(vis.yRight))
                .style("opacity", 1);
        } else {
            vis.yAxisRightGroup.transition().duration(500).style("opacity", 0);
        }

        // Clear chart elements
        vis.svg.selectAll(".bar, .co2-line, .co2-dot, .label-text").remove();

        if (hasTemp) {
            vis.svg.selectAll(".bar")
                .data(vis.displayData, d => d.Year)
                .join(
                    enter => enter.append("rect")
                        .attr("class", "bar")
                        .attr("x", d => vis.x(d.Year))
                        .attr("width", vis.x.bandwidth())
                        .attr("y", vis.yLeft(0))
                        .attr("height", 0)
                        .attr("fill", d => d.TempAnomaly >= 0 ? "#e41a1c" : "#67a2d3ff")
                        .attr("opacity", 0.8)
                        .call(enter => enter.transition().duration(800)
                            .attr("y", d => d.TempAnomaly >= 0 ? vis.yLeft(d.TempAnomaly) : vis.yLeft(0))
                            .attr("height", d => Math.abs(vis.yLeft(d.TempAnomaly) - vis.yLeft(0))))
                );
        }

        if (hasCO2) {
            vis.line.y(d => vis.yRight(d.CO2ppm));

            // Attach interactions to bars
            if (hasTemp) {
                vis.svg.selectAll(".bar")
                    .attr("role", "button")
                    .attr("tabindex", 0)
                    .on("mousemove", (event, d) => {
                        showTT(`<strong>${d.Year}</strong><br/>Temp Anomaly: ${d3.format(".2f")(d.TempAnomaly)} °C`, event);
                    })
                    .on("mouseleave", hideTT)
                    .on("click keydown", (event, d) => {
                        if (event.type === "click" || event.key === "Enter" || event.key === " ") {
                            showTT(`<strong>${d.Year}</strong><br/>Temp Anomaly: ${d3.format(".2f")(d.TempAnomaly)} °C`, event);
                        }
                    });
            }
            vis.svg.append("path")
                .datum(vis.displayData)
                .attr("class", "co2-line")
                .attr("fill", "none")
                .attr("stroke", "#0ea5e9")
                .attr("stroke-width", 2)
                .attr("d", vis.line)
                .attr("opacity", 0)
                .transition()
                .duration(1000)
                .attr("opacity", 1);
            // Interactive dots on CO₂ line
            if (hasCO2) {
                vis.svg.selectAll(".co2-dot")
                    .data(vis.displayData, d => d.Year)
                    .join(
                        enter => enter.append("circle")
                            .attr("class", "co2-dot")
                            .attr("cx", d => vis.x(d.Year) + vis.x.bandwidth()/2)
                            .attr("cy", d => vis.yRight(d.CO2ppm))
                            .attr("r", 3.5)
                            .attr("fill", "#0ea5e9")
                            .attr("stroke", "#fff")
                            .attr("role", "button")
                            .attr("tabindex", 0)
                            .on("mousemove", (event, d) => {
                                showTT(`<strong>${d.Year}</strong><br/>CO₂: ${d3.format(".0f")(d.CO2ppm)} ppm`, event);
                            })
                            .on("mouseleave", hideTT)
                            .on("click keydown", (event, d) => {
                                if (event.type === "click" || event.key === "Enter" || event.key === " ") {
                                    showTT(`<strong>${d.Year}</strong><br/>CO₂: ${d3.format(".0f")(d.CO2ppm)} ppm`, event);
                                }
                            })
                    );
            }

        }

        vis.svg.selectAll(".label-text").remove();

        vis.svg.append("text")
            .attr("class", "label-text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 10)
            .style("text-anchor", "middle")
            .style("font-weight", "700")
            .text("Year");

        if (hasTemp) {
            vis.svg.append("text")
                .attr("class", "label-text")
                .attr("transform", "rotate(-90)")
                .attr("y", -60)
                .attr("x", -vis.height / 2)
                .style("text-anchor", "middle")
                .text("Temperature Anomaly (°C)");
        }

        if (hasCO2) {
            vis.svg.append("text")
                .attr("class", "label-text")
                .attr("transform", "rotate(90)")
                .attr("y", -vis.width - 50)
                .attr("x", vis.height / 2)
                .style("text-anchor", "middle")
                .text("CO₂ (ppm)");
        }
    }

    filterByRange(startPercent, endPercent) {
        let vis = this;
        let n = vis.fullData.length;
        if (startPercent > endPercent) [startPercent, endPercent] = [endPercent, startPercent];
        let startIndex = Math.floor((startPercent / 100) * n);
        let endIndex = Math.floor((endPercent / 100) * n);
        vis.data = vis.fullData.slice(startIndex, endIndex);
        vis.wrangleData();

        // Update label
        let startYear = vis.fullData[startIndex].Year;
        let endYear = vis.fullData[endIndex - 1].Year;
        d3.select("#yearRangeLabel").text(`${startYear} – ${endYear}`);
    }

    setMetricMode(metric) {
        let vis = this;
        vis.currentMetricMode = metric;
        vis.updateVis();
    }

    setSmoothing(value) {
        let vis = this;
        vis.smoothing = +value;
        vis.wrangleData();
    }
}
