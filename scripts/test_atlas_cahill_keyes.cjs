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
    points:pts,sphereMoves:(sphere.match(/M/g)||[]).length,sphereBytes:sphere.length,
    vendorAvailable:typeof window.labCahillD3?.geoCahillKeyes==='function'};
  });
  assert(initial.vendorAvailable,'D3 geographic code must be shipped fully offline');
  assert(initial.regionFeatures>=150,'Canonical country features must be present');
  assert(initial.points.every(p=>p&&p.every(Number.isFinite)),'Every test continent has finite actual Cahill-Keyes coordinates');
  assert(initial.sphereBytes>50,'Octahedral ocean outline must be rendered');
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
  assert(Math.abs(cahill.ratio-960/540)<.045,'M-shaped view has a predictable phone aspect ratio');
  assert(cahill.visible&&cahill.opaque>=.99,'M-shaped geography is the visible map');
  assert(!cahill.overflow,'No sideways page scroll from the third selector/map');
  assert.equal(cahill.gesture,'','Gestures restored after entering Cahill');
  assert.match(cahill.label,/Cahill/);
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
  const wheel=await page.evaluate(()=>{
   const svg=document.getElementById('labAtlasCahill');
   const before=+svg.getAttribute('viewBox').split(' ')[2],r=svg.getBoundingClientRect();
   svg.dispatchEvent(new WheelEvent('wheel',{deltaY:-180,clientX:r.left+r.width/2,
    clientY:r.top+r.height/2,bubbles:true,cancelable:true}));
   return {before,after:+svg.getAttribute('viewBox').split(' ')[2]};
  });
  assert(wheel.after<wheel.before,'Cahill map supports interactive magnification');
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
  await page.waitForFunction(()=>document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&!document.querySelector('.lab-atlas-morph')&&document.getElementById('labAtlasCahill')?.style.display==='none'&&window.labAtlasGlobe?.getProjection()?.type==='mercator',
   null,{timeout:7000});
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
