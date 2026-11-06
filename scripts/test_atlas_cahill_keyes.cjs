// Focused 412px + 320px Android WebView simulation for the real Cahill-Keyes projection.
// Run after scripts/bundle_android_lab.py (offline vendor must be present).
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch(e){res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.HipsterLab={state:()=>'{"saved":[]}',inspiration:()=>'',copy:()=>true}});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,{timeout:22000});
  assert.deepEqual(await page.locator('[data-atlas-view]').evaluateAll(es=>es.map(e=>e.dataset.atlasView)),
   ['robinson','globe','cahill-keyes']);
  const initial=await page.evaluate(()=>{
   const d=window.labCahillMap;
   const sphere=d.svg.querySelector('.lab-cahill-ocean')?.getAttribute('d')||'';
   const ids=d.regions.map(x=>x.id);
   const pts=[[-100,40],[10,40],[120,25],[-60,-15],[130,-30]].map(x=>d.projection(x));
   return {regionFeatures:d.regions.length,selected:new Set(ids).size,
     routeStats:d.routeStats,discoveryCount:d.discoveryCount,
    points:pts,sphereMoves:(sphere.match(/M/g)||[]).length,sphereBytes:sphere.length,
    vendorAvailable:typeof window.labCahillD3?.geoCahillKeyes==='function',
     rewound:d.rewoundPolygons,
     antarcticScaleError:(()=>{
      const a=d.projection([-58,-60]),b=d.projection([-58,-57]);
      const base=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const cap=2*d.antarcticPanel.scale*
       (Math.sin(33*Math.PI/360)-Math.sin(30*Math.PI/360));
      return Math.abs(cap/base-1);
     })(),
     antarcticaPath:document.getElementById('labCahillAntarctica')?.getAttribute('d')?.length||0,
     antarcticaOcean:document.getElementById('labCahillAntarcticOcean')?.getAttribute('fill'),
     polarRadius:+(document.getElementById('labCahillAntarcticOcean')?.getAttribute('r')||0),
     mapOcean:d.svg.querySelector('.lab-cahill-ocean')?.getAttribute('fill'),
     africaWidth:(()=>{
      const f=d.regions.find(r=>r.feature.id===22)?.feature;
      if(!f)return -1;
      const b=window.labCahillD3.geoPath(d.projection).bounds(f);
      return b[1][0]-b[0][0];
     })()};
  });
  assert(initial.vendorAvailable,'D3 geographic code must be shipped fully offline');
  assert(initial.regionFeatures>=150,'Canonical country features must be present');
  assert(initial.points.every(p=>p&&p.every(Number.isFinite)),'Every test continent has finite actual Cahill-Keyes coordinates');
  assert(initial.sphereBytes>50,'Octahedral ocean outline must be rendered');
   assert(initial.routeStats.length>=5,'All nautical discoveries retain named tracks');
   assert(initial.discoveryCount>=5,'All routes have accessible touch markers');
   for(const id of ['pacific-handoff','westbound-manifest']){
    const route=initial.routeStats.find(x=>x.id===id);
    assert(route?.breaks>0,id+' must split at a polyhedral interruption');
    assert(route.fragments>1,id+' has separate land-safe polyline pieces');
   }
   assert.equal(initial.rewound,2,'Two inverted canonical rings corrected');
   assert(initial.africaWidth>0&&initial.africaWidth<200,
    'Corrected country polygon must not paint over the entire ocean');
   assert(initial.antarcticaPath>1500,'Real Antarctic coastline has been reconstructed');
   assert.equal(initial.antarcticaOcean,'#103135');
   assert.equal(initial.mapOcean,'#103135');
   assert(initial.polarRadius>65,'Full Antarctic polar panel must be visible');
   assert(initial.antarcticScaleError<.05,'South polar reconstruction preserves local Cahill meridional scale');
  await page.locator('[data-atlas-view=cahill-keyes]').click();
  await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&document.getElementById('labAtlasCahill')?.style.opacity==='1',
   null,{timeout:6500});
  const cahill=await page.evaluate(()=>{
   const el=document.getElementById('labAtlasGlobe'),svg=document.getElementById('labAtlasCahill');
   return {ratio:el.clientWidth/el.clientHeight,mode:document.querySelector('[data-atlas-view][aria-pressed="true"]')?.dataset.atlasView,
    visible:getComputedStyle(svg).display!=='none',
    opaque:+svg.style.opacity,overflow:document.documentElement.scrollWidth>innerWidth,
    label:el.getAttribute('aria-label'),gesture:el.style.pointerEvents};
  });
  assert(Math.abs(cahill.ratio-960/505)<.045,'M-shaped view has a predictable phone aspect ratio');
  assert(cahill.visible&&cahill.opaque>=.99,'M-shaped geography is the visible map');
  assert(!cahill.overflow,'No sideways page scroll from the third selector/map');
  assert.equal(cahill.gesture,'','Gestures restored after entering Cahill');
  assert.match(cahill.label,/Cahill/);
   const atWorld=await page.evaluate(()=>({
    targets:[...document.querySelectorAll('[data-cahill-route-target]')].map(x=>x.getAttribute('pointer-events')),
    markers:getComputedStyle(document.querySelector('.lab-cahill-route-pins')).display
   }));
   assert(atWorld.targets.length>=5&&atWorld.targets.every(x=>x==='none'),
    'Whole-world touch targets must not steal neighboring region taps');
   assert.equal(atWorld.markers,'none','Discovery markers only appear at zoom');
  await page.evaluate(()=>{
   document.querySelector('[data-cahill-region="west-africa"]')
    .dispatchEvent(new MouseEvent('click',{bubbles:true}));
  });
  await page.waitForFunction(()=>document.querySelector('[data-cahill-region="west-africa"]')
   ?.getAttribute('fill')==='#a83223');
  const selected=await page.evaluate(()=>({
   view:document.getElementById('labAtlasCahill').getAttribute('viewBox'),
   highlighted:document.querySelector('[data-cahill-region="west-africa"]')?.getAttribute('fill')
  }));
  assert.equal(selected.highlighted,'#a83223','Country hit area updates the canonical region selection');
  // In WebView, interactive SVG polygon bounding boxes used to flash as
  // large gold/white rectangles instead of changing the geographic fill.
  const focusInk=await page.evaluate(()=>{
   const el=document.querySelector('[data-cahill-region="west-africa"]');
   const style=getComputedStyle(el);
   return {tap:style.webkitTapHighlightColor,outline:style.outlineStyle,
    role:el.getAttribute('role'),tabindex:el.getAttribute('tabindex')};
  });
  assert.equal(focusInk.role,null,'Geographic SVG paths are not WebView button boxes');
  assert.equal(focusInk.tabindex,null,'Country tap does not trigger rectangular focus');
  assert.equal(focusInk.outline,'none','Country has no native rectangular outline');
  assert(['rgba(0,0,0,0)','transparent'].includes(focusInk.tap.split(' ').join('')),
   'WebView native tap flash disabled for map geography');
  // True Chromium touch input (not a script-created click): a tap inside
  // Ghana must hit the painted West Africa geography at phone scale.
  const ghana=await page.evaluate(()=>{
   const svg=document.getElementById('labAtlasCahill');
   const coords=window.labCahillMap.projection([-1.2,7.8]);
   const point=svg.createSVGPoint();point.x=coords[0];point.y=coords[1];
   const screen=point.matrixTransform(svg.getScreenCTM());
   const hit=document.elementFromPoint(screen.x,screen.y);
   return {x:screen.x,y:screen.y,region:hit?.closest?.('[data-cahill-region]')
    ?.getAttribute('data-cahill-region')};
  });
  assert.equal(ghana.region,'west-africa','Geographic touch location matches painted land');
  await page.touchscreen.tap(ghana.x,ghana.y);
  await page.waitForFunction(()=>document.querySelector('[data-cahill-region="west-africa"]')
   ?.getAttribute('fill')==='#dfb045',null,{timeout:1800});
  // Antarctic polygon remains a tappable selectable region.
   await page.evaluate(()=>document.getElementById('labCahillAntarctica')
    .dispatchEvent(new MouseEvent('click',{bubbles:true})));
   await page.waitForFunction(()=>document.querySelector('#labCahillAntarctica')
    ?.getAttribute('fill')==='#a83223');
   assert.equal(await page.locator('#labCahillAntarctica').getAttribute('aria-pressed'),
    'true','Antarctica uses the canonical region-selection state');
   // Region selection may auto-zoom to the maximum. Test wheel from the home extent.
  await page.evaluate(()=>window.labCahillMap.reset());
  const wheel=await page.evaluate(()=>{
   const svg=document.getElementById('labAtlasCahill');
   const before=+svg.getAttribute('viewBox').split(' ')[2],r=svg.getBoundingClientRect();
   svg.dispatchEvent(new WheelEvent('wheel',{deltaY:-180,clientX:r.left+r.width/2,
    clientY:r.top+r.height/2,bubbles:true,cancelable:true}));
   return {before,after:+svg.getAttribute('viewBox').split(' ')[2]};
  });
  assert(wheel.after<wheel.before,'Cahill map supports interactive magnification');
   const closeUp=await page.evaluate(()=>{
    const svg=document.getElementById('labAtlasCahill'),r=svg.getBoundingClientRect();
    svg.dispatchEvent(new WheelEvent('wheel',{deltaY:-180,clientX:r.left+r.width/2,
     clientY:r.top+r.height/2,bubbles:true,cancelable:true}));
    return {
     visible:getComputedStyle(document.querySelector('.lab-cahill-route-pins')).display,
     pins:[...document.querySelectorAll('.lab-cahill-discovery')].map(g=>({
      id:g.dataset.cahillDiscovery,tab:g.getAttribute('tabindex'),
      hit:+g.querySelectorAll('circle')[1]?.getAttribute('stroke-width')
     })),
     targets:[...document.querySelectorAll('[data-cahill-route-target]')].map(x=>x.getAttribute('pointer-events'))
    };
   });
   assert.notEqual(closeUp.visible,'none','Zoomed nautical markers must become discoverable');
   assert(closeUp.pins.length>=5&&closeUp.pins.every(x=>x.tab==='0'&&x.hit>=36),
    'Touch markers remain finger-sized and keyboard accessible');
   assert(closeUp.targets.every(x=>x==='stroke'),'Only close-up lanes have narrow hit strokes');
   await page.evaluate(()=>document.querySelector('[data-cahill-discovery="pacific-handoff"]')
    .dispatchEvent(new MouseEvent('click',{bubbles:true})));
   assert.equal(await page.evaluate(()=>document.getElementById('atlasSecretCard')?.hidden),false,
    'Route markers open their existing discovery card');
  // Reproduce Pixel bug: a 1.6 CSS-pixel finger tremor, pointerup, and
  // NO follow-up synthetic click must still stamp the correct SVG country.
  await page.evaluate(()=>window.labCahillMap.reset());
  const jitter=await page.evaluate(()=>{
   const svg=document.getElementById('labAtlasCahill');
   const land=document.querySelector('[data-cahill-region="west-africa"]');
   const xy=window.labCahillMap.projection([-1.2,7.8]);
   const p=svg.createSVGPoint();p.x=xy[0];p.y=xy[1];
   const screen=p.matrixTransform(svg.getScreenCTM());
   const x=screen.x,y=screen.y;
   const beforeView=svg.getAttribute('viewBox'),beforeFill=land.getAttribute('fill');
   const pointer=(type,xx)=>new PointerEvent(type,{bubbles:true,
    pointerId:987,pointerType:'touch',clientX:xx,clientY:y,isPrimary:true});
   land.dispatchEvent(pointer('pointerdown',x));
   land.dispatchEvent(pointer('pointermove',x+1.6));
   land.dispatchEvent(pointer('pointerup',x+1.6));
   return {beforeView,afterView:svg.getAttribute('viewBox'),beforeFill};
  });
  assert.equal(jitter.afterView,jitter.beforeView,
   'A 1.6px finger tremor must not pan the geographic camera');
  await page.waitForFunction(fill=>document.querySelector('[data-cahill-region="west-africa"]')
   ?.getAttribute('fill')!==fill,jitter.beforeFill,{timeout:1800});
  await page.waitForTimeout(120);
  assert.notEqual(await page.locator('[data-cahill-region="west-africa"]').first()
   .getAttribute('fill'),jitter.beforeFill,'One completed finger tap stamps exactly once');
  assert((await page.evaluate(()=>window.labCahillMap.touchDebug.landTaps))>=2,
   'Pointerup, not synthetic click, performs touch selection');
  // Home view, then switch to MapLibre; no stale overlays or input locks.
  await page.evaluate(()=>window.labCahillMap.reset());
  await page.locator('[data-atlas-view=globe]').click();
  await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&document.getElementById('labAtlasCahill')?.style.display==='none'&&window.labAtlasGlobe?.getProjection()?.type==='globe',
   null,{timeout:7000});
  assert.equal(await page.evaluate(()=>window.labAtlasGlobe.getProjection().type),'globe');
  assert.equal(await page.locator('#labAtlasCahill').evaluate(e=>getComputedStyle(e).display),'none');
  assert.equal(await page.locator('#labAtlasGlobe').evaluate(e=>e.style.pointerEvents),'');
  // The existing Robinson <-> Globe morph must still work untouched.
  await page.locator('[data-atlas-view=robinson]').click();
  try{
   await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&!document.querySelector('.lab-atlas-morph')&&document.getElementById('labAtlasCahill')?.style.display==='none'&&window.labAtlasGlobe?.getProjection()?.type==='mercator',
    null,{timeout:12000});
  }catch(error){
   console.log('Return-to-Robinson state',JSON.stringify(await page.evaluate(()=>({
    projection:window.labAtlasGlobe?.getProjection()?.type,
    requested:document.querySelector('[data-atlas-view][aria-pressed=true]')?.dataset.atlasView,
    pointer:document.getElementById('labAtlasGlobe')?.style.pointerEvents,
    cahill:document.getElementById('labAtlasCahill')?.style.display,
    morph:document.querySelector('.lab-atlas-morph')?.dataset.phase,
    morphInfo:window.__labAtlasLastMorph,
    mapLoaded:window.labAtlasGlobe?.loaded()
   }))));
   throw error;
  }
  await page.locator('[data-atlas-view=cahill-keyes]').click();
  await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&document.getElementById('labAtlasCahill')?.style.opacity==='1',
   null,{timeout:7000});
  // Last-tap wins across projection engines, even during a dissolve.
  await page.locator('[data-atlas-view=globe]').click();
  await page.locator('[data-atlas-view=cahill-keyes]').click();
  await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&document.getElementById('labAtlasCahill')?.style.opacity==='1',
   null,{timeout:8500});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-atlas-view=robinson]').click();
  await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&!document.querySelector('.lab-atlas-morph')&&document.getElementById('labAtlasCahill')?.style.display==='none'&&window.labAtlasGlobe?.getProjection()?.type==='mercator',
   null,{timeout:4000});
  await page.setViewportSize({width:320,height:740});
  await page.locator('[data-atlas-view=cahill-keyes]').click();
  await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&document.getElementById('labAtlasCahill')?.style.opacity==='1',
   null,{timeout:4000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,
   'Narrow screen still fits three modes and M-map');
  assert.equal(await page.locator('#labAtlasGlobe').evaluate(e=>e.style.pointerEvents),'');
  // Capture the full M-map and Antarctic extension, not a selected-region closeup.
   await page.evaluate(()=>window.labCahillMap.reset());
   assert.equal(await page.locator('#labAtlasCahill').getAttribute('viewBox'),
    '0.00 65.00 960.00 505.00','Whole world includes Antarctica');
   // Screenshot is for human geometry QA, not a blocking GPU performance gate.
  try{
   fs.mkdirSync('android-lab/build/switch-review',{recursive:true});
   await page.locator('#labAtlasGlobe').screenshot({
    path:'android-lab/build/switch-review/cahill-keyes-320.png',timeout:6000,animations:'disabled'});
  }catch(e){console.log('Optional screenshot skipped:',e.message.slice(0,180))}
  assert.deepEqual(errors,[],'No browser JavaScript errors');
  console.log('Cahill-Keyes phone interaction passed',JSON.stringify({initial,cahill,wheel}));
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
