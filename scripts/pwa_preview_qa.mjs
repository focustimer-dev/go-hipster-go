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
  assert.equal(await page.locator('.pwa-atlas-preview-link').count(),0,'Retired three-map trial link must not appear in the Jukebox');
  assert.equal(await page.locator('.pwa-add-inspiration').getAttribute('data-pwa-action'),'edit-reference');
  await page.screenshot({path:folder+'/'+profile.name+'-jukebox.png'});
  // Test the actual two-mood combination from the phone review: Desire + Funk.
  // A theme must recolor both independent portrait systems without rewriting them.
  await page.locator('[data-mood="happy"]').click();
  await page.locator('[data-mood="desire"]').click();
  await page.locator('[data-mood="funky"]').click();
  assert.equal(await page.locator('[data-mood="desire"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-mood="funky"]').getAttribute('aria-pressed'),'true');
  // Three poster-colorways must be visual-only and persist across browser reload.
  // Capture the real production PWA DOM, controls, original clerk portraits, and map.
  const promptBeforeColorChange=await page.locator('#prompt').textContent();
  const observedThemes={};
  for(const name of ['liberi','bosque','usiku']){
   await page.locator('[data-pwa-action="prefs"]').click();
   await page.locator('#pwaPrefs').waitFor({state:'visible'});
   await page.locator('button[data-pwa-theme="'+name+'"]').click();
   assert.equal(await page.locator('button[data-pwa-theme="'+name+'"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('button[data-pwa-theme][aria-pressed=true]').count(),1,'One theme only');
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),name);
   // Audit every PWA surface, not just the Jukebox. Preferences is in a real
   // dialog; Crate and Manual are persistent destinations with their own ink.
   const surfaces=await page.evaluate(()=>({
    prefs:getComputedStyle(document.querySelector('#pwaPrefs')).backgroundColor,
    crate:getComputedStyle(document.querySelector('#pwaCrate')).backgroundColor,
    manual:getComputedStyle(document.querySelector('#pwaManual')).backgroundColor
   }));
   if(name==='bosque')for(const key of ['prefs','crate','manual'])
    assert.equal(surfaces[key],'rgb(245, 240, 230)','Bosque '+key+' uses warm paper');
   if(name==='usiku'){
    assert.equal(surfaces.prefs,'rgb(17, 17, 17)','Usiku preferences use night ink');
    for(const key of ['crate','manual'])
     assert.equal(surfaces[key],'rgb(0, 48, 24)','Usiku '+key+' uses forest ground');
   }
   if(profile.name==='phone')
    await page.screenshot({path:folder+'/phone-theme-'+name+'-preferences.png'});
   await page.locator('[data-pwa-action="close"]').click();
   for(const tab of ['crate','manual']){
    await page.locator('[data-pwa-tab="'+tab+'"]').click();
    await page.locator('#pwa'+tab.charAt(0).toUpperCase()+tab.slice(1)).waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,
     name+' '+tab+' overflow');
    if(tab==='manual')assert.equal(await page.locator('#pwaGuidePicker').isVisible(),true,
     'Guide picker is available in '+name);
    if(profile.name==='phone')
     await page.screenshot({path:folder+'/phone-theme-'+name+'-'+tab+'.png'});
   }
   await page.locator('[data-pwa-tab="jukebox"]').click();
   // Theme color transitions last 160ms; sample fully settled pixels, never
   // intermediate animated colors. Reduced-motion users already see the final state.
   await page.waitForFunction(expected=>{
    const key=document.querySelector('.mood[data-mood="desire"]');
    return key && getComputedStyle(key).backgroundColor===expected;
   },name==='liberi'?'rgb(214, 75, 48)':'rgb(229, 207, 66)',{timeout:5000});
   if(name==='usiku'){
    await page.waitForFunction(()=>
     getComputedStyle(document.querySelector('.mood[data-mood="sad"]')).backgroundImage.includes('radial-gradient')
    ,null,{timeout:5000});
   }
   observedThemes[name]=await page.locator('#pwaJukebox').evaluate(el=>({
    background:getComputedStyle(el).backgroundColor,
    paper:getComputedStyle(document.body).getPropertyValue('--paper').trim(),
    ink:getComputedStyle(document.body).getPropertyValue('--ink').trim(),
    desire:getComputedStyle(document.querySelector('.mood[data-mood="desire"]')).backgroundColor,
    funky:getComputedStyle(document.querySelector('.mood[data-mood="funky"]')).backgroundColor,
    neutral:getComputedStyle(document.querySelector('.mood[data-mood="sad"]')).backgroundImage,
    neutralPortraitFilter:getComputedStyle(document.querySelector('.mood[data-mood="sad"] .face')).filter,
    neutralInkFilter:getComputedStyle(document.querySelector('.mood[data-mood="sad"] .face'),'::before').filter,
    neutralLabel:getComputedStyle(document.querySelector('.mood[data-mood="sad"] .word')).color,
    neutralDesireInk:getComputedStyle(document.querySelector('.mood[data-mood="desire"] .face'),'::before').filter,
    sea:getComputedStyle(document.querySelector('.crate-map-ocean')).fill,
    land:getComputedStyle(document.querySelector('#posterLandEngraving rect')).fill,
    selectInk:getComputedStyle(document.querySelector('.mood[data-mood="funky"] .face'),'::after').filter,
    funkGradient:getComputedStyle(document.querySelector('.mood[data-mood="funky"]')).backgroundImage,
    desireNeutralInk:getComputedStyle(document.querySelector('.mood[data-mood="desire"] .face'),'::before').filter,
    desireNeutralOpacity:getComputedStyle(document.querySelector('.mood[data-mood="desire"] .face'),'::before').opacity,
    desireSelectedOpacity:getComputedStyle(document.querySelector('.mood[data-mood="desire"] .face'),'::after').opacity,
    desireHearts:getComputedStyle(document.querySelector('.mood[data-mood="desire"] .desire-hearts')).backgroundColor,
    selectedMapInk:getComputedStyle(document.querySelector('#posterSelectedHalftone rect')).fill,
    atlasMat:getComputedStyle(document.querySelector('.crate-map-frame')).backgroundImage,
    atlasTrim:getComputedStyle(document.querySelector('.crate-map-frame')).borderTopColor,
    compassLeather:getComputedStyle(document.querySelector('.chart-rose-field')).fill,
    goCounterThickness:getComputedStyle(document.querySelector('#goButton')).borderBottomWidth,
    goCounterGreen:getComputedStyle(document.querySelector('#goButton')).backgroundColor,
    ticketTrim:getComputedStyle(document.querySelector('#selectionTicket')).borderTopColor,
    ticketOutline:getComputedStyle(document.querySelector('#selectionTicket')).borderTopWidth,
    ticketShadow:getComputedStyle(document.querySelector('#selectionTicket')).boxShadow,
    navTrim:getComputedStyle(document.querySelector('.pwa-rail button[aria-current="page"]')).borderBottomColor,
    appearanceSwatch:getComputedStyle(document.querySelector('.pwa-theme-choice[data-pwa-theme="usiku"] .pwa-theme-sample i:nth-child(3)')).backgroundColor
   }));
   if(name==='bosque'||name==='usiku'){
    assert.equal(observedThemes[name].desire,'rgb(229, 207, 66)','Desire uses racing-yellow selection');
    assert.equal(observedThemes[name].funky,'rgb(110, 34, 92)','The Funk has its own violet base');
    assert.match(observedThemes[name].funkGradient,/linear-gradient/,'Funk uses a violet to magenta pressing');
    assert.notEqual(observedThemes[name].selectInk,'none','Funk portrait retains its vivid ink treatment');
    assert.match(observedThemes[name].desireNeutralInk,/referenceInk/,'Desire reuses the natural detailed portrait');
    assert.equal(observedThemes[name].desireNeutralOpacity,'1','Desire neutral portrait remains visible on selection');
    assert.equal(observedThemes[name].desireSelectedOpacity,'0','Desire negative-looking selection plate stays hidden');
    assert.equal(observedThemes[name].desireHearts,'rgb(142, 48, 105)','Desire keeps its magenta heart eyes');
    assert.equal(observedThemes[name].selectedMapInk,'rgb(229, 207, 66)','Selected regions use visible yellow');
   }
   if(name==='usiku'){
    assert.match(observedThemes.usiku.neutral,/radial-gradient/,'Usiku unselected cards have a vignette');
    assert.match(observedThemes.usiku.neutral,/rgb\(183, 123, 77\) 0%/,'Saddle light at the center');
    assert.match(observedThemes.usiku.neutral,/rgb\(126, 76, 48\) 100%/,'Deep cognac at outer corners');
    assert.ok(observedThemes.usiku.neutral.indexOf('rgb(183, 123, 77)') <
      observedThemes.usiku.neutral.indexOf('rgb(126, 76, 48)'),'Vignette runs light center to dark edges');
    assert.equal(observedThemes.usiku.neutralLabel,'rgb(8, 37, 22)','Neutral card lettering uses legible deep forest green');
    assert.equal(observedThemes.usiku.neutralPortraitFilter,'none','Do not invert the Usiku neutral face');
    assert.equal(observedThemes.usiku.neutralInkFilter,'none','Original engraved ink is preserved without negative filters');
    assert.match(observedThemes.usiku.neutralDesireInk,/referenceInk/,'Desire retains alpha-detail ink filter on cognac');
    assert.equal(observedThemes.usiku.sea,'rgb(17, 17, 17)','Usiku atlas ocean must be near-black');
    assert.equal(observedThemes.usiku.land,'rgb(245, 240, 230)','Usiku land engraving must be cream');
    assert.match(observedThemes.usiku.atlasMat,/radial-gradient/,'Atlas mat carries quiet leather tint');
    assert.match(observedThemes.usiku.atlasTrim,/rgba?\(183, 123, 77/,'Atlas border has saddle trim');
    assert.equal(observedThemes.usiku.compassLeather,'rgb(126, 76, 48)','Compass is an engraved leather accent');
    assert.equal(observedThemes.usiku.goCounterThickness,'0px','GO has no unnecessary leather underline');
    assert.equal(observedThemes.usiku.goCounterGreen,'rgb(0, 66, 37)','GO remains green, not leather');
    assert.equal(observedThemes.usiku.ticketTrim,'rgb(183, 123, 77)','Crate ticket has a saddle outline');
    assert.equal(observedThemes.usiku.ticketOutline,'1px','Crate border is uniformly thin');
    assert.match(observedThemes.usiku.ticketShadow,/rgb\(17, 17, 17\)/,'Ticket offset shadow stays dark');
    assert.equal(observedThemes.usiku.navTrim,'rgb(183, 123, 77)','Selected navigation carries leather trim');
    assert.equal(observedThemes.usiku.appearanceSwatch,'rgb(183, 123, 77)','Usiku theme swatch reflects the leather');
   }
   if(profile.name==='phone'||profile.name==='phone-reduced-motion'){
    await page.screenshot({path:folder+'/'+profile.name+'-theme-'+name+'-top.png'});
    await page.locator('.mood-grid').scrollIntoViewIfNeeded();
    await page.screenshot({path:folder+'/'+profile.name+'-theme-'+name+'-portraits.png'});
    await page.locator('#crateAtlasMap').scrollIntoViewIfNeeded();
    await page.screenshot({path:folder+'/'+profile.name+'-theme-'+name+'-atlas.png'});
    await page.locator('#goButton').scrollIntoViewIfNeeded();
    await page.screenshot({path:folder+'/'+profile.name+'-theme-'+name+'-go.png'});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   }
   const dims=await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);
   assert.ok(dims[0]<=dims[1]+2,'Theme '+name+' horizontal overflow '+dims.join('/'));
  }
  assert.equal(await page.locator('#prompt').textContent(),promptBeforeColorChange,'Themes must never change the GO prompt');
  assert.notEqual(observedThemes.liberi.ink,observedThemes.bosque.ink);
  assert.notEqual(observedThemes.bosque.ink,observedThemes.usiku.ink);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.pwa-rail').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),'usiku','Theme must survive reload');
  await page.locator('[data-pwa-action="prefs"]').click();
  await page.locator('button[data-pwa-theme="liberi"]').click();
  await page.locator('[data-pwa-action="close"]').click();
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
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
  assert.match(await page.locator('#prompt').textContent(),/Inspiration: "QA: violin pulses over brushed drums"/);
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
  // Metadata is resolved asynchronously and must be visible without replacing
  // the source link. Stub only third-party metadata, never the public app.
  const unsupported=await page.request.get(base+'/api/inspiration-preview?url='+encodeURIComponent('https://127.0.0.1/private'));
  assert.equal(unsupported.status(),200,'Browser metadata endpoint must exist');
  assert.equal((await unsupported.json()).status,'unsupported','Private addresses never fetched');
  await page.route('**/api/inspiration-preview?*',async route=>{
   const original=new URL(route.request().url()).searchParams.get('url')||'';
   const blocked=original.includes('music.apple.com');
   await route.fulfill({status:200,contentType:'application/json',
    body:JSON.stringify(blocked?{status:'unavailable',provider:'Apple Music',url:original,title:'',description:''}:
     {status:'ok',provider:'Spotify',url:original,title:'A Properly Parsed Track',description:'Album from a public provider'})});
  });
  await page.locator('#pwaCrate [data-pwa-action="edit-reference"]').click();
  const sharedUrl='https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P';
  await page.locator('#pwaReferenceInput').fill('A song\n'+sharedUrl);
  await page.locator('#pwaReferenceKeep').click();
  await page.waitForFunction(()=>document.getElementById('pwaReferenceName')?.textContent==='A Properly Parsed Track');
  const enrichedPrompt=await page.locator('#prompt').textContent();
  assert.match(enrichedPrompt,/Inspiration: "A Properly Parsed Track"/,'GO sends the fetched metadata title to the AI');
  assert.ok(!enrichedPrompt.includes('Album from a public provider'),'Page description remains in Crate, not repeated in GO');
  assert.ok(enrichedPrompt.includes(sharedUrl),'GO always preserves the exact source URL');

  await page.locator('[data-pwa-tab="crate"]').click();
  assert.match(await page.locator('#pwaReferenceHelp').innerText(),/Album from a public provider/);
  assert.match(await page.locator('#pwaRecent').innerText(),/A Properly Parsed Track/);
  await page.locator('#pwaCrate [data-pwa-action="edit-reference"]').click();
  assert.match(await page.locator('#pwaReferenceInput').inputValue(),/open\.spotify\.com\/track/,'Never replace original link with metadata');
  await page.locator('[data-pwa-action="cancel-reference"]').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.pwa-rail').waitFor({state:'visible'});
  await page.locator('[data-pwa-tab="crate"]').click();
  assert.equal(await page.locator('#pwaReferenceName').innerText(),'A Properly Parsed Track','Parsed title survives browser reload');
  assert.match(await page.locator('#prompt').textContent(),/Inspiration: "A Properly Parsed Track"/,'GO metadata persists after reload');

  await page.locator('#pwaCrate [data-pwa-action="edit-reference"]').click();
  const blockedUrl='https://music.apple.com/us/album/music/123456';
  await page.locator('#pwaReferenceInput').fill(blockedUrl);
  await page.locator('#pwaReferenceKeep').click();
  await page.waitForFunction(()=>document.getElementById('pwaReferenceHelp')?.textContent?.includes('unavailable'));
  await page.locator('[data-pwa-tab="crate"]').click();
  assert.match(await page.locator('#pwaReferenceName').innerText(),/Apple Music link/,'Blocked provider gets a readable fallback');
  await page.locator('#pwaCrate [data-pwa-action="edit-reference"]').click();
  assert.equal(await page.locator('#pwaReferenceInput').inputValue(),blockedUrl,'Blocked metadata must not lose URL');
  const rawFallback=await page.locator('#prompt').textContent();
  assert.ok(rawFallback.includes(blockedUrl),'Blocked source URL is retained in GO');
  assert.ok(!rawFallback.includes('A Properly Parsed Track'),'Never fabricate a metadata title after provider denial');

  await page.locator('[data-pwa-action="cancel-reference"]').click();
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
 // The full Manual is a separate Worker route: it must inherit the appearance
 // chosen in Preferences, not silently fall back to Liberi.
 for(const theme of ['bosque','usiku']){
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.evaluate(t=>localStorage.setItem('ghg-pwa-theme-v1',t),theme);
  await page.goto(base+'/setup/',{waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),theme,
   'Full Manual inherited selected appearance');
  const paper=await page.locator('body').evaluate(el=>getComputedStyle(el).getPropertyValue('--paper').trim());
  assert.equal(paper,theme==='bosque'?'#f5f0e6':'#003018','Full Manual has correct paper token');
 }
 const gemini=await page.goto(base+'/gemini/',{waitUntil:'domcontentloaded'});assert.equal(gemini.status(),200);
 assert.match(page.url(),/ai=gemini/);assert.match(page.url(),/service=youtube/);
 await page.locator('.pwa-rail').waitFor({state:'visible'});
 report.push({profile:'routes',passed:true});
}catch(e){failed=true;report.push({profile:'routes',passed:false,error:String(e.stack||e)})}
await context.close();
// Independently exercise the actual Android 0.9.56 map bundle on the isolated PWA
// Worker: no fake third projection or merely ornamental map screenshot.
for (const width of [390,320]) {
 const theme=width===390?'usiku':'bosque';
 const colors=theme==='usiku'?
  {ocean:'#111111',land:'#f5f0e6',selected:'#e5cf42'}:
  {ocean:'#f5f0e6',land:'#004225',selected:'#e5cf42'};
 const atlasContext=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const atlas=await atlasContext.newPage();
 await atlas.addInitScript(theme=>{
  try{localStorage.setItem('ghg-pwa-theme-v1',theme)}catch(_){}
 },theme);
 atlas.setDefaultTimeout(25000);
 const issues=[];
 atlas.on('pageerror',e=>issues.push(e.message));
 try{
  const response=await atlas.goto(base+'/pwa-atlas/',{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response.status(),200,'Atlas preview route must be hosted by isolated Worker');
  await atlas.waitForFunction(()=>window.labCahillMap?.ready&&window.labAtlasGlobe?.loaded(),null,{timeout:55000});
  assert.equal(await atlas.locator('[data-atlas-view]').count(),3,'All three Android map projections are available');
  assert.equal(await atlas.evaluate(()=>document.documentElement.dataset.pwaTheme),theme,'Atlas inherited chosen PWA theme');
  assert.equal(await atlas.locator('link[href="/pwa-atlas/assets/pwa-atlas-themes.css"]').count(),1,
   'Atlas loads its browser-only palette stylesheet');
  await atlas.waitForFunction(colors=>{
   const land=window.labAtlasGlobe?.getPaintProperty?.('land','fill-color');
   return land?.[2]===colors.selected&&land?.[3]===colors.land;
  },colors,{timeout:15000});
  const tabs=await atlas.evaluate(()=>({
   rail:getComputedStyle(document.querySelector('.lab-rail')).backgroundColor,
   page:getComputedStyle(document.querySelector('.lab-page')).backgroundColor
  }));
  assert.equal(tabs.rail,theme==='usiku'?'rgb(17, 17, 17)':'rgb(0, 48, 24)','Atlas navigation theme');
  assert.equal(tabs.page,theme==='usiku'?'rgb(0, 48, 24)':'rgb(245, 240, 230)','Atlas Crate/Manual theme');
  await atlas.locator('[data-crate-region]').first().evaluate(el=>el.click());
  await atlas.waitForFunction(()=>!!document.querySelector('[data-crate-region][aria-pressed=true]'),
   null,{timeout:5000});
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
   await atlas.waitForFunction(colors=>{
    const land=window.labAtlasGlobe?.getPaintProperty?.('land','fill-color');
    return land?.[2]===colors.selected&&land?.[3]===colors.land;
   },colors,{timeout:10000});
   const ink=await atlas.evaluate(()=>{
    const m=window.labAtlasGlobe;return {
     land:m.getPaintProperty('land','fill-color'),
     water:m.getPaintProperty('ocean','background-color'),
     projection:m.getProjection()?.type,
     robinson:m.getPaintProperty('robinson-ocean','fill-color')
    };
   });
   assert.equal(ink.land[2],colors.selected,'Selected region paint is yellow');
   assert.equal(ink.land[3],colors.land,'Unselected MapLibre land is themed');
   assert.equal(ink.robinson,colors.ocean,'Robinson ocean plate is themed');
   assert.equal(ink.water,ink.projection==='mercator'?'rgba(0,0,0,0)':colors.ocean,
    'Visible globe ocean stays themed while Robinson engine keeps transparent backdrop');
   if(mode==='cahill-keyes'){
    const fill=await atlas.locator('#labAtlasCahill [data-cahill-region][aria-pressed=true]').first()
     .evaluate(el=>getComputedStyle(el).fill);
    assert.equal(fill,'rgb(229, 207, 66)','Cahill country selected color is yellow');
   }
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
