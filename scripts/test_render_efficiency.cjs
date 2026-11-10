// Behavioral budgets: unrelated choices must not rewrite geography or reread the bridge.
const {JSDOM}=require('jsdom'),fs=require('fs'),assert=require('assert/strict');
const root=__dirname+'/../android-lab/app/src/main/assets/site';
const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://lab.hipster.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;let stateReads=0,inspirationReads=0;
const state={saved:[],mode:'open',activeInspiration:'A musical reference',recentInspirations:[]};
w.scrollTo=()=>{};w.scrollBy=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.HTMLElement.prototype.scrollIntoView=()=>{};
w.HipsterLab={state(){stateReads++;return JSON.stringify(state)},inspiration(){inspirationReads++;return 'legacy'}};
try{
 w.eval(fs.readFileSync(root+'/assets/app.js','utf8'));
 const map=w.document.querySelector('#crateAtlasMap'),camera=map.getAttribute('viewBox');
 assert.equal(map.querySelector('.crate-map-ocean').parentNode,map.querySelector('.robinson-plate-content'),'Ocean and countries share clipped paint group');
 const observer=new w.MutationObserver(()=>{});observer.observe(map,{subtree:true,attributes:true});
 for(const selector of ['[data-mood="happy"]','#includeCover','#goHard']){
  stateReads=0;inspirationReads=0;observer.takeRecords();w.document.querySelector(selector).click();
  assert.equal(observer.takeRecords().length,0,selector+' must not mutate atlas');
  assert(stateReads<=1,selector+' reads native state at most once');assert.equal(inspirationReads,0);
  assert.equal(map.getAttribute('viewBox'),camera);
 }
 const pace=w.document.querySelector('#tempoSlider');pace.value='4';pace.dispatchEvent(new w.Event('input'));
 const paceObserver=new w.MutationObserver(()=>{});paceObserver.observe(w.document.body,{subtree:true,attributes:true,childList:true,characterData:true});
 stateReads=0;for(let i=0;i<8;i++)pace.dispatchEvent(new w.Event('input'));
 assert.equal(paceObserver.takeRecords().length,0,'Repeated pace notch does not redraw the page');assert.equal(stateReads,0);paceObserver.disconnect();
 const unrelated=new w.MutationObserver(()=>{});
 for(const selector of ['.mood-grid','#tempoControl','#labServicePreferences','#labSetupPreferences']){
  const node=w.document.querySelector(selector);if(node)unrelated.observe(node,{attributes:true,childList:true,characterData:true,subtree:true});
 }
 w.document.querySelector("#undoShuffle").hidden=false;
 let pairEvents=0;w.document.addEventListener('hipster-pair-changed',()=>pairEvents++);
 const storageWrites=[],originalSet=w.Storage.prototype.setItem;
 w.Storage.prototype.setItem=function(key,value){storageWrites.push(key);return originalSet.call(this,key,value)};
 for(const selected of [true,false]){
  stateReads=0;unrelated.takeRecords();storageWrites.length=0;
  w.document.querySelector('[data-crate-region="atlantic-europe"]').click();
  assert.equal(w.document.querySelector('#undoShuffle').hidden,true,'Region change clears stale shuffle undo');
  assert.equal(unrelated.takeRecords().length,0,'Region tap leaves moods, pace, setup and service controls untouched');
  assert.equal(stateReads,0,'Region tap reuses native snapshot');assert.equal(pairEvents,0,'Region tap does not restart pairing/setup');
  assert.deepEqual(storageWrites,['ghg-crate-map-regions-v2'],'Only region storage is written');
  assert.equal(w.document.querySelector('[data-crate-region="atlantic-europe"]').getAttribute('aria-pressed'),String(selected));
  assert.equal(w.document.querySelector('#prompt').textContent.includes('Regional exploration:'),selected);
 }
 unrelated.disconnect(); // Touch capture must apply the first tap before its 290ms timer expires.
 const timers=[],originalTimer=w.setTimeout;
 w.setTimeout=(callback,ms)=>ms===290?(timers.push(callback),timers.length):originalTimer(callback,ms);
 const touch=land=>{const tap=new w.MouseEvent('click',{bubbles:true,cancelable:true,detail:1,clientX:100,clientY:100});Object.defineProperty(tap,'pointerType',{value:'touch'});land.dispatchEvent(tap)};
 w.document.querySelector('[data-crate-continent="asia"]').click();
 const land=w.document.querySelector('[data-atlas-country][data-atlas-region="east-asia"]');
 touch(land);assert.equal(land.getAttribute('data-inked'),'true','First touch selects immediately');
 timers.shift()();assert.equal(land.getAttribute('data-inked'),'true','Timer does not select twice');
 touch(land);assert.equal(land.getAttribute('data-inked'),'false','Touch deselection is immediate');timers.shift()();
 const beforeDouble=w.document.querySelector('#prompt').textContent;
 touch(land);touch(land);
 assert.equal(land.getAttribute('data-inked'),'false','Double tap restores prior selection before zoom');
 assert.equal(w.document.querySelector('#prompt').textContent,beforeDouble,'Double tap restores exact request');
 w.setTimeout=originalTimer;

 w.document.querySelector('[data-crate-region="south-asia"]').click();
 assert(observer.takeRecords().length>0,'Region changes still update geography');
 state.activeInspiration='Updated reference';w.HipsterLabRefresh();
 assert.equal(w.document.querySelector('#labInspirationPreview').textContent,'Updated reference','Native invalidation updates cached state');
 observer.disconnect();console.log('PASS: zero atlas writes for unrelated choices; at most one native snapshot; native invalidation stays fresh.');
}finally{dom.window.close()}
