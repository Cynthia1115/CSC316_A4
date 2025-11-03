// === Shared tooltip ===
const tt = d3.select("#tooltip");
function showTT(html, event) {
    tt.classed("hidden", false)
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY - 28) + "px")
        .select("p").html(html);
}
function hideTT(){ tt.classed("hidden", true); }

class Chart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.fullData = data.slice().sort((a,b)=>a.Year-b.Year);
        this.data = this.fullData;
        this.currentMetricMode = "both"; // "TempAnomaly" | "CO2ppm" | "both"
        this.smoothing = 0;

        this.margin = { top: 56, right: 120, bottom: 130, left: 110 };  // extra bottom for context
        this.contextHeight = 80;
        this.height = 460;  // reduced to fit brush without scrolling

        this.initVis();
        window.addEventListener("resize", () => this.resize());
    }

    computeWidth(){
        const container = document.getElementById(this.parentElement);
        const cw = container ? container.clientWidth : 1000;
        this.width = Math.max(720, cw - 24 - this.margin.left - this.margin.right);
    }

    initVis(){
        const vis = this;
        vis.computeWidth();

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("class","chart")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom + vis.contextHeight + 20);

        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales
        vis.x      = d3.scaleLinear().range([0, vis.width]);
        vis.yLeft  = d3.scaleLinear().range([vis.height, 0]);
        vis.yRight = d3.scaleLinear().range([vis.height, 0]);

        // Clip in inner coords
        vis.svg.append("defs").append("clipPath")
            .attr("id","plot-clip")
            .append("rect")
            .attr("x",0).attr("y",0)
            .attr("width",vis.width).attr("height",vis.height);

        vis.plot = vis.g.append("g")
            .attr("class","plot")
            .attr("clip-path","url(#plot-clip)");

        // Gradients
        const defs = vis.svg.append("defs");
        const warm = defs.append("linearGradient").attr("id","warmGradient")
            .attr("x1","0%").attr("x2","0%").attr("y1","0%").attr("y2","100%");
        warm.append("stop").attr("offset","0%").attr("stop-color","#e63946");
        warm.append("stop").attr("offset","100%").attr("stop-color","#ffb703");
        const cool = defs.append("linearGradient").attr("id","coolGradient")
            .attr("x1","0%").attr("x2","0%").attr("y1","0%").attr("y2","100%");
        cool.append("stop").attr("offset","0%").attr("stop-color","#48cae4");
        cool.append("stop").attr("offset","100%").attr("stop-color","#023e8a");

        // Optional soft glow for green CO₂ line
        const glow = defs.append("filter").attr("id","glow-green")
            .attr("x","-30%").attr("y","-30%").attr("width","160%").attr("height","160%");
        glow.append("feGaussianBlur").attr("stdDeviation","2").attr("result","blur");
        const merge = glow.append("feMerge");
        merge.append("feMergeNode").attr("in","blur");
        merge.append("feMergeNode").attr("in","SourceGraphic");

        // Axes
        vis.xAxisG = vis.g.append("g").attr("class","x-axis");
        vis.yAxisL = vis.g.append("g").attr("class","y-axis-left");
        vis.yAxisR = vis.g.append("g").attr("class","y-axis-right").attr("transform",`translate(${vis.width},0)`);
        // Axis titles
        vis.yLabelL = vis.g.append("text")
            .attr("class","y-label-left")
            .attr("text-anchor","middle")
            .attr("fill","#c7d2e4")
            .attr("font-weight",600)
            .attr("transform",`translate(${-70},${vis.height/2}) rotate(-90)`)
            .text("Temp anomaly (°C, 1951–1980 baseline)");
        vis.yLabelR = vis.g.append("text")
            .attr("class","y-label-right")
            .attr("text-anchor","middle")
            .attr("fill","#c7d2e4")
            .attr("font-weight",600)
            .attr("transform",`translate(${vis.width+70},${vis.height/2}) rotate(90)`)
            .text("CO₂ concentration (ppm — separate scale)");
        

        // CO₂ line (generator)
        vis.line = d3.line()
            .x(d => vis.x(d.Year))
            .y(d => vis.yRight(d.CO2ppm))
            .curve(d3.curveMonotoneX);

        // Context (focus+context)
        const ctxY = vis.margin.top + vis.height + 54;
        vis.ctx = vis.svg.append("g")
            .attr("class","context")
            .attr("transform", `translate(${vis.margin.left},${ctxY})`);

        vis.cx = d3.scaleLinear().range([0, vis.width]);
        vis.cy = d3.scaleLinear().range([vis.contextHeight, 0]);

        
        // Small user hint for brushing interaction
        vis.ctxHint = vis.ctx.append("text")
            .attr("class","brush-hint")
            .attr("x", 8).attr("y", -6)
            .attr("fill","#c7d2e4").attr("font-size", 12)
            .text("Drag to select years");
