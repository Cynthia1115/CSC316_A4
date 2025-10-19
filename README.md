# CSC316_A4
This is for the CSC316 A4 Interactive Visualization
# 🌍 Tracing Earth’s Fever — Interactive Trends in Temperature & Carbon

An interactive D3.js visualization exploring the long-term relationship between **global temperature anomalies** and **atmospheric CO₂ concentrations**.  
The project blends scientific data, narrative storytelling, and elegant interaction design to help viewers intuitively understand how Earth’s atmosphere has changed over the past century.

---

## 📘 Dataset Description

### Combined Climate Dataset — Temperature Anomalies and CO₂ Concentrations

This dataset merges:
- **NASA GISTEMP v4** (Global Land–Ocean Temperature Index)  
- **NOAA Mauna Loa CO₂ Record**, with pre-1958 values extended from **Scripps Ice Core reconstructions**

It covers **annual global mean temperature anomalies** (°C relative to the 1951–1980 average) and **atmospheric CO₂ concentrations** (ppm).

| Column | Description |
|:--------|:-------------|
| `Year` | Calendar year (1880 – present) |
| `Temp_Anomaly` | Global mean surface temperature anomaly (°C) relative to 1951–1980 baseline |
| `CO2_ppm` | Atmospheric CO₂ concentration (parts per million), measured at Mauna Loa or estimated from ice cores pre-1958 |

### 🔗 Source References
- **NASA GISTEMP v4** – Global Land-Ocean Temperature Index  
  https://data.giss.nasa.gov/gistemp/  
- **NOAA Global Monitoring Laboratory** – Mauna Loa CO₂ Record  
  https://gml.noaa.gov/ccgg/trends/data.html  
- **Scripps CO₂ Program** – Ice-core extension (pre-1958)  

---

## 🎯 Purpose and Analytical Goals

The visualization aims to:

- Compare **atmospheric CO₂ growth** with **rising global temperature anomalies**.  
- Reveal how warming accelerated after the industrial era (≈1950 onward).  
- Encourage exploration of the **correlation** between greenhouse gases and surface temperature (r ≈ 0.9 since 1958).  
- Educate users on the **link between human emissions and observable climate change**.

---

## 🧭 Visualization Overview

### Main Components
- **Bars** → Temperature anomalies (blue = cooler, red = warmer)  
- **Green line** → CO₂ concentration (ppm), using a smooth curve and subtle glow  
- **Dual axes** → °C on the left, ppm on the right  
- **Brushable context chart** → CO₂ overview at bottom controlling main focus  
- **Dynamic x-axis** → Labels anchored to the 0 °C baseline  
- **Annotations** → Pulsing highlights for record-warm years  

### Controls
- **Metric toggle**: Temperature / CO₂ / Both  
- **Smoothing**: Off / 3-year / 5-year centered moving average  
- **Story Mode**: Animated narrative walkthrough of four climate eras  
- **Keyboard shortcuts**:  
  `1` Temp | `2` CO₂ | `3` Both | `S` toggle smoothing | `P` play/pause | `← →` shift window  

When Story Mode is **paused**, the visualization automatically **resets** to the full-range, dual-metric default view.

---

## 🎬 Story Mode Highlights

| Scene | Years | Focus | Key Insight |
|:------|:------|:------|:------------|
| 1️⃣ | 1960–1975 | Temperature | Mid-century cooling before modern warming trend |
| 2️⃣ | 1988–2000 | Both | 1998 El Niño spike and rapid recovery |
| 3️⃣ | 2009–2017 | Temperature | 2016 record warmth — persistent positive anomalies |
| 4️⃣ | 2015–2024 | Both | CO₂ surpasses 420 ppm; continued high temperatures |

---

## 💡 Key Design Decisions

- **Dual encoding** (bars + line) clearly differentiates additive CO₂ accumulation vs. fluctuating temperature deviations.  
- **Warm-to-cool gradient** instantly communicates direction and magnitude.  
- **Green CO₂ line** creates visual contrast and environmental symbolism.  
- **Inner-coordinate clipping** eliminates visual gaps from resizing or brushing.  
- **Baseline-anchored x-axis** reinforces the idea of “above vs. below normal.”  
- **Multi-view coordination** (focus + context) enables zooming without losing orientation.  
- **Subtle animation and glow** increase depth without distraction.  

---

## 📈 Insights

1. **Persistent Warming Trend** – Post-1980s, almost every year is above the zero baseline.  
2. **CO₂ and Temperature Rise Together** – The visual correlation between the green line and red bars is unmistakable.  
3. **Accelerating Growth** – CO₂ climbs steadily while temperature anomalies increase non-linearly.  
4. **Smoothing Exposes Structure** – 3- and 5-year averages reveal stable upward momentum.  

---

## ⚠️ Limitations

- **Baseline sensitivity:** The “zero” line depends on the chosen 1951–1980 reference period.  
- **Temporal resolution:** Annual aggregation hides monthly and seasonal variability.  
- **No causal inference:** The visualization illustrates correlation, not proof of causation.  
- **Uncertainty:** Measurement and reconstruction errors are not visualized.  
- **Global averaging:** Regional extremes are not represented.  

---

## 🧠 Educational & Design Impact

This project demonstrates how **data storytelling** and **interaction design** can transform raw climate data into an accessible narrative.  
It bridges **science and emotion** by combining accuracy, interactivity, and visual storytelling — helping viewers *see* Earth’s fever in motion.

---

## 🛠️ Technical Implementation

| Aspect | Details |
|:-------|:---------|
| **Framework** | D3.js (v7) |
| **Files** | `index.html`, `css/style.css`, `js/chart.js`, `js/main.js`, `data/annual.csv` |
| **Scales** | Linear for both axes |
| **Smoothing** | Centered moving average ignoring nulls |
| **Animations** | D3 transitions + timed story playback |
| **Responsiveness** | Dynamic width + resize event handling |
| **Annotations** | Pulsing record-year markers with CSS keyframes |

---

## 📁 Directory Structure

- project/
- ├── index.html
- ├── css/
- │ └── style.css
- ├── js/
- │ ├── chart.js
- │ └── main.js
- └── data/
- └── annual.csv
