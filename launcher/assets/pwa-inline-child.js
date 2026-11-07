/* Atlas-only document inside the PWA Jukebox. The normal Android
   app is a backend dependency of the map engine, NOT a second visible UI. */
(function(){
'use strict';
const TYPE='ghg-inline-atlas';
function notify(suffix,fields={}){
 if(window.parent===window)return;
 try{parent.postMessage({type:TYPE+'-'+suffix,...fields},location.origin)}catch(_){}
}
function init(){
 const dock=document.getElementById('pwaInlineAtlasRoot');
 const chart=document.querySelector('.crate-map-frame');
 if(!dock||!chart)return;
 const modes=document.querySelector('.lab-atlas-modes');
 if(!modes||!window.labAtlasGlobe||!window.HipsterInlineAtlas)return;
 // Keep the real original chart, MapLibre map, and Cahill SVG. Move the two
 // visible map nodes after they are initialized, preserving event listeners.
 dock.append(modes,chart);
 document.body.classList.add('pwa-atlas-only');
 document.querySelector('.site')?.setAttribute('hidden','');
 document.querySelector('.lab-rail')?.setAttribute('hidden','');
 document.querySelectorAll('.lab-page').forEach(el=>el.setAttribute('hidden',''));
 const oldPanel=document.getElementById('crateGeo');if(oldPanel)oldPanel.open=true;
 const map=window.labAtlasGlobe;
 map.resize();
 const observer=new ResizeObserver(()=>{
  const height=dock.getBoundingClientRect().height;
  if(height>=150)notify('height',{height:Math.min(860,height)});
 });
 observer.observe(dock);
 notify('ready',{regions:window.HipsterInlineAtlas.getRegions()});
 const sendHeight=()=>notify('height',{height:dock.getBoundingClientRect().height});
 requestAnimationFrame(sendHeight);
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==window.parent)return;
  const data=event.data;
  if(data?.type===TYPE+'-set-regions'&&Array.isArray(data.regions))
   window.HipsterInlineAtlas.setRegions(data.regions);
  if(data?.type===TYPE+'-theme'){
   window.GHGAtlasTheme?.apply?.();
   document.documentElement.dataset.pwaTheme=
    window.GHGAtlasTheme?.current?.()||'liberi';
  }
 });
 window.addEventListener('pagehide',()=>observer.disconnect());
}
document.addEventListener('DOMContentLoaded',()=>{
 // Native Atlas owns async MapLibre readiness; never spin up another map.
 const max=performance.now()+18000;
 function check(){
  if(document.querySelector('.lab-atlas-modes')&&window.labAtlasGlobe?.loaded()){
   init();return;
  }
  if(performance.now()<max)requestAnimationFrame(check);
  else notify('unavailable',{reason:'Atlas graphics unavailable'});
 }
 check();
});
})();
