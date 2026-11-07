/* PWA Jukebox: a single lazily instantiated canonical Atlas surface.
   The framed runtime exposes ONLY the map canvas and projection buttons, never
   a second Jukebox, Crate or Manual. Browser GO and map stamps stay parent-owned. */
(function(){
'use strict';
if(document.body.dataset.page!=='launch'||!document.body.classList.contains('gig-poster'))return;
const regionKey='ghg-crate-map-regions-v1',type='ghg-inline-atlas',frameSelector='.crate-geo .crate-map-frame';
const original=document.querySelector(frameSelector),section=original?.closest('.crate-geo');
if(!original||!section||document.getElementById('pwaInlineAtlas'))return;
const valid=new Set(Array.from(document.querySelectorAll('[data-crate-region]'),button=>button.dataset.crateRegion).filter(Boolean));
if(valid.size<20)return;
const host=document.createElement('div');
host.className='pwa-inline-atlas';host.id='pwaInlineAtlas';
host.setAttribute('aria-label','Three-projection listening Atlas');
const frame=document.createElement('iframe');frame.title='Interactive listening Atlas — Robinson, Keyes and Globe';
frame.setAttribute('aria-label','Interactive regional Atlas');frame.setAttribute('loading','lazy');
frame.setAttribute('referrerpolicy','same-origin');
frame.setAttribute('allow','fullscreen');frame.style.height='265px';
host.appendChild(frame);original.after(host);
let mounted=false,ready=false,revision=0,pending=false,failed=false;
function current(){
 try{
  const saved=JSON.parse(localStorage.getItem(regionKey)||'[]');
  return Array.isArray(saved)?[...new Set(saved.filter(x=>valid.has(x)))].sort():[];
 }catch(_){return []}
}
function send(){
 if(!ready||failed)return;
 frame.contentWindow?.postMessage({type:type+'-set-regions',regions:current()},location.origin);
}
function queueSync(){
 if(pending)return;pending=true;
 requestAnimationFrame(()=>{pending=false;send()});
}
function mount(){
 if(mounted||failed)return;mounted=true;
 // One WebGL Atlas instance, initialized only when the Jukebox map is near view.
 frame.src='/pwa-atlas/inline.html';
 const fallback=setTimeout(()=>{
  if(ready||failed)return;failed=true;section.classList.remove('pwa-atlas-native-active');host.hidden=true;
 },20000);
 frame.addEventListener('load',()=>{if(ready)clearTimeout(fallback)});
}
const lazy='IntersectionObserver'in window?new IntersectionObserver(entries=>{
 if(entries.some(entry=>entry.isIntersecting)){lazy.disconnect();mount()}
},{rootMargin:'500px 0px'}):null;
if(lazy)lazy.observe(section);else mount();
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
 const msg=event.data;if(!msg||typeof msg!=='object')return;
 if(msg.type===type+'-ready'){
  ready=true;section.classList.add('pwa-atlas-native-active');host.hidden=false;send();return;
 }
 if(msg.type===type+'-height'){
  const height=Number(msg.height);
  if(ready&&Number.isFinite(height)&&height>=160&&height<900)frame.style.height=Math.ceil(height+3)+'px';
  return;
 }
 if(msg.type===type+'-regions'){
  if(!ready||!Array.isArray(msg.regions)||msg.regions.length>30||msg.regions.some(x=>!valid.has(x)))return;
  const wanted=new Set(msg.regions),have=new Set(current());
  if(wanted.size===have.size&&[...wanted].every(x=>have.has(x)))return;
  // Dispatch real existing region handlers, not a parallel prompt/GO model.
  for(const id of new Set([...wanted,...have])){
   if(wanted.has(id)===have.has(id))continue;
   const button=[...document.querySelectorAll('[data-crate-region]')].find(el=>el.dataset.crateRegion===id);
   button?.click();
  }
  queueSync();
 }
});
document.addEventListener('click',event=>{
 if(!event.target.closest('#pwaInlineAtlas'))queueSync();
},true);
window.addEventListener('storage',event=>{
 if(event.key===regionKey||event.key===null)queueSync();
 if(event.key==='ghg-pwa-theme-v1'||event.key===null)
  frame.contentWindow?.postMessage({type:type+'-theme'},location.origin);
});
window.addEventListener('pagehide',()=>{lazy?.disconnect()});
window.GHGInlineAtlas=Object.freeze({ready:()=>ready,refresh:queueSync,regions:current});
})();
