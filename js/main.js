let chart;

loadData()


function loadData() {
    d3.csv("data/annual.csv").then(csvData =>{
        let data = prepareData(csvData);
        chart = new Chart("chart-container", data);

    });

}


function prepareData(data) {
    data.forEach(d => {
        d.Year = +d.Year;
        d.TempAnomaly = +d.TempAnomaly;
        d.CO2ppm =d.CO2ppm;
    });

    return data;
}