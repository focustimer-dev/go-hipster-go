// Isolated third-view handoff: a timed paper dissolve, not a fake
// geographic morph. Original Robinson <-> Globe vector choreography is intact.
function labAtlasCahillTransition(mode,instant=false){
 if(!labCahill?.ready)return;
 const host=labGlobe.getContainer(),svg=labCahill.svg;
 const frame=host.closest('.crate-map-frame'),from=labAtlasMode;
 const width=host.clientWidth||host.getBoundingClientRect().width||360;
 const fromHeight=host.clientHeight||host.getBoundingClientRect().height||200;
 const targetHeight=width*(mode==='cahill-keyes'?505/960:mode==='globe'?1:372/720);
 const duration=instant?0:390;
 const state={from,to:mode,queued:null,raf:0,started:false};
 const oldPointer=host.style.pointerEvents;
 labAtlasMorph=state;host.style.pointerEvents='none';
 labAtlasSwitchButtons(mode);
 svg.style.display='block';svg.style.pointerEvents='none';
 host.style.height=fromHeight+'px';host.style.aspectRatio='auto';
 if(mode==='cahill-keyes'){
  labAtlasMode=mode;host.classList.add('lab-cahill-active');
  frame?.classList.add('lab-cahill-frame');
  frame?.classList.remove('lab-globe-frame');
  const home=doc.getElementById('atlasHome');
  if(home)home.textContent='← WHOLE WORLD';
  host.setAttribute('aria-label','Interactive Cahill–Keyes world map');
  labCahillSync();
  if(crateSelected.size||atlasFocus)labCahillFocus('selected');else labCahill.reset();
  svg.style.opacity='0';
 }else{
  // Commit the real MapLibre destination behind the opaque Cahill card.
  svg.style.opacity='1';
  labAtlasCommitMode(mode,true);
  host.style.height=targetHeight+'px';
  labGlobe.resize();
  host.style.height=fromHeight+'px';
 }
 let began=0;
 const smooth=t=>{const q=Math.min(1,Math.max(0,t));return q*q*(3-2*q)};
 const finish=()=>{
  if(labAtlasMorph!==state||state.done)return;
  state.done=true;cancelAnimationFrame(state.raf);
  host.style.height='';
  host.style.aspectRatio=mode==='cahill-keyes'?'960 / 505':
   mode==='globe'?'1 / 1':'720 / 372';
  if(mode==='cahill-keyes')svg.style.opacity='1';
  else{
   svg.style.display='none';svg.style.opacity='0';
   host.classList.remove('lab-cahill-active');
   frame?.classList.remove('lab-cahill-frame');
  }
  labGlobe.resize();
  if(mode!=='cahill-keyes'){
   if(mode==='robinson')labGlobe.setMinZoom(labRobinsonMinimumZoom());
   labGlobe.jumpTo({center:labAtlasHome(),zoom:labGlobeHomeZoom(),bearing:0,pitch:0});
  }
  host.style.pointerEvents=oldPointer;
  svg.style.pointerEvents=mode==='cahill-keyes'?'auto':'none';
  labAtlasMorph=null;
  window.__labAtlasLastCahillSwitch={from,to:mode,duration,finished:true};
  const next=state.queued;
  if(next&&next!==labAtlasMode)labSetAtlasMode(next);
 };
 const begin=()=>{
  if(state.started||labAtlasMorph!==state)return;
  state.started=true;
  if(duration===0){finish();return}
  const tick=now=>{
   if(labAtlasMorph!==state)return;
   if(!began)began=now;
   const t=smooth((now-began)/duration);
   host.style.height=(fromHeight+(targetHeight-fromHeight)*t).toFixed(2)+'px';
   // Hold the map opaque until the final 35% when leaving, so that
   // a MapLibre resize cannot peek out before its new projection is painted.
   const opacity=mode==='cahill-keyes'?t:1-smooth((t-.65)/.35);
   svg.style.opacity=String(opacity);
   if(t>=1)finish();else state.raf=requestAnimationFrame(tick);
  };
  state.raf=requestAnimationFrame(tick);
  // Background WebViews may freeze animation frames.
  setTimeout(finish,duration+650);
 };
 if(mode==='cahill-keyes'){begin();return}
 const onRender=()=>{
  const expected=mode==='globe'?'globe':'mercator';
  if(labGlobe.getProjection()?.type!==expected||
     !labGlobe.isStyleLoaded()||!labGlobe.isSourceLoaded('land'))return;
  labGlobe.off('render',onRender);begin();
 };
 labGlobe.on('render',onRender);
 labGlobe.once('idle',()=>{labGlobe.off('render',onRender);begin()});
 labGlobe.triggerRepaint();
 setTimeout(()=>{labGlobe.off('render',onRender);begin()},950);
}
