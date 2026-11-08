/* Android Lab appearance: exact Liberi, Bosque and Usiku browser palettes.
   This early document script leaves native app state and map geometry alone. */
(function(){
'use strict';
const KEY='ghg-lab-theme-v1',THEMES=['liberi','bosque','usiku'];
/* Single paint contract for the three REAL projections and their cached
   animation frames. Geometry, sprites, camera and transitions are unchanged.
   CSS receives identical roles via --lab-atlas-*; no per-projection palette. */
const ATLAS=Object.freeze({
 liberi:Object.freeze({
  paper:'#dfb045',land:'#dfb045',ocean:'#103135',ink:'#103135',
  selected:'#a83223',route:'#edc65d',routeOpacity:.65,routeWidth:1,
  routeDash:[3,5],backdrop:'#dfb045',field:'#dfb045',
  graticule:'#dfb045',graticuleOpacity:.21,
  oceanStroke:'#103135',oceanStrokeOpacity:1
 }),
 bosque:Object.freeze({
  paper:'#004225',land:'#004225',ocean:'#e8e9df',ink:'#003018',
  selected:'#e5cf42',route:'#8c6239',routeOpacity:.88,routeWidth:1.2,
  routeDash:[3,2.6],backdrop:'#f5f0e6',field:'#f5f0e6',
  graticule:'#8c6239',graticuleOpacity:.24,
  oceanStroke:'#003018',oceanStrokeOpacity:1
 }),
 usiku:Object.freeze({
  paper:'#f5f0e6',land:'#f5f0e6',ocean:'#111111',ink:'#003018',
  selected:'#e5cf42',route:'#b77b4d',routeOpacity:.88,routeWidth:1.2,
  routeDash:[3,2.6],backdrop:'#003018',
  field:'radial-gradient(ellipse at 50% 38%,#004225 0%,#003018 78%)',
  graticule:'#b77b4d',graticuleOpacity:.2,
  oceanStroke:'#b77b4d',oceanStrokeOpacity:.72
 })
});
const CSS_ATLAS_ROLES={
 paper:'paper',land:'land',ocean:'ocean',ink:'ink',
 selected:'selected',route:'route',backdrop:'backdrop',
 field:'field',graticule:'graticule',
 'graticule-opacity':'graticuleOpacity',
 'ocean-stroke':'oceanStroke',
 'ocean-stroke-opacity':'oceanStrokeOpacity',
 'route-width':'routeWidth','route-opacity':'routeOpacity'
};
function applyAtlasTokens(){
 const style=document.documentElement.style,palette=ATLAS[theme];
 for(const [role,property] of Object.entries(CSS_ATLAS_ROLES))
  style.setProperty('--lab-atlas-'+role,String(palette[property]));
}
function saved(){
 try{const value=localStorage.getItem(KEY);return THEMES.includes(value)?value:'liberi'}
 catch(_){return 'liberi'}
}
let theme=saved(),atlas=null,defaults=null,frame=0;
document.documentElement.dataset.pwaTheme=theme;
applyAtlasTokens();
window.GHGAtlasPaintColors=()=>({theme,...ATLAS[theme]});
function refreshButtons(){
 document.querySelectorAll('[data-lab-theme]').forEach(button=>
  button.setAttribute('aria-pressed',String(button.dataset.labTheme===theme)));
}
function paint(){
 const map=atlas,palette=ATLAS[theme];
 if(!map||!map.getLayer?.('land'))return;
 try{
  if(!defaults){
   defaults={};
   const properties={land:['fill-color'],borders:['line-color'],
    ocean:['background-color'],'robinson-ocean':['fill-color'],routes:['line-color']};
   for(const [layer,props] of Object.entries(properties)){
    if(!map.getLayer(layer))continue;
    defaults[layer]={};
    for(const prop of props)defaults[layer][prop]=map.getPaintProperty(layer,prop);
   }
  }
  // Keep MapLibre land, true ocean plate, coastlines and shipping lanes
  // on the same palette as Cahill SVG and the vector/tween renderers.
  const desired={
   land:{'fill-color':['case',['boolean',['feature-state','selected'],false],
    palette.selected,palette.land]},
   borders:{'line-color':palette.ink},
   ocean:{'background-color':map.getProjection()?.type==='mercator'?
    'rgba(0,0,0,0)':palette.ocean},
   'robinson-ocean':{'fill-color':palette.ocean},
   routes:{'line-color':palette.route,'line-opacity':palette.routeOpacity,
    'line-width':palette.routeWidth,'line-dasharray':palette.routeDash}
  };
  for(const [layer,paints] of Object.entries(desired)){
   if(!map.getLayer(layer))continue;
   for(const [property,value] of Object.entries(paints)){
    if(JSON.stringify(map.getPaintProperty(layer,property))!==JSON.stringify(value))
     map.setPaintProperty(layer,property,value);
   }
  }
 }catch(e){console.warn('Android Atlas palette check failed',e)}
}
function requestPaint(){
 if(frame)return;
 frame=requestAnimationFrame(()=>{frame=0;paint()});
}
function attach(){
 const map=window.labAtlasGlobe;
 if(!map||map===atlas)return Boolean(map);
 atlas=map;defaults=null;
 map.on('load',requestPaint);
 map.on('styledata',requestPaint);
 map.on('idle',requestPaint);
 requestPaint();
 return true;
}
function syncManualTheme(){
 const frame=document.getElementById('labManualFrame');
 try{
  const guide=frame?.contentDocument;
  if(guide&&guide.documentElement.dataset.pwaTheme!==theme)
   guide.documentElement.dataset.pwaTheme=theme;
 }catch(e){console.warn('Manual theme synchronization unavailable',e)}
}
function setTheme(next,persist){
 if(!THEMES.includes(next))return false;
 // The base Liberi palette is already in the canonical stylesheet.
 // Load the shared additional rules only for the two alternate themes.
 for(const link of document.querySelectorAll('link[data-lab-palette-style]'))
  link.media=next==='liberi'?'not all':'all';
 if(persist){
  try{localStorage.setItem(KEY,next)}catch(e){
   const status=document.getElementById('labThemeStatus');
   if(status)status.textContent='Appearance applied for this visit. Device storage unavailable.';
  }
 }
 if(theme!==next){theme=next;document.documentElement.dataset.pwaTheme=theme;
  applyAtlasTokens();requestPaint();syncManualTheme();window.dispatchEvent(new Event('ghg-lab-theme-change'))}
 refreshButtons();
 if(persist){
  const status=document.getElementById('labThemeStatus');
  if(status&&!status.textContent.includes('unavailable'))status.textContent='Appearance saved on this device.';
 }
 return true;
}
document.addEventListener('click',event=>{
 const choice=event.target.closest?.('[data-lab-theme]');
 if(choice)setTheme(choice.dataset.labTheme,true);
});
document.addEventListener('DOMContentLoaded',()=>{
 refreshButtons();
 const guide=document.getElementById('labManualFrame');
 guide?.addEventListener('load',syncManualTheme);
 syncManualTheme();
 // Legacy SVG mode deliberately has no MapLibre map. Do not leave a
 // document-wide MutationObserver running forever on atlas DOM updates.
 if(new URLSearchParams(location.search).get('atlas')==='legacy')return;
 // The canonical Android map initializes asynchronously, only once.
 const observer=new MutationObserver(()=>{if(attach())observer.disconnect()});
 observer.observe(document.body,{childList:true,subtree:true});
 if(attach())observer.disconnect();
});
window.HipsterLabTheme=Object.freeze({current:()=>theme,set:setTheme,colors:()=>ATLAS[theme],refresh:requestPaint});
})();
