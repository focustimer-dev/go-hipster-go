// Verify REAL inline Android-derived MapLibre/Keyes Atlas inside PWA Jukebox.
// This is not a detached demo and never touches production.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const base=(process.env.PWA_PREVIEW_URL||'https://hipster-go-pwa-preview.samelling.workers.dev').replace(/\/$/,'');
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
   await page.locator('[data-pwa-theme='+theme+']').click();
   await page.locator('[data-pwa-action=close]').first().click();
   await page.waitForFunction(name=>{
    const doc=document.querySelector('#pwaInlineAtlas iframe')?.contentDocument;
    return doc?.documentElement.dataset.pwaTheme===name;
   },theme,{timeout:8000});
   const selected=await page.evaluate(()=>JSON.parse(localStorage.getItem('ghg-crate-map-regions-v1')||'[]').sort());
   for(const mode of ['robinson','cahill-keyes','globe']){
    await frame.locator('[data-atlas-view='+mode+']').click();
    await frame.locator('[data-atlas-view='+mode+'][aria-pressed=true]').waitFor({timeout:18000});
    await frame.locator('.lab-cahill-motion,.lab-atlas-morph').first().waitFor({state:'hidden',timeout:20000});
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
  await frame.locator('[data-crate-region="us-east"][aria-pressed=true]').waitFor({timeout:8000});
  const widthOk=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2);
  assert(widthOk,'Integrated Atlas must not introduce horizontal page scroll on '+width+'px');
  await page.close();
 }
 assert.deepEqual(errors,[],'PWA/Atlas frame must not throw browser exceptions');
 console.log('PASS: inline Atlas projections, theme paints, selected regions and responsive states verified');
}finally{await browser.close()}
