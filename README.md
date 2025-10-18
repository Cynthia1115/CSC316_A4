# CSC316_A4
This is for the CSC316 A4 Interactive Visualization

# 🌍 Global Warming — Interactive Trends

### Overview
This interactive visualization explores the long-term relationship between **global temperature anomalies** and **atmospheric CO₂ concentrations** from **1958 to 2024**. It combines two major climate indicators into a single coordinated view — showing how the planet’s average temperature has risen in tandem with increasing greenhouse gas levels.

---

### 📊 Dataset Description
The dataset used (`data/annual.csv`) contains annual global averages for:
- **Year** — 1958 to 2024  
- **Temperature Anomaly (°C)** — deviation from the 20th-century baseline  
- **CO₂ concentration (ppm)** — atmospheric CO₂ recorded at Mauna Loa Observatory

These values come from publicly available climate monitoring records (NASA GISS & NOAA’s ESRL datasets).

---

### 🎨 Visualization Description
The main chart integrates two synchronized elements:
- **Vertical bars** (blue to red gradient): show the yearly temperature anomaly relative to the baseline.  
  - Blue bars = cooler than average  
  - Red bars = warmer than average  
- **Smooth blue line with dots**: represents the atmospheric CO₂ concentration over time (ppm).  

Users can:
- **Hover or click** on bars/dots to reveal exact numeric values.  
- **Filter** between *Temperature*, *CO₂*, or *Both* using toggle buttons.  
- **Adjust the year range** via the dual slider to zoom into specific decades.  
- **Toggle smoothing** to simplify trends for clarity.

---

### 🧭 Story & Insights
This visualization tells a simple yet powerful story:  
As atmospheric CO₂ rises, global temperatures follow a parallel upward trend.

Key takeaways:
- From 1958 to the late 1970s, temperatures fluctuated near or slightly below the 0 °C baseline while CO₂ rose steadily past 320 ppm.  
- After 1980, both indicators climb sharply — marking the onset of accelerated global warming.  
- In the 2010s, CO₂ surpasses **400 ppm**, coinciding with record-breaking temperature anomalies near **+1.2 °C**.  
- The visual convergence of line and bars highlights the **tight correlation between human activity and climate change**.

---

### 💡 Inspiration
This project draws inspiration from NASA’s *Climate Spiral* and *Our World in Data*’s long-term temperature plots.  
The design goal was to create an **interactive, educational** tool that balances aesthetic appeal and scientific integrity — helping viewers *see* the connection between emissions and warming trends rather than just read about it.

---

### ⚙️ Technical Stack
- **D3.js v7** — for dynamic SVG rendering and interactivity  
- **HTML5 + CSS3** — layout, responsive design, and styling  
- **JavaScript (modular)** — structured into `main.js`, `chart.js`, and `helperfunctions.js` for clarity  

---

### ⚠️ Limitations
- **Correlation ≠ causation** — while the data strongly correlates, this visualization does not prove direct causality.  
- **Temporal resolution** — the dataset is yearly, smoothing out short-term climate variability.  
- **No regional breakdown** — data shows global averages, not local or seasonal variations.  
- **Visual scalability** — extreme zooming or resizing can distort aspect ratios on some browsers.  

---

### 🌱 Future Improvements
- Add **trendline regression** and **statistical correlation coefficient (r²)**.  
- Include **annotations** for major global climate events (e.g., El Niño years, volcanic eruptions).  
- Add **responsive storytelling sections** that guide the viewer through key insights.  

---

### 🧑‍💻 Authors & Credits
Project by **Cynthia Liu** , **Ayaan Asif** , **CTasheen Rana** 
University of Toronto — *CSC316: Data Visualization and Storytelling*  
Inspired by real-world climate datasets and the mission to make data-driven stories engaging and accessible.
