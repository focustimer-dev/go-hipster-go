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
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
  const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.labCalls=[];window.labState={saved:[],mode:'open',oneTap:true,haptics:true,updateAvailable:false};
   window.HipsterLab={state(){return JSON.stringify(window.labState)},setPreference(k,v){window.labState[k]=k==='mode'?v:v==='true';window.HipsterLabStateChanged()},saveRequest(a,t){labCalls.push(['save',a,t])},showUpdates(){labCalls.push(['updates'])},copy(t){labCalls.push(['copy',t]);return true},go(a,t){labCalls.push(['go',a,t])},open(a,t){labCalls.push(['open',a,t])},share(t){labCalls.push(['share',t])}};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/?ai=chatgpt&service=spotify&atlas=legacy');
  await page.locator('#goButton').click();
  await page.waitForFunction(()=>labCalls.some(c=>c[0]==='go'));
  let calls=await page.evaluate(()=>labCalls);
  const first=calls.find(c=>c[0]==='go');assert.match(first[2],/Discovery route: v1\/R\d\d\./);assert.doesNotMatch(first[2],/Seed:/);assert.equal(first[1],'chatgpt');assert.equal(first[2],calls.find(c=>c[0]==='copy')[1]);

  await page.locator('#openAi').click();
  assert.equal((await page.evaluate(()=>labCalls)).filter(c=>c[0]==='open').length,1);
  fs.mkdirSync('android-lab/build/switch-review',{recursive:true});
  // Inspiration and GO are surface bands, not inset cards.
  await page.evaluate(()=>{labState.activeInspiration='Stress bath bummer jams';window.HipsterLabRefresh()});
  for(const width of [320,412,840]){
   await page.setViewportSize({width,height:915});await page.waitForTimeout(450);
   const geometry=await page.evaluate(()=>{
    const site=document.querySelector('.site').getBoundingClientRect();
    return ['#labInspiration','.go-options'].map(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();return {selector,left:r.left,right:r.right,siteLeft:site.left,siteRight:site.right,overflow:document.documentElement.scrollWidth>innerWidth,stripe:selector==='#labInspiration'?getComputedStyle(el,'::before').content:null}})
   });
   for(const r of geometry){assert(Math.abs(r.left-r.siteLeft)<1.5&&Math.abs(r.right-r.siteRight)<1.5,r.selector+' spans the Jukebox surface');assert(!r.overflow,'Full-width bands do not cause horizontal overflow');if(r.stripe!==null)assert(['none','normal'].includes(r.stripe),'No inspiration accent stripe')}
   await page.locator('#labInspiration').screenshot({path:'android-lab/build/switch-review/inspiration-band-'+width+'.png'});
   await page.locator('.go-options').screenshot({path:'android-lab/build/switch-review/go-band-'+width+'.png'});
  }
  await page.evaluate(()=>{labState.activeInspiration='';window.HipsterLabRefresh()});
  await page.setViewportSize({width:412,height:915});
  assert.equal(await page.locator('#labJukebox .service-counter').count(),0);
  assert.equal(await page.locator('.poster-go-trail-word').last().textContent(),'CONTINUE IN YOUR AI');
  await page.locator('.lab-rail [data-lab-action="preferences"]').click();
  assert.deepEqual(await page.locator('[name=labHandoff]').evaluateAll(nodes=>nodes.map(n=>n.nextElementSibling.firstChild.textContent)),['Copy + Open Installed App','Copy + Open Installed App + Paste','Copy + Open Browser']);
  // Verify the native switch's state, selection colors and narrow-phone layout.
  const rough=page.locator('#skipRough');
  await rough.check();
  await page.waitForFunction(()=>document.querySelector('#skipRough').checked&&getComputedStyle(document.querySelector('.recording-metal-lever')).transform==='matrix(1, 0, 0, 1, 0, 0)');
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
  await page.frameLocator('#labManualFrame').locator('#cratePicker > summary').click();await page.frameLocator('#labManualFrame').locator('[data-crate-tab=setup]').click();await page.frameLocator('#labManualFrame').locator('.crate-dividers a[href="#setup"]').click();await page.frameLocator('#labManualFrame').locator('#reviewGeminiUpdates').click();await page.waitForFunction(()=>labCalls.some(c=>c[0]==='updates'));
  await page.locator('[data-lab-tab="jukebox"]').click();assert(Math.abs((await page.evaluate(()=>window.scrollY))-position)<2);
  await page.locator('.lab-rail [data-lab-action="preferences"]').click();await page.locator('#labPreferences').waitFor({state:'visible'});
  await page.locator('[name="labHandoff"][value="share"]').check();await page.locator('[data-lab-action="close-preferences"]').click();await page.locator('#labPreferences').waitFor({state:'hidden'});
  assert((await page.locator('#goHint').textContent()).includes('SHARE TO GEMINI'));
  assert((await page.locator('#handoffInstruction').textContent()).startsWith('Review and send'));
  await page.locator('[data-lab-tab="manual"]').click();
  await page.locator('.lab-rail [data-lab-action="preferences"]').click();
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
  // Reproduce the recorded WebView fill dropout deliberately. The independent
  // ocean surface must cover it without filling transparent Robinson corners.
  const ocean=page.locator('#crateAtlasMap .crate-map-ocean');
  await ocean.evaluate(el=>el.style.visibility='hidden');
  const protectedOcean=await page.locator('.crate-map-frame').screenshot({path:'android-lab/build/switch-review/ocean-fill-dropout.png'});
  require('./assert_atlas_ocean.cjs')(protectedOcean);
  assert.equal(await page.locator('.atlas-ocean-backplate').count(),1);
  await ocean.evaluate(el=>el.style.visibility='');

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
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.waitForFunction(()=>window.labAtlasGlobe&&labAtlasGlobe.loaded());
  assert(await page.locator('#labAtlasGlobe').isVisible());
  const polar=await page.evaluate(()=>{
   const features=JSON.parse(document.querySelector('#labGlobeGeography').textContent).features;
   const points=country=>features.filter(f=>f.properties.country===country).flatMap(f=>f.geometry.coordinates.flat(2));
   return {greenland:Math.max(...points('GRL').map(p=>p[1])),canada:Math.max(...points('CAN').map(p=>p[1])),russia:Math.max(...points('RUS').map(p=>p[1]))};
  });
  assert(polar.greenland>83.5&&polar.canada>82&&polar.russia>80,'Bundled map retains the northern coasts beyond the old 75-degree crop');

  assert.deepEqual(await page.locator('[data-atlas-view]').evaluateAll(nodes=>nodes.map(n=>n.dataset.atlasView)),['robinson','globe']);
  assert.equal(await page.locator('[data-atlas-view="robinson"]').getAttribute('aria-pressed'),'true','Fresh installs default to Robinson');
  assert.match(await page.locator('#labAtlasGlobe').getAttribute('aria-label'),/Robinson/);
  assert.match(await page.locator('#atlasInstruction').textContent(),/SWIPE TO SCROLL/);
  await page.locator('[data-atlas-view="globe"]').click();
  await page.reload();await page.waitForFunction(()=>window.labAtlasGlobe&&labAtlasGlobe.loaded());
  assert.equal(await page.locator('[data-atlas-view="globe"]').getAttribute('aria-pressed'),'true','An explicit Globe choice survives reload');
  await page.locator('[data-atlas-view="robinson"]').click();


  await page.evaluate(()=>{const f=labAtlasGlobe.getSource('land')._data.features.find(f=>f.properties.country==='GRL');const points=f.geometry.coordinates.flat(2);const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);labAtlasGlobe.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding:16,maxZoom:3,duration:0})});
  await page.waitForFunction(()=>!labAtlasGlobe.isMoving()&&labAtlasGlobe.loaded());
  const northernCrown=await page.evaluate(()=>{const f=labAtlasGlobe.getSource('land')._data.features.find(f=>f.properties.country==='GRL');const north=f.geometry.coordinates.flat(2).reduce((a,b)=>a[1]>b[1]?a:b);const p=labAtlasGlobe.project(north);return {x:p.x,y:p.y,width:labAtlasGlobe.getContainer().clientWidth,height:labAtlasGlobe.getContainer().clientHeight}});
  assert(northernCrown.y>=0&&northernCrown.y<=northernCrown.height&&northernCrown.x>=0&&northernCrown.x<=northernCrown.width,'Complete Greenland crown remains in the close-up frame');
  await page.locator('#labAtlasGlobe').screenshot({path:'android-lab/build/switch-review/northern-coastline-closeup.png'});
  await page.locator('#atlasHome').evaluate(el=>el.click());await page.waitForTimeout(500);
  await page.locator('[data-crate-region="west-africa"]').evaluate(el=>el.click());
  assert.match(await page.locator('#prompt').textContent(),/West Africa/);
  assert(await page.locator('[data-crate-stamp-region="west-africa"]').count());
  await page.waitForTimeout(500);
  const beforeModes=await page.locator('#prompt').textContent();
  assert.equal(await page.locator('[data-atlas-view="mercator"]').count(),0,'Only Globe and Robinson are offered');
  for(const mode of ['robinson','globe']){
   await page.locator('[data-atlas-view="'+mode+'"]').click();
   await page.waitForFunction(()=>labAtlasGlobe.loaded());
   assert.equal(await page.locator('[data-atlas-view="'+mode+'"]').getAttribute('aria-pressed'),'true');
   if(mode==='robinson'){
    await page.locator('#atlasHome').evaluate(el=>el.click());await page.waitForTimeout(500);
    const drift=await page.evaluate(()=>{labAtlasGlobe.jumpTo({center:[170,85]});const c=labAtlasGlobe.getCenter();return {lng:c.lng,lat:c.lat}});
    assert(Math.abs(drift.lat)<6&&Math.abs(drift.lng)<12,'Whole-world Robinson cannot be dragged into empty margins');
    const zoomed=await page.evaluate(()=>{labAtlasGlobe.jumpTo({zoom:2,center:[0,50]});return labAtlasGlobe.getCenter().lat});
    assert(zoomed>20,'Zoomed Robinson retains useful north/south exploration');
    assert(await page.evaluate(()=>labAtlasGlobe.dragPan.isEnabled()),'Zoomed Robinson permits panning');
    await page.evaluate(()=>labAtlasGlobe.jumpTo({center:[0,0],zoom:Math.log2(labAtlasGlobe.getContainer().clientWidth/512)-.08}));
    await page.locator('#labAtlasGlobe').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-200,behavior:'instant'}));
    assert.equal(await page.evaluate(()=>labAtlasGlobe.dragPan.isEnabled()),false);
    const scrollBefore=await page.evaluate(()=>scrollY),box=await page.locator('#labAtlasGlobe').boundingBox();
    const gesture=await page.context().newCDPSession(page);
    const x=box.x+box.width/2,y=box.y+box.height*.8;
    await gesture.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=8;i++){
     await gesture.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*12}]});
     await page.waitForTimeout(25);
    }
    await gesture.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForFunction(before=>scrollY>before+30,scrollBefore);
    // A fresh two-finger gesture still zooms while one-finger page scrolling is enabled.
    await page.locator('#labAtlasGlobe').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-200,behavior:'instant'}));
    const pinchBox=await page.locator('#labAtlasGlobe').boundingBox();
    const cx=pinchBox.x+pinchBox.width/2,cy=pinchBox.y+pinchBox.height/2;
    const startZoom=await page.evaluate(()=>labAtlasGlobe.getZoom());
    await gesture.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-25,y:cy,id:1},{x:cx+25,y:cy,id:2}]});
    for(let i=1;i<=8;i++){
     await gesture.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-25-i*6,y:cy-i*2,id:1},{x:cx+25+i*6,y:cy+i*2,id:2}]});
     await page.waitForTimeout(25);
    }
    await gesture.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForFunction(z=>labAtlasGlobe.getZoom()>z+.2,startZoom);
    assert(Math.abs(await page.evaluate(()=>labAtlasGlobe.getBearing()))<.01,'Robinson remains north-up during a twisting pinch');
    await gesture.detach();
    await page.evaluate(()=>labAtlasGlobe.jumpTo({center:[0,0],zoom:labAtlasGlobe.getMinZoom()}));

   }
   assert.equal(await page.locator('#prompt').textContent(),beforeModes,'Projection changes preserve the request');
   await page.locator('#labAtlasGlobe').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-160,behavior:'instant'}));
   const positions=await page.locator('#labAtlasGlobe').evaluate(el=>new Promise(resolve=>{const samples=[];let count=0;function frame(){const r=el.getBoundingClientRect();samples.push({x:r.x,y:r.y,width:r.width,height:r.height});if(++count<8)requestAnimationFrame(frame);else resolve(samples)}requestAnimationFrame(frame)}));
   console.log('Atlas mode bounds',mode,positions);
   const last=positions.at(-1);assert(positions.slice(-3).every(p=>Math.abs(p.width-last.width)<.5&&Math.abs(p.height-last.height)<.5),'Projection switch settles viewport dimensions');
   await page.screenshot({path:'android-lab/build/switch-review/atlas-'+mode+'.png',clip:last});
  }
  await page.locator('#labAtlasGlobe').screenshot({path:'android-lab/build/switch-review/integrated-globe.png'});
  await page.locator('#atlasHome').evaluate(el=>el.click());await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>labAtlasGlobe.getCenter().lng),10,'Whole World resets camera while preserving stamps');
  assert.equal(await page.getByText('SHIPS, ROUTES & MARGINALIA',{exact:true}).count(),0,'Discoveries are not exposed as a list');
  const routePoint=await page.evaluate(()=>{
   const map=labAtlasGlobe,rect=map.getCanvas().getBoundingClientRect();
   const routes=map.querySourceFeatures('routes').filter(f=>f.properties.secret==='westbound-manifest');
   for(const feature of routes)for(const coordinate of feature.geometry.coordinates){
    const p=map.project(coordinate);if(p.x<8||p.y<8||p.x>rect.width-8||p.y>rect.height-8)continue;
    if(map.queryRenderedFeatures(p,{layers:['route-targets']}).some(f=>f.properties.secret==='westbound-manifest'))return {x:rect.left+p.x,y:rect.top+p.y};
   }
   return null;
  });
  assert(routePoint,'Westbound route can be discovered on the map');
  await page.mouse.click(routePoint.x,routePoint.y);
  await page.locator('#atlasSecretCard').waitFor({state:'visible'});
  await page.locator('.atlas-secret-add').click();
  const selected=await page.locator('[data-crate-stamp-region]').evaluateAll(nodes=>nodes.map(n=>n.dataset.crateStampRegion));
  assert.deepEqual(selected.sort(),['atlantic-europe','canada-east','caribbean'].sort(),'Route picks replace previous selections');
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:8});
  await page.locator('#labAtlasGlobe').scrollIntoViewIfNeeded();
  await page.evaluate(()=>{window.globeFrames=[];window.globeMeasuring=true;let last=performance.now();function frame(t){globeFrames.push(t-last);last=t;if(globeMeasuring)requestAnimationFrame(frame)}requestAnimationFrame(frame)});
  const b=await page.locator('#labAtlasGlobe').boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy}]});
  for(let i=1;i<=24;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+Math.sin(i/24*Math.PI*2)*40,y:cy+Math.cos(i/24*Math.PI*2)*15}]});await page.waitForTimeout(16)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  console.log('Globe 8xCPU drag frames:',await page.evaluate(()=>{globeMeasuring=false;globeFrames.sort((a,b)=>a-b);return {frames:globeFrames.length,p95:globeFrames[Math.floor(globeFrames.length*.95)]}}));
  await page.locator('#labAtlasGlobe').screenshot({path:'android-lab/build/switch-review/integrated-globe-after-drag.png'});
  assert.deepEqual(errors,[]);
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto('http://127.0.0.1:'+server.address().port+'/atlas-lab.html');
  await page.waitForFunction(()=>window.atlasTestReady,{timeout:30000});
  await page.waitForFunction(()=>atlasTestMap.loaded());
  assert.equal(await page.evaluate(()=>atlasTestMap.getProjection().type),'globe');
  await page.screenshot({path:'android-lab/build/switch-review/maplibre-globe.png'});
  await page.locator('#map').click({position:{x:206,y:290}});
  await page.locator('#flat').click();
  await page.evaluate(()=>atlasTestMap.jumpTo({zoom:3,center:[10,20]}));
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>atlasTestMap.getPaintProperty('borders','line-width')),.7,'Border thickness stays screen-relative');
  await page.screenshot({path:'android-lab/build/switch-review/maplibre-flat.png'});
  assert(requests.every(url=>url.startsWith('http://127.0.0.1:')||url.startsWith('blob:')||url.startsWith('data:')),'Prototype runs without remote map requests');
  assert.deepEqual(errors,[]);

  console.log('PASS: mobile workspace, scroll restoration, preferences, save, exact-prompt copy, ChatGPT/Gemini GO, Open, and native Share hooks.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
