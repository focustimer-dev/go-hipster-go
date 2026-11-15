// Browser regression: portrait taps are selectors in Simple and drag stamps in Curve.
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
  assert.match(await hint.innerText(),/Drag a face onto the curve/);
  assert.match(await mood.getAttribute('aria-label'),/drag onto the curve/);
  assert.equal(await mood.locator('.mood-drag-grip').first().evaluate(e=>getComputedStyle(e).display),'grid');
  assert.match(await happy.getAttribute('title'),/Drag HAPPY onto the curve/);
  assert.equal(await happy.getAttribute('aria-pressed'),'true','Global Happy remains until the curve gets a mood pin');
  await angry.click();
  assert.equal(await angry.getAttribute('aria-pressed'),'false','A tap must not silently change global mood in curve mode');
  assert.equal(await page.evaluate(()=>window.HipsterPWABridge.getPrompt()),before,'Tempo-only curve retains existing global mood');

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
  assert.match(await hint.innerText(),/change the mood along it/);
  assert.equal(await happy.getAttribute('aria-pressed'),'false','Pinned curve moods own the selection');
  await page.locator('.refinements').screenshot({path:'android-lab/build/curve-mood-review.png'});

  await page.getByRole('button',{name:'Set the tempo'}).click();
  assert.equal(await mood.getAttribute('data-mood-interaction'),'tap');
  assert.match(await hint.innerText(),/Tap up to two moods/);
  assert.equal(await mood.locator('.mood-drag-grip').first().evaluate(e=>getComputedStyle(e).display),'none');
  assert.equal(await happy.getAttribute('aria-pressed'),'true','Switching back restores original global choice');
  await angry.click();
  assert.equal(await angry.getAttribute('aria-pressed'),'true','Portrait tapping is restored in Simple');
  assert.equal(errors.length,0,'No browser exceptions: '+errors.join(' | '));
  console.log('PASS curve mood affordances, retained global moods, iframe message contract, tap isolation and mode recovery');
  await page.close();
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>server.close());
