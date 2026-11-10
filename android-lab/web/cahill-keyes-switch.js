// Android Lab: reversible Cahill ↔ Globe fold and Cahill ↔ Robinson arrangement.
// The live renderers keep ownership of selection and touch gestures. The
// temporary canvas is only a view of cached canonical geographic ink.
function labAtlasCahillTransition(mode,instant=false){
 if(!labCahill?.ready||!labGlobeReady)return;
 const host=labGlobe.getContainer(),svg=labCahill.svg;
 const frame=host.closest('.crate-map-frame'),from=labAtlasMode;
 const valid=['cahill-keyes','globe','robinson'];
 if(!valid.includes(mode)||mode===from)return;
 // Learn the actual resting map geometry before hiding the live renderer.
 // The cached source/return frame then uses this same size and position.
 if(from!=='cahill-keyes'&&labGlobeResting){
  const measured=labAtlasMorphVectors.landingFit(from,host.clientWidth,host.clientHeight,
   point=>labGlobe.project(from==='robinson'?labRobinsonPoint(point):point),.2);
  labCahillMotion.rememberLiveFit(from,host.clientWidth,host.clientHeight,measured);
 }
 const finishLayout=()=>{
  host.style.height='';host.style.aspectRatio=mode==='cahill-keyes'?'960 / 505':
   mode==='globe'?'1 / 1':'720 / 372';
  if(mode==='cahill-keyes'){
   labAtlasMode='cahill-keyes';
   host.classList.add('lab-cahill-active');
   frame?.classList.add('lab-cahill-frame');
   frame?.classList.remove('lab-globe-frame');
   svg.parentElement.style.display='block';
   svg.style.display='block';svg.style.opacity='1';
   svg.style.pointerEvents='auto';
   host.setAttribute('aria-label','Interactive Cahill–Keyes world map');
   const home=doc.getElementById('atlasHome');if(home)home.textContent='← WHOLE WORLD';
   labCahill.reset();labCahillSync();labCahill.navigator?.activate();
  }else{
   svg.style.display='none';svg.style.opacity='0';svg.style.pointerEvents='none';
   svg.parentElement.style.display='none';
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
 // An opaque geographic film is already covering the map. Stop the
 // live WebGL canvas from competing for compositor frames during the fold.
 // Restore its visibility before revealing the destination renderer.
 const mapCanvas=labGlobe.getCanvas(),canvasVisibility=mapCanvas.style.visibility;
 labGlobe.stop();
 mapCanvas.style.visibility='hidden';
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
   mapCanvas.style.visibility=canvasVisibility;
   labGlobe.off('render',onRender);
   labGlobe.off('idle',onIdle);
   let alignment=null,fitSampled=false;
   if(mode!=='cahill-keyes'){
    const width=host.clientWidth,height=host.clientHeight;
    const measured=labAtlasMorphVectors.landingFit(mode,width,height,
     point=>labGlobe.project(mode==='robinson'?labRobinsonPoint(point):point),.2);
    fitSampled=measured.sampled;
    if(measured.sampled){
     const predicted=state.roundFits?.[mode];
     if(predicted&&state.pixels){
      const dx=measured.x-predicted.x*width/state.pixels;
      const dy=measured.y-predicted.y*height/state.pixels;
      const sx=measured.sx/predicted.sx,sy=measured.sy/predicted.sy;
      const residual=Math.max(Math.abs(sx-1),Math.abs(sy-1),
       Math.abs(dx)/Math.max(1,width),Math.abs(dy)/Math.max(1,height));
      alignment={x:dx,y:dy,sx,sy,residual};
     }
     labCahillMotion.rememberLiveFit(mode,width,height,measured);
    }
   }
   window.__labAtlasLastCahillSwitch={
    from,to:mode,duration:575,animationElapsedMs:state.elapsed,
    frames:state.frames,maxPaintMs:state.maxPaintMs,
    renderSignal:signal,finished:true,cacheSelection:crateSelected.size,
    fitSampled,endpointResidual:alignment?.residual??null
   };
   reveal(()=>{
    labAtlasMorph=null;
    const next=state.queued;
    if(next&&next!==labAtlasMode)labSetAtlasMode(next);
    else labAtlasSwitchButtons(mode);
   },alignment);
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
  geojson:labJoinedGlobeGeography,selected:crateSelected,
  cahillView:labCahill.camera.snapshot(),complete:finish});
 labAtlasMorph=state;
 // Finish the inexpensive 2D geographic fold before changing MapLibre's
 // projection. A mid-fold setProjection/source refresh stalled rAF on
 // software-backed WebViews, skipping key leaves and stretching ~575 ms
 // into several seconds. The opaque terminal pose stays visible while the
 // single live map commits its destination in finish(), then fades away
 // once ready. No extra map instance, per-frame WebGL update or dependency.

}
