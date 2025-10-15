
// ===== Helper functions and shared constants =====
const CSV_URL = "https://datahub.io/core/global-temp/r/annual.csv";
const fmt = d3.format("+.2f");

function rolling(data, k){
  if(k === 0) return data.map(d=>({...d}));
  const out=[]; const half=Math.floor(k/2);
  for(let i=0;i<data.length;i++){
    const s = Math.max(0, i-half);
    const e = Math.min(data.length-1, i+half);
    const slice = data.slice(s, e+1);
    const m = d3.mean(slice, d=>d.Mean);
    out.push({...data[i], Mean: m});
  }
  return out;
}

function makeColorScale(min=-0.6, max=1.4){
  return d3.scaleLinear()
    .domain([min, 0, 0.3, 0.6, 1.0, max])
    .range(["#2c6bb2", "#5aa7d9", "#bfe3ff", "#ffd1a1", "#ff8a5b", "#d64545"]);
}

const annotations = [
  {year: 1945, text: "Post-WWII industrial expansion"},
  {year: 1980, text: "CO₂ > 340 ppm"},
  {year: 2016, text: "Record El Niño heat"}
];

function lerp(a,b,t){ return a + (b-a)*t; }
function clamp(x, lo, hi){ return Math.max(lo, Math.min(hi, x)); }
