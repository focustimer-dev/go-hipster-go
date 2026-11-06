#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const base=process.env.PWA_PREVIEW_URL;
const isProduction=process.argv.includes('--allow-production');
const previewOrigin='https://hipster-go-pwa-preview.samelling.workers.dev';
const publicOrigin='https://hipster-go.samelling.workers.dev';
// The preview workflow must remain unable to visit production by accident.
// Only the explicit production verification command may use the exact public
// hostname; no arbitrary URLs, hidden redirects or write-capable sessions.
assert.equal(base,isProduction?publicOrigin:previewOrigin,
 isProduction?'Explicit production QA flag requires exact public origin':
 'Only the dedicated preview is an allowed QA target');
const folder='artifacts/pwa-preview';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const profiles=[
  {name:'phone',viewport:{width:390,height:844},isMobile:true,hasTouch:true},
  {name:'desktop',viewport:{width:1280,height:900}},
  {name:'phone-reduced-motion',viewport:{width:360,height:780},isMobile:true,hasTouch:true,reducedMotion:'reduce'}
];
const report=[];let failed=false;
for(const profile of profiles){
 const context=await browser.newContext({...profile,serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();
 page.setDefaultTimeout(20000);
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',res=>{if(res.url().startsWith(base)&&res.status()>=400)errors.push('HTTP '+res.status()+' '+res.url())});
 const result={profile:profile.name,passed:false};
 try{
  const response=await page.goto(base+'/?ai=chatgpt&service=spotify&mood=happy',{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response.status(),200);
  await page.locator('.pwa-rail').waitFor({state:'visible',timeout:20000});
  await page.locator('#goButton').waitFor({state:'visible'});
  // Android 0.9.56 provides a Jukebox-level inspiration entry point.
  await page.locator('.pwa-add-inspiration').waitFor({state:'visible'});
  assert.equal(await page.locator('.pwa-add-inspiration').getAttribute('data-pwa-action'),'edit-reference');
  await page.screenshot({path:folder+'/'+profile.name+'-jukebox.png'});
  const rects=await page.locator('.pwa-rail button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {width:r.width,height:r.height}}));
  assert.equal(rects.length,4,'four rail buttons');
  assert.ok(rects.every(r=>r.width>=44&&r.height>=44),'rail touch targets');
  const dimensions=await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);
  assert.ok(dimensions[0]<=dimensions[1]+2,'page horizontal overflow: '+dimensions.join('/'));
  // Regression: the floating receipt must not be clipped behind the fixed PWA rail.
  await page.evaluate(()=>{
    const first=document.querySelector('.service-counter .panel');
    if(first)window.scrollTo({top:window.scrollY+first.getBoundingClientRect().bottom+18,behavior:'instant'});
  });
  await page.waitForFunction(()=>{
    const ticket=document.getElementById('selectionTicket');
    return ticket && !ticket.hidden && !ticket.classList.contains('is-docked');
  },null,{timeout:6000});
  const collision=await page.evaluate(()=>{
    const nav=document.querySelector('.pwa-rail').getBoundingClientRect();
    const ticket=document.getElementById('selectionTicket').getBoundingClientRect();
    const summary=document.querySelector('#selectionTicket summary').getBoundingClientRect();
    return {railBottom:nav.bottom,ticketTop:ticket.top,summaryHeight:summary.height};
  });
  assert.ok(collision.ticketTop>=collision.railBottom+6,
    'floating Crate clipped by fixed navigation: '+JSON.stringify(collision));
  assert.ok(collision.summaryHeight>=44,'floating Crate summary too small for touch');
  await page.screenshot({path:folder+'/'+profile.name+'-floating-ticket.png'});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.locator('[data-pwa-tab="crate"]').click();
  await page.locator('#pwaCrate').waitFor({state:'visible'});
  assert.equal(await page.locator('#pwaJukebox').isVisible(),false,'Jukebox hides in Crate');
  await page.locator('[data-pwa-action="edit-reference"]').first().click();
  await page.locator('#pwaReferenceInput').fill('QA: violin pulses over brushed drums');
  await page.locator('#pwaReferenceKeep').click();
  await page.locator('#pwaInspiration').waitFor({state:'visible'});
  assert.match(await page.locator('#prompt').textContent(),/Musical reference only.*violin pulses over brushed drums/);
  await page.screenshot({path:folder+'/'+profile.name+'-inspiration.png'});
  const prompt=await page.locator('#prompt').textContent();
  await page.locator('[data-pwa-action="save"]').click();
  await page.locator('#pwaSaveName').fill('QA saved crate');
  await page.locator('#pwaSaveDialog button[type="submit"]').click();
  await page.locator('#pwaCrate').waitFor({state:'visible'});
  assert.match(await page.locator('#pwaSavedCount').innerText(),/1 \/ 10/);
  await page.screenshot({path:folder+'/'+profile.name+'-crate.png'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.pwa-rail').waitFor({state:'visible'});
  await page.locator('[data-pwa-tab="crate"]').click();
  assert.match(await page.locator('#pwaSavedCount').innerText(),/1 \/ 10/);
  assert.match(await page.locator('#pwaRecent').innerText(),/violin pulses/);
  await page.locator('#pwaSaved button').first().click();
  await page.locator('#pwaSavedDialog').waitFor({state:'visible'});
  assert.equal(await page.locator('#pwaSavedPrompt').textContent(),prompt,'exact saved prompt after reload');
  await page.locator('[data-pwa-action="close-saved"]').click();
  await page.locator('[data-pwa-tab="manual"]').click();
  await page.locator('#pwaManual').waitFor({state:'visible'});
  // The Android-aligned Manual belongs to the PWA adapter, not Android Lab.
  await page.locator('#pwaGuidePicker').waitFor({state:'visible'});
  assert.match(await page.locator('#pwaGuideContent h2').innerText(),/Overview/);
  await page.locator('#pwaGuidePicker summary').click();
  await page.locator('[data-pwa-guide-group="use"]').click();
  await page.locator('[data-pwa-guide="inspiration"]').click();
  assert.match(await page.locator('#pwaGuideContent').innerText(),/Your Crate/);
  assert.equal(await page.locator('#pwaGuidePicker').evaluate(el=>el.open),false);
  await page.locator('#pwaGuidePicker summary').click();
  await page.locator('[data-pwa-guide-group="setup"]').click();
  await page.locator('[data-pwa-guide="gemini"]').click();
  assert.match(await page.locator('#pwaGuideContent').innerText(),/YouTube Music/);
  await page.screenshot({path:folder+'/'+profile.name+'-manual.png'});
  await page.locator('[data-pwa-action="prefs"]').click();
  await page.locator('#pwaPrefs').waitFor({state:'visible'});
  await page.locator('[data-pwa-action="close"]').click();
  await page.locator('[data-pwa-tab="jukebox"]').click();
  await page.locator('#pwaInspiration [data-pwa-action="remove-reference"]').click();
  assert.ok(!(await page.locator('#prompt').textContent()).includes('violin pulses'),'removed reference cleared from GO');
  await page.locator('[data-pwa-tab="crate"]').click();
  assert.match(await page.locator('#pwaRecent').innerText(),/violin pulses/);
  assert.deepEqual(errors,[],errors.join('; '));
  result.passed=true;
 }catch(e){failed=true;result.error=String(e.stack||e);result.browserErrors=errors;
   try{await page.screenshot({path:folder+'/'+profile.name+'-failure.png',fullPage:true})}catch(ignore){}
 }finally{report.push(result);await context.close()}
}
const context=await browser.newContext({serviceWorkers:'block'});const page=await context.newPage();
try{
 const manual=await page.goto(base+'/setup/',{waitUntil:'domcontentloaded'});assert.equal(manual.status(),200);
 assert.equal(await page.locator('.pwa-rail').count(),0,'manual remains a standalone route');
 const gemini=await page.goto(base+'/gemini/',{waitUntil:'domcontentloaded'});assert.equal(gemini.status(),200);
 assert.match(page.url(),/ai=gemini/);assert.match(page.url(),/service=youtube/);
 await page.locator('.pwa-rail').waitFor({state:'visible'});
 report.push({profile:'routes',passed:true});
}catch(e){failed=true;report.push({profile:'routes',passed:false,error:String(e.stack||e)})}
await context.close();
// Independently exercise the actual Android 0.9.56 map bundle on the isolated PWA
// Worker: no fake third projection or merely ornamental map screenshot.
for (const width of [390,320]) {
 const atlasContext=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const atlas=await atlasContext.newPage();
 atlas.setDefaultTimeout(25000);
 const issues=[];
 atlas.on('pageerror',e=>issues.push(e.message));
 try{
  const response=await atlas.goto(base+'/pwa-atlas/',{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response.status(),200,'Atlas preview route must be hosted by isolated Worker');
  await atlas.waitForFunction(()=>window.labCahillMap?.ready&&window.labAtlasGlobe?.loaded(),null,{timeout:55000});
  assert.equal(await atlas.locator('[data-atlas-view]').count(),3,'All three Android map projections are available');
  const before=await atlas.evaluate(()=>[...document.querySelectorAll('[data-crate-region][aria-pressed=true]')].map(el=>el.dataset.crateRegion).sort());
  const routes=['cahill-keyes','globe','robinson'];
  for(const mode of routes){
   await atlas.locator('[data-atlas-view="'+mode+'"]').click({timeout:10000});
   await atlas.waitForFunction(to=>{
    const active=document.querySelector('[data-atlas-view="'+to+'"]');
    return active?.getAttribute('aria-pressed')==='true' &&
     !document.querySelector('.lab-cahill-motion,.lab-atlas-morph') &&
     document.getElementById('labAtlasGlobe')?.style.pointerEvents==='';
   },mode,{timeout:28000});
   const after=await atlas.evaluate(()=>[...document.querySelectorAll('[data-crate-region][aria-pressed=true]')].map(el=>el.dataset.crateRegion).sort());
   assert.deepEqual(after,before,'Atlas modes must not silently change selected regions');
   assert.equal(await atlas.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,
    'Atlas preview cannot make mobile page horizontally overflow');
   await atlas.locator('#labAtlasGlobe').screenshot({path:folder+'/atlas-'+width+'-'+mode+'.png',timeout:30000});
  }
  const back=atlas.getByRole('link',{name:'Return to PWA Jukebox'});
  assert.equal(await back.getAttribute('href'),'/','Preview must clearly return to the PWA');
  assert.deepEqual(issues,[],'No Atlas browser errors');
  report.push({profile:'atlas-'+width,passed:true,projections:routes});
 }catch(e){
  failed=true;report.push({profile:'atlas-'+width,passed:false,error:String(e.stack||e),browserErrors:issues});
  try{await atlas.screenshot({path:folder+'/atlas-'+width+'-failure.png',fullPage:true})}catch(ignore){}
 }finally{await atlasContext.close()}
}
await browser.close();
await writeFile(folder+'/results.json',JSON.stringify({url:base,report},null,2));
console.log(JSON.stringify(report,null,2));
if(failed)process.exitCode=1;
