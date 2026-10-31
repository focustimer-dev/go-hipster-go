const {JSDOM}=require('jsdom');
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
(async()=>{
 const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:'https://lab.hipster.invalid/?ai=chatgpt&service=spotify',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;const calls=[];
 try{
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HipsterLab={copy(t){calls.push(['copy',t]);return true},go(a,t){calls.push(['go',a,t])},open(a,t){calls.push(['open',a,t])},share(t){calls.push(['share',t])}};
  w.eval(fs.readFileSync(root+'/assets/app.js','utf8'));
  const click=selector=>w.document.querySelector(selector).click();
  const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
  click('#goButton');await flush();
  const first=calls.find(c=>c[0]==='go');assert(first);assert.equal(first[1],'chatgpt');assert.equal(first[2],calls.find(c=>c[0]==='copy')[1]);
  click('#openAi');assert.equal(calls.filter(c=>c[0]==='open').length,1);
  click('[data-ai="gemini"]');click('#openAi');assert.equal(calls.filter(c=>c[0]==='open').length,1,'Stale prompt must not launch AI');
  click('[data-service="youtube"]');click('#goButton');await flush();
  const second=calls.find(c=>c[0]==='go'&&c[1]==='gemini');assert(second);assert(second[2].includes('YouTube Music'));
  click('#shareButton');await flush();assert(calls.some(c=>c[0]==='share'&&c[1]===second[2]));
  console.log('PASS: DOM contract checks exact prompt, ChatGPT/Gemini selection, stale-request guard, Open and Share.');
 }finally{w.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