vis.ctxAxis = vis.ctx.append("g").attr("class","ctx-axis")
            .attr("transform", `translate(0,${vis.contextHeight})`);

        vis.ctxArea = d3.area()
            .x(d => vis.cx(d.Year))
            .y0(vis.contextHeight)
            .y1(d => vis.cy(d.CO2ppm))
            .curve(d3.curveMonotoneX);

        // CO₂ context path — green to match main line
        vis.ctxPath = vis.ctx.append("path")
            .attr("fill","rgba(22,163,74,0.22)")   // green fill
            .attr("stroke","#16a34a")               // green stroke
            .attr("stroke-width",1.2);

        vis.brush = d3.brushX()
            .extent([[0,0],[vis.width, vis.contextHeight]])
            .on("brush end", ({selection}) => {
                if (!selection) return;
                const [x0, x1] = selection.map(vis.cx.invert);
                const y0 = Math.round(x0), y1 = Math.round(x1);
                vis.filterByYears(y0, y1);
                vis.onRangeChange?.([y0, y1]);
            });

        vis.brushG = vis.ctx.append("g")
            .attr("class","brush")
            .call(vis.brush);

        // Annotations layer
        vis.ann = vis.g.append("g").attr("class","annotations");

        // First render
        vis.wrangleData();
    }

    setExternalRangeLabel(fn){ this.onRangeChange = fn; }

    filterByYears(y0, y1){
        this.data = this.fullData.filter(d => d.Year >= y0 && d.Year <= y1);
        this.wrangleData();
    }

    setMetricMode(mode){
        this.currentMetricMode = mode; // "TempAnomaly" | "CO2ppm" | "both"
        this.updateVis(true);
    }

    setSmoothing(k){
        this.smoothing = +k || 0;
        this.wrangleData();
    }

    // >>> NEW: reset to original full-range + both series
    resetToDefault(){
        const ext = d3.extent(this.fullData, d=>d.Year);
        // move brush; its handler will update main view + label
        this.brushG.call(this.brush.move, [this.cx(ext[0]), this.cx(ext[1])]);
        this.setMetricMode("both");
        this._stepIndex = null; // clear story position
    }

    wrangleData(){
        const vis = this;
        let arr = this.data.map(d => ({...d}));
        if (vis.smoothing > 1){
            const k = vis.smoothing, half = Math.floor(k/2);
            const n = arr.length;
            const roll = (get) => arr.map((_,i)=>{
                let s=0,c=0;
                for(let j=i-half;j<=i+half;j++){
                    if(j>=0 && j<n && get(arr[j])!=null){ s+=get(arr[j]); c++; }
                }
                return c? s/c : null;
            });
            const tS = roll(d=>d.TempAnomaly), cS = roll(d=>d.CO2ppm);
            arr = arr.map((d,i)=>({...d, TempAnomaly:tS[i], CO2ppm:cS[i]}));
        }
        this.displayData = arr;
        this.updateVis();
    }

    updateVis(animate=false){
        const vis = this;
        const xMin = d3.min(vis.displayData, d=>d.Year);
        const xMax = d3.max(vis.displayData, d=>d.Year);

        vis.x.domain([xMin-0.5, xMax+0.5]);
        vis.cx.domain(d3.extent(vis.fullData, d=>d.Year));

        const hasTemp = vis.currentMetricMode!=="CO2ppm";
        const hasCO2  = vis.currentMetricMode!=="TempAnomaly";

        if (hasTemp){
            vis.yLeft.domain([
                Math.min(0, d3.min(vis.displayData, d=>d.TempAnomaly)-0.1),
                Math.max(0.2, d3.max(vis.displayData, d=>d.TempAnomaly)+0.1)
            ]).nice();
        }
        if (hasCO2){
            vis.yRight.domain([
                d3.min(vis.displayData, d=>d.CO2ppm)-10,
                d3.max(vis.displayData, d=>d.CO2ppm)+10
            ]).nice();
            vis.cy.domain(d3.extent(vis.fullData, d=>d.CO2ppm)).nice();
        }

        // ========== Bars (temperature) ==========
        const cellX0 = d => vis.x(d.Year-0.5);
        const cellX1 = d => vis.x(d.Year+0.5);
        const barX = d => Math.ceil(cellX0(d));
        const barW = d => Math.max(1, Math.floor(cellX1(d)-barX(d)));
        const bars = vis.plot.selectAll("rect.temp-bar")
            .data(hasTemp ? vis.displayData : [], d=>d.Year);

        bars.join(
            enter => enter.append("rect")
                .attr("class","temp-bar")
                .attr("x", d => barX(d))
                .attr("width", d => barW(d))
                .attr("y", vis.yLeft(0))
                .attr("height",0)
                .attr("fill", d => d.TempAnomaly>=0 ? "url(#warmGradient)" : "url(#coolGradient)")
                .call(sel => sel.transition().duration(animate?700:350)
                    .attr("y", d => Math.min(vis.yLeft(d.TempAnomaly), vis.yLeft(0)))
                    .attr("height", d => Math.abs(vis.yLeft(d.TempAnomaly)-vis.yLeft(0)))),
            update => update
                .attr("fill", d => d.TempAnomaly>=0 ? "url(#warmGradient)" : "url(#coolGradient)")
                .call(sel => sel.transition().duration(300)
                    .attr("x", d => barX(d))
                    .attr("width", d => barW(d))
                    .attr("y", d => Math.min(vis.yLeft(d.TempAnomaly), vis.yLeft(0)))
                    .attr("height", d => Math.abs(vis.yLeft(d.TempAnomaly)-vis.yLeft(0)))),
            exit => exit.transition().duration(250).attr("height",0).attr("y",vis.yLeft(0)).remove()
        ).on("mousemove",(event,d)=>{
            const t = d3.format("+.2f")(d.TempAnomaly);
            showTT(`<strong>${d.Year}</strong><br/>Temp anomaly: ${t} °C`, event);
        }).on("mouseleave", hideTT);

        // ========== CO2 line + dots (GREEN) ==========
        const co2Data = hasCO2 ? vis.displayData.filter(d=>d.CO2ppm!=null) : [];
        const lineSel = vis.plot.selectAll("path.co2-line").data(co2Data.length?[co2Data]:[]);
        lineSel.join(
            enter => enter.append("path").attr("class","co2-line")
                .attr("fill","none")
                .attr("stroke","#16a34a")          // green line
                .attr("stroke-width",2)
                .attr("filter","url(#glow-green)") // subtle glow
                .attr("d", vis.line),
            update => update
                .attr("stroke","#16a34a")
                .attr("filter","url(#glow-green)")
                .transition().duration(300).attr("d", vis.line),
            exit => exit.remove()
        );

        const dots = vis.plot.selectAll("circle.co2-dot").data(co2Data, d=>d.Year);
        dots.join(
            enter => enter.append("circle").attr("class","co2-dot")
                .attr("cx", d=>vis.x(d.Year))
                .attr("cy", d=>vis.yRight(d.CO2ppm))
                .attr("r",3.2)
                .attr("fill","#16a34a")            // green dots
                .attr("stroke","#0b0f15").attr("stroke-width",1)
                .on("mousemove",(event,d)=>showTT(`<strong>${d.Year}</strong><br/>CO₂: ${d3.format(".0f")(d.CO2ppm)} ppm`,event))
                .on("mouseleave", hideTT),
            update => update.transition().duration(250)
                .attr("cx", d=>vis.x(d.Year)).attr("cy", d=>vis.yRight(d.CO2ppm)),
            exit => exit.remove()
        );

        // ========== Axes ==========
        const xAxisY = hasTemp ? vis.yLeft(0) : vis.height;
        vis.xAxisG.selectAll("*").remove();
        vis.xAxisG.append("g")
            .attr("transform",`translate(0,${xAxisY})`)
            .call(d3.axisBottom(vis.x).tickValues([]).tickSize(0))
            .select(".domain").attr("stroke","#2a3956").attr("stroke-width",1.4);

        vis.xAxisG.append("g")
            .attr("transform",`translate(0,${xAxisY+8})`)
            .call(d3.axisBottom(vis.x).ticks(8).tickFormat(d3.format("d")).tickSize(0))
            .select(".domain").remove();

        hasTemp
            ? vis.yAxisL.style("opacity",1).call(d3.axisLeft(vis.yLeft).ticks(6))
            : vis.yAxisL.style("opacity",0);

        hasCO2
            ? vis.yAxisR.style("opacity",1).attr("transform",`translate(${vis.width},0)`).call(d3.axisRight(vis.yRight).ticks(6))
            : vis.yAxisR.style("opacity",0);

        
        // ========== Baseline reference at 0 °C ==========
        const baseData = hasTemp ? [0] : [];
        const baseLine = vis.plot.selectAll("line.baseline-zero").data(baseData);
        baseLine.join(
            enter => enter.append("line").attr("class","baseline-zero")
                .attr("x1",0).attr("x2",vis.width)
                .attr("y1", vis.yLeft(0)).attr("y2", vis.yLeft(0))
                .attr("stroke","#94a3b8").attr("stroke-dasharray","4,4").attr("opacity",0.8),
            update => update
                .attr("x2",vis.width)
                .attr("y1", vis.yLeft(0)).attr("y2", vis.yLeft(0)),
            exit => exit.remove()
        );
        const baseLbl = vis.plot.selectAll("text.baseline-label").data(baseData);
        baseLbl.join(
            enter => enter.append("text").attr("class","baseline-label")
                .attr("x", 8).attr("y", vis.yLeft(0) - 6)
                .attr("fill","#c7d2e4").attr("font-size", 12).attr("font-weight", 600)
                .text("Baseline (1951–1980 avg)"),
            update => update.attr("y", vis.yLeft(0) - 6),
            exit => exit.remove()
        );
// ========== Context view ==========
        vis.ctxPath.datum(vis.fullData.filter(d=>d.CO2ppm!=null))
            .attr("d", vis.ctxArea);
        vis.ctxAxis.call(d3.axisBottom(vis.cx).ticks(8).tickFormat(d3.format("d")));
        if (!vis._brushedOnce){
            vis._brushedOnce = true;
            const ext = d3.extent(vis.fullData, d=>d.Year);
            vis.brushG.call(vis.brush.move, [vis.cx(ext[0]), vis.cx(ext[1])]);
        }

        // ========== Annotations: record highs ==========
        vis.ann.selectAll("*").remove();
        if (hasTemp){
            const maxTemp = d3.max(vis.displayData, d=>d.TempAnomaly);
            const tops = vis.displayData.filter(d => d.TempAnomaly === maxTemp);
            const g = vis.ann.selectAll("g.maxT").data(tops).join("g").attr("class","maxT");
            g.append("circle")
                .attr("cx", d=>vis.x(d.Year)).attr("cy", d=>vis.yLeft(d.TempAnomaly))
                .attr("r",3).attr("fill","#e11d48")
                .style("animation","pulse 2.2s ease-out infinite");
            g.append("text")
                .attr("x", d=>vis.x(d.Year)+8).attr("y", d=>vis.yLeft(d.TempAnomaly)-8)
                .attr("fill","#ffd7e0").attr("font-weight",600).attr("font-size",12)
                .text(d=>`${d.Year} record warmth`);
        }
    }

    // Story steps
    get story(){
        return [
            { label:"Cool mid-20th century",
                range:[1960,1975], mode:"TempAnomaly",
                note:"Mid-century anomalies mostly below zero — cooler baseline." },
            { label:"1998 El Niño spike",
                range:[1988,2000], mode:"both",
                note:"1998 marks an extraordinary spike linked to El Niño." },
            { label:"2016 record warmth",
                range:[2009,2017], mode:"TempAnomaly",
                note:"2016 sets a new record; warming trend is unmistakable." },
            { label:"Recent highs",
                range:[2015,2024], mode:"both",
                note:"CO₂ crosses 420 ppm while temperatures remain elevated." }
        ];
    }

    goToStep(i){
        const s = this.story[(i+this.story.length)%this.story.length];
        this._stepIndex = (i+this.story.length)%this.story.length;
        this.brushG.transition().duration(700)
            .call(this.brush.move, [this.cx(s.range[0]), this.cx(s.range[1])]);
        this.setMetricMode(s.mode);
        const caption = this.g.selectAll(".story-caption").data([s]);
        caption.join(
            enter => enter.append("text").attr("class","story-caption")
                .attr("x", 12).attr("y", -22).attr("fill","#cfe7ff")
                .attr("font-weight",600)
                .text(d=>`Story: ${d.label} — ${d.note}`)
                .attr("opacity",0).transition().duration(350).attr("opacity",1),
            update => update.text(d=>`Story: ${d.label} — ${d.note}`)
        );
    }

    play(toggle){
        if (toggle===false){ clearInterval(this._timer); this._timer=null; return; }
        if (this._timer){ clearInterval(this._timer); this._timer=null; return; }
        if (this._stepIndex==null) this._stepIndex = 0;
        this.goToStep(this._stepIndex);
        this._timer = setInterval(()=>{ this.goToStep(++this._stepIndex); }, 5200);
    }

    resize(){
        this.computeWidth();
        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom + this.contextHeight + 20);
        this.yLeft.range([this.height, 0]);
        this.yRight.range([this.height, 0]);
        this.x.range([0, this.width]);
        this.cx.range([0, this.width]);
        this.cy.range([this.contextHeight, 0]);
        this.yAxisR.attr("transform",`translate(${this.width},0)`);
        // reposition axis titles
        this.yLabelL.attr("transform",`translate(${-70},${this.height/2}) rotate(-90)`);
        this.yLabelR.attr("transform",`translate(${this.width+70},${this.height/2}) rotate(90)`);
        
        this.svg.select("#plot-clip rect").attr("width", this.width).attr("height", this.height);
        this.brush.extent([[0,0],[this.width, this.contextHeight]]);
        this.brushG.call(this.brush);
        this.updateVis();
    }
}

window.Chart = Chart; // expose for main.js
