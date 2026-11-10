// Android Lab: offline, geographically accurate Cahill–Keyes M-map surface.
// This renderer is separate from MapLibre because MapLibre has no octahedral
// projection. Coordinates/cuts come from d3-geo-polygon, not a hand-drawn mask.
// Palette, region selection and discovery routes are shared with other views.
let labCahill=null;
function labCahillInit(host,geography,routes,legacy){
 const d3=window.labCahillD3;
 if(!d3?.geoCahillKeyes||!d3?.geoPath)return false;
 const NS='http://www.w3.org/2000/svg',W=960,H=505,TOP=65;
 // Keep geographic scale intact; crop the unused margins instead of
 // stretching the M-shaped world to fill its phone viewport.
 const PROJECTION_HEIGHT=540;
 const make=(tag,attrs={})=>{
  const el=doc.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));
  return el;
 };
 // Keep the detailed SVG's viewport fixed. Moving the SVG viewBox on
 // every touch frame repaints all countries, graticules and route shapes.
 // Clip a composited, transformed layer instead. Hit testing stays native:
 // transformed country paths are still the real SVG DOM.
 const viewport=doc.createElement('div');
 viewport.className='lab-cahill-camera-viewport';
 viewport.style.cssText='position:absolute;inset:0;overflow:hidden;pointer-events:none;contain:paint;display:none;';
 host.appendChild(viewport);
 const svg=make('svg',{viewBox:`0 ${TOP} ${W} ${H}`,'aria-label':'Cahill–Keyes world map: select a country or zoom to explore','role':'group'});
 svg.id='labAtlasCahill';svg.classList.add('lab-cahill-overlay');
 svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;opacity:0;display:none;transform-origin:0 0;transform-box:border-box;will-change:transform;';
 viewport.appendChild(svg);
 const projection=d3.geoCahillKeyes();
 projection.fitExtent([[22,20],[W-22,PROJECTION_HEIGHT-24]],{type:'Sphere'});
 const path=d3.geoPath(projection);
 const world=make('g',{'class':'lab-cahill-geography'});
 svg.appendChild(world);
 const ocean=make('path',{'class':'lab-cahill-ocean',d:path({type:'Sphere'})||'',
  fill:'#103135','stroke':'#103135','stroke-width':'1'});
 world.appendChild(ocean);
 const grid=make('path',{'class':'lab-cahill-graticule',d:path(d3.geoGraticule10())||'',
  fill:'none',stroke:'#dfb045','stroke-opacity':'.21','stroke-width':'.55',
  'pointer-events':'none'});
 world.appendChild(grid);
 const countries=make('g',{'class':'lab-cahill-countries'});world.appendChild(countries);
 const regions=[],usFills=[];
 let pendingTap=null,lastTouchUp=-Infinity;
 const cancelTap=()=>{if(pendingTap){clearTimeout(pendingTap);pendingTap=null}};
 // Android synthesizes click after pointerup, often after the map has moved.
 // The completed touch itself chooses the country; the later click is ignored.
 const activateOnTap=(fn,event)=>{
  if(labAtlasMode!=='cahill-keyes'||performance.now()<blockedClicks||dragged)return;
  if(event?.type==='click'&&
     (event.sourceCapabilities?.firesTouchEvents||
      (event.detail>0&&performance.now()-lastTouchUp<1200)))return;
  fn(); // Mouse, keyboard, and explicitly scripted clicks are immediate.
 };
 // D3 interprets two reversed polygon rings as painting the planet's
 // complement: they obliterated the ocean and concealed several continents.
 // Correct just those rings for this renderer, never mutate canonical GeoJSON.
 let rewoundPolygons=0;
 const ringArea=ring=>ring.reduce((sum,p,i)=>{
  const q=ring[(i+1)%ring.length];return sum+p[0]*q[1]-q[0]*p[1];
 },0);
 const correctWinding=feature=>{
  const multi=feature.geometry.type==='MultiPolygon';
  const source=multi?feature.geometry.coordinates:[feature.geometry.coordinates];
  let changed=false;
  const polys=source.map(rings=>{
   if(ringArea(rings[0])<=0)return rings;
   changed=true;rewoundPolygons++;
   return rings.map(r=>r.slice().reverse());
  });
  return changed?{...feature,geometry:{...feature.geometry,
   coordinates:multi?polys:polys[0]}}:feature;
 };
 const antarcticFeatures=[];
 for(const sourceFeature of geography.features){
  const feature=correctWinding(sourceFeature);
  if(feature.properties?.region==='antarctica'){
   antarcticFeatures.push(feature);continue;
  }
  const id=feature.properties?.region;
  const d=path(feature);
  if(!id||!d)continue;
  const country=make('path',{'d':d,'data-cahill-region':id,
   ...(feature.properties?.country==='USA'?{'data-cahill-us-state':'true'}:{}),
   ...(feature.properties?.country==='MEX'?{'data-cahill-mexico':'true'}:{}),
   fill:'#dfb045',stroke:['USA','MEX'].includes(feature.properties?.country)?'none':'#103135',
   'stroke-linejoin':'round'});
  const region=crateRegions.find(x=>x.id===id);
  const label=region?.label||region?.name||id.replace(/-/g,' ');
  country.appendChild(make('title')).textContent=label;
  // SVG paths are painted geography, not focusable rectangular WebView controls.
  // Keyboard/screen-reader region controls already exist under Choose by Name.
  regions.push({id,feature,node:country});
  countries.appendChild(country);
 }
 // Paint each joined listening region once. Transparent state paths above
 // these fills keep the original touch geometry without antialias seams.
 for(const sourceFeature of labUSRegionFills){
  const d=path(correctWinding(sourceFeature));
  if(!d)continue;
  const id=sourceFeature.properties.region;
  const node=make('path',{d,'data-cahill-region':id,'data-cahill-us-fill':'true'});
  usFills.push({id,node});
  countries.insertBefore(node,countries.firstChild);
 }
 // One non-interactive path draws the U.S. regions and Mexico's coast.
 const boundaryPath=path(labAtlasBoundaryLines);
 if(boundaryPath)countries.appendChild(make('path',{
  d:boundaryPath,class:'lab-us-region-boundaries',
  fill:'none',stroke:'#103135',
  'stroke-linejoin':'round','pointer-events':'none'
 }));
 // The D3 Cahill–Keyes projection lacks the reunited Antarctic extension.
 // Reconstruct that missing landmass from canonical coordinates as an
 // equal-area South Polar panel joined below the M's South Atlantic.
 // Unlike a decorative inset, each Antarctic coastline is true GeoJSON.
 // Calibrated at 60°S: a 3° meridian step is 6.85px here versus
 // 6.90px in the surrounding Cahill–Keyes octant (<1% difference).
 const polar={cx:475,cy:477,scale:136,cutLatitude:-58};
 const polarPoint=([lon,lat])=>{
  const colatitude=(90+Math.max(-90,Math.min(0,lat)))*Math.PI/180;
  const radius=2*polar.scale*Math.sin(colatitude/2);
  const angle=lon*Math.PI/180;
  return [polar.cx+radius*Math.sin(angle),polar.cy-radius*Math.cos(angle)];
 };
 const polarRadius=2*polar.scale*Math.sin((90+polar.cutLatitude)*Math.PI/360);
 const antarcticOcean=make('circle',{id:'labCahillAntarcticOcean',
  cx:polar.cx,cy:polar.cy,r:polarRadius,fill:'#103135',
  'pointer-events':'none'});
 world.appendChild(antarcticOcean);
 world.appendChild(make('circle',{cx:polar.cx,cy:polar.cy,r:polarRadius*.62,
  fill:'none',stroke:'#dfb045','stroke-opacity':'.18','stroke-width':'.65',
  'pointer-events':'none'}));
 const polarPath=feature=>{
  const polys=feature.geometry.type==='MultiPolygon'?
   feature.geometry.coordinates:[feature.geometry.coordinates];
  return polys.map(rings=>rings.map(ring=>ring.map((point,i)=>{
   const [x,y]=polarPoint(point);
   return (i?'L':'M')+x.toFixed(3)+','+y.toFixed(3);
  }).join('')+'Z').join('')).join('');
 };
 for(const feature of antarcticFeatures){
  const id='antarctica',d=polarPath(feature);
  if(!d)continue;
  const country=make('path',{id:'labCahillAntarctica',
   'data-cahill-region':id,d,fill:'#dfb045',stroke:'#103135',
   'stroke-linejoin':'round'});
  country.appendChild(make('title')).textContent='Antarctica';
  // SVG paths are painted geography, not focusable rectangular WebView controls.
  // Keyboard/screen-reader region controls already exist under Choose by Name.
  world.appendChild(country);
  regions.push({id,feature,node:country,
   bounds:[[polar.cx-polarRadius,polar.cy-polarRadius],
    [polar.cx+polarRadius,polar.cy+polarRadius]]});
 }
 // Reproject the same geographic waypoints without connecting detached lobes.
 // Dashed lane ink never catches taps; close-up targets are separate.
 const lanes=labCahillInstallLanes({make,world,routes,projection,legacy,
  markers:labSecretMarkers,activateOnTap,
  canActivate:()=>labAtlasMode==='cahill-keyes'&&
   performance.now()>=blockedClicks&&!dragged
 });
 const bounds={x:0,y:TOP,w:W,h:H};let zoom=1,blockedClicks=0,lastTap=0;
 const cameraListeners=new Set();
 // Coalesce pointer samples into one GPU/compositor transform per display
 // frame, not one complete SVG re-raster per event.
 let cameraFrame=0,cameraDirty=false,activeTouchAction='',routeZoomActive=null;
 const paintCamera=()=>{
  cameraFrame=0;if(!cameraDirty)return;cameraDirty=false;
  const r=viewport.getBoundingClientRect();
  const tx=-bounds.x/W*zoom*r.width;
  const ty=(TOP-bounds.y)/H*zoom*r.height;
  svg.style.transform=`translate3d(${tx.toFixed(3)}px,${ty.toFixed(3)}px,0) scale(${zoom.toFixed(6)})`;
  const action=zoom>1.01?'none':'pan-y';
  if(activeTouchAction!==action){activeTouchAction=action;svg.style.touchAction=action}
  const routesVisible=zoom>=1.55;
  if(routeZoomActive!==routesVisible){routeZoomActive=routesVisible;lanes.setZoom(zoom)}
  for(const listener of cameraListeners)listener({...bounds,zoom});
 };
 // A responsive viewport or projection switch never reuses old pixel offsets.
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{
  // Globe/Robinson morphs resize the shared host dozens of times. Never
  // compete with their geographic frames when Keyes is hidden/transitioning.
  if(labAtlasMode!=='cahill-keyes'||labAtlasMorph)return;
  cameraDirty=true;if(!cameraFrame)cameraFrame=requestAnimationFrame(paintCamera);
 }).observe(viewport);
 const pointers=new Map();let previousPinch=null,dragged=false;
 let pinchMidpoint=null;
 const limit=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 const refresh=()=>{
  bounds.w=W/zoom;bounds.h=H/zoom;
  bounds.x=limit(bounds.x,0,W-bounds.w);bounds.y=limit(bounds.y,TOP,TOP+H-bounds.h);
  cameraDirty=true;
  if(!cameraFrame)cameraFrame=requestAnimationFrame(paintCamera);
  // Presentation and route visibility update once in paintCamera().
 };
 const screenToWorld=(cx,cy)=>{
  const r=viewport.getBoundingClientRect();
  return [bounds.x+(cx-r.left)/Math.max(1,r.width)*bounds.w,
   bounds.y+(cy-r.top)/Math.max(1,r.height)*bounds.h];
 };
 const zoomAt=(factor,cx,cy)=>{
  const before=screenToWorld(cx,cy),next=limit(zoom*factor,1,5.5);
  if(Math.abs(next-zoom)<.00001)return;
  zoom=next;
  const r=viewport.getBoundingClientRect();bounds.w=W/zoom;bounds.h=H/zoom;
  bounds.x=before[0]-(cx-r.left)/Math.max(1,r.width)*bounds.w;
  bounds.y=before[1]-(cy-r.top)/Math.max(1,r.height)*bounds.h;
  refresh();
 };
 // MapLibre eases double-tap zoom rather than jumping a full level.
 // Keep direct pinch and drag strictly finger-anchored; only discrete tap
 // zoom is tweened, and a fresh gesture cancels it immediately.
 let zoomTweenFrame=0;
 const cancelZoomTween=()=>{
  if(zoomTweenFrame)cancelAnimationFrame(zoomTweenFrame);
  zoomTweenFrame=0;
 };
 const animateZoomAt=(factor,cx,cy)=>{
  cancelZoomTween();
  const start=zoom,target=limit(start*factor,1,5.5);
  if(Math.abs(target-start)<.00001)return;
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
   zoomAt(factor,cx,cy);return;
  }
  const [anchorX,anchorY]=screenToWorld(cx,cy);
  const r=viewport.getBoundingClientRect();
  const fx=(cx-r.left)/Math.max(1,r.width),fy=(cy-r.top)/Math.max(1,r.height);
  let began=null;
  const step=now=>{
   if(began===null)began=now;
   const t=limit((now-began)/220,0,1),e=1-Math.pow(1-t,3);
   zoom=start+(target-start)*e;
   bounds.w=W/zoom;bounds.h=H/zoom;
   bounds.x=anchorX-fx*bounds.w;
   bounds.y=anchorY-fy*bounds.h;
   refresh();
   if(t<1)zoomTweenFrame=requestAnimationFrame(step);
   else zoomTweenFrame=0;
  };
  zoomTweenFrame=requestAnimationFrame(step);
 };
 const reset=()=>{cancelZoomTween();zoom=1;bounds.x=0;bounds.y=TOP;refresh()};
 // Selecting distant regions must expand the same camera smoothly, just as
 // MapLibre fitBounds does. Keep geographic center and zoom coupled on every
 // frame so a new stamp never teleports the viewport to its wider bounds.
 const animateCameraFit=(targetZoom,targetCenterX,targetCenterY)=>{
  cancelZoomTween();
  const finalZoom=limit(targetZoom,1,5.5);
  const cx=limit(targetCenterX,W/(2*finalZoom),W-W/(2*finalZoom));
  const cy=limit(targetCenterY,TOP+H/(2*finalZoom),TOP+H-H/(2*finalZoom));
  const startZoom=zoom,startX=bounds.x+bounds.w/2,startY=bounds.y+bounds.h/2;
  const apply=(value,zx,zy)=>{
   zoom=value;bounds.w=W/zoom;bounds.h=H/zoom;
   bounds.x=zx-bounds.w/2;bounds.y=zy-bounds.h/2;refresh();
  };
  const changed=Math.abs(Math.log(finalZoom/startZoom))>0.001||
   Math.hypot(cx-startX,cy-startY)>.3;
  if(!changed)return;
  // During a projection morph or with reduced motion, don't animate an
  // invisible map. The user-initiated selection path gets the ease.
  if(labAtlasMode!=='cahill-keyes'||labAtlasMorph||
     window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
   apply(finalZoom,cx,cy);return;
  }
  const logA=Math.log(startZoom),logB=Math.log(finalZoom);
  const distance=Math.hypot((cx-startX)/W,(cy-startY)/H);
  const duration=limit(300+120*Math.abs(logB-logA)+110*distance,300,520);
  let started=null;
  const step=now=>{
   if(started===null)started=now;
   const t=limit((now-started)/duration,0,1);
   const eased=t*t*(3-2*t);
   apply(Math.exp(logA+(logB-logA)*eased),
    startX+(cx-startX)*eased,startY+(cy-startY)*eased);
   if(t<1)zoomTweenFrame=requestAnimationFrame(step);
   else{zoomTweenFrame=0;apply(finalZoom,cx,cy)}
  };
  zoomTweenFrame=requestAnimationFrame(step);
 };
 const zoomBounds=([x0,y0],[x1,y1])=>{
  const rect=viewport.getBoundingClientRect();
  if(!rect.width||!rect.height)return reset();
  const dx=Math.max(14,x1-x0),dy=Math.max(14,y1-y0);
  const s=limit(Math.min(W/(dx*1.28),H/(dy*1.28)),1,5.5);
  animateCameraFit(s,(x0+x1)/2,(y0+y1)/2);
 };
 svg.addEventListener('wheel',event=>{
  if(labAtlasMode!=='cahill-keyes')return;
  event.preventDefault();cancelZoomTween();zoomAt(Math.exp(-event.deltaY*.002),event.clientX,event.clientY);
 },{passive:false});
 svg.addEventListener('dblclick',event=>{
  if(labAtlasMode!=='cahill-keyes')return;
  event.preventDefault();
  // The second touch pointerup already executed this zoom; suppress the
  // later synthetic dblclick so it cannot zoom twice or disturb the target.
  if(performance.now()-lastTouchUp<450)return;
  blockedClicks=performance.now()+280;
  animateZoomAt(zoom>3?.5:1.8,event.clientX,event.clientY);
 });
 svg.addEventListener('pointerdown',event=>{
  if(labAtlasMode!=='cahill-keyes')return;
  cancelZoomTween();
  const first=pointers.size===0;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,
   startX:event.clientX,startY:event.clientY,startTarget:event.target});
  if(first)dragged=false;
  else{dragged=true;cancelTap()} // A second finger means pinch, never tap.
  // Do not capture pointerdown: capturing immediately retargets the
  // eventual click to the SVG root, breaking country and route hit targets.
  // Touch-action:none already prevents native page gestures when zoomed.
  previousPinch=null;pinchMidpoint=null;
 });
 svg.addEventListener('pointermove',event=>{
  if(!pointers.has(event.pointerId)||labAtlasMode!=='cahill-keyes')return;
  const previous=pointers.get(event.pointerId);
  const dx=event.clientX-previous.x,dy=event.clientY-previous.y;
  const moved=Math.hypot(event.clientX-previous.startX,event.clientY-previous.startY);
  pointers.set(event.pointerId,{...previous,x:event.clientX,y:event.clientY});
  if(moved>9){
   dragged=true;cancelTap();blockedClicks=performance.now()+180;
   if(zoom>1.01){
    try{if(!svg.hasPointerCapture?.(event.pointerId))svg.setPointerCapture(event.pointerId)}catch(e){}
    event.preventDefault();
   }
  }
  if(pointers.size===2){
   const [p,q]=[...pointers.values()];
   const distance=Math.hypot(p.x-q.x,p.y-q.y);
   const mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
   if(previousPinch&&distance>5){
    // Track midpoint translation as well as scale: otherwise a moving
    // two-finger gesture jumps when its center shifts across the screen.
    if(pinchMidpoint){
     const r=viewport.getBoundingClientRect();
     bounds.x-=(mx-pinchMidpoint.x)/Math.max(1,r.width)*bounds.w;
     bounds.y-=(my-pinchMidpoint.y)/Math.max(1,r.height)*bounds.h;
     refresh();
    }
    zoomAt(distance/previousPinch,mx,my);
   }
   previousPinch=distance;pinchMidpoint={x:mx,y:my};dragged=true;cancelTap();
   blockedClicks=performance.now()+300;return;
  }
  // IMPORTANT: browser touch pointers report sub-pixel movement while a
  // finger rests on the glass. The old path panned and blocked ALL clicks
  // on those tiny movements, even below our 7px drag threshold.
  if(!dragged||zoom<=1.01)return;
  const r=viewport.getBoundingClientRect();
  bounds.x-=dx/Math.max(1,r.width)*bounds.w;
  bounds.y-=dy/Math.max(1,r.height)*bounds.h;
  refresh();blockedClicks=performance.now()+150;
 });
 // Android WebView SVG clicks can be focus/selection events instead of
 // geographic taps. Handle the completed finger directly.
 const touchDebug={landTaps:0,routeTaps:0,misses:0,zoomAssists:0,last:null};
 const resolveTouchTarget=(cx,cy,original)=>{
  const candidates=[doc.elementFromPoint(cx,cy),original];
  for(const node of candidates){
   const pin=node?.closest?.('[data-cahill-discovery]');
   if(pin&&zoom>=1.55)return {type:'route',id:pin.dataset.cahillDiscovery};
   const line=node?.closest?.('[data-cahill-route-target]');
   if(line&&zoom>=1.55)return {type:'route',id:line.dataset.cahillRouteTarget};
   const land=node?.closest?.('[data-cahill-region]');
   if(land)return {type:'land',id:land.getAttribute('data-cahill-region')};
  }
  const small=nearbySmallRegion(cx,cy);
  if(small)return small;
  const region=nearbyRegion(cx,cy);
  return region?{type:'land',id:region}:null;
 };
 const endPointer=event=>{
  const pointer=pointers.get(event.pointerId);
  if(!pointer)return;
  pointers.delete(event.pointerId);previousPinch=null;pinchMidpoint=null;
  const now=performance.now();
  if(dragged){cancelTap();blockedClicks=now+180;return}
  if(event.type!=='pointerup'||event.pointerType!=='touch')return;
  lastTouchUp=now;
  if(now-lastTap<315){
   cancelTap();blockedClicks=now+320;lastTap=0;
   animateZoomAt(zoom>3?.5:1.8,event.clientX,event.clientY);
   return;
  }
  lastTap=now;
  if(now<blockedClicks)return;
  const choice=resolveTouchTarget(event.clientX,event.clientY,pointer.startTarget);
  if(!choice){touchDebug.misses++;return}
  cancelTap();
  pendingTap=setTimeout(()=>{
   pendingTap=null;
   if(labAtlasMode!=='cahill-keyes'||performance.now()<blockedClicks)return;
   touchDebug.last=choice;
   if(choice.type==='route'){touchDebug.routeTaps++;lanes.open(choice.id)}
   else if(choice.type==='zoom'){
    touchDebug.zoomAssists++;
    if(zoom<5.45)animateZoomAt(1.65,event.clientX,event.clientY);
   }else if(validCrateRegions.has(choice.id)){
    touchDebug.landTaps++;atlasFocus=null;atlasUserNavigated=true;
    toggleCrateRegion(choice.id);labCahillSync();
   }
  },315);
 };
 svg.addEventListener('pointerup',endPointer);
 svg.addEventListener('pointercancel',endPointer);
 // Buffered island hit test. Sample only on missed taps, in CSS pixels;
 // never make broad SVG overlays that can steal a neighboring country's tap.
 const nearbySmallRegion=(cx,cy)=>{
  const frame=viewport.getBoundingClientRect();
  if(cx<frame.left||cx>frame.right||cy<frame.top||cy>frame.bottom)return null;
  const candidates=new Set();
  for(const radius of [8,16]){
   for(let i=0;i<16;i++){
    const angle=i*Math.PI/8,x=cx+radius*Math.cos(angle),y=cy+radius*Math.sin(angle);
    if(x<frame.left||x>frame.right||y<frame.top||y>frame.bottom)continue;
    const id=doc.elementFromPoint(x,y)?.closest?.('[data-cahill-region]')?.getAttribute('data-cahill-region');
    if(id)candidates.add(id);
   }
  }
  return labAtlasSmallHit(candidates);
 };
 // A few projected islands/slivers are narrower than a finger on phones.
 // Forgive near-coast taps ONLY if exactly one region appears in a small
 // screen-space halo; if two countries compete, do not guess.
 const nearbyRegion=(cx,cy)=>{
  const frame=viewport.getBoundingClientRect();
  if(cx<frame.left||cx>frame.right||cy<frame.top||cy>frame.bottom)return null;
  for(const radius of [4,8,12]){
   const candidates=new Set();
   for(let i=0;i<12;i++){
    const a=i*Math.PI/6,x=cx+radius*Math.cos(a),y=cy+radius*Math.sin(a);
    if(x<frame.left||x>frame.right||y<frame.top||y>frame.bottom)continue;
    const land=doc.elementFromPoint(x,y)?.closest?.('[data-cahill-region]');
    if(land)candidates.add(land.getAttribute('data-cahill-region'));
   }
   if(candidates.size>1)return null; // Ambiguous border: do not mis-stamp.
   if(candidates.size===1)return [...candidates][0];
  }
  return null;
 };
 svg.addEventListener('click',event=>{
  if(labAtlasMode!=='cahill-keyes'||dragged||performance.now()<blockedClicks)return;
  // Delegate mouse/keyboard clicks at map level instead of registering
  // 183+ clickable SVG polygons that Android WebView outlines as boxes.
  if(event.target.closest?.('[data-cahill-discovery],[data-cahill-route-target]'))return;
  const direct=event.target.closest?.('[data-cahill-region]');
  const fallback=direct?null:nearbySmallRegion(event.clientX,event.clientY);
  const id=!direct&&!fallback?nearbyRegion(event.clientX,event.clientY):null;
  const choice=direct?{type:'land',id:direct.getAttribute('data-cahill-region')}:
   fallback||(id?{type:'land',id}:null);
  if(!choice)return;
  event.stopPropagation();
  activateOnTap(()=>{
   atlasFocus=null;atlasUserNavigated=true;
   if(choice.type==='zoom'){if(zoom<5.45)animateZoomAt(1.65,event.clientX,event.clientY);return}
   if(validCrateRegions.has(choice.id)){toggleCrateRegion(choice.id);labCahillSync()}
  },event);
 });
 // Navigator drives only this camera, not the region stamping event pipeline.
 const camera={
  snapshot:()=>({...bounds,zoom}),
  centerAt:(x,y)=>{
   cancelZoomTween();
   bounds.x=x-bounds.w/2;bounds.y=y-bounds.h/2;
   atlasFocus=null;atlasUserNavigated=true;refresh();
  },
  panBy:(dx,dy)=>{
   cancelZoomTween();
   bounds.x+=dx;bounds.y+=dy;
   atlasFocus=null;atlasUserNavigated=true;refresh();
  },
  subscribe:fn=>{cameraListeners.add(fn);return ()=>cameraListeners.delete(fn)}
 };
 const navigator=labCahillInstallNavigator({host,camera});
 const appliedRegionState=new WeakMap();
 const sync=()=>{
  // The 183 country paths are static. Only touch SVG attributes for
  // regions whose selection actually changed, rather than invalidating
  // the entire paint layer on every focus/selection refresh.
  for(const {id,node}of [...regions,...usFills]){
   const selected=crateSelected.has(id);
   if(appliedRegionState.get(node)===selected)continue;
   node.setAttribute('fill',selected?'#a83223':'#dfb045');
   node.setAttribute('aria-pressed',String(selected));
   appliedRegionState.set(node,selected);
  }
  labCahillMotion.scheduleWarm(svg,labJoinedGlobeGeography,crateSelected);
 };
 const focus=(view)=>{
  if(view===null||(!crateSelected.size&&!atlasFocus))
   return animateCameraFit(1,W/2,TOP+H/2);
  let selected=crateSelected;
  if(atlasFocus)selected=new Set(crateRegions.filter(r=>r.continent===atlasFocus).map(r=>r.id));
  // Project each region's geographic bounds at most once. Repeated
  // zoom-to-selection previously ran D3 projection for the same coastline.
  const boxes=regions.filter(r=>selected.has(r.id)).map(r=>r.bounds||(r.bounds=path.bounds(r.feature)))
   .filter(b=>b.flat().every(Number.isFinite));
  if(!boxes.length)return reset();
  zoomBounds([Math.min(...boxes.map(b=>b[0][0])),Math.min(...boxes.map(b=>b[0][1]))],
   [Math.max(...boxes.map(b=>b[1][0])),Math.max(...boxes.map(b=>b[1][1]))]);
 };
 refresh();sync();
 labCahill={svg,focus,reset,sync,camera,navigator,projection,regions,rewoundPolygons,antarcticPanel:polar,
  routeStats:lanes.stats,discoveryCount:lanes.pinCount,touchDebug,
  // Read-only Lab QA probe of the cached geographic ink; never mutates the map.
  polarInkSample:()=>{
   const cached=labCahillMotion.prepare(svg,geography,crateSelected);
   const pixels=cached.pixels,ctx=cached.images.keyes.getContext('2d');
   const x=Math.round(543/960*pixels),y=Math.round((477-65)/505*pixels);
   return [...ctx.getImageData(x,y,1,1).data];
  },ready:true};
 window.labCahillMap=labCahill;
 return true;
}
function labCahillSync(){labCahill?.sync()}
function labCahillFocus(view){labCahill?.focus(view)}
