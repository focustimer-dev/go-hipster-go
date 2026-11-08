// Verify REAL inline Android-derived MapLibre/Keyes Atlas inside PWA Jukebox.
// This is not a detached demo and never touches production.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const base=(process.env.PWA_PREVIEW_URL||'https://hipster-go-pwa-theme-atlas-rc.samelling.workers.dev').replace(/\/$/,'');
const out='artifacts/pwa-inline-atlas';
const errors=[];
const browser=await chromium.launch({headless:true});
try{
 await mkdir(out,{recursive:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:860},isMobile:true,hasTouch:true});
  page.on('pageerror',err=>errors.push(err.message));
  const response=await page.goto(base+'/?ai=chatgpt&service=spotify',{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response.status(),200);
  await page.locator('#crateGeo').scrollIntoViewIfNeeded();
  try{
   await page.waitForFunction(()=>window.GHGInlineAtlas?.ready?.()===true,null,{timeout:15000});
  }catch(error){
   const state=await page.evaluate(()=>{
    const host=document.getElementById('pwaInlineAtlas'),frame=host?.querySelector('iframe');
    let child=null;
    try{
     const w=frame?.contentWindow,doc=w?.document;
     child={url:doc?.location.href,ready:!!w?.labAtlasGlobe?.loaded?.(),
      root:!!doc?.getElementById('pwaInlineAtlasRoot'),
      map:!!doc?.getElementById('labAtlasGlobe'),
      mapStyles:!!doc?.querySelector('.lab-atlas-modes'),
      bridge:!!w?.HipsterInlineAtlas,css:doc?.body?.className};
    }catch(e){child={error:e.message}}
    return {parent:document.body.className,atlasHook:!!window.GHGInlineAtlas,
     host:!!host,hidden:host?.hidden,iframeUrl:frame?.getAttribute('src'),child};
   });
   console.error('INLINE_ATLAS_DIAGNOSTIC',JSON.stringify(state),JSON.stringify(errors));
   await page.screenshot({path:path.join(out,'not-ready-'+width+'.png'),fullPage:true});
   throw error;
  }
  const frame=page.frameLocator('#pwaInlineAtlas iframe');
  await frame.locator('#labAtlasGlobe').waitFor();
  assert.equal(await frame.locator('body.pwa-atlas-only').count(),1,'Atlas-only surface hides duplicate Android app');
  assert.equal(await frame.locator('#labAtlasGlobe').count(),1,'Exactly one actual WebGL map');
  assert.equal(await frame.locator('.lab-atlas-modes [data-atlas-view]').count(),3,'Real Android projection controls');
  await page.evaluate(()=>localStorage.removeItem('ghg-crate-map-regions-v1'));
  for(const theme of ['liberi','bosque','usiku']){
   await page.locator('[data-pwa-action=prefs]').first().click();
   await page.locator('.pwa-theme-choice[data-pwa-theme='+theme+']').click();
   await page.locator('[data-pwa-action=close]').first().click();
   await page.waitForFunction(name=>{
    const doc=document.querySelector('#pwaInlineAtlas iframe')?.contentDocument;
    return doc?.documentElement.dataset.pwaTheme===name;
   },theme,{timeout:8000});
   // Shipping routes are real canonical map geometry, not a decorative
   // screenshot. Themed route strokes must be legible at phone scale.
   const routeInk=await frame.locator('body').evaluate(()=>{
    const map=window.labAtlasGlobe;
    const features=map.getSource('routes')?.serialize?.().data?.features||[];
    const path=document.querySelector('#labAtlasCahill .lab-cahill-routes path');
    const keyes=path?getComputedStyle(path):null;
    return {count:features.length,
     paint:map.getPaintProperty('routes','line-color'),
     width:map.getPaintProperty('routes','line-width'),
     opacity:map.getPaintProperty('routes','line-opacity'),
     paths:document.querySelectorAll('#labAtlasCahill .lab-cahill-routes path').length,
     keyesWidth:keyes?parseFloat(keyes.strokeWidth):0,
     keyesOpacity:keyes?parseFloat(keyes.strokeOpacity):0,
     keyesColor:keyes?.stroke||''};
   });
   assert(routeInk.count>0&&routeInk.paths>0,'Sailing routes must remain on both map renderers');
   const routeColors={liberi:'#edc65d',bosque:'#8c6239',usiku:'#b77b4d'};
   assert.equal(routeInk.paint,routeColors[theme],theme+' route ink palette');
   assert.equal(routeInk.width,theme==='liberi'?1:1.7,theme+' route width');
   assert.equal(routeInk.opacity,theme==='liberi'?.65:.88,theme+' route opacity');
   if(theme!=='liberi'){
    assert(routeInk.keyesWidth>=1.8,theme+' Keyes route width must be readable');
    assert(routeInk.keyesOpacity>=.85,theme+' Keyes routes need sufficient opacity');
   }
   const selected=await page.evaluate(()=>JSON.parse(localStorage.getItem('ghg-crate-map-regions-v1')||'[]').sort());
   for(const mode of ['robinson','cahill-keyes','globe']){
    await frame.locator('[data-atlas-view='+mode+']').click();
    await frame.locator('[data-atlas-view='+mode+'][aria-pressed=true]').waitFor({timeout:18000});
    // The pressed button updates at animation START. Verify the actual
    // canonical projection committed and its veil was removed before
    // capturing any frame as a final visual quality reference.
    await frame.locator('body').evaluate(async (_,target)=>{
     const deadline=performance.now()+20000;
     while(performance.now()<deadline){
      const state=window.HipsterAtlasState?.();
      if(state?.projection===target&&!state.transitioning)return;
      await new Promise(resolve=>requestAnimationFrame(resolve));
     }
     const state={
      requested:target,
      actual:window.HipsterAtlasState?.()||'unavailable',

      pressed:[...document.querySelectorAll('[data-atlas-view][aria-pressed=true]')]
        .map(el=>el.dataset.atlasView),
      overlays:document.querySelectorAll('.lab-atlas-morph,.lab-cahill-motion').length,
      lastCahill:window.__labAtlasLastCahillSwitch||null
     };
     throw new Error('Projection did not settle: '+JSON.stringify(state));
    },mode);
    // Nine-combination release gate: visible ocean ink, real route geometry
    // and readable Keyes octant separation after the projection SETTLES.
    const visual=await frame.locator('body').evaluate(()=>{
     const map=window.labAtlasGlobe;
     const keyesOcean=document.querySelector('#labAtlasCahill .lab-cahill-ocean');
     const keyesMat=document.querySelector('#labAtlasGlobe .lab-cahill-overlay');
     const stage=document.getElementById('labAtlasGlobe');
     const routes=[...document.querySelectorAll('#labAtlasCahill .lab-cahill-routes path')];
     return {
      sea:map.getPaintProperty('ocean','background-color'),
      plate:map.getPaintProperty('robinson-ocean','fill-color'),
      mapRoutes:map.getPaintProperty('routes','line-color'),
      keyesOcean:keyesOcean?getComputedStyle(keyesOcean).fill:'',
      keyesMat:keyesMat?getComputedStyle(keyesMat).backgroundColor:'',
      stageBackdrop:stage?getComputedStyle(stage).backgroundImage:'',
      stageGround:stage?getComputedStyle(stage).backgroundColor:'',
      webglVisible:getComputedStyle(map.getCanvasContainer()).visibility,
      robinsonRim:map.getLayoutProperty('robinson-outline','visibility'),
      rimInk:map.getPaintProperty('robinson-outline','line-color'),
      rimWidth:map.getPaintProperty('robinson-outline','line-width'),
      projectedRoutes:routes.filter(path=>{
       try{return path.getTotalLength()>4 && getComputedStyle(path).display!=='none'}catch(_){return false}
      }).length
     };
    });
    const seaPalette={liberi:'#103135',bosque:'#f5f0e6',usiku:'#111111'};
    assert.equal(visual.webglVisible,mode==='cahill-keyes'?'hidden':'visible',
     theme+'/'+mode+' must never show the previous WebGL map through Keyes');
    assert.equal(visual.robinsonRim,mode==='robinson'?'visible':'none',
     theme+'/'+mode+' boundary must only appear around Robinson');
    if(mode==='robinson'){
     assert.equal(visual.rimWidth,theme==='bosque'?1.4:1.15,
      theme+' Robinson silhouette should have a thin cartographic edge');
     assert.equal(visual.rimInk,theme==='usiku'?'#b77b4d':
      theme==='bosque'?'#003018':'#103135',theme+' boundary ink');
    }
    assert.equal(visual.mapRoutes,routeColors[theme],theme+'/'+mode+' routes keep theme ink');
    assert(visual.projectedRoutes>0,theme+'/'+mode+' must retain visible projected Keyes routes');
    if(mode!=='cahill-keyes'){
     assert.equal(visual.sea,mode==='robinson'?'rgba(0,0,0,0)':seaPalette[theme],
      theme+'/'+mode+' background must allow the correct exterior field');
     assert.equal(visual.plate,seaPalette[theme],
      theme+'/'+mode+' Robinson ocean polygon must retain the real sea color');
     if(mode==='robinson'){
      if(theme==='usiku')assert.match(visual.stageBackdrop,/radial-gradient/,
       'Usiku Robinson stage keeps the original forest vignette');
      if(theme==='liberi')assert.equal(visual.stageGround,'rgb(223, 176, 69)',
       'Liberi Robinson exterior must be yellow paper');
     }
    }
    if(theme==='usiku'&&mode==='cahill-keyes'){
     assert.equal(visual.keyesMat,'rgba(0, 0, 0, 0)',
      'The transparent Keyes matte exposes the shared green field');
     assert.equal(visual.keyesOcean,'rgb(17, 17, 17)',
      'Usiku Keyes water is the same dark ocean as Robinson and Globe');
     assert.match(visual.stageBackdrop,/radial-gradient/,
      'Keyes has the same green vignette as the other projections');
    }
    if(width===390)await page.screenshot({path:path.join(out,theme+'-'+mode+'.png')});
    const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('ghg-crate-map-regions-v1')||'[]').sort());
    assert.deepEqual(state,selected,'Projection mode must never rewrite selected Jukebox regions');
   }
  }
  // User selection inside native canvas must update the parent's actual GO model.
  await frame.locator('[data-crate-region="us-west"]').evaluate(el=>el.click());
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('ghg-crate-map-regions-v1')||'[]').includes('us-west'),null,{timeout:6000});
  assert.equal(await page.locator('[data-crate-stamp-region="us-west"]').count(),1,'Real Jukebox stamp reflects nested Atlas selection');
  // Jukebox region buttons must also update the native Atlas instantly.
  await page.locator('[data-crate-region="us-east"]').evaluate(el=>el.click());
  await frame.locator('[data-crate-region="us-east"][aria-pressed=true]').waitFor({state:'attached',timeout:8000});
  const widthOk=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2);
  assert(widthOk,'Integrated Atlas must not introduce horizontal page scroll on '+width+'px');
  await page.close();
 }
 assert.deepEqual(errors,[],'PWA/Atlas frame must not throw browser exceptions');
 console.log('PASS: inline Atlas projections, theme paints, selected regions and responsive states verified');
}finally{await browser.close()}
