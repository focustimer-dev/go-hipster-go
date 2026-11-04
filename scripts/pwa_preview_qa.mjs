#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const base=process.env.PWA_PREVIEW_URL;
assert.equal(base,'https://hipster-go-pwa-preview.samelling.workers.dev','Only the dedicated preview is an allowed QA target');
assert.ok(!base.includes('://hipster-go.'),'Never run browser preview QA on production');
const folder='artifacts/pwa-preview';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
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
await context.close();await browser.close();
await writeFile(folder+'/results.json',JSON.stringify({url:base,report},null,2));
console.log(JSON.stringify(report,null,2));
if(failed)process.exitCode=1;
