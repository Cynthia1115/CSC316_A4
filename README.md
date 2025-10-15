# CSC316_A4
This is for the CSC316 A4 Interactive Visualization

🌍The Warming Curve: How Earth’s Temperature Has Changed Since 1880
    Project Overview
This interactive visualization explores how the Earth’s global average temperature has changed over the past century and a half. Using NASA’s Global Temperature Anomaly dataset, it reveals how the planet has shifted from cooler (blue) to hotter (red) years, emphasizing the accelerating rate of global warming since the mid-20th century.

    Dataset Description
Dataset Source: Global Temperature Time Series (DataHub / NASA GISTEMP)
Data Fields:
Column	Description
Source	Dataset identifier (e.g. “GCAG”, “GISTEMP”)
Year	Year of observation (1880 – 2024)
Mean	Global mean surface temperature anomaly in °C, relative to the 1951–1980 baseline
Summary: Each record represents the annual deviation of the global average temperature from a long-term reference period. Positive values indicate warmer-than-average years, while negative values indicate cooler-than-average years. This dataset is widely used in climate research to illustrate long-term global warming trends.

    Visualization Description
Main View — Global Temperature Line Chart
* X-axis: Year (1880 – 2024)
* Y-axis: Mean temperature anomaly (°C)
* Encoding: A continuous color gradient from blue → red represents cooler to warmer years.
* Animation: The line gradually draws across time, simulating the unfolding story of global warming.
* Tooltip: Hovering over a point displays the exact year and temperature anomaly value.
* Slider & Play Controls: Users can manually scrub through time or press “Play” to animate the timeline.
Secondary View — Global Heat Stripes
* A compact bar-stripe timeline shows each year’s color-coded anomaly.
* Hovering on a stripe highlights the corresponding position on the main chart.
Annotations & Highlights
Key historical milestones are marked to contextualize the data:
* 1945: Post-WWII industrial expansion.
* 1980: Sharp rise in CO₂ concentrations.
* 2016: Record global heat linked to El Niño event.

Insight & Narrative Goals
This visualization aims to:
1. Reveal the long-term warming trend — show how the global temperature anomaly has shifted from ≈ −0.2 °C to +1.2 °C since 1880.
2. Highlight the rate of acceleration — emphasize the steep incline after 1950 and particularly since 1990.
3. Engage users interactively — allow them to explore the data chronologically or jump to specific historical points.
4. Contextualize the science — connect visual data patterns with real-world events (industrialization, environmental policy, climate milestones).
5. Encourage reflection — convey that global warming is not a distant projection but a measurable, accelerating phenomenon already visible in the record.

Technical Notes
* Built with: D3.js v7
* Hosting: GitHub Pages
* Interactivity: Play/pause controls, tooltip hover, time scrubber slider, coordinated dual-view highlighting
* Responsive: Works across desktop and tablet browsers

Acknowledgments
* Data from the NASA Goddard Institute for Space Studies (GISTEMP).
* Visualization inspired by Ed Hawkins’ “Climate Stripes” concept.
* Developed for the CSC316: Data Visualization course at the University of Toronto.
