
// ===== Main Visualization =====
let raw=[], data=[], view=[], years=[];
let tAnim=null, isPlaying=false, speed=1, currentYear=1880, yMax=1.4, yMin=-0.6;

const svg = d3.select('#chart');
const W = () => svg.node().clientWidth;
const H = () => svg.node().clientHeight;
const M = {top:28, right:24, bottom:36, left:56};

const stripesSvg = d3.select('#stripes');
const stripesH = () => stripesSvg.node().clientHeight;

const tooltip = d3.select('#tooltip');
const colorScale = makeColorScale(yMin, yMax);

const x = d3.scaleLinear();
const y = d3.scaleLinear();

const gRoot = svg.append('g');
const gAxes = gRoot.append('g');
const gAnnot = gRoot.append('g');
const gPlot = gRoot.append('g');

const path = gPlot.append('path')
  .attr('fill','none')
  .attr('stroke-width',2.5)
  .attr('stroke-linejoin','round')
  .attr('stroke-linecap','round');

const focus = gPlot.append('circle')
  .attr('r',4.5)
  .attr('fill','#fff')
  .attr('stroke','#000')
  .attr('stroke-width',1.2)
  .style('opacity',0);

const clipId = 'reveal-clip';
svg.append('clipPath').attr('id', clipId).append('rect');
gPlot.attr('clip-path', `url(#${clipId})`);

const xAxisG = gAxes.append('g').attr('class','x-axis');
const yAxisG = gAxes.append('g').attr('class','y-axis');

function resize(){
  const w = W(), h = H();
  gRoot.attr('transform', `translate(${M.left},${M.top})`);
  x.range([0, w - M.left - M.right]);
  y.range([h - M.top - M.bottom, 0]);
  svg.select(`#${clipId} rect`).attr('width', x(currentYear) - x.range()[0]).attr('height', y.range()[0]);
  draw();
}

window.addEventListener('resize', resize);

function draw(){
  const w = W(), h = H();
  const innerW = w - M.left - M.right;
  const innerH = h - M.top - M.bottom;

  x.domain(d3.extent(view, d=>d.Year));
  y.domain([yMin, yMax]).nice();

  const line = d3.line()
    .x(d=>x(d.Year))
    .y(d=>y(d.Mean));

  path.attr('d', line(view))
      .attr('stroke', '#bcd7f6');

  xAxisG.attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')));
  yAxisG.call(d3.axisLeft(y).ticks(6).tickFormat(d=>`${d}°C`));

  // colorize path via gradient
  const gradId = 'grad-temp';
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  const grad = defs.select(`#${gradId}`).empty() ? defs.append('linearGradient').attr('id', gradId) : defs.select(`#${gradId}`);
  grad.attr('x1', '0%').attr('x2','100%').attr('y1','0%').attr('y2','0%');
  grad.selectAll('stop').data(view).join('stop')
    .attr('offset', d => `${(d.Year - view[0].Year)/(view[view.length-1].Year - view[0].Year) * 100}%`)
    .attr('stop-color', d => colorScale(d.Mean));
  path.attr('stroke', `url(#${gradId})`);

  // annotations
  const aSel = gAnnot.selectAll('g.annotation').data(annotations, d=>d.year);
  const aEnter = aSel.enter().append('g').attr('class','annotation');
  aEnter.append('line').attr('y1', -6).attr('y2', 6).attr('stroke','#a7d3ff').attr('stroke-width',1.2);
  aEnter.append('text').attr('dy', -10).attr('text-anchor','middle').attr('fill','#a7d3ff').style('font-size','11px');
  aSel.merge(aEnter)
    .attr('transform', d => `translate(${x(d.year)},${y(yMax)})`);
  aSel.merge(aEnter).select('text').text(d=>`${d.year} • ${d.text}`);

  // update clip (reveal) rect
  svg.select(`#${clipId} rect`)
    .attr('x', x.range()[0])
    .attr('y', 0)
    .attr('width', x(currentYear) - x.range()[0])
    .attr('height', innerH + 20);
}

