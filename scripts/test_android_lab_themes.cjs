// Native Android Lab theme parity visual smoke, including real projection renders.
// Isolated browser test only; no APK signing or production deployment.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const output=path.resolve(__dirname,'../android-lab/build/theme-review');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
const palettes={
 liberi:{page:'rgb(223, 176, 69)',ink:'rgb(16, 49, 53)',land:'#dfb045'},
 bosque:{page:'rgb(245, 240, 230)',ink:'rgb(0, 48, 24)',land:'#004225'},
 usiku:{page:'rgb(17, 17, 17)',ink:'rgb(245, 240, 230)',land:'#f5f0e6'}
};
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
  fs.mkdirSync(output,{recursive:true});
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const width of [390,320]){
   const page=await browser.newPage({viewport:{width,height:860},isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.HipsterLab={state:()=>'{"saved":[]}',inspiration:()=>'',copy:()=>true}});
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,null,{timeout:30000});
   await page.emulateMedia({reducedMotion:'reduce'});
   for(const name of Object.keys(palettes)){
    await page.locator('.lab-rail [data-lab-action=preferences]').click();
    await page.locator('[data-lab-theme='+name+']').click();
    assert.equal(await page.locator('[data-lab-theme][aria-pressed=true]').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),name);
    assert.equal(await page.evaluate(()=>window.HipsterLabTheme?.current()),name);
    assert.equal(await page.evaluate(()=>localStorage.getItem('ghg-lab-theme-v1')),name);
    assert.equal(await page.evaluate(()=>window.GHGAtlasPaintColors?.().theme),name);
    if(width===390)await page.screenshot({path:path.join(output,`${name}-preferences.png`)});
    await page.locator('[data-lab-action=close-preferences]').click();
    await page.waitForTimeout(150);
    // Source map paint is not a post-hoc CSS bitmap filter.
    const paint=await page.evaluate(()=>({
     land:JSON.stringify(window.labAtlasGlobe.getPaintProperty('land','fill-color')),
     page:getComputedStyle(document.querySelector('#labJukebox')).backgroundColor,
     isWide:document.documentElement.scrollWidth>innerWidth+2
    }));
    assert(paint.land.includes(palettes[name].land),'Missing '+name+' MapLibre land fill: '+paint.land);
    assert(!paint.isWide,'Horizontal scroll/zoom introduced for '+name+' on '+width+'px');
    if(width===390){
     await page.locator('.mood-grid').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(output,`${name}-portraits.png`)});
     await page.locator('#labAtlasGlobe').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(output,`${name}-robinson.png`)});
     await page.locator('[data-atlas-view=cahill-keyes]').click();
     await page.waitForFunction(()=>document.querySelector('[data-atlas-view=cahill-keyes]')?.getAttribute('aria-pressed')==='true',null,{timeout:15000});
     await page.screenshot({path:path.join(output,`${name}-keyes.png`)});
     await page.locator('[data-atlas-view=globe]').click();
     await page.waitForFunction(()=>document.querySelector('[data-atlas-view=globe]')?.getAttribute('aria-pressed')==='true',null,{timeout:15000});
     await page.screenshot({path:path.join(output,`${name}-globe.png`)});
     await page.locator('[data-atlas-view=robinson]').click();
     await page.waitForFunction(()=>document.querySelector('[data-atlas-view=robinson]')?.getAttribute('aria-pressed')==='true',null,{timeout:15000});
    }
   }
   await page.reload({waitUntil:'domcontentloaded'});
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),'usiku','Persisted theme must apply before paint');
   assert.deepEqual(errors,[],'Android theme picker or renderer JS exceptions');
   await page.close();
  }
  console.log('PASS: Android Libéri/Bosque/Usiku are persistent, readable and map color-matched at 390px / 320px');
 }finally{await browser?.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=1});
