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
   // Polar-ocean pigment must be fully opaque: a faint graticule previously
   // leaked its 0.21 alpha into the Antarctic circle in the cached film.
   const polarInk=await page.evaluate(()=>window.labCahillMap.polarInkSample());
   assert(polarInk[0]<35&&polarInk[1]<75&&polarInk[2]<75,
    'Antarctic polar ocean should retain full petrol ink, not washed-out graticule alpha');
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
    const clickMs=Date.now()-started;
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
     console.log('Cahill motion diagnostics',JSON.stringify({from,to,width,frames:stats.frames,maxPaintMs:stats.maxPaintMs,renderSignal:stats.renderSignal,fitSampled:stats.fitSampled,
      endpointResidual:stats.endpointResidual,clickMs,
      animationElapsedMs:stats.animationElapsedMs,elapsedMs:elapsed,samples:samples.length,progress:samples.map(x=>x.progress).slice(0,12)}));
     assert(stats.frames>=8,'Must render distinct physical in-between poses');
     assert(stats.maxPaintMs<35,'No heavy geography projection on each motion frame');
     if(to!=='cahill-keyes'&&stats.fitSampled){
      assert(Number.isFinite(stats.endpointResidual),
       'A measured live destination must report the terminal silhouette residual');
      assert(stats.endpointResidual<.2,
       'Cached Cahill frame must stay within calibrated MapLibre endpoint range');
     }
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
   // Real two-pointer pinch: midpoint translation and scaling must remain
   // anchored, and a pinch must never stamp a country accidentally.
   await page.locator('[data-atlas-view=cahill-keyes]').click();
   await page.waitForFunction(()=>document.querySelector('[data-atlas-view="cahill-keyes"]')?.getAttribute('aria-pressed')==='true'&&
    !document.querySelector('.lab-cahill-motion,.lab-atlas-morph'));
   await page.locator('#labAtlasCahill').scrollIntoViewIfNeeded();
   const rect=await page.locator('#labAtlasCahill').boundingBox();
   const cx=rect.x+rect.width/2,cy=rect.y+rect.height/2;
   const initial=await page.evaluate(()=>window.labCahillMap.camera.snapshot());
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[
    {x:cx-25,y:cy,id:1},{x:cx+25,y:cy,id:2}]});
   for(let step=1;step<=10;step++){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[
     {x:cx-25-step*4+step,y:cy+step*.4,id:1},
     {x:cx+25+step*4+step,y:cy+step*.4,id:2}]});
    await page.waitForTimeout(20);
   }
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await cdp.detach();await page.waitForTimeout(60);
   const afterPinch=await page.evaluate(()=>window.labCahillMap.camera.snapshot());
   assert(afterPinch.zoom>1.2,'Cahill two-finger pinch must zoom, not scroll the page');
   const drawn=await page.evaluate(()=>{
    const svg=window.labCahillMap.svg,viewport=svg.parentElement;
    const b=window.labCahillMap.camera.snapshot();
    const r=svg.getBoundingClientRect(),v=viewport.getBoundingClientRect();
    return {viewBox:svg.getAttribute('viewBox'),transform:svg.style.transform,
     xError:r.left-(v.left-b.x/960*b.zoom*v.width),
     yError:r.top-(v.top+(65-b.y)/505*b.zoom*v.height),
     widthError:r.width-v.width*b.zoom,heightError:r.height-v.height*b.zoom};
   });
   assert.equal(drawn.viewBox,'0 65 960 505','Cahill zoom keeps immutable SVG viewport');
   assert(drawn.transform.includes('translate3d'),'Cahill zoom uses GPU-composited camera');
   assert(Math.max(Math.abs(drawn.xError),Math.abs(drawn.yError),
    Math.abs(drawn.widthError),Math.abs(drawn.heightError))<1.5,
    'Cahill visual transform follows its model camera without scale jumps');

   assert([afterPinch.x,afterPinch.y,afterPinch.w,afterPinch.h].every(Number.isFinite),
    'Cahill pinch camera must remain finite');
   const anchoredX=afterPinch.x+(rect.width/2+10)/rect.width*afterPinch.w;
   const anchoredY=afterPinch.y+(rect.height/2+4)/rect.height*afterPinch.h;
   assert(Math.abs(anchoredX-(initial.x+initial.w/2))<25&&
    Math.abs(anchoredY-(initial.y+initial.h/2))<25,
    'Cahill pinch midpoint must keep its geographic anchor under moving fingers');
   const postPinchSelection=await page.evaluate(()=>[...document.querySelectorAll('[data-crate-region][aria-pressed=true]')]
    .map(el=>el.dataset.crateRegion).sort());
   assert.deepEqual(postPinchSelection,selection,'Pinch must not stamp countries');
   console.log('Cahill pinch QA',JSON.stringify({width,zoom:afterPinch.zoom,
    anchorErrorX:anchoredX-(initial.x+initial.w/2),
    anchorErrorY:anchoredY-(initial.y+initial.h/2)}));
   // Double-tap must ease like MapLibre, never teleport between zoom levels.
   // A continuous pinch above still tracks fingers without interpolation.
   const doubleStart=afterPinch.zoom;
   await page.locator('#labAtlasCahill').evaluate(el=>{
    const r=el.parentElement.getBoundingClientRect();
    el.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,cancelable:true,
     clientX:r.left+r.width*.5,clientY:r.top+r.height*.5}));
   });
   await page.waitForTimeout(80);
   const middle=await page.evaluate(()=>window.labCahillMap.camera.snapshot().zoom);
   await page.waitForTimeout(260);
   const finished=await page.evaluate(()=>window.labCahillMap.camera.snapshot().zoom);
   assert(middle>doubleStart+.05&&middle<finished-.05,
    'Cahill double-tap zoom must have intermediate easing frames');
   assert(Math.abs(finished-doubleStart*1.8)<.03,
    'Cahill double-tap must land at the geographic target without overshoot');
   console.log('Cahill tap easing QA',JSON.stringify({width,doubleStart,middle,finished}));
   // Real selection auto-fit: adding East Asia and US West from a detailed
   // zoom must widen the atlas with intermediate geographic camera frames.
   // This is the "PICK THESE REGIONS" behavior seen in the phone recording.
   const selectionFit=await page.evaluate(async ()=>{
    const initial=window.labCahillMap.camera.snapshot();
    const started=performance.now(),samples=[{ms:0,...initial}];
    const map=document.querySelector('#crateAtlasMap');
    if(!map?._atlasOpenSecret)throw new Error('Pacific route discovery missing');
    map._atlasOpenSecret('pacific-handoff');
    document.querySelector('.atlas-secret-add').click();
    const immediate=window.labCahillMap.camera.snapshot();
    await new Promise((resolve,reject)=>{
     let stable=0,previousZoom=NaN;
     const poll=()=>{
      const next=window.labCahillMap.camera.snapshot();
      samples.push({ms:performance.now()-started,...next});
      stable=Math.abs(next.zoom-previousZoom)<.0001?stable+1:0;
      previousZoom=next.zoom;
      if(stable>=4&&performance.now()-started>150){resolve();return}
      if(performance.now()-started>3500){reject(new Error('Region-fit camera did not settle'));return}
      requestAnimationFrame(poll);
     };requestAnimationFrame(poll);
    });
    return {initial,immediate,final:window.labCahillMap.camera.snapshot(),
     samples,regions:[...document.querySelectorAll('[data-crate-stamp-region]')]
      .map(el=>el.dataset.crateStampRegion).sort()};
   });
   assert.deepEqual(selectionFit.regions,['east-asia','us-west'],
    'Picking distant regions keeps both geographic selections');
   assert(selectionFit.initial.zoom>2,'Region fit starts at a close geographic zoom');
   assert(Math.abs(selectionFit.immediate.zoom-selectionFit.initial.zoom)<.03,
    'Picking regions must not instantly jump to a wide camera');
   assert(selectionFit.final.zoom<selectionFit.initial.zoom-.7,
    'Distant regions must widen the camera enough to show the selection');
   const fits=selectionFit.samples.map(x=>x.zoom);
   assert(new Set(fits.map(x=>x.toFixed(2))).size>=5,
    'Selection zoom-out must show at least five distinct intermediate camera scales');
   assert(fits.every(x=>Number.isFinite(x)&&x>=1&&x<=5.5),
    'Region-fit camera scales stay bounded and finite');
   console.log('Cahill selected-region easing QA',JSON.stringify({
    width,initial:selectionFit.initial.zoom,final:selectionFit.final.zoom,
    frames:selectionFit.samples.length,distinct:new Set(fits.map(x=>x.toFixed(2))).size,
    elapsed:selectionFit.samples.at(-1).ms
   }));


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
