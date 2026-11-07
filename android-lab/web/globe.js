// Android-only adapter: MapLibre owns painting and camera; existing app owns requests.
let labGlobe=null,labGlobeReady=false,labGlobeResting=true;
function labGlobeBounds(view){
 if(!labGlobeReady)return;
 if(labAtlasMode==='cahill-keyes'){
  labCahillFocus(view);return;
 }
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
const labGlobeAppliedSelection=new Map();
function labGlobeSync(force=false){
 if(!labGlobeReady)return;
 if(labAtlasMode==='cahill-keyes')labCahillSync();
 // Prewarm matched coastline images in idle slices, never during the morph.
 // A changed region selection invalidates the cache key automatically.
 if(!labAtlasMorph&&labGlobeGeography)
  labAtlasMorphVectors.warmFrames(labGlobeGeography,crateSelected,
   labGlobe.getContainer().clientWidth);
 window.__labAtlasFrameCacheStatus=()=>labAtlasMorphVectors.cacheStatus(
  crateSelected,labGlobe.getContainer().clientWidth);
 // Feature state is sticky by source/id. Reapplying 183 unchanged features
 // twice per projection switch triggers unnecessary render/worker work,
 // particularly costly on software WebGL. Restore only selected features
 // on a source reload; clear previously selected features on deselection.
 for(const f of labGlobeGeography.features){
  const selected=crateSelected.has(f.properties.region);
  const previous=labGlobeAppliedSelection.get(f.id);
  if((selected&&(force||previous!==true))||(previous===true&&!selected)){
   labGlobe.setFeatureState({source:'land',id:f.id},{selected});
   labGlobeAppliedSelection.set(f.id,selected);
  }
 }
}
let labGlobeGeography;
function initLabGlobe(){
 if(new URLSearchParams(location.search).get('atlas')==='legacy'||typeof maplibregl==='undefined')return;
 const old=doc.getElementById('crateAtlasMap'),frame=old?.closest('.crate-map-frame'),geometry=doc.getElementById('labGlobeGeography');if(!frame||!geometry)return;
 labGlobeGeography=JSON.parse(geometry.textContent);
 const host=doc.createElement('div');host.id='labAtlasGlobe';host.style.cssText='position:relative;width:100%;aspect-ratio:720/372;background:transparent';host.setAttribute('aria-label','Interactive regional globe');
 frame.appendChild(host);
 try{
  labGlobe=new maplibregl.Map({container:host,style:{version:8,sources:{land:{type:'geojson',data:labGlobeGeography}},layers:[{id:'ocean',type:'background',paint:{'background-color':'#103135','background-color-transition':{duration:0,delay:0}}},{id:'land',type:'fill',source:'land',paint:{'fill-color':['case',['boolean',['feature-state','selected'],false],'#a83223','#dfb045']}},{id:'borders',type:'line',source:'land',paint:{'line-color':'#103135','line-width':.7}}]},center:[10,15],zoom:0,maxZoom:5.5,minZoom:-1,attributionControl:false,renderWorldCopies:false,dragRotate:false,pitchWithRotate:false,canvasContextAttributes:{antialias:true}});
 }catch(e){host.remove();labGlobe=null;status('Globe graphics unavailable. The original atlas is available.');return}
 window.labAtlasGlobe=labGlobe;
 labGlobe.on('load',()=>{
  labGlobe.setProjection({type:'globe'});labGlobeReady=true;
  const legacy=frame.querySelector('.atlas-camera-viewport');if(legacy)legacy.hidden=true;else old.style.display='none';
  labGlobe.jumpTo({center:[10,15],zoom:labGlobeHomeZoom()});labGlobeSync();if(crateSelected.size)labGlobeBounds();
  const chart=doc.createElement('canvas');chart.width=chart.height=16;const ctx=chart.getContext('2d');ctx.clearRect(0,0,16,16);ctx.strokeStyle='rgba(16,49,53,.26)';ctx.lineWidth=.7;for(let n=-16;n<32;n+=8){ctx.beginPath();ctx.moveTo(n,16);ctx.lineTo(n+16,0);ctx.stroke()}labGlobe.addImage('engraved-hatch',ctx.getImageData(0,0,16,16));
  labGlobe.addLayer({id:'hatching',type:'fill',source:'land',paint:{'fill-pattern':'engraved-hatch'}},'borders');
  installLabGlobeSecrets(old);
  labCahillInit(host,labGlobeGeography,labRouteGeography,old);
  installLabAtlasModes(frame);
 });
 labGlobe.on('click','land',event=>{
  if(event.originalEvent?._atlasSecret||labGlobe.getLayer('route-targets')&&labGlobe.queryRenderedFeatures(event.point,{layers:['route-targets']}).length)return;
  const id=event.features[0].properties.region;atlasFocus=null;atlasUserNavigated=true;toggleCrateRegion(id);
  setTimeout(()=>{if(!labAtlasMorph)labAtlasMorphVectors.warmFrames(
   labGlobeGeography,crateSelected,host.clientWidth)},0);
 });
 // Region buttons also invalidate the geographic sprite when the user edits
 // the crate; snapshots must never show an obsolete selected region.
 doc.addEventListener('click',event=>{
  if(!event.target?.closest?.('[data-crate-region]'))return;
  setTimeout(()=>{if(!labAtlasMorph)labAtlasMorphVectors.warmFrames(
   labGlobeGeography,crateSelected,host.clientWidth)},0);
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
  labAtlasMorphVectors.warmFrames(labGlobeGeography,crateSelected,host.clientWidth);
  labGlobe.resize();
  if(labAtlasMode==='robinson')labGlobe.setMinZoom(labRobinsonMinimumZoom());
  // Refit at rest on rotation, without erasing a user's current close-up.
  else if(labGlobeResting){
   const home=labAtlasHome(),zoom=labGlobeHomeZoom(),center=labGlobe.getCenter();
   // A resize event after the morph must not cause a redundant camera snap.
   if(Math.abs(labGlobe.getZoom()-zoom)>.025||
      Math.abs(center.lng-home[0])>.1||Math.abs(center.lat-home[1])>.1)
    labGlobe.jumpTo({center:home,zoom});
  }
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
   const point=labGlobeUnproject([x,y]),marker=new maplibregl.Marker({element:button}).setLngLat(point).addTo(labGlobe);labSecretMarkers.push({marker,point,secret:hot.dataset.secret,label:hot.getAttribute('aria-label')});
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
const LAB_ATLAS_MORPH_DURATION=650;
// Measured endpoint fits from completed MapLibre renders, keyed by viewport.
// Avoid using stale calibration after rotation or layout changes.
const labAtlasEndpointFits=new Map();
function labAtlasFitKey(mode,width,height){
 return `${mode}:${Math.round(width)}:${Math.round(height)}`;
}

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

// One reversible geographic animation: continent positions, atlas aspect,
// projection fit and a tiny spring accent share the same timeline. The real
// MapLibre map is only reprojected after the visible geography has finished.
function labAtlasMorphTo(mode){
 const host=labGlobe.getContainer(),from=labAtlasMode;
 const width=host.clientWidth||host.getBoundingClientRect().width;
 const fromHeight=host.clientHeight||host.getBoundingClientRect().height;
 const targetHeight=width*(mode==='globe'?1:372/720);
 const ANTICIPATION_MS=95,GEOGRAPHY_MS=530;
 const mapCanvas=labGlobe.getCanvas();
 const state={from,to:mode,queued:null,raf:0,finishing:false,revealing:false,
  pointerEvents:host.style.pointerEvents,transform:host.style.transform,
  transformOrigin:host.style.transformOrigin,
  canvasVisibility:mapCanvas.style.visibility};
 labAtlasMorph=state;labAtlasSwitchButtons(mode);
 labAtlasMorphVectors.pauseWarm();

 // Start the motion before doing any MapLibre reprojection or GPU readback.
 const veil=doc.createElement('div');veil.className='lab-atlas-morph';
 veil.setAttribute('aria-hidden','true');veil.dataset.from=from;
 veil.dataset.to=mode;veil.dataset.phase='anticipate';
 const tween=doc.createElement('canvas');tween.className='lab-atlas-morph-vectors';
 tween.setAttribute('aria-hidden','true');veil.appendChild(tween);
 host.style.transition='none';host.style.height=fromHeight+'px';
 host.style.aspectRatio='auto';host.style.transformOrigin='50% 50%';
 host.style.pointerEvents='none';host.appendChild(veil);
 // The real WebGL canvas is entirely covered by the vector layer. Keeping it
 // out of composition during the animated resize avoids repaint work on
 // every frame, especially following regional selection/zoom.
 labGlobe.stop();
 mapCanvas.style.visibility='hidden';

 // The current live view tells us the EXACT starting scale. Calibrated
 // viewport-independent baselines predict the destination while MapLibre is
 // still on the old projection; the final render provides a tiny correction.
 const sourceFit=labAtlasMorphVectors.landingFit(from,width,fromHeight,
  point=>labGlobe.project(from==='robinson'?labRobinsonPoint(point):point),.03);
 const destinationFit=labAtlasEndpointFits.get(labAtlasFitKey(mode,width,targetHeight));
 const fits={robinson:labAtlasMorphVectors.estimatedFit('robinson'),
  globe:labAtlasMorphVectors.estimatedFit('globe'),width,height:targetHeight};
 if(destinationFit)fits[mode]={...destinationFit};
 fits[from]=sourceFit;
 const vector=labAtlasMorphVectors.make(tween,labGlobeGeography,crateSelected,[10,15]);
 const renderVector=progress=>{
  const started=performance.now();
  const cached=labAtlasMorphVectors.paintCached(tween,vector.data,progress,vector.selected,fits);
  if(cached)state.cacheHits=(state.cacheHits||0)+1;
  else state.cacheMisses=(state.cacheMisses||0)+1;
  const cost=performance.now()-started;
  state.maxPaintMs=Math.max(state.maxPaintMs||0,cost);
  veil.dataset.cache=cached?'ready':'fallback';
 };
 const initial=from==='globe'?1:0;
 renderVector(initial);
 veil.dataset.vectorProgress=String(initial);
 const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t)};
 let began=0;

 const draw=elapsed=>{
  if(elapsed<ANTICIPATION_MS){
   const q=smooth(elapsed/ANTICIPATION_MS);
   host.style.transform='scale('+(1-.04*q)+','+(1-.055*q)+')';
   veil.dataset.phase='anticipate';return;
  }
  const travel=smooth((elapsed-ANTICIPATION_MS)/GEOGRAPHY_MS);
  const geographicProgress=mode==='globe'?travel:1-travel;
  // Geography, viewport aspect and projection fit share this ONE timeline.
  // No second 235ms resize phase after the continents have stopped.
  renderVector(geographicProgress);
  veil.dataset.vectorProgress=geographicProgress.toFixed(3);
  veil.dataset.morphProgress=travel.toFixed(3);
  veil.dataset.fitX=(fits.robinson.sx+(fits.globe.sx-fits.robinson.sx)*geographicProgress).toFixed(5);
  veil.dataset.fitY=(fits.robinson.sy+(fits.globe.sy-fits.robinson.sy)*geographicProgress).toFixed(5);
  veil.dataset.phase='pop';
  host.style.height=(fromHeight+(targetHeight-fromHeight)*travel).toFixed(2)+'px';
  // A very small spring embellishment on the entire map. It decays to EXACT
  // identity at t=1, without pulling the land away from its destination.
  const unsquash=smooth((elapsed-ANTICIPATION_MS)/135);
  const tail=travel>.68?(travel-.68)/.32:0;
  const recoil=tail?Math.sin(tail*Math.PI*2)*.014*(1-tail):0;
  const sx=1-.04*(1-unsquash)+recoil,sy=1-.055*(1-unsquash)+recoil;
  host.style.transform='scale('+sx.toFixed(5)+','+sy.toFixed(5)+')';
 };

 const cleanup=()=>{
  if(labAtlasMorph!==state||state.revealing)return;
  state.revealing=true;veil.dataset.phase='settle';
  veil.classList.add('is-revealing');veil.style.transition='opacity 125ms ease-out';
  veil.style.opacity='0';
  setTimeout(()=>{
   if(labAtlasMorph!==state)return;
   veil.remove();host.style.pointerEvents=state.pointerEvents;
   mapCanvas.style.visibility=state.canvasVisibility;
   host.style.transform=state.transform;
   host.style.transformOrigin=state.transformOrigin;
   labAtlasMorph=null;
   const next=state.queued;
   if(next&&next!==labAtlasMode)labSetAtlasMode(next);
   else labAtlasMorphVectors.warmFrames(labGlobeGeography,crateSelected,
    host.clientWidth);
  },135);
 };

 const finish=()=>{
  if(labAtlasMorph!==state||state.finishing)return;
  state.finishing=true;cancelAnimationFrame(state.raf);
  renderVector(mode==='globe'?1:0);
  veil.dataset.vectorProgress=mode==='globe'?'1':'0';
  veil.dataset.phase='reproject';
  host.style.height=targetHeight+'px';host.style.transform=state.transform;
  host.style.transformOrigin=state.transformOrigin;
  const commitStarted=performance.now();
  try{
   labAtlasCommitMode(mode,true);
   host.style.height='';host.style.aspectRatio=mode==='globe'?'1 / 1':'720 / 372';
   labGlobe.resize();labAtlasGestures();
   mapCanvas.style.visibility=state.canvasVisibility;
  }catch(e){
   console.warn('Atlas projection switch failed',e);
   host.style.height='';host.style.aspectRatio=mode==='globe'?'1 / 1':'720 / 372';
   cleanup();return;
  }
  const commitMs=performance.now()-commitStarted;
  veil.dataset.commitMs=commitMs.toFixed(1);
  veil.dataset.phase='dock';
  let dockStarted=false;
  const waitingSince=performance.now();
  // A completed frame with loaded sources is enough to reveal the real map.
  // Waiting for global 'idle' alone can hold the final pose unnecessarily.
  const dock=(signal='timeout')=>{
   if(dockStarted||labAtlasMorph!==state)return;
   dockStarted=true;
   labGlobe.off('render',onRender);
   labGlobe.off('idle',onIdle);
   const measured=labAtlasMorphVectors.landingFit(mode,host.clientWidth,host.clientHeight,
    point=>labGlobe.project(mode==='robinson'?labRobinsonPoint(point):point),.2);
   const predicted=fits[mode],actualFit=measured.sampled?measured:predicted;
   const correction={x:actualFit.x-predicted.x,y:actualFit.y-predicted.y,
    sx:actualFit.sx/predicted.sx,sy:actualFit.sy/predicted.sy};
   const residual=Math.max(Math.abs(correction.sx-1),Math.abs(correction.sy-1),
    Math.abs(correction.x)/Math.max(1,width),
    Math.abs(correction.y)/Math.max(1,targetHeight));
   window.__labAtlasLastMorph={from,to:mode,commitMs,landingFit:actualFit,
    handoffSignal:signal,handoffWaitMs:performance.now()-waitingSince,
    sourceFit,predictedFit:predicted,fitSampled:measured.sampled,
    rawFit:{sx:measured.rawSx,sy:measured.rawSy,validX:measured.validX,validY:measured.validY,
     zoom:labGlobe.getZoom(),homeZoom:labGlobeHomeZoom(),projection:labGlobe.getProjection()?.type},
    endpointResidual:residual,correction,cacheHits:state.cacheHits||0,
    cacheMisses:state.cacheMisses||0,maxPaintMs:state.maxPaintMs||0};
   veil.dataset.endpointResidual=residual.toFixed(4);
   // The measured live renderer is authoritative. Redraw the terminal
   // vector pose under the opaque veil before revealing it; a CSS transform
   // on the canvas would also move its paper background and cause a snap.
   if(measured.sampled){
    labAtlasEndpointFits.set(labAtlasFitKey(mode,host.clientWidth,host.clientHeight),
     {x:measured.x,y:measured.y,sx:measured.sx,sy:measured.sy,sampled:true});
    fits[mode]=measured;
    renderVector(mode==='globe'?1:0);
   }
   // Fade only after the destination has produced a real frame.
   cleanup();
  };
  const onRender=()=>{
   const expected=mode==='globe'?'globe':'mercator';
   if(labGlobe.getProjection()?.type!==expected||
      !labGlobe.isStyleLoaded()||!labGlobe.isSourceLoaded('land')||
      (labRouteGeography&&!labGlobe.isSourceLoaded('routes')))return;
   dock('render');
  };
  const onIdle=()=>dock('idle');
  labGlobe.on('render',onRender);
  labGlobe.once('idle',onIdle);
  labGlobe.triggerRepaint();
  // Software WebGL can omit both callbacks: never strand the canvas/gestures.
  setTimeout(()=>dock('timeout'),950);
 };

 const step=now=>{
  if(labAtlasMorph!==state||state.finishing)return;
  if(!began)began=now;
  const elapsed=Math.max(0,now-began);
  draw(Math.min(elapsed,LAB_ATLAS_MORPH_DURATION));
  if(elapsed<LAB_ATLAS_MORPH_DURATION)state.raf=requestAnimationFrame(step);
  else finish();
 };
 state.raf=requestAnimationFrame(step);
 // Background WebViews may suspend rAF; never strand gesture handling.
 setTimeout(finish,1800);
}
function labSetAtlasMode(mode){
 if(mode==='mercator')mode='robinson';
 if(!labGlobeReady||!['globe','robinson','cahill-keyes'].includes(mode))return;
 if(mode==='cahill-keyes'&&!labCahill?.ready)return;
 if(!labAtlasModeInitialized){
  labAtlasModeInitialized=true;
  labAtlasCommitMode(mode==='cahill-keyes'?'robinson':mode);
  if(mode==='cahill-keyes')labAtlasCahillTransition(mode,true);
  return;
 }
 if(labAtlasMorph){
  // Last tap wins: once the visible transition settles, honor its destination.
  labAtlasMorph.queued=mode;
  labAtlasSwitchButtons(mode);
  return;
 }
 if(mode===labAtlasMode)return;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(mode==='cahill-keyes'||labAtlasMode==='cahill-keyes'){
  labAtlasCahillTransition(mode,reduce);return;
 }
 if(reduce){labAtlasCommitMode(mode);return}
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
 labGlobe.once('idle',()=>labGlobeSync(true));labGlobeSync();
}
function installLabAtlasModes(frame){
 const controls=doc.createElement('div');controls.setAttribute('role','group');controls.setAttribute('aria-label','Atlas view');controls.className='lab-atlas-modes';
 const projections=[
  ['robinson','ROBINSON','<path d="M5 4h14c2 2 3 5 3 8s-1 6-3 8H5c-2-2-3-5-3-8s1-6 3-8Z M2 12h20 M12 4v16 M8 4c-2 5-2 11 0 16 M16 4c2 5 2 11 0 16"/>'],
  ['globe','GLOBE','<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'],
  ['cahill-keyes','KEYES','<path d="M2 7 7 2l5 6 5-6 5 5-5 6-5-3-5 3Z M2 17l5-4 5 4 5-4 5 4-5 5-5-3-5 3Z"/>']
 ];
 for(const [mode,label,symbol] of projections){
  const button=doc.createElement('button');
  button.type='button';button.dataset.atlasView=mode;
  button.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true" focusable="false">${symbol}</svg><span>${label}</span>`;
  button.setAttribute('aria-pressed',String(mode==='robinson'));
  if(mode==='cahill-keyes'){
   button.setAttribute('aria-label','Cahill–Keyes projection');
   button.title='Cahill–Keyes (1975)';button.disabled=!labCahill?.ready;
  }
  button.onclick=()=>labSetAtlasMode(mode);
  controls.appendChild(button);
 }
 frame.before(controls);
 const edge=[];for(let lat=90;lat>=-90;lat-=2)edge.push(labRobinsonPoint([-180,lat]));for(let lat=-90;lat<=90;lat+=2)edge.push(labRobinsonPoint([180,lat]));edge.push(edge[0]);
 labGlobe.addSource('robinson-ocean',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[edge]}}});
 labGlobe.addLayer({id:'robinson-ocean',type:'fill',source:'robinson-ocean',layout:{visibility:'none'},paint:{'fill-color':'#103135'}},'land');
 const saved=stored('ghg-atlas-view-v2');
 labSetAtlasMode(['robinson','globe','cahill-keyes'].includes(saved)?saved:'robinson');
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
