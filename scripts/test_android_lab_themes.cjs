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
   await page.addInitScript(()=>{
    window.HipsterLab={
     state:()=>JSON.stringify({saved:[],updateAvailable:true,updateLatest:'gemini-skill-v3.11.2',updateConfirmed:'gemini-skill-v3.11.1'}),
     inspiration:()=>'',copy:()=>true,setTheme:theme=>{window.__nativeAppearance=theme},
     showUpdates:()=>{window.__labUpdatesOpened=(window.__labUpdatesOpened||0)+1}
    };
   });
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,null,{timeout:30000});
   await page.emulateMedia({reducedMotion:'reduce'});
   for(const name of Object.keys(palettes)){
    await page.locator('.lab-rail [data-lab-action=preferences]').click();
    await page.locator('[data-lab-theme='+name+']').click();
    assert.equal(await page.locator('[data-lab-theme][aria-pressed=true]').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),name);
    assert.equal(await page.evaluate(()=>window.HipsterLabTheme?.current()),name);
    assert.equal(await page.evaluate(()=>window.__nativeAppearance),name,'Native update sheet appearance mirrors selected theme');
    assert.equal(await page.evaluate(()=>localStorage.getItem('ghg-lab-theme-v1')),name);
    assert.equal(await page.evaluate(()=>window.GHGAtlasPaintColors?.().theme),name);
    assert.deepEqual(await page.locator('link[data-lab-palette-style]').evaluateAll(els=>els.map(e=>e.media)),
     [name==='liberi'?'not all':'all',name==='liberi'?'not all':'all'],
     'Inactive Libéri palette styles must not slow down the base map');
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
    if(name!=='liberi'){
     const go=await page.locator('#goButton').evaluate(el=>{
      const style=getComputedStyle(el);
      const stamp=getComputedStyle(el.querySelector('.go-stamp'));
      const headline=getComputedStyle(el.querySelector('.go-copy b'));
      const caption=getComputedStyle(el.querySelector('.go-copy>span:not(.go-stamp)'));
      return {background:style.backgroundColor,topBorder:style.borderTopColor,
       headline:headline.color,caption:caption.color,
       height:parseFloat(style.minHeight),stampBackground:stamp.backgroundColor,
       stampInk:stamp.color,stampSize:parseFloat(stamp.fontSize)};
     });
     assert.equal(go.background,'rgb(0, 97, 59)',name+' GO needs its own green key');
     assert.equal(go.headline,'rgb(229, 207, 66)',name+' GO label uses selected yellow');
     assert.equal(go.topBorder,'rgb(229, 207, 66)',name+' GO has a slim selected-yellow crown');
     assert.equal(go.caption,'rgb(245, 240, 230)',name+' secondary action label stays readable');
     assert(go.height>=110,name+' GO remains visually prominent');
     assert.equal(go.stampBackground,'rgb(229, 207, 66)',name+' COPIED stamp is selected yellow');
     assert.equal(go.stampInk,'rgb(0, 48, 24)',name+' COPIED stamp uses dark contrast');
     assert(go.stampSize>=24,name+' COPIED stamp keeps Libéri scale at phone width');
     if(name==='usiku'){
      const receipt=await page.locator('.receipt-heading').evaluate(el=>({
       gradient:getComputedStyle(el).backgroundImage,
       saveBackground:getComputedStyle(el.querySelector('.lab-save-button')).backgroundColor,
       saveInk:getComputedStyle(el.querySelector('.lab-save-button')).color
      }));
      assert.match(receipt.gradient,/radial-gradient/,'Usiku receipt repeats the portrait vignette');
      for(const shade of ['rgb(183, 123, 77)','rgb(168, 108, 67)','rgb(146, 91, 57)','rgb(126, 76, 48)'])
       assert(receipt.gradient.includes(shade),'Missing Usiku vignette step '+shade);
      assert.equal(receipt.saveBackground,'rgb(0, 48, 24)','Save Request stays readable on saddle');
      assert.equal(receipt.saveInk,'rgb(245, 240, 230)','Save Request has cream lettering');
     }
     if(width===390){
      await page.locator('.go-options').screenshot({path:path.join(output,`${name}-go-action.png`)});
      await page.locator('#goButton').evaluate(el=>el.dataset.copyState='copied');
      await page.locator('#goButton').screenshot({path:path.join(output,`${name}-copied-stamp.png`)});
      await page.locator('#goButton').evaluate(el=>el.dataset.copyState='idle');
      if(name==='usiku')
       await page.locator('.receipt-heading').screenshot({path:path.join(output,'usiku-receipt-vignette.png')});
     }
    }
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
    assert.equal(routes.width,name==='liberi'?1:1.2,'Routes must read at phone size for '+name);
    assert.equal(routes.opacity,name==='liberi'?.65:.88,'Routes must not fade away in '+name);
    const water=await page.evaluate(()=>window.labAtlasGlobe.getPaintProperty('ocean','background-color'));
    assert.equal(water,'rgba(0,0,0,0)',
     'Robinson exterior field must not be painted with the water color');
    const plate=await page.evaluate(()=>window.labAtlasGlobe.getPaintProperty('robinson-ocean','fill-color'));
    assert.equal(plate,({liberi:'#103135',bosque:'#e8e9df',usiku:'#111111'})[name],
     'Robinson ocean polygon must preserve '+name+' actual sea ink');
    if(name!=='liberi')assert.equal(routes.keyesWidth,1.2,'Keyes routes must be slim and readable at '+width+'px');
    assert.equal(await page.evaluate(()=>!!window.labAtlasGlobe.getLayer('robinson-outline')),false,
     'No orphaned Robinson stroke; ocean ink separates map from its paper');
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
     if(name==='usiku'){
      const eject=await page.frameLocator('#labManualFrame').locator('.crate-action .deck-key svg')
       .evaluate(el=>({
        ink:getComputedStyle(el).color,
        keycap:getComputedStyle(el.closest('.deck-key')).backgroundImage,
        housing:getComputedStyle(el.closest('.crate-action')).backgroundColor
       }));
      assert.equal(eject.ink,'rgb(245, 240, 230)','Usiku eject icon keeps cream contrast');
      assert(eject.keycap.includes('rgb(126, 76, 48)'),
       'Usiku eject keycap is deep saddle, not cream');
      assert.equal(eject.housing,'rgb(56, 38, 28)','Usiku transport housing is visibly recessed');
     }
     await page.screenshot({path:path.join(output,`${name}-manual.png`)});
     // The skill check-in is part of Gemini setup, not a buried resources
     // page; it must show the recorded and available versions and open the
     // native confirmation controller in all three appearance options.
     const guide=page.frameLocator('#labManualFrame');
     await guide.locator('#cratePicker > summary').click();
     await guide.locator('[data-crate-tab=setup]').click();
     await guide.locator('.crate-dividers a[href="#setup"]').click();
     await guide.locator('.skill-checkin').waitFor({state:'visible'});
     await page.waitForFunction(()=>{
      const status=document.getElementById('labManualFrame')?.contentDocument?.getElementById('geminiSkillCheckStatus');
      return status?.textContent.includes('gemini-skill-v3.11.2');
     },null,{timeout:6000});
     assert.match(await guide.locator('#geminiSkillCheckHint').textContent(),/gemini-skill-v3.11.1/);
     assert.match(await guide.locator('#geminiSkillCheckHint').textContent(),/yellow dot/);
     const key=await guide.locator('.skill-checkin button').evaluate(el=>({
      color:getComputedStyle(el).color,
      bg:getComputedStyle(el).backgroundColor,
      height:el.getBoundingClientRect().height
     }));
     if(name!=='liberi'){
      assert.equal(key.bg,'rgb(0, 66, 37)','Gemini check-in uses forest theme key');
      assert.equal(key.color,'rgb(229, 207, 66)','Gemini check-in uses selection yellow');
     }
     assert(key.height>=44,'Gemini check-in is comfortably tappable');
     const before=await page.evaluate(()=>window.__labUpdatesOpened||0);
     await guide.locator('.skill-checkin [data-review-skill-updates]').click();
     await page.waitForFunction(previous=>(window.__labUpdatesOpened||0)>previous,before);
     await guide.locator('.skill-checkin').screenshot({path:path.join(output,`${name}-skill-checkin.png`)});
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
