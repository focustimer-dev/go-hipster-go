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
    const routes=await page.evaluate(()=>{
     const m=window.labAtlasGlobe;
     const source=m.getSource('routes')?.serialize?.().data?.features||[];
     const stroke=document.querySelector('#labAtlasCahill .lab-cahill-routes path');
     const ink=stroke?getComputedStyle(stroke):null;
     return {count:source.length,color:m.getPaintProperty('routes','line-color'),
      opacity:m.getPaintProperty('routes','line-opacity'),
      width:m.getPaintProperty('routes','line-width'),
      keyesCount:document.querySelectorAll('#labAtlasCahill .lab-cahill-routes path').length,
      keyesWidth:ink?parseFloat(ink.strokeWidth):0,
      keyesColor:ink?.stroke||''};
    });
    assert(routes.count>0&&routes.keyesCount>0,'Original shipping lanes must remain in both atlas engines');
    const expected=name==='liberi'?'#edc65d':name==='bosque'?'#8c6239':'#b77b4d';
    assert.equal(routes.color,expected,'Route ink '+name+' must match original/theme palette');
    assert.equal(routes.width,name==='liberi'?1:1.7,'Routes must read at phone size for '+name);
    assert.equal(routes.opacity,name==='liberi'?.65:.88,'Routes must not fade away in '+name);
    const water=await page.evaluate(()=>window.labAtlasGlobe.getPaintProperty('ocean','background-color'));
    assert.equal(water,'rgba(0,0,0,0)',
     'Robinson exterior field must not be painted with the water color');
    const plate=await page.evaluate(()=>window.labAtlasGlobe.getPaintProperty('robinson-ocean','fill-color'));
    assert.equal(plate,({liberi:'#103135',bosque:'#f5f0e6',usiku:'#111111'})[name],
     'Robinson ocean polygon must preserve '+name+' actual sea ink');
    if(name!=='liberi')assert(routes.keyesWidth>=1.8,'Keyes dashed route ink must be visible on '+width+'px');
    const boundary=await page.evaluate(()=>{
     const m=window.labAtlasGlobe;
     return {visible:m.getLayoutProperty('robinson-outline','visibility'),
      ink:m.getPaintProperty('robinson-outline','line-color'),
      width:m.getPaintProperty('robinson-outline','line-width')};
    });
    assert.equal(boundary.visible,'visible','Robinson needs a real projection-shaped edge');
    assert.equal(boundary.width,name==='bosque'?1.4:1.15,'Boundary stays restrained on phone');
    assert.equal(boundary.ink,name==='usiku'?'#b77b4d':name==='bosque'?'#003018':'#103135');
    if(width===390){
     await page.locator('.mood-grid').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(output,`${name}-portraits.png`)});
     await page.locator('#labAtlasGlobe').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(output,`${name}-robinson.png`)});
     await page.locator('[data-atlas-view=cahill-keyes]').click();
     await page.waitForFunction(()=>{const state=window.HipsterAtlasState?.();
      return state?.projection==='cahill-keyes'&&!state.transitioning;
     },null,{timeout:20000});
     if(name==='usiku'){
      const octantSea=await page.locator('#labAtlasCahill .lab-cahill-ocean').first()
       .evaluate(el=>getComputedStyle(el).fill);
      assert.equal(octantSea,'rgb(17, 17, 17)',
       'Usiku Keyes water must match the dark Robinson and Globe ocean');
      assert.match(await page.locator('#labAtlasGlobe').evaluate(el=>getComputedStyle(el).backgroundImage),
       /radial-gradient/,'Usiku Keyes background is the shared forest vignette');
     }
     assert.equal(await page.locator('#labAtlasGlobe .maplibregl-canvas-container').evaluate(el=>getComputedStyle(el).visibility),
      'hidden','Keyes must not expose the previous Robinson or Globe underlay');
     await page.screenshot({path:path.join(output,`${name}-keyes.png`)});
     await page.locator('[data-atlas-view=globe]').click();
     await page.waitForFunction(()=>{const state=window.HipsterAtlasState?.();
      return state?.projection==='globe'&&!state.transitioning;
     },null,{timeout:20000});
     assert.equal(await page.locator('#labAtlasGlobe .maplibregl-canvas-container').evaluate(el=>getComputedStyle(el).visibility),
      'visible','Returning from Keyes must restore the real Globe');
     await page.screenshot({path:path.join(output,`${name}-globe.png`)});
     await page.locator('[data-atlas-view=robinson]').click();
     await page.waitForFunction(()=>{const state=window.HipsterAtlasState?.();
      return state?.projection==='robinson'&&!state.transitioning;
     },null,{timeout:20000});
     // Theme review is not complete until Crate AND native Manual agree.
     await page.locator('[data-lab-tab=crate]').click();
     await page.locator('#labCrate').waitFor({state:'visible'});
     await page.screenshot({path:path.join(output,`${name}-crate.png`)});
     await page.locator('[data-lab-tab=manual]').click();
     await page.frameLocator('#labManualFrame').locator('#manualNavigation').waitFor({state:'visible',timeout:15000});
     await page.waitForFunction(name=>{
      const doc=document.getElementById('labManualFrame')?.contentDocument;
      return doc?.documentElement.dataset.pwaTheme===name;
     },name,{timeout:8000});
     await page.screenshot({path:path.join(output,`${name}-manual.png`)});
     await page.locator('[data-lab-tab=jukebox]').click();
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
