// Android Lab: reversible Cahill ↔ Globe fold and Cahill ↔ Robinson arrangement.
// The live renderers keep ownership of selection and touch gestures. The
// temporary canvas is only a view of cached canonical geographic ink.
function labAtlasCahillTransition(mode,instant=false){
 if(!labCahill?.ready||!labGlobeReady)return;
 const host=labGlobe.getContainer(),svg=labCahill.svg;
 const frame=host.closest('.crate-map-frame'),from=labAtlasMode;
 const valid=['cahill-keyes','globe','robinson'];
 if(!valid.includes(mode)||mode===from)return;
 const finishLayout=()=>{
  host.style.height='';host.style.aspectRatio=mode==='cahill-keyes'?'960 / 505':
   mode==='globe'?'1 / 1':'720 / 372';
  if(mode==='cahill-keyes'){
   labAtlasMode='cahill-keyes';
   host.classList.add('lab-cahill-active');
   frame?.classList.add('lab-cahill-frame');
   frame?.classList.remove('lab-globe-frame');
   svg.style.display='block';svg.style.opacity='1';
   svg.style.pointerEvents='auto';
   host.setAttribute('aria-label','Interactive Cahill–Keyes world map');
   const home=doc.getElementById('atlasHome');if(home)home.textContent='← WHOLE WORLD';
   labCahill.reset();labCahillSync();labCahill.navigator?.activate();
  }else{
   svg.style.display='none';svg.style.opacity='0';svg.style.pointerEvents='none';
   host.classList.remove('lab-cahill-active');frame?.classList.remove('lab-cahill-frame');
  }
  labGlobe.resize();
 };
 // Prefer the no-motion path for initialization, accessibility and tests.
 if(instant){
  labCahill.navigator?.deactivate();
  if(mode!=='cahill-keyes')labAtlasCommitMode(mode,true);
  finishLayout();
  labAtlasSwitchButtons(mode);
  window.__labAtlasLastCahillSwitch={from,to:mode,duration:0,finished:true,reduced:true};
  return;
 }
 labCahill.navigator?.deactivate();
 labAtlasSwitchButtons(mode);
 labAtlasMorphVectors.pauseWarm();
 const already={value:false};
 const precommit=()=>{
  if(already.value||mode==='cahill-keyes')return;
  already.value=true;
  // Project the real MapLibre destination under the opaque animated chart.
  // Starting early avoids a visible pause after the final keyframe.
  labAtlasCommitMode(mode,true);
  labGlobe.resize();labGlobe.triggerRepaint();
 };
 const finish=(state,reveal)=>{
  try{
   precommit();
   finishLayout();
  }catch(error){
   console.warn('Cahill geographic transition commit failed',error);
   try{finishLayout()}catch(_){/* release camera even if graphics fail */}
  }
  let revealed=false;
  const show=(signal)=>{
   if(revealed)return;revealed=true;
   labGlobe.off('render',onRender);
   labGlobe.off('idle',onIdle);
   window.__labAtlasLastCahillSwitch={
    from,to:mode,duration:575,frames:state.frames,maxPaintMs:state.maxPaintMs,
    renderSignal:signal,finished:true,cacheSelection:crateSelected.size
   };
   reveal(()=>{
    labAtlasMorph=null;
    const next=state.queued;
    if(next&&next!==labAtlasMode)labSetAtlasMode(next);
    else labAtlasSwitchButtons(mode);
   });
  };
  const ready=()=>{
   if(mode==='cahill-keyes')return true;
   const expected=mode==='globe'?'globe':'mercator';
   return labGlobe.getProjection()?.type===expected&&
    labGlobe.isStyleLoaded()&&labGlobe.isSourceLoaded('land');
  };
  const onRender=()=>{if(ready())show('render')};
  const onIdle=()=>{if(ready())show('idle')};
  if(ready()){
   // Two frames allow geometry, size and new MapLibre paint to land together.
   requestAnimationFrame(()=>requestAnimationFrame(()=>show('frame')));
  }else{
   labGlobe.on('render',onRender);labGlobe.once('idle',onIdle);
   labGlobe.triggerRepaint();
   setTimeout(()=>show('timeout'),650);
  }
 };
 const state=labCahillMotion.run({host,svg,to:mode,from,
  geojson:labGlobeGeography,selected:crateSelected,
  cahillView:labCahill.camera.snapshot(),complete:finish});
 labAtlasMorph=state;
 // Render the live MapLibre destination underneath after most of the fold
 // is already on-screen. This saves a hard reproject pause at the last frame.
 if(mode!=='cahill-keyes')setTimeout(()=>{
  if(labAtlasMorph===state&&!state.done){
   try{precommit()}catch(error){console.warn('Cahill precommit failed',error)}
  }
 },355);
}
