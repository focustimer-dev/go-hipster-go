// Focused phone-viewport test for animated GEOGRAPHY, not just the mask.
// This intentionally runs apart from the large interface screenshot suite.
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
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('Browser JS error:',e.message)});
  await page.addInitScript(()=>{window.HipsterLab={state:()=>'{"saved":[]}',inspiration:()=>'',copy:()=>true}});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&!!document.querySelector('[data-atlas-view=globe]'),{timeout:20000});
  const sample=async mode=>await page.evaluate(mode=>new Promise((resolve,reject)=>{
   const points=[];let ready=false;
   const began=performance.now();
   document.querySelector('[data-atlas-view='+mode+']').click();
   const clickCost=performance.now()-began;
   function tick(){
    const veil=document.querySelector('.lab-atlas-morph');
    if(veil){
     const canvas=veil.querySelector('.lab-atlas-morph-vectors');
     if(canvas&&['pop','dock'].includes(veil.dataset.phase)){
      // Sample geography and scale from the SAME requestAnimationFrame.
      // Reading computed styles or pixels here can stall Chromium's GPU.
      points.push({t:performance.now()-began,p:+veil.dataset.vectorProgress,
       phase:veil.dataset.phase,fitX:+veil.dataset.fitX,fitY:+veil.dataset.fitY,
       clickCost,w:document.querySelector('#labAtlasGlobe').clientWidth,
       h:document.querySelector('#labAtlasGlobe').clientHeight});
     }
    }else if(points.length){
     ready=true;resolve(points);return;
    }
    if(performance.now()-began>6000){
     reject(new Error('Atlas did not clean up: '+JSON.stringify({mode,clickCost,frames:points.length,
      last:points.slice(-8),phase:veil?.dataset.phase,progress:veil?.dataset.vectorProgress,
      ready:veil?.dataset.targetReady,opacity:veil?.style.opacity,pointerEvents:document.querySelector('#labAtlasGlobe').style.pointerEvents})));
     return
    }
    requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
  }),mode);
  const out=await sample('globe');
  const toGlobe=await page.evaluate(()=>window.__labAtlasLastMorph);
  const back=await sample('robinson');
  const toRobinson=await page.evaluate(()=>window.__labAtlasLastMorph);
  console.log('Projection commit timing and measured endpoint fit:',{toGlobe,toRobinson});
  for(const [name,record] of [['globe',toGlobe],['robinson',toRobinson]]){
   const f=record?.landingFit;
   assert(f&&['x','y','sx','sy'].every(k=>Number.isFinite(f[k])),
    name+' must have measured destination coordinates, not nominal dimensions');
   assert(f.sx>.2&&f.sy>.2,name+' must land within the renderer bounds');
   assert(record.endpointResidual<.035,name+' integrated endpoint should need at most 3.5% last correction');
  }
  for(const [label,rows] of [['Globe',out],['Robinson',back]]){
   console.log(label+' unified tween diagnostic:',JSON.stringify(rows.map(r=>({t:Math.round(r.t),p:r.p,fitX:r.fitX,fitY:r.fitY,phase:r.phase,clickCost:Math.round(r.clickCost),w:r.w,h:r.h}))));
   // Headless SwiftShader may skip late frames on a software repaint.
   // The essential contract: at least two DISTINCT real geographic positions
   // appear before endpoint and the reverse trip traverses them backwards.
   const intermediate=rows.filter(r=>r.p>.0005&&r.p<.9995);
   assert(rows[0].clickCost<800,label+' must not block tap for expensive MapLibre projection work');
   assert(intermediate.length>=2,label+' must show at least two real vector in-between frames');
   assert(new Set(intermediate.map(r=>r.p.toFixed(2))).size>=2,label+' vertices must move across several frames');
   const moving=rows.filter(r=>r.phase==='pop'&&Number.isFinite(r.fitX)&&Number.isFinite(r.fitY));
   assert(moving.length>=2,label+' should reveal the same continuous size motion as its land geometry');
   assert(new Set(moving.map(r=>r.fitX.toFixed(3))).size>=2,label+' scale should evolve WITH geography');
   if(label==='Globe')assert(moving[0].fitX>moving.at(-1).fitX,
    'Globe scales inward while continents converge, not after they finish');
   else assert(moving[0].fitX<moving.at(-1).fitX,
    'Robinson scales outward while continents unfold, not after they finish');
  }
  assert.equal(await page.locator('.lab-atlas-morph').count(),0,'No overlay after settling');
  assert(out[0].p<out.at(-1).p,'Globe transition moves coastlines forwards');
  assert(back[0].p>back.at(-1).p,'Robinson transition moves coastlines backwards');
  assert(toGlobe?.commitMs<1500&&toRobinson?.commitMs<1500,'MapLibre projection commits must not freeze the map');
  assert.equal(toGlobe?.to,'globe','MapLibre finishes its Globe destination');
  assert.equal(toRobinson?.to,'robinson','MapLibre finishes its Robinson destination');
  assert.equal(await page.locator('#labAtlasGlobe').evaluate(el=>el.style.pointerEvents),'','Map gestures restored');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-atlas-view=globe]').click();
  assert.equal(await page.locator('.lab-atlas-morph').count(),0,'Reduced motion skips geographic animation');
  assert.equal(await page.locator('[data-atlas-view=globe]').getAttribute('aria-pressed'),'true');
  // Ensure endpoint dimensions are viewport-relative, not hardcoded for 412px.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:320,height:740});
  await page.waitForTimeout(280);
  const narrowBack=await sample('robinson');
  const narrowToRobinson=await page.evaluate(()=>window.__labAtlasLastMorph);
  const narrowOut=await sample('globe');
  const narrowToGlobe=await page.evaluate(()=>window.__labAtlasLastMorph);
  console.log('Narrow viewport endpoint camera:',{narrowToRobinson,narrowToGlobe,
   camera:await page.evaluate(()=>{
    const m=window.labAtlasGlobe;
    return {zoom:m.getZoom(),projection:m.getProjection()?.type,
     center:m.getCenter().toArray(),width:m.getContainer().clientWidth,
     height:m.getContainer().clientHeight,loaded:m.loaded()};
   })});
  for(const [name,record] of [['robinson',narrowToRobinson],['globe',narrowToGlobe]]){
   assert(record?.endpointResidual<.035,
    name+' endpoint should stay aligned within 3.5% on a narrow phone');
  }
  assert(narrowBack.length>=2&&narrowOut.length>=2,
   'Both narrow-phone transitions must paint multiple geographic frames');
  assert.equal(await page.locator('#labAtlasGlobe').evaluate(el=>el.style.pointerEvents),'',
   'Narrow-phone transition restores map hit testing');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,
   'Narrow-phone projection morph does not cause sideways page scrolling');
  assert.deepEqual(errors,[],'No browser script errors');
  console.log('Vector betweening passed. Frames:',{globe:out.length,robinson:back.length,
   narrowGlobe:narrowOut.length,narrowRobinson:narrowBack.length});
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
