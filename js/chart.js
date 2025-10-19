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

        this.fullData = data.slice().sort((a,b)=>a.Year-b.Year);
        this.data = this.fullData;     // current filtered slice
        this.currentMetricMode = "both";
        this.smoothing = 0;

        this.margin = { top: 48, right: 120, bottom: 72, left: 110 };
        this.height = 520;

        this.initVis();
        window.addEventListener("resize", () => this.resize());
    }

    computeWidth() {
        const container = document.getElementById(this.parentElement);
        const cw = container ? container.clientWidth : 960;
        this.width = Math.max(600, cw - this.margin.left - this.margin.right);
    }

    initVis() {
        let vis = this;
        vis.computeWidth();

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales
        vis.x      = d3.scaleLinear().range([0, vis.width]);
        vis.yLeft  = d3.scaleLinear().range([vis.height, 0]);
        vis.yRight = d3.scaleLinear().range([vis.height, 0]);

        // --- FIX: clipPath in inner coordinates (0,0 → width,height)
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "plot-clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.width)
            .attr("height", vis.height);

        vis.plot = vis.g.append("g")
            .attr("class", "plot-area")
            .attr("clip-path", "url(#plot-clip)");

        // ===== Gradients for magazine look =====
        const defs = vis.svg.append("defs");

        // Warm bars (positive)
        const warmGrad = defs.append("linearGradient")
            .attr("id","warmGradient")
            .attr("x1","0%").attr("x2","0%").attr("y1","0%").attr("y2","100%");
        warmGrad.append("stop").attr("offset","0%").attr("stop-color","#e63946");
        warmGrad.append("stop").attr("offset","100%").attr("stop-color","#ffb703");

        // Cool bars (negative)
        const coolGrad = defs.append("linearGradient")
            .attr("id","coolGradient")
            .attr("x1","0%").attr("x2","0%").attr("y1","0%").attr("y2","100%");
        coolGrad.append("stop").attr("offset","0%").attr("stop-color","#48cae4");
        coolGrad.append("stop").attr("offset","100%").attr("stop-color","#023e8a");

        // Axis containers
        vis.xAxisGroup = vis.g.append("g").attr("class", "x-axis-container");
        vis.yAxisLeftGroup  = vis.g.append("g").attr("class", "y-axis-left");
        vis.yAxisRightGroup = vis.g.append("g").attr("class", "y-axis-right")
            .attr("transform", `translate(${vis.width},0)`);

        // CO₂ line generator
        vis.line = d3.line()
            .x(d => vis.x(d.Year))
            .y(d => vis.yRight(d.CO2ppm))
            .curve(d3.curveMonotoneX); // smoother

        // Annotation layer
        vis.annotLayer = vis.g.append("g").attr("class","annotations");

        vis.wrangleData();
    }

    // Filter by visible year range (inclusive)
    filterByYears(y0, y1) {
        this.data = this.fullData.filter(d => d.Year >= y0 && d.Year <= y1);
        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.map(d => ({ ...d }));

        // Smoothing (moving average on both series if requested)
        if (vis.smoothing && vis.smoothing > 1) {
            const k = vis.smoothing;
            const half = Math.floor(k/2);
            const n = vis.displayData.length;

            const smoothed = vis.displayData.map((_, i) => {
                const s0 = Math.max(0, i - half);
                const s1 = Math.min(n - 1, i + half);
                const slice = vis.displayData.slice(s0, s1 + 1);
                return {
                    ...vis.displayData[i],
                    TempAnomaly: d3.mean(slice, s => s.TempAnomaly),
                    CO2ppm:      d3.mean(slice, s => s.CO2ppm)
                };
            });

            vis.displayData = smoothed;
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // X domain covers the filtered window with ±0.5-year pad (one cell)
        const xMin = d3.min(vis.displayData, d => d.Year);
        const xMax = d3.max(vis.displayData, d => d.Year);
        vis.x.domain([xMin - 0.5, xMax + 0.5]);

        // Y domains
        const hasTemp = vis.currentMetricMode === "TempAnomaly" || vis.currentMetricMode === "both";
        const hasCO2  = vis.currentMetricMode === "CO2ppm"       || vis.currentMetricMode === "both";

        let minT = 0, maxT = 1;
        if (hasTemp) {
            minT = d3.min(vis.displayData, d => d.TempAnomaly);
            maxT = d3.max(vis.displayData, d => d.TempAnomaly);
            vis.yLeft.domain([Math.min(0, minT - 0.1), Math.max(0.1, maxT + 0.1)]).nice();
        }
        if (hasCO2) {
            vis.yRight.domain([
                d3.min(vis.displayData, d => d.CO2ppm) - 10,
                d3.max(vis.displayData, d => d.CO2ppm) + 10
            ]).nice();
        }

        // Integer year ticks in the visible window
        const y0 = Math.round(xMin), y1 = Math.round(xMax);
        const desired = Math.min(12, Math.max(5, y1 - y0));
        const tickYears = Array.from(new Set(d3.ticks(y0, y1, desired).map(v => Math.round(v))))
            .filter(v => v >= y0 && v <= y1);

        // --- FIX: X-axis baseline at y=0 (if temp shown) else bottom
        const xAxisY = hasTemp ? vis.yLeft(0) : vis.height;

        // === SPECIAL LABEL POSITIONING (single baseline at 0.0) ===
        const showUpperOnly = (xMax <= 1977);
        const showLowerOnly = (xMin >= 1978);
        const splitRange    = (xMin < 1978 && xMax > 1977);

        // Clear any previous x-axis children and rebuild
        vis.xAxisGroup.selectAll("*").remove();

        // 1) Base axis domain line at xAxisY
        const baseAxis = d3.axisBottom(vis.x)
            .tickValues([])
            .tickSize(0);

        vis.xAxisGroup.append("g")
            .attr("class", "x-axis-base")
            .attr("transform", `translate(0,${xAxisY})`)
            .call(baseAxis)
            .select(".domain")
            .attr("stroke", "#1f2937")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.8);

        // 2) Add tick labels above/below without their own domain line
        if (splitRange) {
            const upperTicks = tickYears.filter(v => v <= 1977);
            const lowerTicks = tickYears.filter(v => v >= 1978);

            const axisUpper = d3.axisTop(vis.x)
                .tickValues(upperTicks)
                .tickFormat(d3.format("d"))
                .tickSize(0);

            const axisLower = d3.axisBottom(vis.x)
                .tickValues(lowerTicks)
                .tickFormat(d3.format("d"))
                .tickSize(0);

            vis.xAxisGroup.append("g")
                .attr("class", "x-axis-upper")
                .attr("transform", `translate(0,${xAxisY - 8})`)
                .call(axisUpper)
                .select(".domain").remove();

            vis.xAxisGroup.append("g")
                .attr("class", "x-axis-lower")
                .attr("transform", `translate(0,${xAxisY + 8})`)
                .call(axisLower)
                .select(".domain").remove();

        } else if (showUpperOnly) {
            const axisUpper = d3.axisTop(vis.x)
                .tickValues(tickYears)
                .tickFormat(d3.format("d"))
                .tickSize(0);

            vis.xAxisGroup.append("g")
                .attr("class", "x-axis-upper")
                .attr("transform", `translate(0,${xAxisY - 8})`)
                .call(axisUpper)
                .select(".domain").remove();

        } else {
            const axisLower = d3.axisBottom(vis.x)
                .tickValues(tickYears)
                .tickFormat(d3.format("d"))
                .tickSize(0);

            vis.xAxisGroup.append("g")
                .attr("class", "x-axis-lower")
                .attr("transform", `translate(0,${xAxisY + 8})`)
                .call(axisLower)
                .select(".domain").remove();
        }

        // Left/Right Y axes
        if (hasTemp) vis.yAxisLeftGroup.style("opacity", 1).call(d3.axisLeft(vis.yLeft).ticks(6));
        else         vis.yAxisLeftGroup.style("opacity", 0);

        if (hasCO2) {
            vis.yAxisRightGroup
                .style("opacity", 1)
                .attr("transform", `translate(${vis.width},0)`)
                .call(d3.axisRight(vis.yRight).ticks(6));
        } else {
            vis.yAxisRightGroup.style("opacity", 0);
        }

        // --- FIX: bar positioning stays inside cell (avoid clip fights)
        const cellX0 = d => vis.x(d.Year - 0.5);
        const cellX1 = d => vis.x(d.Year + 0.5);
        const barX   = d => Math.ceil(cellX0(d));
        const barW   = d => Math.max(1, Math.floor(cellX1(d) - barX(d)));

        // Bars
        const bars = vis.plot.selectAll("rect.temp-bar")
            .data(hasTemp ? vis.displayData : [], d => d.Year);

        bars.join(
            enter => enter.append("rect")
                .attr("class", "temp-bar")
                .attr("x", d => barX(d))
                .attr("width", d => barW(d))
                .attr("y", vis.yLeft(0))
                .attr("height", 0)
                .attr("fill", d => d.TempAnomaly >= 0 ? "url(#warmGradient)" : "url(#coolGradient)")
                .on("mousemove", (event, d) => {
                    const t = d3.format("+.2f")(d.TempAnomaly);
                    showTT(`<strong>${d.Year}</strong><br/>Temp anomaly: ${t} °C`, event);
                })
                .on("mouseleave", hideTT)
                .call(sel => sel.transition().duration(350)
                    .attr("y", d => Math.min(vis.yLeft(d.TempAnomaly), vis.yLeft(0)))
                    .attr("height", d => Math.abs(vis.yLeft(d.TempAnomaly) - vis.yLeft(0)))),
            update => update
                .attr("fill", d => d.TempAnomaly >= 0 ? "url(#warmGradient)" : "url(#coolGradient)")
                .call(sel => sel.transition().duration(250)
                    .attr("x", d => barX(d))
                    .attr("width", d => barW(d))
                    .attr("y", d => Math.min(vis.yLeft(d.TempAnomaly), vis.yLeft(0)))
                    .attr("height", d => Math.abs(vis.yLeft(d.TempAnomaly) - vis.yLeft(0)))),
            exit => exit.call(sel => sel.transition().duration(200)
                .attr("height", 0)
                .attr("y", vis.yLeft(0))
                .remove())
        );

        // CO₂ line + dots
        const co2Data = hasCO2 ? vis.displayData : [];
        const path = vis.plot.selectAll("path.co2-line")
            .data(co2Data.length ? [co2Data] : []);
        path.join(
            enter => enter.append("path")
                .attr("class", "co2-line")
                .attr("fill", "none")
                .attr("stroke", "#0ea5e9")
                .attr("stroke-width", 2)
                .attr("d", vis.line),
            update => update.transition().duration(250).attr("d", vis.line),
            exit   => exit.remove()
        );

        const dots = vis.plot.selectAll("circle.co2-dot")
            .data(co2Data, d => d.Year);
        dots.join(
            enter => enter.append("circle")
                .attr("class", "co2-dot")
                .attr("cx", d => vis.x(d.Year))
                .attr("cy", d => vis.yRight(d.CO2ppm))
                .attr("r", 3.5)
                .attr("fill", "#0ea5e9")
                .attr("stroke", "#fff")
                .on("mousemove", (event, d) => {
                    showTT(`<strong>${d.Year}</strong><br/>CO₂: ${d3.format(".0f")(d.CO2ppm)} ppm`, event);
                })
                .on("mouseleave", hideTT),
            update => update.transition().duration(200)
                .attr("cx", d => vis.x(d.Year))
                .attr("cy", d => vis.yRight(d.CO2ppm)),
            exit => exit.remove()
        );

        // Labels (outside plot area)
        vis.g.selectAll(".label-text").remove();

        vis.g.append("text")
            .attr("class", "label-text")
            .attr("x", -40)
            .attr("y", -16)
            .attr("text-anchor", "start")
            .style("font-weight", 600)
            .text("Temperature Anomaly (°C)");

        vis.g.append("text")
            .attr("class", "label-text")
            .attr("x", vis.width + 40)
            .attr("y", -16)
            .attr("text-anchor", "end")
            .style("font-weight", 600)
            .text("CO₂ (ppm)");
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

        // --- FIX: keep the clip rect synced to inner plot size
        this.svg.select("#plot-clip rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width)
            .attr("height", this.height);

        this.updateVis();
    }

    // Public API used by main.js
    setMetricMode(mode) {
        this.currentMetricMode = mode; // "TempAnomaly" | "CO2ppm" | "both"
        this.updateVis();
    }

    setSmoothing(value) {
        this.smoothing = +value || 0;
        this.wrangleData();
    }
}

