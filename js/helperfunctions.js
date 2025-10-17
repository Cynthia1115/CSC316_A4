(function(){
    function movingAvg(values, windowSize){
        const w = Math.max(0, +windowSize|0);
        if (w <= 1) return values.slice();
        const half = Math.floor(w/2);
        return values.map((d,i) => {
            const a = Math.max(0, i-half);
            const b = Math.min(values.length-1, i+half);
            let sum = 0, n = 0;
            for (let k=a; k<=b; k++){ sum += values[k].value; n++; }
            return { Year: d.Year, value: sum / n };
        });
    }

    function lineColor(metric){
        return metric === "TempAnomaly" ? "#ef4444" : "#0ea5e9";
    }

    function formatValue(metric, v){
        return (metric === "TempAnomaly" ? d3.format(".2f")(v) + " °C"
            : d3.format(".0f")(v) + " ppm");
    }

    function buildLegend(container){
        const legend = container.append("div").attr("class","legend");
        const keys = [
            { cls: "TempAnomaly", label: "Temp Anomaly (°C)", color: "#ef4444" },
            { cls: "CO2ppm",      label: "CO₂ (ppm)",     color: "#0ea5e9" }
        ];
        keys.forEach(k => {
            const row = legend.append("div").attr("class","key");
            row.append("span").attr("class","swatch").style("background", k.color);
            row.append("span").text(k.label);
        });
        return legend;
    }

    function drawYGrid(g, y, width){
        g.call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(""))
            .selectAll("line").attr("stroke-dasharray","2,2");
    }

    window.helpers = { movingAvg, lineColor, formatValue, buildLegend, drawYGrid };
})();
