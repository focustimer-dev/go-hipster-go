// Android Lab: reversible, pre-rasterized, geographically anchored Cahill transition.
// Geographically exact endpoints; in-between states are eased octahedral leaves.
// Uses a temporary 2D canvas, no per-frame reprojecting of 183 countries.
const labCahillMotion=(()=>{
 const PAL={paper:'#dfb045',ocean:'#103135',selected:'#a83223',ink:'#103135'};
 const W=960,H=505,TOP=65;
 const FRAME_PIXELS=460;
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{const t=clamp(v);return t*t*(3-2*t)};
 const smooth=(a,b,t)=>ease((t-a)/(b-a));
 let saved=null;
 const selectionKey=selected=>Array.from(selected).sort().join('|');
 function keyesPicture(svg,selected,pixels){
  const target=document.createElement('canvas');target.width=target.height=pixels;
  const ctx=target.getContext('2d',{alpha:false});
  ctx.fillStyle=PAL.paper;ctx.fillRect(0,0,pixels,pixels);
  ctx.setTransform(pixels/W,0,0,pixels/H,0,-TOP*pixels/H);
  const world=svg.querySelector('.lab-cahill-geography');
  if(!world)return target;
  const put=(node,{fill,stroke,lineWidth,alpha=1}={})=>{
   const d=node?.getAttribute('d');if(!d)return;
   const path=new Path2D(d);
   ctx.globalAlpha=alpha;
   if(fill){ctx.fillStyle=fill;ctx.fill(path)}
   if(stroke){ctx.lineWidth=lineWidth||.65;ctx.strokeStyle=stroke;ctx.stroke(path)}
  };
  put(world.querySelector('.lab-cahill-ocean'),{fill:PAL.ocean,stroke:PAL.ocean,lineWidth:1});
  put(world.querySelector('.lab-cahill-graticule'),{stroke:PAL.paper,lineWidth:.55,alpha:.21});
  for(const item of Array.from(world.children).filter(el=>el.tagName.toLowerCase()==='circle')){
   const cx=+item.getAttribute('cx'),cy=+item.getAttribute('cy'),r=+item.getAttribute('r');
   if(!Number.isFinite(cx+cy+r)||r<=0)continue;
   ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
   const stroke=item.getAttribute('stroke');
   if(item.getAttribute('fill')&&item.getAttribute('fill')!=='none'){
    ctx.fillStyle=item.getAttribute('fill');ctx.fill();
   }
   if(stroke&&stroke!=='none'){
    ctx.lineWidth=+item.getAttribute('stroke-width')||.7;
    ctx.strokeStyle=stroke;ctx.globalAlpha=+(item.getAttribute('stroke-opacity')||1);ctx.stroke();
   }
  }
  ctx.globalAlpha=1;
  for(const region of world.querySelectorAll('[data-cahill-region]')){
   const id=region.dataset.cahillRegion;
   put(region,{fill:selected.has(id)?PAL.selected:PAL.paper,stroke:PAL.ink,lineWidth:.65});
  }
  // Decorative nautical ink is part of the printed chart, but invisible
  // route hit targets and interactive markers never enter animation frames.
  for(const path of world.querySelectorAll('.lab-cahill-routes path')){
   const d=path.getAttribute('d'),stroke=path.getAttribute('stroke');
   if(!d||!stroke||stroke==='none')continue;
   ctx.save();ctx.globalAlpha=+(path.getAttribute('stroke-opacity')||1);
   ctx.strokeStyle=stroke;ctx.lineWidth=+(path.getAttribute('stroke-width')||.75);
   const dash=(path.getAttribute('stroke-dasharray')||'').split(/[ ,]+/).map(Number)
     .filter(n=>Number.isFinite(n)&&n>0);
   if(dash.length)ctx.setLineDash(dash);
   ctx.stroke(new Path2D(d));ctx.restore();
  }
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
  return target;
 }
 function roundPicture(geojson,selected,mode,pixels){
  const target=document.createElement('canvas');target.width=target.height=pixels;
  const prepared=labAtlasMorphVectors.prepare(geojson,[10,15]);
  const fits={robinson:labAtlasMorphVectors.estimatedFit('robinson'),
              globe:labAtlasMorphVectors.estimatedFit('globe'),width:pixels,height:pixels};
  labAtlasMorphVectors.paint(target,prepared,mode==='globe'?1:0,selected,fits);
  const ctx=target.getContext('2d');
  ctx.globalCompositeOperation='destination-over';ctx.fillStyle=PAL.paper;
  ctx.fillRect(0,0,pixels,pixels);ctx.globalCompositeOperation='source-over';
  return target;
 }
 function prepare(svg,geojson,selected,pixels=FRAME_PIXELS){
  const key=selectionKey(selected)+'@'+pixels;
  if(saved?.key===key&&saved.svg===svg&&saved.geojson===geojson)return saved;
  const images={keyes:keyesPicture(svg,selected,pixels),
   globe:roundPicture(geojson,selected,'globe',pixels),
   robinson:roundPicture(geojson,selected,'robinson',pixels)};
  saved={key,svg,geojson,pixels,images};return saved;
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
  ctx.fillStyle=PAL.paper;ctx.fillRect(0,0,size,size);
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
  const veil=document.createElement('div');veil.className='lab-cahill-motion';
  veil.setAttribute('aria-hidden','true');veil.dataset.from=from;veil.dataset.to=to;
  veil.style.cssText='position:absolute;inset:0;z-index:30;overflow:hidden;background:#dfb045;pointer-events:none;';
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
   complete(state,onRemoved=>{
    if(!veil.isConnected)return;
    // Leave an opaque final vector pose until its destination has rendered.
    veil.style.transition='opacity 90ms ease-out';veil.style.opacity='0';
    setTimeout(()=>{
     veil.remove();host.style.pointerEvents=state.pointerEvents;
     if(typeof onRemoved==='function')onRemoved();
    },100);
   });
   state.landingMs=performance.now()-landingStart;
  };
  const easing=t=>{const x=clamp(t);return x*x*(3-2*x)};
  const step=now=>{
   if(state.done)return;
   if(!state.startedAt)state.startedAt=now;
   state.lastFrameAt=performance.now();
   // Keep essential fold poses visible even when a busy WebView drops rAFs.
   // Wall-clock progress alone skips most of the octahedral opening after a
   // long GPU pause; cap frame-to-frame travel without slowing normal 60fps.
   const wall=clamp((now-state.startedAt)/DURATION_MS);
   const x=Math.min(wall,(state.progress||0)+.095);
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
      now-submittedAt>4800)finish();
   else setTimeout(watchdog,300);
  };
  setTimeout(watchdog,1600);
  return state;
 }
 return {prepare,clear,scheduleWarm,draw,run,renderFramesTo};
})();
