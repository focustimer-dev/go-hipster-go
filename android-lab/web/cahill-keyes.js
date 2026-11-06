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
 const svg=make('svg',{viewBox:`0 ${TOP} ${W} ${H}`,'aria-label':'Cahill–Keyes world map: select a country or zoom to explore','role':'group'});
 svg.id='labAtlasCahill';svg.classList.add('lab-cahill-overlay');
 svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;opacity:0;display:none';
 host.appendChild(svg);
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
 const regions=[];
 let pendingTap=null,lastTouchUp=-Infinity;
 const cancelTap=()=>{if(pendingTap){clearTimeout(pendingTap);pendingTap=null}};
 // Android synthesizes click after pointerup, often after the map has moved.
 // The completed touch itself chooses the country; the later click is ignored.
 const activateOnTap=(fn,event)=>{
  if(labAtlasMode!=='cahill-keyes'||performance.now()<blockedClicks||dragged)return;
  if(event?.type==='click'&&event.detail>0&&
     performance.now()-lastTouchUp<650)return;
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
   fill:'#dfb045',stroke:'#103135','stroke-width':'.65','stroke-linejoin':'round'});
  const region=crateRegions.find(x=>x.id===id);
  const label=region?.label||region?.name||id.replace(/-/g,' ');
  country.appendChild(make('title')).textContent=label;
  country.addEventListener('click',event=>{
   if(labAtlasMode!=='cahill-keyes'||performance.now()<blockedClicks||dragged)return;
   event.stopPropagation();
   activateOnTap(()=>{
    atlasFocus=null;atlasUserNavigated=true;
    toggleCrateRegion(id);labCahillSync();
   },event);
  });
  // SVG paths are painted geography, not focusable rectangular WebView controls.
  // Keyboard/screen-reader region controls already exist under Choose by Name.
  regions.push({id,feature,node:country});
  countries.appendChild(country);
 }
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
   'stroke-width':'.8','stroke-linejoin':'round'});
  country.appendChild(make('title')).textContent='Antarctica';
  // SVG paths are painted geography, not focusable rectangular WebView controls.
  // Keyboard/screen-reader region controls already exist under Choose by Name.
  country.addEventListener('click',event=>{
   if(labAtlasMode!=='cahill-keyes'||performance.now()<blockedClicks||dragged)return;
   event.stopPropagation();
   activateOnTap(()=>{
    atlasFocus=null;atlasUserNavigated=true;
    toggleCrateRegion(id);labCahillSync();
   },event);
  });
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
 const pointers=new Map();let previousPinch=null,dragged=false;
 const limit=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 const refresh=()=>{
  bounds.w=W/zoom;bounds.h=H/zoom;
  bounds.x=limit(bounds.x,0,W-bounds.w);bounds.y=limit(bounds.y,TOP,TOP+H-bounds.h);
  svg.setAttribute('viewBox',`${bounds.x.toFixed(2)} ${bounds.y.toFixed(2)} ${bounds.w.toFixed(2)} ${bounds.h.toFixed(2)}`);
  svg.style.touchAction=zoom>1.01?'none':'pan-y';
  lanes.setZoom(zoom);
 };
 const screenToWorld=(cx,cy)=>{
  const r=svg.getBoundingClientRect();
  return [bounds.x+(cx-r.left)/Math.max(1,r.width)*bounds.w,
   bounds.y+(cy-r.top)/Math.max(1,r.height)*bounds.h];
 };
 const zoomAt=(factor,cx,cy)=>{
  const before=screenToWorld(cx,cy),next=limit(zoom*factor,1,5.5);
  if(Math.abs(next-zoom)<.00001)return;
  zoom=next;
  const r=svg.getBoundingClientRect();bounds.w=W/zoom;bounds.h=H/zoom;
  bounds.x=before[0]-(cx-r.left)/Math.max(1,r.width)*bounds.w;
  bounds.y=before[1]-(cy-r.top)/Math.max(1,r.height)*bounds.h;
  refresh();
 };
 const reset=()=>{zoom=1;bounds.x=0;bounds.y=TOP;refresh()};
 const zoomBounds=([x0,y0],[x1,y1])=>{
  const rect=svg.getBoundingClientRect();
  if(!rect.width||!rect.height)return reset();
  const dx=Math.max(14,x1-x0),dy=Math.max(14,y1-y0);
  const s=limit(Math.min(W/(dx*1.28),H/(dy*1.28)),1,5.5);
  zoom=s;bounds.w=W/s;bounds.h=H/s;
  bounds.x=(x0+x1-bounds.w)/2;bounds.y=(y0+y1-bounds.h)/2;refresh();
 };
 svg.addEventListener('wheel',event=>{
  if(labAtlasMode!=='cahill-keyes')return;
  event.preventDefault();zoomAt(Math.exp(-event.deltaY*.002),event.clientX,event.clientY);
 },{passive:false});
 svg.addEventListener('dblclick',event=>{
  if(labAtlasMode!=='cahill-keyes')return;
  event.preventDefault();
  // The second touch pointerup already executed this zoom; suppress the
  // later synthetic dblclick so it cannot zoom twice or disturb the target.
  if(performance.now()-lastTouchUp<450)return;
  blockedClicks=performance.now()+280;
  zoomAt(zoom>3?.5:1.8,event.clientX,event.clientY);
 });
 svg.addEventListener('pointerdown',event=>{
  if(labAtlasMode!=='cahill-keyes')return;
  const first=pointers.size===0;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,
   startX:event.clientX,startY:event.clientY,startTarget:event.target});
  if(first)dragged=false;
  else{dragged=true;cancelTap()} // A second finger means pinch, never tap.
  // Do not capture pointerdown: capturing immediately retargets the
  // eventual click to the SVG root, breaking country and route hit targets.
  // Touch-action:none already prevents native page gestures when zoomed.
  previousPinch=null;
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
   if(previousPinch&&distance>5)zoomAt(distance/previousPinch,(p.x+q.x)/2,(p.y+q.y)/2);
   previousPinch=distance;dragged=true;cancelTap();
   blockedClicks=performance.now()+300;return;
  }
  // IMPORTANT: browser touch pointers report sub-pixel movement while a
  // finger rests on the glass. The old path panned and blocked ALL clicks
  // on those tiny movements, even below our 7px drag threshold.
  if(!dragged||zoom<=1.01)return;
  const r=svg.getBoundingClientRect();
  bounds.x-=dx/Math.max(1,r.width)*bounds.w;
  bounds.y-=dy/Math.max(1,r.height)*bounds.h;
  refresh();blockedClicks=performance.now()+150;
 });
 // Android WebView SVG clicks can be focus/selection events instead of
 // geographic taps. Handle the completed finger directly.
 const touchDebug={landTaps:0,routeTaps:0,misses:0,last:null};
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
  const region=nearbyRegion(cx,cy);
  return region?{type:'land',id:region}:null;
 };
 const endPointer=event=>{
  const pointer=pointers.get(event.pointerId);
  if(!pointer)return;
  pointers.delete(event.pointerId);previousPinch=null;
  const now=performance.now();
  if(dragged){cancelTap();blockedClicks=now+180;return}
  if(event.type!=='pointerup'||event.pointerType!=='touch')return;
  lastTouchUp=now;
  if(now-lastTap<315){
   cancelTap();blockedClicks=now+320;lastTap=0;
   zoomAt(zoom>3?.5:1.8,event.clientX,event.clientY);
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
   else if(validCrateRegions.has(choice.id)){
    touchDebug.landTaps++;atlasFocus=null;atlasUserNavigated=true;
    toggleCrateRegion(choice.id);labCahillSync();
   }
  },315);
 };
 svg.addEventListener('pointerup',endPointer);
 svg.addEventListener('pointercancel',endPointer);
 // A few projected islands/slivers are narrower than a finger on phones.
 // Forgive near-coast taps ONLY if exactly one region appears in a small
 // screen-space halo; if two countries compete, do not guess.
 const nearbyRegion=(cx,cy)=>{
  const frame=svg.getBoundingClientRect();
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
  // Direct land hits and route/secret pins own their own interaction.
  if(event.target.closest?.('[data-cahill-region],[data-cahill-discovery],[data-cahill-route-target]'))return;
  const id=nearbyRegion(event.clientX,event.clientY);
  if(!id)return;
  event.stopPropagation();
  activateOnTap(()=>{
   atlasFocus=null;atlasUserNavigated=true;
   toggleCrateRegion(id);labCahillSync();
  },event);
 });
 const sync=()=>{
  for(const {id,node}of regions){
   const selected=crateSelected.has(id);
   node.setAttribute('fill',selected?'#a83223':'#dfb045');
   node.setAttribute('aria-pressed',String(selected));
  }
 };
 const focus=(view)=>{
  if(view===null||(!crateSelected.size&&!atlasFocus))return reset();
  let selected=crateSelected;
  if(atlasFocus)selected=new Set(crateRegions.filter(r=>r.continent===atlasFocus).map(r=>r.id));
  const boxes=regions.filter(r=>selected.has(r.id)).map(r=>r.bounds||path.bounds(r.feature))
   .filter(b=>b.flat().every(Number.isFinite));
  if(!boxes.length)return reset();
  zoomBounds([Math.min(...boxes.map(b=>b[0][0])),Math.min(...boxes.map(b=>b[0][1]))],
   [Math.max(...boxes.map(b=>b[1][0])),Math.max(...boxes.map(b=>b[1][1]))]);
 };
 refresh();sync();
 labCahill={svg,focus,reset,sync,projection,regions,rewoundPolygons,antarcticPanel:polar,
  routeStats:lanes.stats,discoveryCount:lanes.pinCount,touchDebug,ready:true};
 window.labCahillMap=labCahill;
 return true;
}
function labCahillSync(){labCahill?.sync()}
function labCahillFocus(view){labCahill?.focus(view)}
