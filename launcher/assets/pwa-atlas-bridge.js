/* Preview-only browser bridge for the actual Android Lab 0.9.56 atlas.
   No native APIs, background writes, remote network fetch or separate accounts.
   Regional selections and existing Jukebox options share their ordinary keys. */
(function(){
'use strict';
const KEY='ghg-pwa-crate-v1', REF='ghg-pwa-reference-v1', PREF='ghg-pwa-atlas-prefs-v1';
const THEME_KEY='ghg-pwa-theme-v1', THEMES=['liberi','bosque','usiku'];
const ATLAS_PALETTES={
 bosque:{ocean:'#f5f0e6',land:'#004225',ink:'#003018',selected:'#e5cf42',route:'#8c6239'},
 usiku:{ocean:'#111111',land:'#f5f0e6',ink:'#003018',selected:'#e5cf42',route:'#b77b4d'}
};
function atlasTheme(){
 try{const v=localStorage.getItem(THEME_KEY);return THEMES.includes(v)?v:'liberi'}
 catch(_){return 'liberi'}
}
// Applied before Android bundle DOM is parsed: no first-paint theme flash.
document.documentElement.dataset.pwaTheme=atlasTheme();
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
let atlasThemeMap=null,atlasThemeFrame=0;
function paintAtlasTheme(){
 const map=atlasThemeMap,theme=atlasTheme(),palette=ATLAS_PALETTES[theme];
 document.documentElement.dataset.pwaTheme=theme;
 if(!map||!palette||!map.getLayer?.('land'))return;
 try{
  const desired={
   land:{'fill-color':['case',['boolean',['feature-state','selected'],false],
     palette.selected,palette.land]},
   borders:{'line-color':palette.ink},
   ocean:{'background-color':map.getProjection()?.type==='mercator'?'rgba(0,0,0,0)':palette.ocean},
   'robinson-ocean':{'fill-color':palette.ocean},
   routes:{'line-color':palette.route}
  };
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
 const back=document.createElement('a');back.href='/';
 back.textContent='← PWA JUKEBOX';back.setAttribute('aria-label','Return to PWA Jukebox');
 back.style.cssText='display:inline-flex;align-items:center;min-height:44px;margin:6px 0;padding:6px 10px;border:1px solid #103135;background:#dfb045;color:#103135;text-decoration:none;font:700 .76rem/1 Arial,sans-serif';
 brand.append(back);
});
})();