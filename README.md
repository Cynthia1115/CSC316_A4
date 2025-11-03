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
## 🎬 Storyboard — *"Tracing Earth’s Fever"*

The storyboard follows a **four-stage data story arc** that blends science with emotion.

---

### 🎣 1. Hook — *“The Planet’s Pulse”*
**Scene:**  
The visualization opens in full view — a clean dual-axis chart.  
Temperature bars fluctuate around zero, while the CO₂ line begins its steady rise.  
Muted narration or labels read:  
> “Every year, our planet breathes — warming, cooling, changing. But something deeper is shifting.”

**Purpose:**  
Grab attention and establish rhythm. The viewer notices that CO₂ only moves upward, even as temperatures oscillate.

---

### 📈 2. Rising Insights — *“When Patterns Align”*
**Scene:**  
User zooms into 1960–2000 using the **brush**.  
Temperature bars turn red more often; CO₂ steepens.  
The **Story Mode** guides attention with smooth transitions.  
Captions highlight:  
> “Short-term variability hides long-term truth.”  
> “By 1998, a single El Niño pushes global temperature to new highs.”

**Purpose:**  
Reveal emerging correlation — local ups and downs fade in importance as the general trend aligns.

---

### 💡 3. Main Message — *“The Heat is Relentless”*
**Scene:**  
The Story Mode zooms into 2009–2017.  
Bars are consistently above zero, and the CO₂ line glows brighter green.  
Annotation pulse marks **2016 — Record Warm Year**.  
Narration (or subtitle):  
> “Even without El Niño, warmth has become the new normal.”

**Purpose:**  
Drive home the continuity and persistence of modern warming. Visual saturation of red conveys urgency without words.

---

### 🌱 4. Resolution — *“Seeing the Link”*
**Scene:**  
The animation pans back to **full range view**, resetting both datasets.  
The CO₂ curve remains high and steady, contrasting against decades of rising red bars.  
Subtle text overlay:  
> “Two curves, one story — a shared trajectory of carbon and heat.”

**Purpose:**  
Encourage reflection. The full-view reset allows viewers to explore on their own — zoom, smooth, and connect insights personally.

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

When Story Mode is **paused**, the visualization **stays on the current scene** (no reset). You can resume or navigate with Next/Prev.

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


### ℹ️ What is a temperature anomaly?
A *temperature anomaly* is the difference between the observed global mean temperature and a fixed baseline average. Here we use the **1951–1980** global mean as the baseline, so an anomaly of **+0.80 °C** means that year's global mean was 0.80 °C warmer than the 1951–1980 average.


### ℹ️ CO₂ axis note
For legibility, the **CO₂ (ppm)** right-hand axis starts near the observed data range (≈ **320 ppm** for this subset) rather than at 0. The right axis is a **separate scale** from temperature (left axis). A legend/info label in the chart indicates this to avoid implying direct numeric comparability.
