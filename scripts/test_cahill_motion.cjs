// Six-direction atlas transition smoke: actual Android Lab browser build.
// The 4 Cahill routes share one reversible geographic canvas; Globe<->Robinson
// retains its independently verified canonical geographic tween.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
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
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const width of [412,320]){
   const page=await browser.newPage({viewport:{width,height:900},isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.HipsterLab={state:()=>'{"saved":[]}',inspiration:()=>'',copy:()=>true}});
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.labCahillMap?.ready&&window.labAtlasGlobe?.loaded(),null,{timeout:24000});
   const selection=await page.evaluate(()=>[...document.querySelectorAll('[data-crate-region][aria-pressed=true]')].map(e=>e.dataset.crateRegion).sort());
   const routes=[['robinson','cahill-keyes'],['cahill-keyes','globe'],
    ['globe','cahill-keyes'],['cahill-keyes','robinson'],
    ['robinson','globe'],['globe','robinson']];
   let i=0;
   for(const [from,to] of routes){
    const current=await page.locator('[data-atlas-view][aria-pressed=true]').getAttribute('data-atlas-view');
    assert.equal(current,from,'Route starts at expected live mode');
    const started=Date.now();
    await page.locator('[data-atlas-view='+to+']').click();
    const samples=await page.evaluate(async ({to,from})=>{
     let rows=[],began=performance.now(),first=false;
     return await new Promise((resolve,reject)=>{
      const poll=()=>{
       const v=document.querySelector('.lab-cahill-motion');
       if(v){first=true;rows.push({t:performance.now()-began,
        progress:+v.dataset.progress,frame:+v.dataset.frame,
        height:document.getElementById('labAtlasGlobe').getBoundingClientRect().height});
       }
       const done=document.querySelector('[data-atlas-view="'+to+'"]')?.getAttribute('aria-pressed')==='true'&&
        !document.querySelector('.lab-cahill-motion,.lab-atlas-morph')&&
        document.getElementById('labAtlasGlobe')?.style.pointerEvents==='';
       if(done&&(!first||rows.length>0)){resolve(rows);return}
       if(performance.now()-began>10000){reject(new Error(from+'→'+to+' stuck: '+JSON.stringify(rows.slice(-3))));return}
       requestAnimationFrame(poll);
      };requestAnimationFrame(poll);
     });
    },{to,from});
    const elapsed=Date.now()-started;
    if(from==='cahill-keyes'||to==='cahill-keyes'){
     const stats=await page.evaluate(()=>window.__labAtlasLastCahillSwitch);
     assert(stats?.finished&&stats?.to===to,'New geographic transition must finish');
     assert(stats.frames>=8,'Must render distinct physical in-between poses');
     assert(stats.maxPaintMs<35,'No heavy geography projection on each motion frame');
     assert(samples.length>=5,'Visible animation must generate tween frames');
     const between=samples.map(s=>s.progress).filter(p=>p>.03&&p<.97);
     assert(new Set(between.map(p=>p.toFixed(2))).size>=4,
      'Several distinct tween poses, not a static dissolve');
     if(to==='cahill-keyes')assert(samples[0].progress<samples.at(-1).progress,
      'Unfold progresses forward');
     else assert(samples[0].progress>samples.at(-1).progress,
      'Fold/rearrange runs the same geographic film backward');
     assert(elapsed<4500,'Cahill transition must finish without a long blank handoff');
    }
    const after=await page.evaluate(()=>[...document.querySelectorAll('[data-crate-region][aria-pressed=true]')].map(e=>e.dataset.crateRegion).sort());
    assert.deepEqual(after,selection,'Projection changes never change selected regions');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,
     'No projection transition creates horizontal page overflow');
    assert.equal(await page.locator('#labAtlasGlobe').evaluate(e=>e.style.pointerEvents),'',
     'Map gestures unlocked after every motion');
    console.log(width+'px '+from+' -> '+to,elapsed+'ms',samples.length+' in-between samples');
    if(to==='cahill-keyes'){
     fs.mkdirSync(path.join(__dirname,'../android-lab/build/motion-review'),{recursive:true});
     await page.locator('#labAtlasGlobe').screenshot({path:path.join(__dirname,
      '../android-lab/build/motion-review/keyes-'+width+'-'+(++i)+'.png'),animations:'disabled',timeout:30000});
    }
   }
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('[data-atlas-view=cahill-keyes]').click();
   assert.equal(await page.locator('.lab-cahill-motion').count(),0,
    'Reduced motion makes an instant geographic projection change');
   assert.equal(await page.locator('[data-atlas-view=cahill-keyes]').getAttribute('aria-pressed'),'true');
   assert.deepEqual(errors,[],'No browser JS exceptions');
   await page.close();
  }
 }finally{await browser?.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=1});
