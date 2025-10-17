# CSC316_A4
This is for the CSC316 A4 Interactive Visualization

🌍 Visualization Overview
Title: Global Warming Over Time — Temperature and CO₂ Concentration
This interactive D3.js line chart visualizes the relationship between global mean temperature anomalies (°C) and atmospheric CO₂ concentration (ppm) across years. It allows users to dynamically switch metrics and apply smoothing to observe long-term climate trends.

🧩 Structure and Interaction
1. Data
The dataset (annual.csv) contains three main columns:
Year	TempAnomaly (°C)	CO2ppm
1880	-0.12	290.3
1900	-0.08	296.1
...	...	...
2024	1.12	419.7
These values can be replaced with real-world NASA GISTEMP and Mauna Loa data later.

2. Interface
* Dropdown Menu: Lets users choose between:
    * “Temperature Anomaly (°C)”
    * “CO₂ Concentration (ppm)”
* Smoothing Slider: Applies a moving average to reveal long-term climate patterns.
* Tooltips: Show precise year, temperature anomaly, and CO₂ values when hovering.
* Legend and Labels: Clarify which metric is active and what the line color represents.

3. Interactivity Features
* Hover over any data point to view detailed numerical information.
* Transition Effects: Smooth animations for switching metrics and updating line shape.
* Responsive Layout: Scales for different screen widths.
* Smoothing Control: Adjustable window size applies the movingAvg() helper to reduce yearly variability.

📈 Visual Encoding
Feature	Encoding
X-axis	Year (time scale)
Y-axis	Metric value (temperature °C or CO₂ ppm)
Color	Distinguishes metrics: red for temperature, blue for CO₂
Tooltip	Shows formatted values with contextual units
Line shape	Smoothed trend line emphasizes climate progression
🔍 Insights and Interpretation
1. Strong Upward Trend: Both temperature and CO₂ concentration rise sharply after the 1950s. This reflects the acceleration of industrial activity and fossil fuel emissions.
2. Early Flat Period: Between 1880–1940, temperature anomalies fluctuate slightly, showing local variation before the modern warming era.
3. Post-1970 Correlation: The relationship between CO₂ and temperature becomes nearly linear — each ppm increase in CO₂ roughly coincides with a proportional temperature rise.
4. Acceleration in Recent Decades: Smoothing highlights the steepest incline from 2000–2020, showing how the planet is warming faster than ever recorded.
5. Impact Insight: The chart visually supports climate science consensus: anthropogenic CO₂ drives global warming through a greenhouse effect mechanism.
