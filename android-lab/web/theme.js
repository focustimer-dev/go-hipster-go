/* Android Lab appearance: exact Liberi, Bosque and Usiku browser palettes.
   This early document script leaves native app state and map geometry alone. */
(function(){
'use strict';
const KEY='ghg-lab-theme-v1',THEMES=['liberi','bosque','usiku'];
const PALETTES={
 liberi:{ocean:'#103135',land:'#dfb045',ink:'#103135',selected:'#a83223',route:'#a83223'},
 bosque:{ocean:'#f5f0e6',land:'#004225',ink:'#003018',selected:'#e5cf42',route:'#8c6239'},
 usiku:{ocean:'#111111',land:'#f5f0e6',ink:'#003018',selected:'#e5cf42',route:'#b77b4d'}
};
const TWEEN={
 liberi:{paper:'#dfb045',ocean:'#103135',selected:'#a83223',ink:'#103135',backdrop:'#dfb045'},
 bosque:{paper:'#004225',ocean:'#f5f0e6',selected:'#e5cf42',ink:'#003018',backdrop:'#f5f0e6'},
 usiku:{paper:'#f5f0e6',ocean:'#111111',selected:'#e5cf42',ink:'#003018',backdrop:'#003018'}
};
function saved(){
 try{const value=localStorage.getItem(KEY);return THEMES.includes(value)?value:'liberi'}
 catch(_){return 'liberi'}
}
let theme=saved(),atlas=null,defaults=null,frame=0;
document.documentElement.dataset.pwaTheme=theme;
window.GHGAtlasPaintColors=()=>({theme,...TWEEN[theme]});
function refreshButtons(){
 document.querySelectorAll('[data-lab-theme]').forEach(button=>
  button.setAttribute('aria-pressed',String(button.dataset.labTheme===theme)));
}
function paint(){
 const map=atlas,palette=PALETTES[theme];
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
  const desired=theme==='liberi'?{
   land:{'fill-color':['case',['boolean',['feature-state','selected'],false],
     '#a83223','#dfb045']},
   borders:{'line-color':'#103135'},
   ocean:{'background-color':map.getProjection()?.type==='mercator'?'rgba(0,0,0,0)':'#103135'},
   'robinson-ocean':{'fill-color':'#103135'},
   'robinson-outline':{'line-color':'#103135','line-width':1.15,'line-opacity':.8},
   // Keep the original ink and dash rhythm in Liberi, even when the
   // map's routes layer was added after the first palette snapshot.
   routes:{'line-color':'#edc65d','line-opacity':.65,
    'line-width':1,'line-dasharray':[3,5]}
  }:{
   land:{'fill-color':['case',['boolean',['feature-state','selected'],false],
     palette.selected,palette.land]},
   borders:{'line-color':palette.ink},
   ocean:{'background-color':map.getProjection()?.type==='mercator'?'rgba(0,0,0,0)':palette.ocean},
   'robinson-ocean':{'fill-color':palette.ocean},
   'robinson-outline':{'line-color':theme==='usiku'?'#b77b4d':palette.ink,
    'line-width':theme==='bosque'?1.4:1.15,'line-opacity':theme==='bosque'?.85:.72},
   // At 390px the original 1px/.65-alpha dashes nearly vanish against
   // Bosque's cream ocean and Usiku's night sea; keep routes discoverable.
   routes:{'line-color':palette.route,'line-opacity':.88,
    'line-width':1.7,'line-dasharray':[3,2.6]}
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
 if(persist){
  try{localStorage.setItem(KEY,next)}catch(e){
   const status=document.getElementById('labThemeStatus');
   if(status)status.textContent='Appearance applied for this visit. Device storage unavailable.';
  }
 }
 if(theme!==next){theme=next;document.documentElement.dataset.pwaTheme=theme;
  requestPaint();syncManualTheme();window.dispatchEvent(new Event('ghg-lab-theme-change'))}
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
 // The canonical Android map initializes asynchronously, only once.
 const observer=new MutationObserver(()=>{if(attach())observer.disconnect()});
 observer.observe(document.body,{childList:true,subtree:true});
 if(attach())observer.disconnect();
});
window.HipsterLabTheme=Object.freeze({current:()=>theme,set:setTheme,colors:()=>PALETTES[theme],refresh:requestPaint});
})();
