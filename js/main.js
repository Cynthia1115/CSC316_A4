let chart;

function loadData() {
    d3.csv("data/annual.csv").then(csvData => {
        let data = prepareData(csvData);
        chart = new Chart("chart", data);

        // === Dual sliders ===
        const startSlider = d3.select("#yearStart");
        const endSlider = d3.select("#yearEnd");

        function updateRange() {
            const start = +startSlider.node().value;
            const end = +endSlider.node().value;
            chart.filterByRange(start, end);
        }

        startSlider.on("input", updateRange);
        endSlider.on("input", updateRange);

        // === Metric buttons ===
        d3.select("#show-temp").on("click", () => chart.setMetricMode("TempAnomaly"));
        d3.select("#show-co2").on("click", () => chart.setMetricMode("CO2ppm"));
        d3.select("#show-both").on("click", () => chart.setMetricMode("both"));

        // === Smoothing dropdown ===
        d3.select("#smoother").on("change", function () {
            chart.setSmoothing(this.value);
        });

        chart.filterByRange(0, 100);
    });
}

function prepareData(data) {
    data.forEach(d => {
        d.Year = +d.Year;
        d.TempAnomaly = +d.TempAnomaly;
        d.CO2ppm = +d.CO2ppm;
    });
    return data.sort((a, b) => a.Year - b.Year);
}

loadData();
