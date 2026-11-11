/* Preview-only browser bridge for the actual Android Lab 0.9.56 atlas.
   No native APIs, background writes, remote network fetch or separate accounts.
   Regional selections and existing Jukebox options share their ordinary keys. */
(function(){
'use strict';
const KEY='ghg-pwa-crate-v1', REF='ghg-pwa-reference-v1', PREF='ghg-pwa-atlas-prefs-v1';
const THEME_KEY='ghg-pwa-theme-v1', THEMES=['liberi','bosque','usiku','kingston','detroit','addis','polish','beirut','michoacan'];
const PRINT_THEMES=new Set(['kingston','detroit','addis','polish','beirut','michoacan']);
const ATLAS_PALETTES={
 michoacan:{ocean:'#24191b',land:'#d1ad91',ink:'#49232b',selected:'#e5b653',route:'#e5b653',routeOpacity:.78,routeWidth:1.1,routeDash:[3,4]},
 bosque:{ocean:'#e8e9df',land:'#004225',ink:'#003018',selected:'#e5cf42',route:'#8c6239'},
 usiku:{ocean:'#111111',land:'#f5f0e6',ink:'#003018',selected:'#e5cf42',route:'#b77b4d'},
 kingston:{ocean:'#273d3b',land:'#d3c4a8',ink:'#263f3e',selected:'#6d9991',route:'#7ba39b',routeOpacity:0.73,routeWidth:1.15,routeDash:[3,3]},
 detroit:{ocean:'#151515',land:'#d6d6c9',ink:'#181818',selected:'#d5e644',route:'#d5e644',routeOpacity:0.72,routeWidth:1.05,routeDash:[3,3]},
 addis:{ocean:'#0f4a48',land:'#e1cfaa',ink:'#2d251f',selected:'#d17d32',route:'#d99d51',routeOpacity:0.7,routeWidth:1.15,routeDash:[3,4]},
 polish:{ocean:'#172c40',land:'#f6f2e6',ink:'#172c40',selected:'#e34c2f',route:'#d8bd67',routeOpacity:0.78,routeWidth:1.08,routeDash:[2.5,4]},
 beirut:{ocean:'#1c3240',land:'#d9c9ad',ink:'#1c3240',selected:'#a84950',route:'#c5a06d',routeOpacity:0.76,routeWidth:1.07,routeDash:[3,3.6]},
};
function atlasTheme(){
 try{const v=localStorage.getItem(THEME_KEY);return THEMES.includes(v)?v:'liberi'}
 catch(_){return 'liberi'}
}
/* Dynamic browser-only paints for native projection tween canvases.
   The isolated PWA build opts in. Android's exact bundles stay untouched. */
// Legible on small phones while keeping the original dotted nautical feel.
// The original Liberi treatment is restored byte-for-byte on theme switch.
const LIBERI_ROUTE_PAINT={'line-color':'#edc65d','line-opacity':.65,
 'line-width':1,'line-dasharray':[3,5]};
const THEMED_ROUTE_PAINT={opacity:.88,width:1.7,dash:[3,2.6]};
const TWEEN_PALETTES={
 michoacan:{paper:'#d1ad91',ocean:'#24191b',selected:'#e5b653',ink:'#49232b',backdrop:'#6a2430',land:'#d1ad91',route:'#e5b653'},
 liberi:{paper:'#dfb045',ocean:'#103135',selected:'#a83223',ink:'#103135',backdrop:'#dfb045'},
 bosque:{paper:'#004225',ocean:'#e8e9df',selected:'#e5cf42',ink:'#003018',backdrop:'#f5f0e6'},
 usiku:{paper:'#f5f0e6',ocean:'#111111',selected:'#e5cf42',ink:'#003018',backdrop:'#003018'},
 kingston:{paper:'#d3c4a8',ocean:'#273d3b',selected:'#6d9991',ink:'#263f3e',backdrop:'#e3d9c2',land:'#d3c4a8',route:'#7ba39b'},
 detroit:{paper:'#e7e5db',ocean:'#151515',selected:'#d5e644',ink:'#181818',backdrop:'#e7e5db',land:'#d6d6c9',route:'#d5e644'},
 addis:{paper:'#f2e8ce',ocean:'#0f4a48',selected:'#d17d32',ink:'#2d251f',backdrop:'#f2e8ce',land:'#e1cfaa',route:'#d99d51'},
 polish:{paper:'#f6f2e6',ocean:'#172c40',selected:'#e34c2f',ink:'#172c40',backdrop:'#f6f2e6',land:'#f6f2e6',route:'#d8bd67'},
 beirut:{paper:'#e3d8bf',ocean:'#1c3240',selected:'#a84950',ink:'#1c3240',backdrop:'#e3d8bf',land:'#d9c9ad',route:'#c5a06d'},
};
window.GHGAtlasPaintColors=()=>({theme:atlasTheme(),...TWEEN_PALETTES[atlasTheme()]});
/* Theme changes may reach an already-loaded iframe via the storage event.
   Keep its print stylesheet and Atlas CSS roles in step with MapLibre. */
let appliedBrowserTheme='';
function applyBrowserTheme(theme){
 if(theme===appliedBrowserTheme)return;
 appliedBrowserTheme=theme;
 const root=document.documentElement,print=PRINT_THEMES.has(theme);
 root.dataset.pwaTheme=theme;
 root.dataset.ghgThemeProfile=print?'print':'';
 for(const link of document.querySelectorAll('link[data-lab-print-style]'))
  link.media=print?'all':'not all';
 const palette=ATLAS_PALETTES[theme],tween=TWEEN_PALETTES[theme],roles=[
  'paper','land','ocean','ink','selected','route','backdrop','field',
  'graticule','ocean-stroke','route-opacity','route-width'
 ];
 for(const role of roles)root.style.removeProperty('--lab-atlas-'+role);
 if(print&&palette&&tween){
  const paint={...palette,...tween,field:tween.backdrop,
   graticule:palette.route,'ocean-stroke':palette.ink,
   'route-opacity':palette.routeOpacity,'route-width':palette.routeWidth};
  for(const role of roles){
   const value=paint[role];
   if(value!==undefined)root.style.setProperty('--lab-atlas-'+role,String(value));
  }
 }
}
applyBrowserTheme(atlasTheme());
const services={chatgpt:'https://chatgpt.com/',gemini:'https://gemini.google.com/app',
 claude:'https://claude.ai/'};
function read(key,fallback){
 try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch(_){return fallback}
}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
function reference(){try{return localStorage.getItem(REF)||''}catch(_){return ''}}
function storeReference(value){try{localStorage.setItem(REF,value);return true}catch(_){return false}}
function crate(){
 const x=read(KEY,{});return {
  saved:Array.isArray(x.saved)?x.saved.filter(i=>i&&typeof i.prompt==='string').slice(-10):[],
  recent:Array.isArray(x.recent)?x.recent.filter(i=>i&&typeof i.text==='string').slice(0,3):[]
 };
}
function changed(){try{(window.HipsterLabRefresh||window.HipsterLabStateChanged)?.()}catch(e){console.warn('Atlas preview state refresh failed',e)}}
function prefs(){return read(PREF,{mode:'browser',oneTap:false,haptics:false})}
/* Browser-only MapLibre paint adapter. The canonical Android style and
   projection transition code stay untouched. An expression maintains native
   feature-state selection, including region changes and projection switches. */
let atlasThemeMap=null,atlasThemeFrame=0,atlasThemeDefaults=null;
function paintAtlasTheme(){
 const map=atlasThemeMap,theme=atlasTheme(),palette=ATLAS_PALETTES[theme];
 applyBrowserTheme(theme);
 if(!map||!map.getLayer?.('land'))return;
 try{
  // Capture the unmodified Android MapLibre paints once, before applying a
  // browser palette. A cross-tab switch back to Liberi must restore them.
  if(!atlasThemeDefaults){
   atlasThemeDefaults={};
   const properties={land:['fill-color'],borders:['line-color'],
    ocean:['background-color'],'robinson-ocean':['fill-color'],routes:['line-color']};
   for(const [layer,props] of Object.entries(properties)){
    if(!map.getLayer(layer))continue;
    atlasThemeDefaults[layer]={};
    for(const prop of props)
     atlasThemeDefaults[layer][prop]=map.getPaintProperty(layer,prop);
   }
  }
  const desired=palette?{
   land:{'fill-color':['case',['boolean',['feature-state','selected'],false],
     palette.selected,palette.land]},
   borders:{'line-color':palette.ink},
   ocean:{'background-color':map.getProjection()?.type==='mercator'?'rgba(0,0,0,0)':palette.ocean},
   'robinson-ocean':{'fill-color':palette.ocean},
   routes:{'line-color':palette.route,
    'line-opacity':palette.routeOpacity??THEMED_ROUTE_PAINT.opacity,
    'line-width':THEMED_ROUTE_PAINT.width,
    'line-dasharray':palette.routeDash??THEMED_ROUTE_PAINT.dash}
  }:{...atlasThemeDefaults,
   // Restoring original Liberi must also restore the projection-dependent
   // exterior: yellow paper outside Robinson, petrol in the actual sea.
   ocean:{'background-color':map.getProjection()?.type==='mercator'?'rgba(0,0,0,0)':'#103135'},
   'robinson-ocean':{'fill-color':'#103135'},
   routes:LIBERI_ROUTE_PAINT};
  for(const [layer,paints] of Object.entries(desired)){
   if(!map.getLayer(layer))continue;
   for(const [prop,value] of Object.entries(paints)){
    if(JSON.stringify(map.getPaintProperty(layer,prop))!==JSON.stringify(value))
     map.setPaintProperty(layer,prop,value);
   }
  }
 }catch(e){console.warn('Atlas palette could not be applied',e)}
}
function requestAtlasThemePaint(){
 if(atlasThemeFrame)return;
 atlasThemeFrame=requestAnimationFrame(()=>{atlasThemeFrame=0;paintAtlasTheme()});
}
function attachAtlasTheme(){
 const map=window.labAtlasGlobe;
 if(!map||map===atlasThemeMap)return !!map;
 atlasThemeMap=map;
 atlasThemeDefaults=null;
 map.on('load',requestAtlasThemePaint);
 map.on('styledata',requestAtlasThemePaint);
 map.on('idle',requestAtlasThemePaint);
 requestAtlasThemePaint();
 return true;
}
window.addEventListener('storage',event=>{
 if(event.key===THEME_KEY||event.key===null)requestAtlasThemePaint();
});
window.addEventListener('DOMContentLoaded',()=>{
 const observe=new MutationObserver(()=>{if(attachAtlasTheme())observe.disconnect()});
 observe.observe(document.body,{childList:true,subtree:true});
 if(attachAtlasTheme())observe.disconnect();
});
window.GHGAtlasTheme=Object.freeze({current:atlasTheme,apply:paintAtlasTheme});
function state(){
 const saved=crate(),p=prefs();
 const active=reference(),found=saved.recent.find(x=>x.text===active);
 const preview=found?{title:found.title||'',description:found.description||'',metadataStatus:found.metadataStatus||'',loading:active===loadingReference}:{};

 return JSON.stringify({
  saved:saved.saved,recentInspirations:saved.recent,activeInspiration:active,inspirationPreview:preview,
  mode:p.mode||'browser',oneTap:false,haptics:false,updateAvailable:false
 });
}
async function copy(value){
 const text=String(value||'');
 try{await navigator.clipboard.writeText(text);return true}catch(_){}
 try{
  const area=document.createElement('textarea');
  area.value=text;area.style.cssText='position:fixed;left:-9999px;top:0';
  document.body.appendChild(area);area.select();
  const ok=document.execCommand('copy');area.remove();return !!ok;
 }catch(_){return false}
}
let loadingReference='',previewSeq=0,previewController=null;
function urlIn(text){
 const match=String(text||'').match(/https:\/\/[^\s<>"']+/i);
 if(!match)return '';
 let link=match[0].replace(/[.,;!?]+$/,'');
 let depth=0;for(const char of link){if(char==='(')depth++;if(char===')')depth--}
 while(depth<0&&link.endsWith(')')){link=link.slice(0,-1);depth++}
 return link;
}
async function refreshPreview(value){
 previewController?.abort();const original=urlIn(value);
 loadingReference=original?value:'';changed();
 if(!original)return;
 const seq=++previewSeq,controller=new AbortController();previewController=controller;
 try{
  const response=await fetch('/api/inspiration-preview?url='+encodeURIComponent(original),
   {headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit',cache:'no-store'});
  if(!response.ok)throw new Error('Preview unavailable');
  const info=await response.json();
  if(controller.signal.aborted||seq!==previewSeq||reference()!==value)return;
  const data=crate(),entry=data.recent.find(x=>x.text===value);
  if(!entry)return;
  entry.title=typeof info.title==='string'?info.title.slice(0,140):'';
  entry.description=typeof info.description==='string'?info.description.slice(0,240):'';
  entry.provider=typeof info.provider==='string'?info.provider.slice(0,40):'';
  entry.metadataStatus=info.status==='ok'&&entry.title?'ok':info.status==='unsupported'?'unsupported':'unavailable';
  save(KEY,data);
 }catch(_){
  if(!controller.signal.aborted&&seq===previewSeq&&reference()===value){
   const data=crate(),entry=data.recent.find(x=>x.text===value);
   if(entry){entry.metadataStatus='unavailable';save(KEY,data)}
  }
 }finally{if(seq===previewSeq){loadingReference='';previewController=null;changed()}}
}
function useInspiration(value){
 if(typeof value!=='string'||![...value].length||[...value].length>2000)return false;
 if(!storeReference(value))return false;
 const x=crate();
 const previous=x.recent.find(i=>i.text===value);
 x.recent=x.recent.filter(i=>i.text!==value);
 x.recent.unshift({...previous,id:previous?.id||String(Date.now()),text:value,time:Date.now()});
 x.recent=x.recent.slice(0,3);
 save(KEY,x);changed();
 if(!previous?.title)refreshPreview(value);
 return true;
}
function showSaved(id){
 const selected=crate().saved.find(x=>x.id===id);
 if(!selected)return;
 const dialog=document.createElement('dialog');
 dialog.style.cssText='background:#dfb045;color:#103135;border:2px solid #103135;max-width:min(95vw,520px);max-height:82dvh;overflow:auto;padding:20px';
 const heading=document.createElement('h2');heading.textContent=selected.name||'Saved request';
 const prompt=document.createElement('pre');prompt.textContent=selected.prompt;prompt.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-height:45dvh;overflow:auto';
 const status=document.createElement('p');status.setAttribute('role','status');
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='min-height:44px;margin:4px;padding:8px;border:1px solid #103135;background:transparent;color:inherit';b.onclick=fn;return b};
 dialog.append(heading,prompt,status,
  button('COPY',async()=>{status.textContent=(await copy(selected.prompt))?'Request copied.':'Clipboard unavailable. Select the text to copy.'}),
  button('DELETE',()=>{if(!confirm('Delete this request from this browser?'))return;const x=crate();x.saved=x.saved.filter(i=>i.id!==id);if(save(KEY,x)){dialog.close();changed()}}),
  button('CLOSE',()=>dialog.close()));
 dialog.onclose=()=>dialog.remove();document.body.appendChild(dialog);dialog.showModal();
}
window.HipsterLab=Object.freeze({
 state,inspiration:reference,copy,
 // Browser GO is copy-first. Never claim to have opened or sent to an AI.
 go:()=>{},
 open:(ai)=>{const url=services[ai];if(url)location.assign(url)},
 share:async text=>{try{if(navigator.share)await navigator.share({text:String(text)});else await copy(text)}catch(e){}},
 applyInspiration:useInspiration,
 clearInspiration:()=>{previewController?.abort();previewSeq++;loadingReference='';if(storeReference(''))changed()},
 useRecentInspiration:id=>{const found=crate().recent.find(x=>x.id===id);if(found)useInspiration(found.text)},
 saveRequest:(ai,prompt)=>{
  const name=window.prompt('Name this saved request');
  if(!name?.trim())return;
  const x=crate();if(x.saved.length>=10){alert('Crate full. Delete a saved request first.');return}
  x.saved.push({id:String(Date.now()),name:name.trim().slice(0,80),ai,prompt:String(prompt),time:Date.now()});
  if(save(KEY,x))changed();
 },
 savedRequest:showSaved,showUpdates:()=>location.assign('https://github.com/focustimer-dev/go-hipster-go/releases/latest'),
 setPreference:(key,value)=>{const p=prefs();p[key]=key==='oneTap'?false:value;save(PREF,p);changed()},
 offerSetupShare:()=>{}
});
window.addEventListener('DOMContentLoaded',()=>{
 const active=reference();if(active&&urlIn(active)&&!crate().recent.find(x=>x.text===active)?.metadataStatus&&!crate().recent.find(x=>x.text===active)?.title)refreshPreview(active);
 const brand=document.querySelector('.brandrow');
 if(!brand)return;
 const back=document.createElement('a');back.href='/';back.id='pwaAtlasReturn';
 back.textContent='← PWA JUKEBOX';back.setAttribute('aria-label','Return to PWA Jukebox');
 back.style.cssText='display:inline-flex;align-items:center;min-height:44px;margin:6px 0;padding:6px 10px;border:1px solid #103135;background:#dfb045;color:#103135;text-decoration:none;font:700 .76rem/1 Arial,sans-serif';
 // The Android snapshot owns most of this document's click handling.
 // Do not let its in-app navigation handler swallow the browser return.
 back.addEventListener('click',event=>{
  event.preventDefault();event.stopImmediatePropagation();
  window.location.assign('/');
 });
 brand.append(back);
});
})();