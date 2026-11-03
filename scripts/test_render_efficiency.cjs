// Behavioral budgets: unrelated choices must not rewrite geography or reread the bridge.
const {JSDOM}=require('jsdom'),fs=require('fs'),assert=require('assert/strict');
const root=__dirname+'/../android-lab/app/src/main/assets/site';
const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://lab.hipster.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;let stateReads=0,inspirationReads=0;
const state={saved:[],mode:'open',activeInspiration:'A musical reference',recentInspirations:[]};
w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.HTMLElement.prototype.scrollIntoView=()=>{};
w.HipsterLab={state(){stateReads++;return JSON.stringify(state)},inspiration(){inspirationReads++;return 'legacy'}};
try{
 w.eval(fs.readFileSync(root+'/assets/app.js','utf8'));
 const map=w.document.querySelector('#crateAtlasMap'),camera=map.getAttribute('viewBox');
 const observer=new w.MutationObserver(()=>{});observer.observe(map,{subtree:true,attributes:true});
 for(const selector of ['[data-mood="happy"]','#includeCover','#goHard']){
  stateReads=0;inspirationReads=0;observer.takeRecords();w.document.querySelector(selector).click();
  assert.equal(observer.takeRecords().length,0,selector+' must not mutate atlas');
  assert(stateReads<=1,selector+' reads native state at most once');assert.equal(inspirationReads,0);
  assert.equal(map.getAttribute('viewBox'),camera);
 }
 w.document.querySelector('[data-crate-region="south-asia"]').click();
 assert(observer.takeRecords().length>0,'Region changes still update geography');
 state.activeInspiration='Updated reference';w.HipsterLabRefresh();
 assert.equal(w.document.querySelector('#labInspirationPreview').textContent,'Updated reference','Native invalidation updates cached state');
 observer.disconnect();console.log('PASS: zero atlas writes for unrelated choices; at most one native snapshot; native invalidation stays fresh.');
}finally{dom.window.close()}
