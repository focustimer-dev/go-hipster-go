// Android-only adapter: MapLibre owns painting and camera; existing app owns requests.
let labGlobe=null,labGlobeReady=false,labGlobeResting=true;
function labGlobeBounds(view){
 if(!labGlobeReady)return;
 let regions=crateSelected;
 if(atlasFocus)regions=new Set(crateRegions.filter(r=>r.continent===atlasFocus).map(r=>r.id));
 const points=labGlobeGeography.features.filter(f=>regions.has(f.properties.region)).flatMap(f=>f.geometry.coordinates.flat(2));
 if(!points.length||view===null){labGlobeResting=true;labGlobe.easeTo({center:labAtlasHome(),zoom:labGlobeHomeZoom(),duration:320});return}
 // Fit mainland extents; offshore fragments must not send the camera across the globe.
 const transformed=points.map(labAtlasPoint),lon=transformed.map(p=>p[0]),lat=transformed.map(p=>p[1]);
 const sorted=values=>values.slice().sort((a,b)=>a-b),xs=sorted(lon),ys=sorted(lat),n=xs.length;
 const west=xs[Math.floor(n*.02)],east=xs[Math.min(n-1,Math.floor(n*.98))],south=ys[0],north=ys[n-1];
 labGlobeResting=false;
 labGlobe.fitBounds([[west,south],[east,north]],{padding:24,maxZoom:3.4,duration:320});
}
function labGlobeHomeZoom(){
 if(labAtlasMode==='robinson')return labRobinsonMinimumZoom();
 const host=labGlobe.getContainer();
 // Fit the sphere to the shorter side, with space around the edge.
 const shortSide=Math.max(120,Math.min(host.clientWidth||360,host.clientHeight||360));
 return Math.log2(shortSide*Math.PI/512)-.25;
}
function labGlobeSync(){
 if(!labGlobeReady)return;
 for(const f of labGlobeGeography.features)labGlobe.setFeatureState({source:'land',id:f.id},{selected:crateSelected.has(f.properties.region)});
}
let labGlobeGeography;
function initLabGlobe(){
 if(new URLSearchParams(location.search).get('atlas')==='legacy'||typeof maplibregl==='undefined')return;
 const old=doc.getElementById('crateAtlasMap'),frame=old?.closest('.crate-map-frame'),geometry=doc.getElementById('labGlobeGeography');if(!frame||!geometry)return;
 labGlobeGeography=JSON.parse(geometry.textContent);
 const host=doc.createElement('div');host.id='labAtlasGlobe';host.style.cssText='position:relative;width:100%;aspect-ratio:720/372;background:transparent';host.setAttribute('aria-label','Interactive regional globe');
 frame.appendChild(host);
 try{
  labGlobe=new maplibregl.Map({container:host,style:{version:8,sources:{land:{type:'geojson',data:labGlobeGeography}},layers:[{id:'ocean',type:'background',paint:{'background-color':'#103135','background-color-transition':{duration:0,delay:0}}},{id:'land',type:'fill',source:'land',paint:{'fill-color':['case',['boolean',['feature-state','selected'],false],'#a83223','#dfb045']}},{id:'borders',type:'line',source:'land',paint:{'line-color':'#103135','line-width':.7}}]},center:[10,15],zoom:0,maxZoom:5.5,minZoom:-1,attributionControl:false,renderWorldCopies:false,dragRotate:false,pitchWithRotate:false,canvasContextAttributes:{antialias:true,preserveDrawingBuffer:true}});
 }catch(e){host.remove();labGlobe=null;status('Globe graphics unavailable. The original atlas is available.');return}
 window.labAtlasGlobe=labGlobe;
 labGlobe.on('load',()=>{
  labGlobe.setProjection({type:'globe'});labGlobeReady=true;
  const legacy=frame.querySelector('.atlas-camera-viewport');if(legacy)legacy.hidden=true;else old.style.display='none';
  labGlobe.jumpTo({center:[10,15],zoom:labGlobeHomeZoom()});labGlobeSync();if(crateSelected.size)labGlobeBounds();
  const chart=doc.createElement('canvas');chart.width=chart.height=16;const ctx=chart.getContext('2d');ctx.clearRect(0,0,16,16);ctx.strokeStyle='rgba(16,49,53,.26)';ctx.lineWidth=.7;for(let n=-16;n<32;n+=8){ctx.beginPath();ctx.moveTo(n,16);ctx.lineTo(n+16,0);ctx.stroke()}labGlobe.addImage('engraved-hatch',ctx.getImageData(0,0,16,16));
  labGlobe.addLayer({id:'hatching',type:'fill',source:'land',paint:{'fill-pattern':'engraved-hatch'}},'borders');
  installLabGlobeSecrets(old);installLabAtlasModes(frame);
 });
 labGlobe.on('click','land',event=>{
  if(event.originalEvent?._atlasSecret||labGlobe.getLayer('route-targets')&&labGlobe.queryRenderedFeatures(event.point,{layers:['route-targets']}).length)return;
  const id=event.features[0].properties.region;atlasFocus=null;atlasUserNavigated=true;toggleCrateRegion(id);
 });
 labGlobe.on('dragstart',()=>{labGlobeResting=false;atlasFocus=null;atlasUserNavigated=true;renderAtlasNavigation()});
 labGlobe.on('rotatestart',()=>{labGlobeResting=false;atlasUserNavigated=true;renderAtlasNavigation()});
 labGlobe.on('zoomstart',event=>{if(event.originalEvent){labGlobeResting=false;atlasUserNavigated=true;renderAtlasNavigation()}});
 labGlobe.on('zoomend',()=>{labAtlasGestures();const visible=labGlobe.getZoom()>labGlobeHomeZoom()+.8;old._atlasSecretsSync?.(visible);for(const node of host.querySelectorAll('.lab-globe-secret'))node.hidden=!visible});
 new ResizeObserver(()=>{
  if(!host.clientWidth||!host.clientHeight)return;
  // Reflow the silhouette without forcing MapLibre to repaint every frame.
  // The real map is resized once, after the spring reaches its target.
  if(labAtlasMorph)return;
  labGlobe.resize();
  if(labAtlasMode==='robinson')labGlobe.setMinZoom(labRobinsonMinimumZoom());
  // Refit at rest on rotation, without erasing a user's current close-up.
  else if(labGlobeResting)labGlobe.jumpTo({center:labAtlasHome(),zoom:labGlobeHomeZoom()});
 }).observe(host);
}
function labGlobeUnproject([x,y]){
 const X=[1,.9986,.9954,.99,.9822,.973,.96,.9427,.9216,.8962,.8679,.835,.7986,.7597,.7186,.6732,.6213,.5722,.5322],Y=[0,.062,.124,.186,.248,.31,.372,.434,.4958,.5571,.6176,.6769,.7346,.7903,.8435,.8936,.9394,.9761,1];
 const value=Math.min(1,Math.abs((188-y)/168));let i=0;while(i<17&&Y[i+1]<value)i++;const t=(value-Y[i])/(Y[i+1]-Y[i]),lat=(i+t)*5*Math.sign(188-y);return [Math.max(-180,Math.min(180,(x-360)/335/(X[i]+t*(X[i+1]-X[i]))*180)),lat];
}
function installLabGlobeSecrets(old){
 const features=[],hotspots=[...old.querySelectorAll('.atlas-secret-hotspot')],arts=[...old.querySelectorAll('.chart-details > svg')];
 for(const hot of hotspots){
  const route=hot.querySelector('path.atlas-secret-route-touch');
  if(route){
   // Split at SVG subpaths, including the two halves of the Date Line route.
   for(const part of route.getAttribute('d').match(/M[^M]+/g)||[]){const p=doc.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',part);old.appendChild(p);const length=p.getTotalLength(),coordinates=[];for(let d=0;d<=length;d+=Math.max(1,length/64)){const point=p.getPointAtLength(d);coordinates.push(labGlobeUnproject([point.x,point.y]))}p.remove();features.push({type:'Feature',properties:{secret:hot.dataset.secret},geometry:{type:'LineString',coordinates}})}
  }else{
   const target=hot.querySelector('circle.atlas-secret-target');if(!target)continue;
   const x=+target.getAttribute('cx'),y=+target.getAttribute('cy'),button=doc.createElement('button');button.className='lab-globe-secret';button.hidden=true;button.type='button';button.setAttribute('aria-label',hot.getAttribute('aria-label'));button.style.cssText='width:44px;height:44px;padding:3px;background:transparent;border:0;color:#edc65d';
   const art=arts.find(a=>Math.abs(+a.getAttribute('x')+(+a.getAttribute('width'))/2-x)<1&&Math.abs(+a.getAttribute('y')+(+a.getAttribute('height'))/2-y)<1);
   if(art){const clone=art.cloneNode(true);clone.removeAttribute('x');clone.removeAttribute('y');clone.setAttribute('width','38');clone.setAttribute('height','38');button.appendChild(clone)}else{button.innerHTML='<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor"/><path d="M16 7V25M7 16H25" stroke="currentColor"/></svg>'}
   button.onclick=event=>{event.stopPropagation();old._atlasSecretsSync?.(true);old._atlasOpenSecret?.(hot.dataset.secret)};
   const point=labGlobeUnproject([x,y]),marker=new maplibregl.Marker({element:button}).setLngLat(point).addTo(labGlobe);labSecretMarkers.push({marker,point});
  }
 }
 labRouteGeography={type:'FeatureCollection',features};
 labGlobe.addSource('routes',{type:'geojson',data:labRouteGeography});
 labGlobe.addLayer({id:'routes',type:'line',source:'routes',paint:{'line-color':'#edc65d','line-opacity':.65,'line-width':1,'line-dasharray':[3,5]}});
 labGlobe.addLayer({id:'route-targets',type:'line',source:'routes',paint:{'line-color':'rgba(0,0,0,0)','line-width':20}});
 labGlobe.on('click','route-targets',event=>{if(event.originalEvent)event.originalEvent._atlasSecret=true;old._atlasSecretsSync?.(true);old._atlasOpenSecret?.(event.features[0].properties.secret)});

}

// For this bounded, offline atlas, prepare Robinson geometry once in MapLibre's
// planar address space. Geographic data remains canonical for globe/markers.
let labAtlasMode='robinson',labRobinsonData=null,labRouteGeography=null;
const labSecretMarkers=[];
function labRobinsonPoint([lon,lat]){
 const X=[1,.9986,.9954,.99,.9822,.973,.96,.9427,.9216,.8962,.8679,.835,.7986,.7597,.7186,.6732,.6213,.5722,.5322],Y=[0,.062,.124,.186,.248,.31,.372,.434,.4958,.5571,.6176,.6769,.7346,.7903,.8435,.8936,.9394,.9761,1];
 const a=Math.min(90,Math.abs(lat)),i=Math.min(17,Math.floor(a/5)),t=(a-i*5)/5;
 const x=lon*(X[i]+t*(X[i+1]-X[i])),y=Math.sign(lat)*(Y[i]+t*(Y[i+1]-Y[i]))*168/335*Math.PI;
 return [x,Math.atan(Math.sinh(y))*180/Math.PI];
}
function labRobinsonGeometry(data){
 const coordinates=c=>typeof c[0]==='number'?labRobinsonPoint(c):c.map(coordinates);
 return {type:'FeatureCollection',features:data.features.map(f=>({...f,geometry:{...f.geometry,coordinates:coordinates(f.geometry.coordinates)}}))};
}
function labAtlasPoint(point){return labAtlasMode==='robinson'?labRobinsonPoint(point):point}
function labAtlasHome(){return labAtlasMode==='globe'?[10,15]:[0,0]}

let labAtlasModeInitialized=false,labAtlasMorph=null;
const LAB_ATLAS_MORPH_DURATION=690;

// The projection buttons reflect the requested destination immediately; the
// live map may need a frame to prepare its new geometry underneath the veil.
function labAtlasSwitchButtons(mode){
 for(const b of doc.querySelectorAll('[data-atlas-view]')){
  const active=b.dataset.atlasView===mode;
  b.setAttribute('aria-pressed',String(active));
  b.style.background=active?'#103135':'transparent';
  b.style.color=active?'#dfb045':'#103135';
 }
 store('ghg-atlas-view-v2',mode);
}

// Closed-form damped harmonic spring (in the spirit of wobble). A small
// physical overshoot is intentional; the live map itself is never distorted.
function labAtlasSpring(t){
 const decay=9.5,frequency=Math.sqrt(240-decay*decay);
 return 1-Math.exp(-decay*t)*
  (Math.cos(frequency*t)+(decay/frequency)*Math.sin(frequency*t));
}

// The animation's goal is a settled destination, not a repaint event. A single
// preserved snapshot carries the coastline while the offline map reprojects
// underneath. Only the mask and frame spring; no per-frame GeoJSON rebuilding.
function labAtlasMorphTo(mode){
 const host=labGlobe.getContainer(),from=labAtlasMode;
 const frame=host.getBoundingClientRect(),fromHeight=host.clientHeight||frame.height;
 const targetHeight=host.clientWidth*(mode==='globe'?1:372/720);
 const ANTICIPATION_MS=115;
 const state={from,to:mode,queued:null,raf:0,ready:false,revealing:false,
  pointerEvents:host.style.pointerEvents,transform:host.style.transform,
  transformOrigin:host.style.transformOrigin};
 labAtlasMorph=state;
 labAtlasSwitchButtons(mode);

 // Keep the outgoing geographic frame exactly as drawn while preparing the
 // incoming projection on the SAME MapLibre instance behind the paper veil.
 const veil=doc.createElement('div');
 veil.className='lab-atlas-morph';
 veil.setAttribute('aria-hidden','true');
 veil.dataset.from=from;veil.dataset.to=mode;veil.dataset.phase='anticipate';
 const ink=doc.createElement('div');ink.className='lab-atlas-morph-ink';
 const image=doc.createElement('canvas');image.className='lab-atlas-morph-image';
 const source=labGlobe.getCanvas();
 image.width=Math.max(1,source.width);image.height=Math.max(1,source.height);
 image.style.height=fromHeight+'px';
 try{
  const ctx=image.getContext('2d');
  ctx.drawImage(source,0,0,image.width,image.height);
  if(!ctx.getImageData(Math.floor(image.width/2),Math.floor(image.height/2),1,1).data[3])
   image.hidden=true;
 }catch(e){image.hidden=true}
 ink.appendChild(image);veil.appendChild(ink);
 host.style.transition='none';
 host.style.height=fromHeight+'px';host.style.aspectRatio='auto';
 host.style.transformOrigin='50% 50%';host.style.pointerEvents='none';
 host.appendChild(veil);

 // Make the destination physically ready early rather than changing coasts
 // abruptly AFTER the spring stops. The map canvas is sized ONCE to the
 // destination underneath the fully opaque overlay.
 labGlobe.once('idle',()=>{
  if(labAtlasMorph===state){state.ready=true;veil.dataset.targetReady='true'}
 });
 labAtlasCommitMode(mode,true);
 host.style.height=targetHeight+'px';
 labGlobe.resize();
 if(mode==='robinson')labGlobe.setMinZoom(labRobinsonMinimumZoom());
 labGlobe.jumpTo({center:labAtlasHome(),zoom:labGlobeHomeZoom(),bearing:0,pitch:0});
 host.style.height=fromHeight+'px';
 labGlobe.triggerRepaint();

 const smooth=x=>{const t=Math.max(0,Math.min(x,1));return t*t*(3-2*t)};
 const draw=elapsed=>{
  if(elapsed<ANTICIPATION_MS){
   // Anticipation: compress the atlas like a little spring-loaded card.
   const q=smooth(elapsed/ANTICIPATION_MS);
   host.style.height=fromHeight+'px';
   host.style.transform='scale('+(1-.11*q)+','+(1-.125*q)+')';
   veil.dataset.phase='anticipate';veil.dataset.springProgress='0';
   return;
  }
  const p=Math.max(0,Math.min(1.12,labAtlasSpring((elapsed-ANTICIPATION_MS)/1000)));
  veil.dataset.phase='pop';veil.dataset.springProgress=p.toFixed(3);
  host.style.height=Math.max(100,fromHeight+(targetHeight-fromHeight)*p)+'px';

  // Spring the whole atlas, not just the silhouette. The incoming map is
  // visible underneath once ready, so the rebound belongs to the new view.
  const rebound=Math.max(0,p-1),travel=Math.min(1,p);
  const sx=.89+.11*travel+.72*rebound,sy=.875+.125*travel+.72*rebound;
  host.style.transform='scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
  const fromRx=from==='globe'?46:50,fromRy=from==='globe'?46:44;
  const toRx=mode==='globe'?46:50,toRy=mode==='globe'?46:44;
  ink.style.clipPath='ellipse('+(fromRx+(toRx-fromRx)*travel)+'% '+(fromRy+(toRy-fromRy)*travel)+'% at 50% 50%)';

  // Rather than a cut at the end, crossfade the physical map views during
  // release. Never reveal an unfinished MapLibre repaint or a blank canvas.
  if(state.ready){
   // Never skip the fade if an older phone delivers its first idle late.
   // Start a complete 200ms blend at the later of 'pop' or render-ready.
   if(state.blendStart===undefined)
    state.blendStart=Math.max(ANTICIPATION_MS+145,elapsed);
   const blend=smooth((elapsed-state.blendStart)/200);
   veil.style.opacity=(1-blend).toFixed(3);
  }
 };
 draw(0);
 const finish=()=>{
  if(labAtlasMorph!==state)return;
  host.style.height='';
  host.style.aspectRatio=mode==='globe'?'1 / 1':'720 / 372';
  host.style.transform=state.transform;
  host.style.transformOrigin=state.transformOrigin;
  labGlobe.resize();
  labGlobe.jumpTo({center:labAtlasHome(),zoom:labGlobeHomeZoom(),bearing:0,pitch:0});
  labAtlasGestures();

  const reveal=()=>{
   if(labAtlasMorph!==state||state.revealing)return;
   state.revealing=true;
   veil.dataset.phase='settle';veil.classList.add('is-revealing');
   veil.style.transition='opacity 120ms ease-out';veil.style.opacity='0';
   setTimeout(()=>{
    if(labAtlasMorph!==state)return;
    veil.remove();host.style.pointerEvents=state.pointerEvents;
    labAtlasMorph=null;
    const next=state.queued;
    if(next&&next!==labAtlasMode)labSetAtlasMode(next);
   },130);
  };
  if(state.ready)reveal();
  else{
   labGlobe.once('idle',reveal);
   labGlobe.triggerRepaint();
   setTimeout(reveal,850);
  }
 };
 let began=0;
 const step=now=>{
  if(labAtlasMorph!==state)return;
  if(!began)began=now;
  const elapsed=Math.max(0,now-began);
  draw(Math.min(elapsed,LAB_ATLAS_MORPH_DURATION));
  if(elapsed<LAB_ATLAS_MORPH_DURATION)state.raf=requestAnimationFrame(step);
  else finish();
 };
 state.raf=requestAnimationFrame(step);
}
function labSetAtlasMode(mode){
 if(mode==='mercator')mode='robinson';
 if(!labGlobeReady||!['globe','robinson'].includes(mode))return;
 if(!labAtlasModeInitialized){
  labAtlasModeInitialized=true;
  labAtlasCommitMode(mode);
  return;
 }
 if(labAtlasMorph){
  // Last tap wins: once the visible transition settles, honor its destination.
  labAtlasMorph.queued=mode;
  labAtlasSwitchButtons(mode);
  return;
 }
 if(mode===labAtlasMode||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  labAtlasCommitMode(mode);
  return;
 }
 labAtlasMorphTo(mode);
}
function labAtlasCommitMode(mode,keepHostSize=false){
 if(mode==='mercator')mode='robinson'; // Migrate the retired flat-view preference.
 if(!labGlobeReady||!['globe','robinson'].includes(mode))return;
 labAtlasMode=mode;
 const host=labGlobe.getContainer(),frame=host.closest('.crate-map-frame');
 frame?.classList.toggle('lab-globe-frame',mode==='globe');
 if(!keepHostSize){
  host.style.aspectRatio=mode==='globe'?'1 / 1':'720 / 372';
  labGlobe.resize();
 }
 const home=doc.getElementById('atlasHome');if(home)home.textContent=mode==='globe'?'← WHOLE GLOBE':'← WHOLE WORLD';
 host.setAttribute('aria-label',mode==='robinson'?'Interactive regional Robinson map':'Interactive regional globe');store('ghg-atlas-view-v2',mode);
 labGlobe.stop();labGlobe.setMaxBounds(null);labGlobe.setMinZoom(-1);labGlobe.setProjection({type:mode==='globe'?'globe':'mercator'});
 if(mode==='robinson'){
  // Bounds are in the prepared planar address space, with a small paper margin.
  // MapLibre constrains the camera itself: no corrective snap after each move.
  const pole=labRobinsonPoint([0,90])[1]+1;
  // This engine wraps longitudes beyond 180: ±185 describes a narrow
  // Date Line interval, not a padded world. Stay just inside ±180 instead.
  labGlobe.setMinZoom(labRobinsonMinimumZoom());
  labGlobe.setMaxBounds([[-179.999,-pole],[179.999,pole]]);
 }
 if(!labRobinsonData)labRobinsonData=labRobinsonGeometry(labGlobeGeography);
 labGlobe.getSource('land').setData(mode==='robinson'?labRobinsonData:labGlobeGeography);
 if(labRouteGeography)labGlobe.getSource('routes').setData(mode==='robinson'?labRobinsonGeometry(labRouteGeography):labRouteGeography);
 for(const {marker,point} of labSecretMarkers)marker.setLngLat(labAtlasPoint(point));
 labGlobe.setPaintProperty('ocean','background-color',mode==='robinson'?'rgba(0,0,0,0)':'#103135');
 labGlobe.setLayoutProperty('robinson-ocean','visibility',mode==='robinson'?'visible':'none');
 labAtlasSwitchButtons(mode);
 labGlobe.touchZoomRotate[mode==='robinson'?'disableRotation':'enableRotation']();
 labGlobe.touchPitch[mode==='robinson'?'disable':'enable']();
 labGlobe.keyboard[mode==='robinson'?'disableRotation':'enableRotation']();
 labGlobeResting=true;
 labGlobe.jumpTo({center:labAtlasHome(),zoom:labGlobeHomeZoom(),bearing:0,pitch:0});
 labAtlasGestures();
 labGlobe.once('idle',labGlobeSync);labGlobeSync();
}
function installLabAtlasModes(frame){
 const controls=doc.createElement('div');controls.setAttribute('role','group');controls.setAttribute('aria-label','Atlas view');controls.className='lab-atlas-modes';
 const projections=[
  ['robinson','ROBINSON','<path d="M5 4h14c2 2 3 5 3 8s-1 6-3 8H5c-2-2-3-5-3-8s1-6 3-8Z M2 12h20 M12 4v16 M8 4c-2 5-2 11 0 16 M16 4c2 5 2 11 0 16"/>'],
  ['globe','GLOBE','<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>']
 ];
 for(const [mode,label,symbol] of projections){
  const button=doc.createElement('button');
  button.type='button';button.dataset.atlasView=mode;
  button.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true" focusable="false">${symbol}</svg><span>${label}</span>`;
  button.setAttribute('aria-pressed',String(mode==='robinson'));
  button.onclick=()=>labSetAtlasMode(mode);
  controls.appendChild(button);
 }
 frame.before(controls);
 const edge=[];for(let lat=90;lat>=-90;lat-=2)edge.push(labRobinsonPoint([-180,lat]));for(let lat=-90;lat<=90;lat+=2)edge.push(labRobinsonPoint([180,lat]));edge.push(edge[0]);
 labGlobe.addSource('robinson-ocean',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[edge]}}});
 labGlobe.addLayer({id:'robinson-ocean',type:'fill',source:'robinson-ocean',layout:{visibility:'none'},paint:{'fill-color':'#103135'}},'land');
 const saved=stored('ghg-atlas-view-v2');
 labSetAtlasMode(['robinson','globe'].includes(saved)?saved:'robinson');
}

