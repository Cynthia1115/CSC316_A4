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

        // Store and sort full dataset once
        this.fullData = data.slice().sort((a,b)=>a.Year-b.Year);
        this.data = this.fullData;       // current filtered slice
        this.fullExtent = d3.extent(this.fullData, d => d.Year); // e.g., [1958, 2024]
        this.currentMetricMode = "both";
        this.smoothing = 0;

        // layout
        this.margin = { top: 48, right: 120, bottom: 72, left: 110 };
        this.height = 520;

        this.initVis();
        window.addEventListener("resize", () => this.resize());
    }

    computeWidth() {
        const node = document.getElementById(this.parentElement);
        this.width = Math.max(360, node.getBoundingClientRect().width - this.margin.left - this.margin.right);
    }

    initVis() {
        let vis = this;
        vis.computeWidth();

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales (x domain follows filtered window)
        vis.x      = d3.scaleLinear().range([0, vis.width]);
        vis.yLeft  = d3.scaleLinear().range([vis.height, 0]);
        vis.yRight = d3.scaleLinear().range([vis.height, 0]);

        // Clip only plot marks (axes/labels never clipped)
        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", vis.margin.left)
            .attr("y", vis.margin.top)
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.plot = vis.g.append("g")
            .attr("class", "plot-area")
            .attr("clip-path", "url(#clip)");

        // Axes groups
        vis.xAxisGroup = vis.g.append("g").attr("class", "x-axis"); // positioned at y=0 in updateVis
        vis.yAxisLeftGroup  = vis.g.append("g").attr("class", "y-axis-left");
        vis.yAxisRightGroup = vis.g.append("g").attr("class", "y-axis-right")
            .attr("transform", `translate(${vis.width},0)`);

        // Line generator (CO₂)
        vis.line = d3.line()
            .x(d => vis.x(d.Year))
            .y(d => vis.yRight(d.CO2ppm));

        vis.wrangleData();
    }

    resize() {
        this.computeWidth();
        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.x.range([0, this.width]);
        this.yLeft.range([this.height, 0]);
        this.yRight.range([this.height, 0]);

        this.g.select(".y-axis-right").attr("transform", `translate(${this.width},0)`);
        this.svg.select("#clip rect").attr("width", this.width).attr("height", this.height);

        this.updateVis();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.map(d => ({ ...d }));

        if (vis.smoothing > 1) {
            vis.displayData = vis.displayData.map((d, i, arr) => {
                const half = Math.floor(vis.smoothing / 2);
                const a = Math.max(0, i - half);
                const b = Math.min(arr.length, i + half + 1);
                const slice = arr.slice(a, b);
                return {
                    ...d,
                    TempAnomaly: d3.mean(slice, s => s.TempAnomaly),
                    CO2ppm:      d3.mean(slice, s => s.CO2ppm)
                };
            });
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // === X domain = filtered window, padded by ±0.5 year so bars never clip ===
        const xMin = d3.min(vis.displayData, d => d.Year);
        const xMax = d3.max(vis.displayData, d => d.Year);
        const pad = 0.5;
        vis.x.domain([xMin - pad, xMax + pad]);

        // === Y domains (include 0 so we can draw x-axis at y=0) ===
        const hasTemp = vis.currentMetricMode === "TempAnomaly" || vis.currentMetricMode === "both";
        const hasCO2  = vis.currentMetricMode === "CO2ppm"       || vis.currentMetricMode === "both";

        let minT = 0, maxT = 1;
        if (hasTemp) {
            minT = d3.min(vis.displayData, d => d.TempAnomaly);
            maxT = d3.max(vis.displayData, d => d.TempAnomaly);
            const lo = Math.min(0, minT - 0.1);
            const hi = Math.max(0.1, maxT + 0.1);
            vis.yLeft.domain([lo, hi]).nice();
        }
        if (hasCO2) {
            vis.yRight.domain([
                d3.min(vis.displayData, d => d.CO2ppm) - 10,
                d3.max(vis.displayData, d => d.CO2ppm) + 10
            ]).nice();
        }

        // === Integer year ticks in the visible window ===
        const y0 = Math.round(xMin), y1 = Math.round(xMax);
        const desired = Math.min(12, Math.max(5, y1 - y0));
        const tickYears = Array.from(new Set(d3.ticks(y0, y1, desired).map(v => Math.round(v))))
            .filter(v => v >= y0 && v <= y1);

        // === Draw x-axis AT y = 0; if all temps below 0, put ticks on top ===
        const xAxisY = vis.yLeft(0);
        const allBelowZero = maxT <= 0;
        const axisX = allBelowZero
            ? d3.axisTop(vis.x).tickValues(tickYears).tickFormat(d3.format("d"))
            : d3.axisBottom(vis.x).tickValues(tickYears).tickFormat(d3.format("d"));

        vis.xAxisGroup
            .attr("transform", `translate(0,${xAxisY})`)
            .call(axisX);

        if (hasTemp) {
            vis.yAxisLeftGroup.style("opacity", 1).call(d3.axisLeft(vis.yLeft));
        } else {
            vis.yAxisLeftGroup.style("opacity", 0);
        }
        if (hasCO2) {
            vis.yAxisRightGroup
                .style("opacity", 1)
                .attr("transform", `translate(${vis.width},0)`)
                .call(d3.axisRight(vis.yRight));
        } else {
            vis.yAxisRightGroup.style("opacity", 0);
        }

        // === Bar width from CURRENT step (prevents drift/overlap) ===
        const years = vis.displayData.map(d => d.Year).sort((a,b)=>a-b);
        const stepPx = years.length > 1 ? Math.abs(vis.x(years[1]) - vis.x(years[0])) : vis.width;
        const barWidth = Math.max(8, Math.min(40, stepPx * 0.8));

        // === Draw marks (inside clip) ===
        vis.plot.selectAll(".bar, .co2-line, .co2-dot").remove();

        if (hasTemp) {
            vis.plot.selectAll(".bar")
                .data(vis.displayData, d => d.Year)
                .join(enter => enter.append("rect")
                    .attr("class", "bar")
                    .attr("x", d => vis.x(d.Year) - barWidth/2)             // centered on year
                    .attr("width", barWidth)
                    .attr("y", vis.yLeft(0))                                // start at baseline
                    .attr("height", 0)
                    .attr("fill", d => d.TempAnomaly >= 0 ? "#e41a1c" : "#67a2d3ff")
                    .call(enter => enter.transition().duration(500)
                        .attr("y", d => d.TempAnomaly >= 0 ? vis.yLeft(d.TempAnomaly) : vis.yLeft(0))
                        .attr("height", d => Math.abs(vis.yLeft(d.TempAnomaly) - vis.yLeft(0))))
                )
                .on("mousemove", (event, d) => {
                    showTT(`<strong>${d.Year}</strong><br/>Temp Anomaly: ${d3.format(".2f")(d.TempAnomaly)} °C`, event);
                })
                .on("mouseleave", hideTT);
        }

        if (hasCO2) {
            vis.plot.append("path")
                .datum(vis.displayData)
                .attr("class", "co2-line")
                .attr("fill", "none")
                .attr("stroke", "#0ea5e9")
                .attr("stroke-width", 2)
                .attr("d", vis.line);

            vis.plot.selectAll(".co2-dot")
                .data(vis.displayData, d => d.Year)
                .join("circle")
                .attr("class", "co2-dot")
                .attr("cx", d => vis.x(d.Year))
                .attr("cy", d => vis.yRight(d.CO2ppm))
                .attr("r", 3.5)
                .attr("fill", "#0ea5e9")
                .attr("stroke", "#fff")
                .on("mousemove", (event, d) => {
                    showTT(`<strong>${d.Year}</strong><br/>CO₂: ${d3.format(".0f")(d.CO2ppm)} ppm`, event);
                })
                .on("mouseleave", hideTT);
        }

        // === Static axis labels (outside plot area) ===
        vis.g.selectAll(".label-text").remove();

        vis.g.append("text")
            .attr("class", "label-text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 48)
            .style("text-anchor", "middle")
            .style("font-weight", "700")
            .text("Year");

        if (hasTemp) {
            vis.g.append("text")
                .attr("class", "label-text")
                .attr("transform", "rotate(-90)")
                .attr("x", -vis.height / 2)
                .attr("y", - (vis.margin.left - 36))
                .style("text-anchor", "middle")
                .text("Temperature Anomaly (°C)");
        }

        if (hasCO2) {
            vis.g.append("text")
                .attr("class", "label-text")
                .attr("transform", "rotate(90)")
                .attr("x", vis.height / 2)
                .attr("y", - (vis.width + vis.margin.right - 36))
                .style("text-anchor", "middle")
                .text("CO₂ (ppm)");
        }
    }

    // === NEW: filter by explicit years (inclusive), robust to missing years ===
    filterByYears(startYear, endYear) {
        if (startYear > endYear) [startYear, endYear] = [endYear, startYear];

        // Find first index with Year >= startYear
        let s = this.fullData.findIndex(d => d.Year >= startYear);
        if (s < 0) s = 0;

        // Find last index with Year <= endYear
        let e = this.fullData.length - 1;
        for (let i = s; i < this.fullData.length; i++) {
            if (this.fullData[i].Year > endYear) { e = i - 1; break; }
        }
        e = Math.max(e, s); // ensure at least one

        // Slice inclusive
        this.data = this.fullData.slice(s, e + 1);
        this.wrangleData();

        // Update the external label if present
        d3.select("#yearRangeLabel").text(`${this.fullData[s].Year} – ${this.fullData[e].Year}`);
    }

    // Back-compat (percent API) if something else calls it
    filterByRange(startPercent, endPercent) {
        const n = this.fullData.length;
        if (startPercent > endPercent) [startPercent, endPercent] = [endPercent, startPercent];
        const sIdx = Math.floor((Math.max(0, Math.min(100, +startPercent)) / 100) * (n - 1));
        const eIdxIncl = Math.floor((Math.max(0, Math.min(100, +endPercent)) / 100) * (n - 1));
        const eIdx = Math.min(n - 1, eIdxIncl);
        this.filterByYears(this.fullData[sIdx].Year, this.fullData[eIdx].Year);
    }

    setMetricMode(metric) {
        this.currentMetricMode = metric;
        this.updateVis();
    }

    setSmoothing(value) {
        this.smoothing = +value;
        this.wrangleData();
    }
}