function updateFocus(year){
  const idx = d3.bisector(d=>d.Year).left(view, year);
  const d = view[clamp(idx, 0, view.length-1)];
  focus.attr('cx', x(d.Year)).attr('cy', y(d.Mean)).style('opacity',1);
  tooltip.style('opacity',1)
    .style('left', (x(d.Year) + M.left + 12) + 'px')
    .style('top', (y(d.Mean) + M.top - 28) + 'px')
    .html(`<b>${d.Year}</b><br/>Anomaly: <b>${fmt(d.Mean)}°C</b>`);
}

function hideFocus(){
  focus.style('opacity',0);
  tooltip.style('opacity',0);
}

function buildStripes(){
  const w = stripesSvg.node().clientWidth;
  const h = stripesH();
  const years = view.map(d=>d.Year);
  const xStripe = d3.scaleBand().domain(years).range([0, w]).padding(0);
  const rects = stripesSvg.selectAll('rect').data(view, d=>d.Year);
  rects.enter().append('rect')
    .attr('x', d=>xStripe(d.Year)).attr('y', 0)
    .attr('width', xStripe.bandwidth()).attr('height', h)
    .attr('fill', d=>makeColorScale()(d.Mean))
    .on('mousemove', (event, d) => {
      currentYear = d.Year;
      d3.select('#scrub').property('value', currentYear);
      d3.select('#yearLabel').text(currentYear);
      svg.select(`#${clipId} rect`).attr('width', x(currentYear) - x.range()[0]);
      updateFocus(currentYear);
    })
    .on('mouseleave', hideFocus);
  rects.attr('x', d=>xStripe(d.Year)).attr('width', xStripe.bandwidth());
}

function setYear(yval){
  currentYear = yval;
  d3.select('#yearLabel').text(currentYear);
  svg.select(`#${clipId} rect`).attr('width', x(currentYear) - x.range()[0]);
  updateFocus(currentYear);
}

function tick(){
  if(!isPlaying) return;
  currentYear = Math.min(currentYear + 1, years[years.length-1]);
  setYear(currentYear);
  if(currentYear >= years[years.length-1]){
    isPlaying = false;
    return;
  }
  const delay = 400 / speed;
  tAnim = setTimeout(tick, delay);
}

function play(){ if(!isPlaying){ isPlaying=true; tick(); } }
function pause(){ isPlaying=false; clearTimeout(tAnim); }
function reset(){ pause(); currentYear = years[0]; setYear(currentYear); }

// UI bindings
d3.select('#play').on('click', play);
d3.select('#pause').on('click', pause);
d3.select('#reset').on('click', reset);
d3.select('#speed').on('input', function(){ speed = +this.value; d3.select('#speedVal').text(this.value + '×'); });
d3.select('#scrub').on('input', function(){ pause(); setYear(+this.value); });
d3.select('#smooth').on('change', function(){
  const k = +this.value;
  view = rolling(data, k);
  resize();
  buildStripes();
});

// Load data
d3.csv(CSV_URL).then(rows => {
  raw = rows.filter(r => r.Source === 'GCAG').map(r => ({
    Source: r.Source,
    Year: +r.Year,
    Mean: +r.Mean
  }));
  data = raw.sort((a,b)=>d3.ascending(a.Year,b.Year));
  view = data.slice();
  years = view.map(d=>d.Year);

  // set scrub range
  d3.select('#scrub').attr('min', years[0]).attr('max', years[years.length-1]).property('value', years[0]);
  d3.select('#yearLabel').text(years[0]);
  currentYear = years[0];

  resize();
  buildStripes();

  // mouse move on chart
  svg.on('mousemove', (event)=>{
    const xm = d3.pointer(event, svg.node())[0] - M.left;
    const year = Math.round(x.invert(xm));
    if(year >= years[0] && year <= years[years.length-1]){
      d3.select('#scrub').property('value', year);
      currentYear = year;
      setYear(currentYear);
    }
  }).on('mouseleave', hideFocus);
});
