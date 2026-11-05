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
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
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
     if(canvas&&veil.dataset.phase==='pop'){
      // DO NOT getImageData here: GPU readback can stall 400+ ms on CI.
      // Geometry/pixel validity is checked deterministically in the Node test.
      points.push({t:performance.now()-began,p:+veil.dataset.vectorProgress,clickCost,w:document.querySelector('#labAtlasGlobe').clientWidth,h:document.querySelector('#labAtlasGlobe').clientHeight});
     }
    }else if(points.length){
     ready=true;resolve(points);return;
    }
    if(performance.now()-began>6000){reject(new Error('Atlas did not clean up its vector overlay'));return}
    requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
  }),mode);
  const out=await sample('globe');
  const back=await sample('robinson');
  for(const [label,rows] of [['Globe',out],['Robinson',back]]){
   console.log(label+' tween diagnostic:',JSON.stringify(rows.map(r=>({t:Math.round(r.t),p:r.p,clickCost:Math.round(r.clickCost),w:r.w,h:r.h}))));
   const intermediate=rows.filter(r=>r.p>.05&&r.p<.95);
   assert(intermediate.length>=2,label+' must show at least two real vector in-between frames');
   assert(new Set(intermediate.map(r=>r.p.toFixed(2))).size>=2,label+' vertices must move across several frames');
  }
  assert.equal(await page.locator('.lab-atlas-morph').count(),0,'No overlay after settling');
  assert.equal(await page.locator('#labAtlasGlobe').evaluate(el=>el.style.pointerEvents),'','Map gestures restored');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-atlas-view=globe]').click();
  assert.equal(await page.locator('.lab-atlas-morph').count(),0,'Reduced motion skips geographic animation');
  assert.equal(await page.locator('[data-atlas-view=globe]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[],'No browser script errors');
  console.log('Vector betweening passed. Frames:',{globe:out.length,robinson:back.length});
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
