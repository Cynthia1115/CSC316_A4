# CSC316_A4
This is for the CSC316 A4 Interactive Visualization

# 🌍 Global Warming — Interactive Trends

# Tracing Earth’s Fever — Interactive Trends in Temperature & Carbon

An interactive, multi-view D3.js visualization exploring the long-term relationship between **global temperature anomalies** and **atmospheric CO₂**.  
The project blends **data storytelling**, **interactive controls**, and **aesthetic design** to convey the narrative of climate change through data.

---

## 🌍 1. Overview

This visualization links two key climate indicators:

- **Temperature Anomaly (°C)** — global surface temperature relative to a baseline (0-line).  
  Red/yellow bars = warmer years; blue bars = cooler years.

- **Atmospheric CO₂ (ppm)** — annual mean carbon dioxide concentration.  
  Shown as a smooth **green line** with optional glow, symbolizing the rise in greenhouse gases.

Together, they form a **dual-axis story** of how Earth’s atmosphere and temperature have evolved over the last seven decades.

---

## 📊 2. Dataset Description

**File:** `data/annual.csv`

| Column        | Type    | Description                                                   |
|----------------|---------|---------------------------------------------------------------|
| `Year`         | number  | Year of observation (e.g., 1958–2024).                       |
| `TempAnomaly`  | number  | Annual mean surface temperature anomaly (°C) vs baseline.     |
| `CO2ppm`       | number  | Annual mean CO₂ concentration (parts per million).            |

**Notes:**
- Data covers modern instrumental records (post-1950s).
- Missing values (`null`) are handled gracefully and excluded from smoothing.
- Both metrics are aggregated by year for clarity and comparability.

---

## 🧭 3. Story Mode — The Narrative

The visualization includes a **guided story sequence** that automatically highlights key historical patterns:

1. **Cool Mid-20th Century (1960–1975)**  
   Bars dip below the baseline — a cooler era preceding the modern warming trend.

2. **1998 El Niño Spike (1988–2000)**  
   A sharp positive anomaly marks a major El Niño event, visually distinct in the warming trajectory.

3. **2016 Record Warmth (2009–2017)**  
   The highest anomalies on record; persistent red bars reflect long-term change.

4. **Recent Highs (2015–2024)**  
   CO₂ surpasses 420 ppm, and anomalies remain elevated — a vivid pairing of carbon and heat.

> When you **pause** the story, the visualization **resets** to the **full range view** with both series visible, encouraging exploration beyond the scripted scenes.

---

## 🧩 4. Interaction Features

| Feature | Description |
|----------|-------------|
| **Focus + Context** | Brushed CO₂ overview allows zooming into specific decades. |
| **Toggle Metrics** | View Temperature only, CO₂ only, or both together. |
| **Smoothing** | Apply 3-year or 5-year moving averages to clarify long-term trends. |
| **Story Mode** | Auto-narrated view that pans through key historical events. |
| **Keyboard Shortcuts** | `1` Temp only · `2` CO₂ only · `3` Both · `S` toggle smoothing · `P` play/pause · `←/→` shift window |
| **Responsive Design** | Automatically adapts to browser width. |

---

## 🎨 5. Design Rationale

### Multi-view coordination
A **focus + context** design helps users navigate large temporal ranges while maintaining orientation.

### Color symbolism
- Warm anomalies → **gradient of red to yellow**  
- Cool anomalies → **gradient of blue to navy**  
- CO₂ line → **green glow**, representing environmental change and growth of carbon concentration.

### Layout choices
- **Baseline-anchored x-axis**: Labels sit on the 0°C line when temperature is active, reinforcing the “above/below normal” concept.  
- **Dual y-axes**: Left for temperature, right for CO₂.  
- **Annotations**: Pulsing dots mark record-high temperatures.  

### Aesthetic style
- Minimal gridlines and soft gradients for elegance.  
- Balanced padding and hierarchy for legibility.  
- Cohesive typographic system (`Inter` font family).

---

## 🔍 6. Insights

1. **Persistent Warming Trend**  
   Bars shift from blue to red as time progresses, showing that warming dominates the recent decades.

2. **CO₂ Growth Mirrors Temperature Rise**  
   The green line steadily increases, closely aligned with the pattern of positive anomalies.

3. **Short-term Variability vs. Long-term Pattern**  
   Individual cool years remain, but the overall signal is upward.

4. **Smoothing Clarifies Structure**  
   3- and 5-year moving averages reveal a clear structural warming trend without short-term noise.

---

## ⚠️ 7. Limitations

- **Baseline sensitivity:** The zero line depends on the chosen reference period.  
- **Temporal granularity:** Annual averages mask intra-year variability and extremes.  
- **No causal proof:** Correlation between CO₂ and temperature is visual, not statistical evidence of causality.  
- **Data completeness:** Some early or edge years may lack one variable.  
- **Simplified units:** Global averages hide regional disparities and feedback dynamics.

---

## 🧠 8. Educational Value

This project transforms abstract climate statistics into an accessible, emotionally resonant narrative.  
It demonstrates:
- How **data visualization can reveal long-term structure**, not just raw trends.  
- How thoughtful **interaction design** enhances engagement and retention.  
- How **color, motion, and context** can evoke both scientific insight and storytelling.

---

## 🛠️ 9. Technical Details

- **Framework:** D3.js (v7)  
- **Structure:** Modular JS (`chart.js`, `main.js`) + static HTML/CSS  
- **Scales:** Linear (time, value)  
- **Smoothing:** Centered moving average, ignores `null` values  
- **Clip path:** Inner-coordinate clipping to avoid masking artifacts  
- **Responsiveness:** Dynamic width recomputation with window resize  
- **Animations:** Transitions for story playback and annotations  

---

## 🧾 10. Directory Structure

project/
├── index.html
├── css/
│ └── style.css
├── js/
│ ├── chart.js
│ └── main.js
└── data/
└── annual.csv

---
