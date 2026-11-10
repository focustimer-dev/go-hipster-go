// Android Lab: reversible, pre-rasterized, geographically anchored Cahill transition.
// Geographically exact endpoints; in-between states are eased octahedral leaves.
// Uses a temporary 2D canvas, no per-frame reprojecting of 183 countries.
const labCahillMotion=(()=>{
 const PAL=new Proxy({paper:'#dfb045',ocean:'#103135',selected:'#a83223',ink:'#103135',backdrop:'#dfb045',graticule:'#dfb045',graticuleOpacity:.21},
  {get(base,key){return window.GHGAtlasPaintColors?.()?.[key]||base[key]}});
 const W=960,H=505,TOP=65;
 const FRAME_PIXELS=460;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{const t=clamp(v);return t*t*(3-2*t)};
 const smooth=(a,b,t)=>ease((t-a)/(b-a));
 let saved=null;
 // Store actual resting MapLibre camera fits at each flat/globe stop. The
 // paper atlas can then paint its FINAL pose to the same measured silhouette,
 // rather than docking a nominally sized drawing onto the live renderer.
 const landingFits={robinson:null,globe:null};
 // Paths are permanent SVG geography. Re-parsing each country's "d" into a
 // Path2D on every selection/theme refresh is needless allocation. Weak
 // references avoid retaining a superseded SVG after an Atlas rebuild.
 const parsedPaths=new WeakMap();
 function cachedPath(node){
  const d=node?.getAttribute('d');if(!d)return null;
  let hit=parsedPaths.get(node);
  if(!hit||hit.d!==d){
   hit={d,path:new Path2D(d)};
   parsedPaths.set(node,hit);
  }
  return hit.path;
 }
 function rememberLiveFit(mode,width,height,fit){
  if(!landingFits.hasOwnProperty(mode)||!fit?.sampled||width<=0||height<=0||
     ![fit.x,fit.y,fit.sx,fit.sy].every(Number.isFinite))return false;
  const next={width,aspect:height/width,x:fit.x/width,y:fit.y/height,
   sx:fit.sx,sy:fit.sy};
  const old=landingFits[mode];landingFits[mode]=next;
  if(!old||Object.keys(next).some(k=>Math.abs(next[k]-old[k])>.0005))saved=null;
  return true;
 }
 function roundFit(mode,pixels){
  const f=landingFits[mode],expectedAspect=mode==='globe'?1:372/720;
  if(!f||Math.abs(f.aspect-expectedAspect)>.025)return labAtlasMorphVectors.estimatedFit(mode);
  return {x:f.x*pixels,y:f.y*pixels,sx:f.sx,sy:f.sy};
 }
 const selectionKey=selected=>Array.from(selected).sort().join('|');
 function keyesPicture(svg,selected,pixels){
  const target=document.createElement('canvas');target.width=target.height=pixels;
  const ctx=target.getContext('2d',{alpha:false});
  ctx.fillStyle=PAL.backdrop;ctx.fillRect(0,0,pixels,pixels);
  ctx.setTransform(pixels/W,0,0,pixels/H,0,-TOP*pixels/H);
  const world=svg.querySelector('.lab-cahill-geography');
  if(!world)return target;
  const put=(node,{fill,stroke,lineWidth,alpha=1}={})=>{
   const path=cachedPath(node);if(!path)return;
   ctx.globalAlpha=alpha;
   if(fill){ctx.fillStyle=fill;ctx.fill(path)}
   if(stroke){ctx.lineWidth=lineWidth||.65;ctx.strokeStyle=stroke;ctx.stroke(path)}
  };
  // Render the SAME computed ocean fill and saddle/ink outlines as the live
  // Cahill SVG. Bosque previously painted border strokes cream on the tween
  // canvas, then snapped to dark green at the end of the fold.
  const ocean=world.querySelector('.lab-cahill-ocean');
  const oceanInk=ocean?getComputedStyle(ocean):null;
  put(ocean,{fill:oceanInk?.fill||PAL.ocean});
  put(ocean,{stroke:oceanInk?.stroke||PAL.ink,
   lineWidth:parseFloat(oceanInk?.strokeWidth)||1,
   alpha:Number.isFinite(parseFloat(oceanInk?.strokeOpacity))?parseFloat(oceanInk.strokeOpacity):1});
  // Copy the resting Cahill grid's actual theme ink. Using PAL.paper here
  // made Bosque's transition grid green while the live SVG was saddle.
  const grid=world.querySelector('.lab-cahill-graticule');
  const gridInk=grid?getComputedStyle(grid):null;
  put(grid,{stroke:gridInk?.stroke||PAL.graticule,
   lineWidth:parseFloat(gridInk?.strokeWidth)||.55,
   alpha:Number.isFinite(parseFloat(gridInk?.strokeOpacity))?
    parseFloat(gridInk.strokeOpacity):PAL.graticuleOpacity});
  for(const item of Array.from(world.children).filter(el=>el.tagName.toLowerCase()==='circle')){
   const cx=+item.getAttribute('cx'),cy=+item.getAttribute('cy'),r=+item.getAttribute('r');
   if(!Number.isFinite(cx+cy+r)||r<=0)continue;
   // Each polar circle has its own alpha. The preceding low-opacity
   // graticule must not wash out the Antarctic ocean fill.
   ctx.save();ctx.globalAlpha=1;
   ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
   const polarInk=getComputedStyle(item);
   const stroke=polarInk.stroke||item.getAttribute('stroke');
   if(item.getAttribute('fill')&&item.getAttribute('fill')!=='none'){
    ctx.fillStyle=window.GHGAtlasPaintColors?polarInk.fill:item.getAttribute('fill');ctx.fill();
   }
   if(stroke&&stroke!=='none'){
    ctx.lineWidth=parseFloat(polarInk.strokeWidth)||+item.getAttribute('stroke-width')||.7;
    ctx.strokeStyle=stroke;
    ctx.globalAlpha=Number.isFinite(parseFloat(polarInk.strokeOpacity))?
     parseFloat(polarInk.strokeOpacity):+(item.getAttribute('stroke-opacity')||1);
    ctx.stroke();
   }
   ctx.restore();
  }
  ctx.globalAlpha=1;
  for(const region of world.querySelectorAll('[data-cahill-region]')){
   // Only the joined US fills appear in the transition snapshot.
   if(region.hasAttribute('data-cahill-us-state'))continue;
   const ink=getComputedStyle(region);
   const stroke=ink.stroke!=='none'?ink.stroke:null;
   const lineWidth=Math.min(parseFloat(ink.strokeWidth)||.65,.65);
   put(region,{fill:ink.fill|| (selected.has(region.dataset.cahillRegion)?PAL.selected:PAL.paper),
    stroke,lineWidth});
  }
  const usOutline=world.querySelector('.lab-us-region-boundaries');
  if(usOutline){
   const ink=getComputedStyle(usOutline);
   put(usOutline,{stroke:ink.stroke!=='none'?ink.stroke:PAL.ink,
    lineWidth:Math.min(parseFloat(ink.strokeWidth)||.65,.65)});
  }
  // Decorative nautical ink is part of the printed chart, but invisible
  // route hit targets and interactive markers never enter animation frames.
  for(const path of world.querySelectorAll('.lab-cahill-routes path')){
   const d=path.getAttribute('d'),ink=getComputedStyle(path);
   const stroke=ink.stroke||path.getAttribute('stroke');
   if(!d||!stroke||stroke==='none')continue;
   ctx.save();
   // Computed style includes the Bosque/Usiku route accents. Reading only
   // original SVG attributes made the routes flash yellow mid-transition.
   ctx.globalAlpha=Number.isFinite(parseFloat(ink.strokeOpacity))?
     parseFloat(ink.strokeOpacity):+(path.getAttribute('stroke-opacity')||1);
   ctx.strokeStyle=stroke;
   ctx.lineWidth=parseFloat(ink.strokeWidth)||+(path.getAttribute('stroke-width')||.75);
   const dash=(ink.strokeDasharray||path.getAttribute('stroke-dasharray')||'')
     .split(/[ ,]+/).map(parseFloat).filter(n=>Number.isFinite(n)&&n>0);
   if(dash.length)ctx.setLineDash(dash);
   const cached=cachedPath(path);if(cached)ctx.stroke(cached);ctx.restore();
  }
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
  return target;
 }
 function roundPicture(prepared,selected,mode,pixels,roundFits){
  const target=document.createElement('canvas');target.width=target.height=pixels;
  const fits={...roundFits,width:pixels,height:pixels};
  labAtlasMorphVectors.paint(target,prepared,mode==='globe'?1:0,selected,fits);
  const ctx=target.getContext('2d');
  ctx.globalCompositeOperation='destination-over';ctx.fillStyle=PAL.backdrop;
  ctx.fillRect(0,0,pixels,pixels);ctx.globalCompositeOperation='source-over';
  return target;
 }
 function prepare(svg,geojson,selected,pixels=FRAME_PIXELS){
  const key=selectionKey(selected)+'@'+pixels+'@'+(window.GHGAtlasPaintColors?.().theme||'liberi');
  if(saved?.key===key&&saved.svg===svg&&saved.geojson===geojson)return saved;
  // Globe and Robinson share identical canonical vertices: project once,
  // then paint the two cached poses without duplicating preparation work.
  const prepared=labAtlasMorphVectors.sourceData(geojson);
  const fits={globe:roundFit('globe',pixels),robinson:roundFit('robinson',pixels)};
  const images={keyes:keyesPicture(svg,selected,pixels),
   globe:roundPicture(prepared,selected,'globe',pixels,fits),
   robinson:roundPicture(prepared,selected,'robinson',pixels,fits)};
  saved={key,svg,geojson,pixels,images,fits};return saved;
 }
 function clear(){saved=null}
 let idleWarm=null,warmVersion=0;
 function scheduleWarm(svg,geojson,selected){
  if(!svg||!geojson||!selected)return;
  if(idleWarm){clearTimeout(idleWarm);idleWarm=null}
  const snapshot=new Set(selected),version=++warmVersion;
  idleWarm=setTimeout(()=>{
   idleWarm=null;
   const warm=()=>{if(version===warmVersion)prepare(svg,geojson,snapshot)};
   if(typeof requestIdleCallback==='function'){
    requestIdleCallback(warm,{timeout:1400});
   }else warm();
  },150);
 }
 const cells=[];
 for(let row=0;row<2;row++)for(let col=0;col<4;col++){
  const cx=(col+.5)/4,cy=(row+.5)/2;
  cells.push({row,col,cx,cy,serial:col<=1?(3-col)*.04:(col-1)*.04,sign:col<2?-1:1});
 }
 function draw(canvas,assets,origin,p,zoomFrom=null){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
  const size=canvas.width;const t=clamp(p),from=assets.images[origin],keyes=assets.images.keyes;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,size,size);
  ctx.fillStyle=PAL.backdrop;ctx.fillRect(0,0,size,size);
  const cropped=zoomFrom?.zoom>1.03;
  const crop=()=>{
   const q=smooth(.83,1,t),b=zoomFrom;
   const sx=q*b.x/W*size,sy=q*(b.y-TOP)/H*size;
   const sw=size*(1-q*(1-b.w/W)),sh=size*(1-q*(1-b.h/H));
   ctx.drawImage(keyes,sx,sy,sw,sh,0,0,size,size);
  };
  if(t<=.001){ctx.drawImage(from,0,0,size,size);return}
  if(t>=.999){if(cropped)crop();else ctx.drawImage(keyes,0,0,size,size);return}
  if(cropped&&t>=.83){crop();return}
  const open=ease(t);
  // Eight pieces form a reversible geographic fold. Their destinations are
  // true Cahill pixel quadrants; no arbitrary region or vertex reordering.
  for(const cell of cells){
   const {row,col,cx,cy,serial,sign}=cell;
   const fold=ease((t-serial)/(.85-serial));
   const flare=Math.sin(Math.PI*clamp((fold-.73)/.27))*Math.max(0,(1-fold))*.035;
   const spread=origin==='globe'?.30:.78;
   const down=origin==='globe'?.34:.88;
   const x=.5+(cx-.5)*(spread+(1-spread)*fold);
   const y=.5+(cy-.5)*(down+(1-down)*fold);
   const angle=(1-fold)*(origin==='globe'?.26:.10)*sign*(row===0?1:-1);
   const squeeze=origin==='globe'?.47:.89;
   const sx=(squeeze+(1-squeeze)*fold)*(1+flare);
   const sy=(origin==='globe'?.65:.91)+(origin==='globe'?.35:.09)*fold;
   const alpha=smooth(.07,.19,t);
   const tileW=size/4,tileH=size/2;
   ctx.save();ctx.globalAlpha=alpha;
   ctx.translate(x*size,y*size);
   ctx.rotate(angle);ctx.scale(sx,sy);
   // Crop source pixels before transformation; every piece is part of the
   // exact flattened chart and ends in the identical source position.
   ctx.drawImage(keyes,col*tileW,row*tileH,tileW,tileH,
     -tileW/2,-tileH/2,tileW,tileH);
   // A subtle crease is visible only during the fold, never at rest.
   ctx.globalAlpha=(1-fold)*alpha*.13;
   ctx.strokeStyle=PAL.ink;ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(-tileW/2,-tileH/2);ctx.lineTo(-tileW/2,tileH/2);ctx.stroke();
   ctx.restore();
  }
  // The source is a coherent geographic disk, never a second translucent
  // full rectangle. It retreats as the folded facets open outwards.
  ctx.save();
  ctx.globalAlpha=1-smooth(.17,.50,t);
  const sourceScale=origin==='globe'?1-.18*open:1-.08*open;
  ctx.translate(size/2,size/2);ctx.scale(sourceScale,sourceScale);
  ctx.translate(-size/2,-size/2);
  ctx.beginPath();
  ctx.ellipse(size*.5,size*.5,
    size*(origin==='globe'?.455:.48),size*.455,0,0,Math.PI*2);
  ctx.clip();
  ctx.drawImage(from,0,0,size,size);
  ctx.restore();
  // Last 12% resolves the seam interpolation into the exact projected map,
  // with no mismatch or redraw of geography on the landing frame.
  if(t>.80){
   ctx.save();ctx.globalAlpha=smooth(.80,cropped?.83:1,t);
   ctx.drawImage(keyes,0,0,size,size);ctx.restore();
  }
 }
 function renderFramesTo(canvas,assets,origin,p){draw(canvas,assets,origin,p)}
 function run({host,svg,to,from,geojson,selected,cahillView,complete}){
  const state={from,to,queued:null,raf:0,done:false,
   startedAt:0,frames:0,maxPaintMs:0,firstFrame:null,elapsed:0,
   pointerEvents:host.style.pointerEvents};
  const width=host.clientWidth||host.getBoundingClientRect().width||360;
  const startH=host.clientHeight||host.getBoundingClientRect().height||200;
  const destinationH=width*(to==='cahill-keyes'?505/960:to==='globe'?1:372/720);
  const goingToKeyes=to==='cahill-keyes';
  const origin=from==='cahill-keyes'?to:from;
  const crop=from==='cahill-keyes'?cahillView:null;
  const assets=prepare(svg,geojson,selected);
  state.roundFits=assets.fits;state.pixels=assets.pixels;
  const veil=document.createElement('div');veil.className='lab-cahill-motion';
  veil.setAttribute('aria-hidden','true');veil.dataset.from=from;veil.dataset.to=to;
  veil.style.cssText='position:absolute;inset:0;z-index:30;overflow:hidden;background:'+PAL.backdrop+';pointer-events:none;';
  const canvas=document.createElement('canvas');canvas.className='lab-cahill-motion-canvas';
  canvas.width=canvas.height=assets.pixels;
  canvas.style.cssText='display:block;width:100%;height:100%;pointer-events:none;';
  veil.appendChild(canvas);
  host.style.pointerEvents='none';host.style.height=startH+'px';host.style.aspectRatio='auto';
  host.appendChild(veil);
  const DURATION_MS=575;
  const finish=()=>{
   if(state.done)return;state.done=true;
   if(state.raf)cancelAnimationFrame(state.raf);
   const last=goingToKeyes?1:0;draw(canvas,assets,origin,last,crop);
   veil.dataset.progress=String(last);
   host.style.height=destinationH+'px';
   const landingStart=performance.now();
   complete(state,(onRemoved,alignment)=>{
    if(!veil.isConnected)return;
    // Align the terminal cached image while its veil dissolves into the
    // measured live map; avoid a separate size/position adjustment afterward.
    if(alignment&&alignment.residual>.002&&alignment.residual<.15){
     canvas.style.transformOrigin='50% 50%';
     canvas.style.transition='transform 125ms ease-out';
     canvas.style.transform='translate('+alignment.x.toFixed(2)+'px,'+
      alignment.y.toFixed(2)+'px) scale('+alignment.sx.toFixed(5)+','+
      alignment.sy.toFixed(5)+')';
    }
    veil.style.transition='opacity 125ms ease-out';veil.style.opacity='0';
    setTimeout(()=>{
     veil.remove();host.style.pointerEvents=state.pointerEvents;
     if(typeof onRemoved==='function')onRemoved();
    },135);
   });
   state.landingMs=performance.now()-landingStart;
  };
  const easing=t=>{const x=clamp(t);return x*x*(3-2*x)};
  const step=now=>{
   if(state.done)return;
   if(!state.startedAt)state.startedAt=now;
   const frameGap=state.lastFrameAt?Math.max(0,now-state.lastFrameAt):16;
   state.lastFrameAt=now;
   // Preserve fine-grained fold poses at normal FPS. When software WebGL
   // starves the frame queue, allow larger progress steps instead of turning
   // a 575ms animation into a five-second forced slideshow.
   const wall=clamp((now-state.startedAt)/DURATION_MS);
   const adaptiveBudget=Math.min(.4,.095+Math.max(0,frameGap-50)/DURATION_MS);
   // Keep at least eight real tween poses even on a starved renderer; after
   // the seventh paint catch up to wall time rather than stretching to 5s.
   const budget=state.frames<7?Math.min(.125,adaptiveBudget):adaptiveBudget;
   const x=Math.min(wall,(state.progress||0)+budget);
   state.progress=x;
   const travel=easing(x);
   const t=goingToKeyes?travel:1-travel;
   const started=performance.now();draw(canvas,assets,origin,t,crop);
   state.maxPaintMs=Math.max(state.maxPaintMs,performance.now()-started);
   veil.dataset.progress=t.toFixed(3);veil.dataset.frame=String(++state.frames);
   const h=startH+(destinationH-startH)*travel;
   host.style.height=h.toFixed(2)+'px';
   state.elapsed=now-state.startedAt;
   if(state.frames===1)state.firstFrame=now;
   if(x>=1)finish();else state.raf=requestAnimationFrame(step);
  };
  state.raf=requestAnimationFrame(step);
  // The old unconditional 1.6s watchdog jumped straight to the finished
  // map when software WebGL delayed rAF, skipping the last Cahill leaves.
  // Only force a finish when WebView truly stops delivering animation frames.
  const submittedAt=performance.now();
  const watchdog=()=>{
   if(state.done)return;
   const now=performance.now();
   const sinceFrame=now-(state.lastFrameAt||submittedAt);
   if(document.visibilityState==='hidden'||sinceFrame>1500||
      now-submittedAt>3200)finish();
   else setTimeout(watchdog,300);
  };
  setTimeout(watchdog,1600);
  return state;
 }
 return {prepare,clear,rememberLiveFit,scheduleWarm,draw,run,renderFramesTo};
})();
