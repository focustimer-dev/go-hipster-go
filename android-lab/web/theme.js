/* Android Lab appearance: exact Liberi, Bosque and Usiku browser palettes.
   This early document script leaves native app state and map geometry alone. */
(function(){
'use strict';
const KEY='ghg-lab-theme-v1',THEMES=['liberi','bosque','usiku'];
// Pilot themes are URL/QA-only, never persisted or exposed in Preferences.
const PILOTS=['kingston'];
const preview=new URLSearchParams(location.search).get('theme');
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
 }),
 kingston:Object.freeze({
  // Aged Studio One paper with inked wax, not black photocopier stock.
  paper:'#d3c4a8',land:'#d3c4a8',ocean:'#273d3b',ink:'#263f3e',
  selected:'#6d9991',route:'#7ba39b',routeOpacity:.73,routeWidth:1.15,
  routeDash:[3,3],backdrop:'#e3d9c2',field:'#e3d9c2',
  graticule:'#6d9991',graticuleOpacity:.18,
  oceanStroke:'#263f3e',oceanStrokeOpacity:.92
 })
});
/* These color roles control PRINTED mood tiles and labels. The artwork
   itself remains the approved transparent plate; special Funk, Desire and
   Triumph alpha masks are not recolored or regenerated here. */
const MOODS=Object.freeze({
 liberi:Object.freeze({
  neutralPaper:'#dfb045',neutralInk:'#103135',
  selectedPaper:'#d64b30',selectedInk:'#103135',
  desireHeart:'#e03fd8',funkPaper:'#e03fd8',funkInk:'#103135'
 }),
 bosque:Object.freeze({
  neutralPaper:'#f5f0e6',neutralInk:'#003018',
  selectedPaper:'#e5cf42',selectedInk:'#003018',
  desireHeart:'#8e3069',funkPaper:'#6e225c',funkInk:'#f2c84e'
 }),
 usiku:Object.freeze({
  neutralPaper:'radial-gradient(ellipse farthest-corner at 50% 36%,#b77b4d 0%,#a86c43 34%,#925b39 68%,#7e4c30 100%)',
  neutralInk:'#063821',selectedPaper:'#e5cf42',selectedInk:'#003018',
  desireHeart:'#8e3069',funkPaper:'#6e225c',funkInk:'#f2c84e'
 }),
 kingston:Object.freeze({
  // Selected stock is still LABEL PAPER; the stamped outline indicates state.
  // Funk retains its own approved pink pressing and original source shading.
  neutralPaper:'#e3d9c2',neutralInk:'#263f3e',
  selectedPaper:'#d2c3a6',selectedInk:'#244643',
  desireHeart:'#657f78',funkPaper:'#e4cbe4',funkInk:'#08252a'
 })
});
const CSS_MOOD_ROLES={
 'neutral-paper':'neutralPaper','neutral-ink':'neutralInk',
 'selected-paper':'selectedPaper','selected-ink':'selectedInk',
 'desire-hearts':'desireHeart','funk-paper':'funkPaper','funk-ink':'funkInk'
};
const CSS_ATLAS_ROLES={
 paper:'paper',land:'land',ocean:'ocean',ink:'ink',
 selected:'selected',route:'route',backdrop:'backdrop',
 field:'field',graticule:'graticule',
 'graticule-opacity':'graticuleOpacity',
 'ocean-stroke':'oceanStroke',
 'ocean-stroke-opacity':'oceanStrokeOpacity',
 'route-width':'routeWidth','route-opacity':'routeOpacity'
};
function applyThemeTokens(){
 const style=document.documentElement.style,palette=ATLAS[theme],mood=MOODS[theme];
 for(const [role,property] of Object.entries(CSS_ATLAS_ROLES))
  style.setProperty('--lab-atlas-'+role,String(palette[property]));
 for(const [role,property] of Object.entries(CSS_MOOD_ROLES))
  style.setProperty('--lab-mood-'+role,String(mood[property]));
}
function saved(){
 try{const value=localStorage.getItem(KEY);return THEMES.includes(value)?value:'liberi'}
 catch(_){return 'liberi'}
}
let theme=PILOTS.includes(preview)?preview:saved(),atlas=null,defaults=null,frame=0;
document.documentElement.dataset.pwaTheme=theme;
document.documentElement.dataset.ghgThemeProfile=PILOTS.includes(theme)?'print':'';
applyThemeTokens();
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
  if(guide){
   if(guide.documentElement.dataset.pwaTheme!==theme)
    guide.documentElement.dataset.pwaTheme=theme;
   guide.documentElement.dataset.ghgThemeProfile=PILOTS.includes(theme)?'print':'';
  }
 }catch(e){console.warn('Manual theme synchronization unavailable',e)}
}
function setTheme(next,persist){
 if(!THEMES.includes(next)&&!PILOTS.includes(next))return false;
 if(PILOTS.includes(next)&&persist)return false;
 // The base Liberi palette is already in the canonical stylesheet.
 // Load the shared additional rules only for the two alternate themes.
 for(const link of document.querySelectorAll('link[data-lab-palette-style]'))
  link.media=next==='liberi'?'not all':'all';
 for(const link of document.querySelectorAll('link[data-lab-print-style]'))
  link.media=PILOTS.includes(next)?'all':'not all';
 if(persist){
  try{localStorage.setItem(KEY,next)}catch(e){
   const status=document.getElementById('labThemeStatus');
   if(status)status.textContent='Appearance applied for this visit. Device storage unavailable.';
  }
 }
 if(theme!==next){theme=next;document.documentElement.dataset.pwaTheme=theme;
  document.documentElement.dataset.ghgThemeProfile=PILOTS.includes(theme)?'print':'';
  applyThemeTokens();requestPaint();syncManualTheme();window.dispatchEvent(new Event('ghg-lab-theme-change'))}
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
window.HipsterLabTheme=Object.freeze({current:()=>theme,set:setTheme,colors:()=>ATLAS[theme],moods:()=>MOODS[theme],pilot:()=>PILOTS.includes(theme),refresh:requestPaint});
})();
