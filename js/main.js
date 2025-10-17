(function(){
    const container = d3.select("#chart");
    const tooltip = d3.select("#tooltip");
    const svg = container.append("svg");
    const g = svg.append("g");
    const gGrid = g.append("g").attr("class", "grid");
    const gX = g.append("g").attr("class", "axis x-axis");
    const gY = g.append("g").attr("class", "axis y-axis");
    const gPath = g.append("g");
    const gDots = g.append("g");
    const legend = helpers.buildLegend(container);

    const margin = { top: 18, right: 18, bottom: 40, left: 58 };
    const x = d3.scaleLinear();
    const y = d3.scaleLinear();
    const line = d3.line().x(d => x(d.Year)).y(d => y(d.value));

    const metricSel = d3.select("#metric");
    const smoothSel = d3.select("#smoother");

    let baseSeries = null;

    d3.csv("data/annual.csv", d3.autoType).then(data => {
        data = data.filter(d => Number.isFinite(d.Year) && Number.isFinite(d.TempAnomaly) && Number.isFinite(d.CO2ppm));
        baseSeries = {
            TempAnomaly: data.map(d => ({ Year: d.Year, value: d.TempAnomaly })),
            CO2ppm:      data.map(d => ({ Year: d.Year, value: d.CO2ppm }))
        };

        render();
        metricSel.on("change", render);
        smoothSel.on("change", render);
        window.addEventListener("resize", render);
    });

    function render(){
        if (!baseSeries) return;

        const bounds = container.node().getBoundingClientRect();
        const width = bounds.width || 800;
        const height = bounds.height || 480;

        svg.attr("width", width).attr("height", height);
        const innerW = Math.max(320, width) - margin.left - margin.right;
        const innerH = Math.max(240, height) - margin.top - margin.bottom;
        g.attr("transform", `translate(${margin.left},${margin.top})`);

        const metric = metricSel.node().value;
        const win = +smoothSel.node().value || 0;
        const series = baseSeries[metric];
        const s = helpers.movingAvg(series, win);

        x.domain(d3.extent(s, d => d.Year)).range([0, innerW]);
        y.domain([d3.min(s, d => d.value)*0.95, d3.max(s, d => d.value)*1.05]).nice().range([innerH, 0]);

        gGrid.call(g => g.selectAll("*").remove());
        helpers.drawYGrid(gGrid, y, innerW);

        gX.attr("transform", `translate(0,${innerH})`)
            .call(d3.axisBottom(x).ticks(Math.min(12, s.length)).tickFormat(d3.format("d")));
        gY.call(d3.axisLeft(y).ticks(6));

        const path = gPath.selectAll("path.line").data([s], () => metric + "-" + win);
        path.join(
            enter => enter.append("path")
                .attr("class", "line " + metric)
                .attr("d", line)
                .attr("stroke", helpers.lineColor(metric)),
            update => update
                .attr("class","line " + metric)
                .attr("stroke", helpers.lineColor(metric))
                .attr("d", line)
        );

        const dots = gDots.selectAll("circle.dot").data(s, d => d.Year);
        dots.join(
            enter => enter.append("circle")
                .attr("class","dot")
                .attr("r", 3.5)
                .attr("cx", d => x(d.Year))
                .attr("cy", d => y(d.value))
                .on("mouseenter", (event, d) => {
                    tooltip.classed("hidden", false)
                        .style("left", (event.pageX + 14) + "px")
                        .style("top", (event.pageY + 12) + "px")
                        .select("p").html(`<strong>${d.Year}</strong><br>${helpers.formatValue(metric, d.value)}${win ? ` (MA${win})` : ""}`);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", (event.pageX + 14) + "px")
                        .style("top", (event.pageY + 12) + "px");
                })
                .on("mouseleave", () => tooltip.classed("hidden", true)),
            update => update
                .attr("cx", d => x(d.Year))
                .attr("cy", d => y(d.value))
        );
    }
})();
