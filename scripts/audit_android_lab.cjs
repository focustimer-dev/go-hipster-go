// Inspect the exact bundled interface with a simulated native bridge.
// Does not install Android, connect accounts, send prompts, or publish playlists.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const output=path.resolve(__dirname,'../android-lab/build/workflow-audit');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const server=http.createServer((req,res)=>{
  let name=new URL(req.url,'http://localhost').pathname;if(name.endsWith('/'))name+='index.html';
  const file=path.resolve(root,'.'+decodeURIComponent(name));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const results=[];let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
  for(const profile of [{name:'phone',width:412,height:915},{name:'narrow',width:320,height:740},{name:'large-text',width:412,height:915,scale:2},{name:'landscape',width:915,height:412}]){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:true,hasTouch:true,reducedMotion:profile.name==='phone'?'no-preference':'reduce'});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.auditCalls=[];window.auditCopyOK=true;window.auditReference='';
    window.auditState={saved:[],mode:'open',oneTap:true,haptics:true,updateAvailable:false};
    window.HipsterLab={state:()=>JSON.stringify(auditState),inspiration:()=>auditReference,
     copy(t){auditCalls.push(['copy',t]);return auditCopyOK},go(a,t){auditCalls.push(['go',a,t])},open(a,t){auditCalls.push(['open',a,t])},share(t){auditCalls.push(['share',t])},
     setPreference(k,v){auditState[k]=k==='mode'?v:v==='true';window.HipsterLabStateChanged()},
     saveRequest(ai,prompt){auditState.saved.push({id:'audit-1',name:'A deliberately long saved request title for narrow screens',ai,prompt,time:0});window.HipsterLabStateChanged()},
     savedRequest(id){auditCalls.push(['saved',id])},reviewInspiration(){auditCalls.push(['review'])},clearInspiration(){auditReference='';window.HipsterLabRefresh()},showUpdates(){auditCalls.push(['updates'])},offerSetupShare(a,t){auditCalls.push(['offerSetupShare',a,t])}};
   });
   await page.goto('http://127.0.0.1:'+server.address().port+'/');
   if(profile.scale)await page.addStyleTag({content:'html{font-size:200% !important}'});
   await page.evaluate(()=>document.fonts.ready);
   const capture=async name=>{
    const navigation=await page.locator('.lab-rail [data-lab-tab]').evaluateAll(tabs=>tabs.map(e=>({tab:e.dataset.labTab,active:e.getAttribute('aria-current')==='page',background:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color})));
    assert.equal(navigation.filter(t=>t.active).length,1,'Exactly one current destination');
    for(const tab of navigation){assert.equal(tab.background,tab.active?'rgb(223, 176, 69)':'rgba(0, 0, 0, 0)','Only the current tab is highlighted: '+tab.tab);assert.equal(tab.color,tab.active?'rgb(16, 49, 53)':'rgb(223, 176, 69)')}
    await page.screenshot({path:path.join(output,profile.name+'-'+name+'.png'),fullPage:true});
    const metrics=await page.evaluate(()=>{
     const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden]');
     const label=e=>e.getAttribute('aria-label')||e.innerText||e.getAttribute('title')||e.id||e.tagName;
     const controls=[...document.querySelectorAll('button,a[href],summary,input,select,textarea')].filter(visible);
     const small=controls.map(e=>{let target=e;if(e.matches('input'))target=e.closest('label')||e;const r=target.getBoundingClientRect();return {label:label(e).trim().slice(0,90),width:Math.round(r.width),height:Math.round(r.height)}}).filter(e=>e.width<44||e.height<44);
     const overflow=[...document.querySelectorAll('body *')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+2&&r.width>0&&!e.closest('svg')}).slice(0,15).map(e=>({tag:e.tagName,id:e.id,class:e.getAttribute('class')}));
     return {pageOverflow:document.documentElement.scrollWidth>innerWidth+2,smallControls:small,overflow,focus:document.activeElement?.id||document.activeElement?.tagName,bodyText:document.body.innerText};
    });
    results.push({profile:profile.name,state:name,...metrics});
   };
   await capture('first-use');
   await page.locator('.lab-rail [data-lab-action="preferences"]').click();await capture('first-use-preferences');
   await page.locator('[data-lab-action="close-preferences"]').click();
   assert(await page.locator('#firstCrateSetup [data-action="choose"]').first().isVisible(),'Shipped first-run setup must be visible');
   await page.locator('#firstCrateSetup [data-action="pause"]').first().click();
   assert(await page.locator('#firstCrateSetup [data-action="resume"]').isVisible(),'Paused setup offers resume');
   await page.locator('#firstCrateSetup [data-action="resume"]').click();
   await page.locator('#firstCrateSetup [data-action="choose"]').first().click();
   await page.locator('#fc-ai').selectOption('Claude');
   await page.locator('#firstCrateSetup [data-action="install"]').first().click();
   assert(await page.locator('#firstCrateSetup [data-action="install-copy"]').isVisible(),'Claude prompt-first installation is directly visible');
   assert.equal(await page.locator('#firstCrateSetup .install-fallback').getAttribute('open'),null,'Manual uploader instructions stay secondary');
   await page.locator('#firstCrateSetup [data-action="install-copy"]').click();
   await page.waitForFunction(()=>auditCalls.some(c=>c[0]==='offerSetupShare'&&c[1]==='claude'));
   assert.equal(await page.evaluate(()=>auditCalls.filter(c=>c[0]==='offerSetupShare').at(-1)[2]===auditCalls.filter(c=>c[0]==='copy').at(-1)[1]),true);
   assert.equal(await page.evaluate(()=>auditCalls.some(c=>c[0]==='share'||c[0]==='go')),false,'Copy offers consent without auto-sharing');
   await capture('claude-prompt-first');
   await page.locator('#firstCrateSetup [data-action="choose"]').first().click();
   await page.locator('#fc-ai').selectOption('ChatGPT');
   for(const action of ['install','check'])await page.locator('#firstCrateSetup [data-action="'+action+'"]').first().click();
   await page.locator('#firstCrateSetup [data-action="copy"]').click();
   await capture('setup-copied');
   await page.locator('#firstCrateSetup [data-action="ready"]').click();
   assert(!await page.locator('#fc-ticket').isVisible(),'Completed setup stays hidden');
   await capture('jukebox');
   await page.locator('[data-lab-tab="crate"]').click();
   await page.evaluate(()=>{auditReference='Harlem Prom Night 1986';window.HipsterLabRefresh()});
   assert(await page.locator('#labJukebox').isVisible(),'Accepted inspiration returns to the shaping workspace');
   await page.locator('#labInspiration').evaluate(async el=>{await Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{})))});
   assert.equal(await page.locator('#labInspiration').evaluate(el=>getComputedStyle(el).animationName),'none');
   await capture('inspiration-guidance');
   await page.locator('[data-lab-tab="crate"]').click();
   await page.locator('#labCrateContinue').click();
   assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('[data-mood]')),true);
   await capture('inspiration-music-choices');
   await page.locator('[data-mood="desire"]').click();await page.locator('[data-mood="weird"]').click();
   await page.locator('#goButton').click();
   await page.waitForFunction(()=>auditCalls.some(c=>c[0]==='go'));
   assert.equal(await page.evaluate(()=>auditCalls.filter(c=>c[0]==='copy').at(-1)[1]===auditCalls.filter(c=>c[0]==='go').at(-1)[2]),true,'Exact prompt reaches native handoff');
   assert((await page.locator('#prompt').textContent()).includes('Inspiration:'),'GO retains inspiration in its compact brief');
   await capture('receipt');
   await page.locator('[data-lab-action="save"]').click();
   await page.locator('[data-lab-tab="crate"]').click();await capture('saved-crate');
   await page.evaluate(()=>{
    auditState.recentInspirations=[{id:'recent-preview',text:auditReference,title:'Harlem Prom Night 1986',description:'A page-supplied music reference description.'}];auditState.inspirationPreview={title:'Harlem Prom Night 1986',description:'A page-supplied music reference description.'};
    HipsterLab.useRecentInspiration=id=>{auditReference=auditState.recentInspirations.find(e=>e.id===id).text;window.HipsterLabRefresh()};window.HipsterLabRefresh();
   });
   await page.locator('[data-lab-tab="jukebox"]').click();await page.locator('#labInspiration').scrollIntoViewIfNeeded();await capture('link-preview');
   await page.locator('#labDismissInspiration').click();assert(!await page.locator('#labInspiration').isVisible());
   await page.locator('[data-lab-tab="crate"]').click();await page.locator('[data-lab-recent="recent-preview"]').click();
   assert(await page.locator('#labJukebox').isVisible());assert(await page.locator('#labInspiration').isVisible());
   await page.locator('[data-lab-tab="manual"]').click();await capture('manual');
   const appVersion=fs.readFileSync(path.resolve(__dirname,'../android-lab/app/build.gradle'),'utf8').match(/versionName\s+'([^']+)'/)[1];
   assert.equal(await page.locator('#labAppVersion').textContent(),appVersion);
   await page.evaluate(()=>window.auditCopyOK=false);
   await page.evaluate(()=>{document.getElementById('labMoreResources').hidden=false;document.getElementById('labManualGuide').hidden=true});await page.locator('[data-lab-action="setup"]').click();
   await page.locator('#labSetupText').waitFor({state:'visible'});
   assert.equal(await page.locator('#labSetupText').inputValue(),await page.evaluate(()=>auditCalls.filter(c=>c[0]==='copy').at(-1)[1]));
   await capture('manual-copy-recovery');
   await page.evaluate(()=>window.auditCopyOK=true);
   await page.evaluate(()=>{document.getElementById('labMoreResources').hidden=false;document.getElementById('labManualGuide').hidden=true});await page.locator('[data-lab-action="setup"]').click();
   await page.waitForFunction(()=>document.querySelector('#labSetupFallback').hidden);
   await page.locator('.lab-rail [data-lab-action="preferences"]').click();await capture('preferences');
   await page.locator('[data-lab-action="close-preferences"]').click();
   await page.locator('[data-lab-tab="jukebox"]').click();
   await page.locator('#fc-current-setup [data-action="choose"]').click();
   await page.locator('#fc-ai').selectOption('Other');
   await page.locator('#firstCrateSetup [data-action="pause"]').first().click();
   await page.locator('[data-lab-tab="jukebox"]').click();await page.locator('#goButton').click();
   await page.waitForFunction(()=>document.querySelector('#handoffTitle').textContent.includes('MANUALLY'));
   await capture('other-ai');
   await page.evaluate(()=>{window.auditCopyOK=false;window.auditCalls=[]});
   await page.locator('#goButton').click();
   await page.waitForFunction(()=>!document.querySelector('#goButton').disabled);
   assert.equal(await page.evaluate(()=>auditCalls.some(c=>c[0]==='go')),false,'Failed clipboard cannot launch an AI');
   await capture('clipboard-failure');
   // Relaunch a confirmed user; setup must be reachable without occupying Jukebox.
   await page.evaluate(()=>{localStorage.setItem('hmg-ai','chatgpt');localStorage.setItem('hmg-service','spotify');localStorage.setItem('hmg-first-crate-v1',JSON.stringify({completed:true,ai:'ChatGPT',service:'Spotify',confirmedPairs:{'["ChatGPT","Spotify"]':true}}))});
   await page.goto('http://127.0.0.1:'+server.address().port+'/?ai=chatgpt&service=spotify');if(profile.scale)await page.addStyleTag({content:'html{font-size:200% !important}'});
   assert.equal(await page.locator('#labJukebox #firstCrateSetup').count(),0);
   await capture('returning-jukebox');
   await page.locator('.lab-rail [data-lab-action="preferences"]').click();
   assert(await page.locator('#labSetupDetails').isVisible());
   await page.locator('#labSetupDetails>summary').click();
   assert(await page.locator('#fc-current-setup [data-action="choose"]').isVisible());
   await capture('returning-preferences');
   await page.evaluate(()=>window.HipsterLabBack());assert(!await page.locator('#labPreferences').evaluate(e=>e.open));
   assert.deepEqual(errors,[],profile.name+' has no uncaught JS errors');
   await context.close();
  }
 }finally{if(browser)await browser.close();server.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({boundary:'Unmodified bundled interface in Chromium with simulated Android bridge; no diagnostic CSS overrides, device, external AI, account or publication verification.',results},null,2))}
 console.log('PASS: setup, exact handoff, two moods, saving, navigation, Preferences, Other AI and clipboard failure across four profiles. Review screenshots and metrics separately.');
})().catch(e=>{console.error(e);process.exitCode=1});
