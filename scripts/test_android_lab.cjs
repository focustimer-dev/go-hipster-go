// Functional browser test for the bundled native handoff contract.
const {chromium}=require('playwright');
const http=require('http');
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
(async()=>{
 const server=http.createServer((req,res)=>{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name.endsWith('/'))name+='index.html';
  const file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch{res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
  const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.labCalls=[];window.labState={saved:[],mode:'open',oneTap:true,haptics:true,updateAvailable:false};
   window.HipsterLab={state(){return JSON.stringify(window.labState)},setPreference(k,v){window.labState[k]=k==='mode'?v:v==='true';window.HipsterLabStateChanged()},saveRequest(a,t){labCalls.push(['save',a,t])},showUpdates(){labCalls.push(['updates'])},copy(t){labCalls.push(['copy',t]);return true},go(a,t){labCalls.push(['go',a,t])},open(a,t){labCalls.push(['open',a,t])},share(t){labCalls.push(['share',t])}};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/?ai=chatgpt&service=spotify');
  await page.locator('#goButton').click();
  await page.waitForFunction(()=>labCalls.some(c=>c[0]==='go'));
  let calls=await page.evaluate(()=>labCalls);
  const first=calls.find(c=>c[0]==='go');assert.match(first[2],/Discovery route: v1\/R\d\d\./);assert.doesNotMatch(first[2],/Seed:/);assert.equal(first[1],'chatgpt');assert.equal(first[2],calls.find(c=>c[0]==='copy')[1]);
  await page.locator('#openAi').click();
  assert.equal((await page.evaluate(()=>labCalls)).filter(c=>c[0]==='open').length,1);
  assert.equal(await page.locator('#labJukebox .service-counter').count(),0);
  assert.equal(await page.locator('.poster-go-trail-word').last().textContent(),'CONTINUE IN YOUR AI');
  await page.locator('.lab-rail [data-lab-action="preferences"]').click();
  // Verify the native switch's state, selection colors and narrow-phone layout.
  const rough=page.locator('#skipRough');
  await rough.check();
  await page.waitForTimeout(220);
  assert.equal(await page.locator('.recording-on').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(16, 49, 53)');
  assert.equal(await page.locator('.recording-metal-lever').evaluate(e=>getComputedStyle(e).transform),'matrix(1, 0, 0, 1, 0, 0)');
  fs.mkdirSync('android-lab/build/switch-review',{recursive:true});
  await page.locator('#labRecordingPreferences').screenshot({path:'android-lab/build/switch-review/on-412.png'});
  await page.setViewportSize({width:320,height:740});
  await rough.uncheck();await page.waitForTimeout(220);
  assert.equal(await page.locator('.recording-off').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(16, 49, 53)');
  assert(await page.locator('#labPreferences').evaluate(e=>e.scrollWidth<=e.clientWidth),'No horizontal overflow at 320px');
  await page.locator('#labRecordingPreferences').screenshot({path:'android-lab/build/switch-review/off-320.png'});
  await page.setViewportSize({width:412,height:915});
  await page.locator('[data-ai="gemini"]').first().click();
  await page.locator('[data-service="youtube"]').first().click();
  await page.locator('[data-lab-action="close-preferences"]').click();
  await page.locator('#goButton').click();
  await page.waitForFunction(()=>labCalls.some(c=>c[0]==='go'&&c[1]==='gemini'));
  calls=await page.evaluate(()=>labCalls);assert(calls.find(c=>c[0]==='go'&&c[1]==='gemini')[2].includes('YouTube Music'));
  await page.locator('#shareButton').click();
  assert((await page.evaluate(()=>labCalls)).some(c=>c[0]==='share'));
  await page.evaluate(()=>window.scrollTo({top:700,behavior:'instant'}));
  const position=await page.evaluate(()=>window.scrollY);
  await page.locator('[data-lab-tab="crate"]').click();await page.locator('#labCrate').waitFor({state:'visible'});
  await page.locator('[data-lab-tab="manual"]').click();await page.locator('#labManual').waitFor({state:'visible'});
  await page.locator('[data-lab-action="updates"]').click();assert((await page.evaluate(()=>labCalls)).some(c=>c[0]==='updates'));
  await page.locator('[data-lab-tab="jukebox"]').click();assert(Math.abs((await page.evaluate(()=>window.scrollY))-position)<2);
  await page.locator('.lab-rail [data-lab-action="preferences"]').click();await page.locator('#labPreferences').waitFor({state:'visible'});
  await page.locator('[name="labHandoff"][value="share"]').check();await page.locator('[data-lab-action="close-preferences"]').click();await page.locator('#labPreferences').waitFor({state:'hidden'});
  assert((await page.locator('#goHint').textContent()).includes('SHARE TO GEMINI'));
  assert((await page.locator('#handoffInstruction').textContent()).startsWith('Review and send'));
  await page.locator('[data-lab-tab="manual"]').click();
  await page.locator('[data-lab-action="services"]').click();
  assert(await page.locator('#labPreferences').isVisible());
  await page.locator('[data-lab-action="close-preferences"]').click();
  await page.locator('[data-lab-tab="jukebox"]').click();
  await page.locator('[data-lab-action="save"]').click();assert((await page.evaluate(()=>labCalls)).some(c=>c[0]==='save'));
  // Fixed viewport, continuous inner camera, truthful navigation and compact ticket.
  await page.emulateMedia({reducedMotion:'reduce'});
  const map=page.locator('#crateAtlasMap');
  await page.locator('[data-crate-continent="europe"]').evaluate(el=>el.click());
  assert.equal(await map.getAttribute('viewBox'),'0 0 720 372','Outer SVG viewport remains fixed');
  assert.notEqual(await map.getAttribute('data-camera-view'),'0 0 720 372','Inner camera actually zoomed');
  assert.equal(await page.locator('.atlas-camera-scene').count(),1);
  assert(await page.locator('.atlas-camera-scene').evaluate(el=>getComputedStyle(el).transform.startsWith('matrix(')));
  assert.equal(await page.locator('.atlas-camera-scene').evaluate(el=>el.style.willChange),'auto','Settled SVG can rasterize at its current scale');
  const cameraBeforeResize=await map.getAttribute('data-camera-view');
  await page.setViewportSize({width:360,height:800});await page.waitForTimeout(100);
  assert.equal(await map.getAttribute('data-camera-view'),cameraBeforeResize,'Resize preserves geographic destination');
  const resizeError=await page.locator('.atlas-camera-viewport').evaluate(el=>{
   const scene=el.querySelector('.atlas-camera-scene'),m=new DOMMatrix(getComputedStyle(scene).transform),v=scene.querySelector('svg#crateAtlasMap').dataset.cameraView.split(/\s+/).map(Number),r=el.getBoundingClientRect();
   return Math.max(Math.abs(m.e+v[0]*720/v[2]*r.width/720),Math.abs(m.f+v[1]*720/v[2]*r.height/372));
  });
  assert(resizeError<.2,'Resize recalculates pixel translation');
  await page.locator('.crate-map-frame').screenshot({path:'android-lab/build/switch-review/settled-detail-360.png'});
  await page.setViewportSize({width:412,height:915});await page.waitForTimeout(100);
  await page.locator('[data-crate-region="south-asia"]').evaluate(el=>el.click());
  assert.match(await page.locator('#atlasLocator').textContent(),/^SELECTED REGIONS/,'Auto-framing does not claim an old continent');
  await page.locator('#atlasHome').evaluate(el=>el.click());
  assert.equal(await map.getAttribute('data-camera-view'),'0 0 720 372');
  await page.locator('.crate-map-frame').screenshot({path:'android-lab/build/switch-review/fixed-viewport-world.png'});
  await page.locator('.mood-grid').evaluate(el=>window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top+60,behavior:'instant'}));
  await page.waitForTimeout(80);
  const ticket=page.locator('#selectionTicket');
  assert(await ticket.evaluate(el=>el.classList.contains('is-compact')&&!el.hidden&&!el.classList.contains('is-docked')),'Ticket condenses while choosing moods');
  assert((await ticket.boundingBox()).height<=64,'Compact summary does not retain a multi-line panel');
  await ticket.screenshot({path:'android-lab/build/switch-review/compact-mood-ticket.png'});
  await page.locator('.mood-grid [data-mood]').first().focus();await page.waitForTimeout(80);
  const focusBounds=await page.locator('.mood-grid [data-mood]').first().boundingBox(),ticketBounds=await ticket.boundingBox();
  assert(focusBounds.y>=ticketBounds.y+ticketBounds.height+10,'Focused mood clears the floating ticket');
  await ticket.locator('summary').click();
  assert(await ticket.locator('.ticket-region-short').isVisible(),'Expanded ticket restores region/option details');
  assert.deepEqual(errors,[]);
  console.log('PASS: mobile workspace, scroll restoration, preferences, save, exact-prompt copy, ChatGPT/Gemini GO, Open, and native Share hooks.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
