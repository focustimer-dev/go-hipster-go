// Browser regression: both modes allow 2-mood taps; Curve also offers 3-dot drag stamps.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const server=http.createServer((req,res)=>{
 const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(route.endsWith('/')?route+'index.html':route));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
 }catch{res.writeHead(404);res.end()}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
 try{
  const page=await browser.newPage({viewport:{width:412,height:915},hasTouch:true,isMobile:true});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{window.HipsterLab={
   state:()=>JSON.stringify({saved:[],mode:'share',oneTap:true}),
   inspiration:()=>'',surpriseUnlocked:()=>false,
   setDialogPalette(){},syncSystemPalette(){},
   haptic(){},copy:()=>true
  }});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?atlas=legacy');
  const mood=page.locator('.mood-grid'),happy=mood.locator('[data-mood=happy]'),angry=mood.locator('[data-mood=angry]');
  const hint=page.locator('#moodModeHint');
  assert.equal(await mood.getAttribute('data-mood-interaction'),'tap');
  assert.match(await hint.innerText(),/Tap up to two moods/);
  assert.equal(await mood.locator('.mood-drag-grip').count(),8);
  assert.equal(await mood.locator('.mood-drag-grip').first().evaluate(e=>getComputedStyle(e).display),'none');
  await happy.click();
  assert.equal(await happy.getAttribute('aria-pressed'),'true');
  const before=await page.evaluate(()=>window.HipsterPWABridge.getPrompt());
  assert.match(before,/\bgo happy\b/,'Default Lab handoff prefix may precede the music command');

  await page.getByRole('button',{name:'The curve'}).click();
  assert.equal(await mood.getAttribute('data-mood-interaction'),'drag');
  assert.equal(await hint.getAttribute('data-mode'),'drag');
  assert.match(await hint.innerText(),/Tap up to two moods, then drag onto the curve/);
  assert.match(await mood.getAttribute('aria-label'),/tap up to two, then drag onto the curve/);
  assert.equal(await mood.locator('.mood-drag-grip').first().evaluate(e=>getComputedStyle(e).display),'grid');
  assert.equal((await mood.locator('.mood-drag-grip').first().innerText()).trim(),'✥','Four-spoked drag cue does not resemble an overflow menu');
  assert.match(await happy.getAttribute('title'),/Tap to select HAPPY; drag onto the curve/);
  assert.equal(await happy.getAttribute('aria-pressed'),'true','Happy remains selected in Curve mode');
  assert.equal(await page.evaluate(()=>window.HipsterPWABridge.getPrompt()),before,'Tempo-only curve keeps the original global mood');
  await angry.click();
  assert.equal(await happy.getAttribute('aria-pressed'),'true','Curve mode preserves first tap selection');
  assert.equal(await angry.getAttribute('aria-pressed'),'true','Curve mode allows a second selected portrait');
  const twoMoodPrompt=await page.evaluate(()=>window.HipsterPWABridge.getPrompt());
  assert.match(twoMoodPrompt,/go happy angry/,'Tempo-only curve exports both global moods');
  await page.locator('[data-mood=weird]').click();
  assert.equal(await happy.getAttribute('aria-pressed'),'true','Third tap preserves the first mood');
  assert.equal(await angry.getAttribute('aria-pressed'),'false','Third tap replaces the second mood');
  assert.equal(await page.locator('[data-mood=weird]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-mood=weird]').click();
  assert.equal(await page.locator('[data-mood=weird]').getAttribute('aria-pressed'),'false','Tapping a selected mood removes it');
  await angry.click();
  assert.equal(await angry.getAttribute('aria-pressed'),'true','Restore two selected moods for the curve stamp');

  // Use the real parent/iframe message contract. Synthetic Playwright mouse
  // drags across sandboxed iframes are not a reliable substitute for the
  // physical touch test, so this guards the UI mode handoff deterministically.
  const frame=page.locator('#mixCurveEditor');
  await frame.waitFor({state:'visible'});
  const code='c1:0h'+'0'.repeat(11);
  const promptAfterPin=await page.evaluate(code=>{
   const frame=document.getElementById('mixCurveEditor');
   window.dispatchEvent(new MessageEvent('message',{
    source:frame.contentWindow,origin:'null',
    data:{type:'ghg-mix-curve',code,height:154}
   }));
   return window.HipsterPWABridge.getPrompt();
  },code);
  assert(promptAfterPin.includes(code),'Pinned mood must enter the actual exported curve');
  assert.match(await hint.innerText(),/Curve pins control the mix/);
  assert.equal(await happy.getAttribute('aria-pressed'),'true','Pinned curve moods do not erase staged drag selection');
  assert.equal(await angry.getAttribute('aria-pressed'),'true','Second staged mood remains available for another curve stamp');
  assert.doesNotMatch(promptAfterPin,/go happy angry/,'Pinned curve moods override global mood in exported prompt');
  await page.locator('[data-mood=sad]').click();
  assert.equal(await page.locator('[data-mood=sad]').getAttribute('aria-pressed'),'true','Tap selection still works after a pin');
  assert.equal(await angry.getAttribute('aria-pressed'),'false','Third tap updates staged pair');
  assert.equal(await page.evaluate(()=>window.HipsterPWABridge.getPrompt()),promptAfterPin,'Staging next moods must not override pinned curve output');
  await page.locator('.refinements').screenshot({path:'android-lab/build/curve-mood-review.png'});

  await page.getByRole('button',{name:'Set the tempo'}).click();
  assert.equal(await mood.getAttribute('data-mood-interaction'),'tap');
  assert.match(await hint.innerText(),/Tap up to two moods/);
  assert.equal(await mood.locator('.mood-drag-grip').first().evaluate(e=>getComputedStyle(e).display),'none');
  assert.equal(await happy.getAttribute('aria-pressed'),'true','Switching back retains staged mood');
  assert.equal(await page.locator('[data-mood=sad]').getAttribute('aria-pressed'),'true','Second staged mood survives return to simple');
  await angry.click();
  assert.equal(await angry.getAttribute('aria-pressed'),'true','Third tap selects the new second mood in Simple');
  assert.equal(await page.locator('[data-mood=sad]').getAttribute('aria-pressed'),'false');
  assert.equal(errors.length,0,'No browser exceptions: '+errors.join(' | '));
  console.log('PASS 2-mood taps in both modes, three-dot drag cue, iframe curve precedence and mode recovery');
  await page.close();
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>server.close());
