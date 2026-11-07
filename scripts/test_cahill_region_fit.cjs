// Focused regression for Cahill–Keyes automatic selection zoom-out.
// Tests the real Android Lab bundle without invoking unrelated projection morphs.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch(_){res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const width of [412,320]){
   const page=await browser.newPage({viewport:{width,height:915},isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(()=>{window.HipsterLab={state:()=>'{"saved":[]}',inspiration:()=>'',copy:()=>true}});
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.labCahillMap?.ready&&window.labAtlasGlobe?.loaded(),null,{timeout:24000});
   // Enter Keyes instantly so software WebGL projection timing cannot
   // obscure whether its independent region-fit camera is working.
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('[data-atlas-view=cahill-keyes]').evaluate(el=>el.click());
   await page.waitForFunction(()=>document.querySelector('[data-atlas-view=cahill-keyes]')?.getAttribute('aria-pressed')==='true',null,{timeout:7000});
   await page.emulateMedia({reducedMotion:'no-preference'});
   const svg=page.locator('#labAtlasCahill');
   // Two discrete zooms recreate the user's detailed Pacific-route view.
   for(let i=0;i<2;i++){
    await svg.evaluate(el=>{
     const r=el.parentElement.getBoundingClientRect();
     el.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true,
      clientX:r.left+r.width/2,clientY:r.top+r.height/2}));
    });
    await page.waitForTimeout(300);
   }
   const result=await page.evaluate(async ()=>{
    const camera=window.labCahillMap.camera,start=camera.snapshot(),samples=[];
    // This follows exactly the toggleCrateRegion -> updateCrateMap ->
    // frameSelectedAtlas -> labCahillFocus route used by route picks.
    const map=document.querySelector('#crateAtlasMap');
    if(!map?._atlasOpenSecret)throw new Error('Missing installed route discovery');
    map._atlasOpenSecret('pacific-handoff');
    document.querySelector('.atlas-secret-add').click();
    const immediate=camera.snapshot(),began=performance.now();
    return await new Promise((resolve,reject)=>{
     let stable=0,prev=NaN;
     const poll=()=>{
      const state=camera.snapshot();
      samples.push({ms:performance.now()-began,zoom:state.zoom,x:state.x,y:state.y});
      stable=Math.abs(state.zoom-prev)<.0001?stable+1:0;
      prev=state.zoom;
      if(stable>=4&&performance.now()-began>180){
       resolve({start,immediate,final:state,samples,
        regions:[...document.querySelectorAll('[data-crate-stamp-region]')]
         .map(el=>el.dataset.crateStampRegion).sort()});return;
      }
      if(performance.now()-began>5000){reject(new Error('Cahill selection fit never settled'));return}
      requestAnimationFrame(poll);
     };
     requestAnimationFrame(poll);
    });
   });
   const scales=result.samples.map(s=>s.zoom),distinct=new Set(scales.map(z=>z.toFixed(2))).size;
   console.log('Cahill selection-region camera',JSON.stringify({width,
    initial:result.start.zoom,immediate:result.immediate.zoom,final:result.final.zoom,
    frames:result.samples.length,distinct,duration:result.samples.at(-1).ms}));
   assert.deepEqual(result.regions,['east-asia','us-west'],'The two distant route regions remain selected');
   assert(result.start.zoom>2.5,'The test starts at a close geographic zoom');
   assert(Math.abs(result.immediate.zoom-result.start.zoom)<.03,'Region pick must not jump the camera instantly');
   assert(result.final.zoom<result.start.zoom-.7,'The camera must widen to include both distant regions');
   assert(distinct>=5,'Auto-fit needs at least five genuine intermediate camera scales');
   assert(scales.every(z=>Number.isFinite(z)&&z>=1&&z<=5.5),'Auto-fit camera remains bounded');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,
    'The camera must not widen the phone page');
   assert.deepEqual(errors,[],'No JavaScript exceptions');
   await page.close();
  }
  console.log('PASS: Cahill multi-region selection fit eases rather than snapping at 320px and 412px');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error(error);process.exitCode=1});
