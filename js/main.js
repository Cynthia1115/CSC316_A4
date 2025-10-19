(async function(){
    // Load data using your CSV headers
    const data = await d3.csv("data/annual.csv", d => ({
        Year: +d.Year,
        TempAnomaly: d.TempAnomaly !== "" && d.TempAnomaly != null ? +d.TempAnomaly : null,
        CO2ppm:      d.CO2ppm      !== "" && d.CO2ppm      != null ? +d.CO2ppm      : null
    }));

    const chart = new Chart("chartContainer", data);

    // Link the external year-range label to brush updates
    const rangeLabel = document.getElementById("rangeLabel");
    chart.setExternalRangeLabel(([a,b])=>{
        rangeLabel.textContent = `${a} – ${b}`;
    });

    // Controls
    const btnTemp = document.getElementById("btnTemp");
    const btnCO2  = document.getElementById("btnCO2");
    const btnBoth = document.getElementById("btnBoth");
    const smoothingSel = document.getElementById("smoothing");

    function setActive(el){
        [btnTemp,btnCO2,btnBoth].forEach(b=>b.classList.remove("btn-primary"));
        el.classList.add("btn-primary");
    }

    btnTemp.onclick = ()=>{ chart.setMetricMode("TempAnomaly"); setActive(btnTemp); };
    btnCO2.onclick  = ()=>{ chart.setMetricMode("CO2ppm");      setActive(btnCO2);  };
    btnBoth.onclick = ()=>{ chart.setMetricMode("both");         setActive(btnBoth); };

    smoothingSel.onchange = (e)=> chart.setSmoothing(+e.target.value);

    // Story controls
    const btnPlay = document.getElementById("btnPlay");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    let playing = false;
    btnPlay.onclick = ()=>{
        playing = !playing;
        if (playing){
            btnPlay.textContent = "❚❚ Pause Story";
            chart.play(true);
        } else {
            btnPlay.textContent = "▶ Play Story";
            chart.play(false);
            // >>> On pause, snap back to full-range + both
            chart.resetToDefault();
            setActive(btnBoth);
        }
    };
    btnPrev.onclick = ()=>{ chart.play(false); playing=false; btnPlay.textContent="▶ Play Story"; chart.goToStep((chart._stepIndex??0)-1); };
    btnNext.onclick = ()=>{ chart.play(false); playing=false; btnPlay.textContent="▶ Play Story"; chart.goToStep((chart._stepIndex??-1)+1); };

    // Keyboard shortcuts
    window.addEventListener("keydown", (e)=>{
        if (e.key==="1"){ btnTemp.click(); }
        else if (e.key==="2"){ btnCO2.click(); }
        else if (e.key==="3"){ btnBoth.click(); }
        else if (e.key==="S" || e.key==="s"){
            const val = smoothingSel.value==="0" ? "3" : smoothingSel.value==="3" ? "5" : "0";
            smoothingSel.value = val; smoothingSel.onchange({target:{value:val}});
        } else if (e.key==="P" || e.key==="p"){
            btnPlay.click(); // pause will trigger reset via handler above
        } else if (e.key==="ArrowLeft" || e.key==="ArrowRight"){
            // nudge brush window by ~1 year
            const dir = e.key==="ArrowRight" ? +1 : -1;
            const sel = d3.brushSelection(chart.brushG.node());
            if (!sel) return;
            const [x0,x1] = sel;
            const yrStep = 1;
            const nx0 = chart.cx(chart.cx.invert(x0) + dir*yrStep);
            const nx1 = chart.cx(chart.cx.invert(x1) + dir*yrStep);
            chart.brushG.call(chart.brush.move, [nx0, nx1]);
        }
    });
})();