function labRobinsonMinimumZoom(){
 const host=labGlobe.getContainer(),pole=labRobinsonPoint([0,90])[1]+1;
 const yRange=Math.log(Math.tan(Math.PI/4+pole*Math.PI/360))/Math.PI;
 // Fit the bounds in both axes. A small epsilon avoids the engine's
 // simultaneous zoom-and-pan constraint branch at exactly the minimum.
 return Math.max(-2,Math.min(labGlobe.getMaxZoom(),Math.log2(Math.max((host.clientWidth||387)/(512*(359.998/360)),(host.clientHeight||200)/(512*yRange)))+.002));
}

// Let the browser own page scrolling at the flat world's resting zoom.
// No synthetic scroll loop or per-frame camera correction is needed.
function labAtlasGestures(){
 const scroll=labAtlasMode==='robinson'&&labGlobe.getZoom()<=labGlobeHomeZoom()+.025;
 if(labGlobe.dragPan.isEnabled()===scroll)labGlobe.dragPan[scroll?'disable':'enable']();
 const action=scroll?'pan-y':'none';
 labGlobe.getCanvas().style.touchAction=action;
 labGlobe.getCanvasContainer().style.touchAction=action;
 labAtlasInstruction();
}

function labAtlasInstruction(){
 if(!labGlobeReady)return;
 const hint=doc.getElementById('atlasInstruction');if(!hint)return;
 const touch=!window.matchMedia('(pointer: fine)').matches;
 const scroll=labAtlasMode==='robinson'&&labGlobe.getZoom()<=labGlobeHomeZoom()+.025;
 const navigation=touch?(scroll?'SWIPE TO SCROLL':'DRAG TO PAN')+' · PINCH TO ZOOM':'DRAG TO PAN · SCROLL TO ZOOM';
 hint.textContent='TAP LAND TO EXPLORE · '+navigation;
}
