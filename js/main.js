let chart;

function loadData() {
    d3.csv("data/annual.csv").then(csvData => {
        const data = prepareData(csvData);
        chart = new Chart("chart", data);

        // ==== map slider percent -> year precisely ====
        const minYear = data[0].Year;
        const maxYear = data[data.length - 1].Year;

        const startSlider = d3.select("#yearStart");
        const endSlider   = d3.select("#yearEnd");
        const lbl         = d3.select("#yearRangeLabel");

        function percentToYear(p) {
            const pct = Math.max(0, Math.min(100, +p || 0));
            const y = minYear + (pct / 100) * (maxYear - minYear);
            return Math.round(y);
        }

        function updateRange() {
            let sY = percentToYear(startSlider.node().value);
            let eY = percentToYear(endSlider.node().value);
            if (sY > eY) [sY, eY] = [eY, sY];
            chart.filterByYears(sY, eY);
            lbl.text(`${sY} – ${eY}`);
        }

        // sliders
        startSlider.on("input", updateRange);
        endSlider.on("input", updateRange);

        // metric buttons
        d3.select("#show-temp").on("click", () => chart.setMetricMode("TempAnomaly"));
        d3.select("#show-co2").on("click",  () => chart.setMetricMode("CO2ppm"));
        d3.select("#show-both").on("click", () => chart.setMetricMode("both"));

        // smoothing
        const smoother = d3.select("#smoother");
        smoother.on("change", function () { chart.setSmoothing(+this.value || 0); });
        chart.setSmoothing(+smoother.node().value || 0);

        // initial full range
        startSlider.property("value", 0);
        endSlider.property("value", 100);
        updateRange();

        // safety: hide tooltip when cursor leaves the whole svg
        d3.select("#chart svg").on("mouseleave", () => {
            const tt = d3.select("#tooltip");
            tt.classed("hidden", true);
        });
    }).catch(err => console.error("CSV load failed:", err));
}

function prepareData(data) {
    data.forEach(d => {
        d.Year = +d.Year;
        d.TempAnomaly = +d.TempAnomaly;
        d.CO2ppm = +d.CO2ppm;
    });
    return data.sort((a, b) => a.Year - b.Year);
}

// Ensure DOM exists before drawing
if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", loadData);
} else {
    loadData();
}
