// Record the real bundled app with deterministic, non-personal native-bridge fixtures.
// External Gemini and Android's native dialogs are not simulated as screenshots.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve('android-lab/app/src/main/assets/site'),out=path.resolve('android-lab/web/tutorial-media'),scratch=path.resolve('android-lab/build/tutorial-frames');
(async()=>{
 fs.mkdirSync(out,{recursive:true});fs.mkdirSync(scratch,{recursive:true});
 const server=http.createServer((req,res)=>{let n=new URL(req.url,'http://local').pathname;if(n==='/')n='/index.html';const f=path.resolve(root,'.'+n);if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return}try{res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff','.mp4':'video/mp4'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))}catch{res.writeHead(404);res.end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
 for(const scene of ['setup','inspiration','submit']){
  const frames=path.join(scratch,scene);fs.mkdirSync(frames,{recursive:true});let count=0;
  const page=await browser.newPage({viewport:{width:390,height:620},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await page.addInitScript(({scene})=>{
   const reference='';
   localStorage.setItem('hmg-first-crate-v1',JSON.stringify({completed:true}));
   window.demoCalls=[];window.demoState={saved:[],mode:'open',oneTap:true,haptics:false,activeInspiration:reference,inspirationPreview:reference?{title:reference}:null,recentInspirations:reference?[{id:'example',text:reference}]:[]};
   window.HipsterLab={state:()=>JSON.stringify(demoState),copy:t=>{demoCalls.push(['copy',t]);return true},setPreference:(k,v)=>{demoState[k]=v;HipsterLabStateChanged()},go:(a,t)=>demoCalls.push(['go',a,t]),open:()=>{},share:()=>{},reviewInspiration:()=>{
    // Explicit recreation: native AlertDialog cannot be captured by Playwright.
    const d=document.createElement('dialog');d.id='demoEntry';d.style.cssText='background:#dfb045;color:#103135;border:2px solid #103135;width:90%;padding:24px;font:16px Arial';
    d.innerHTML='<small>ANDROID DIALOG · RECREATED FOR THIS DEMO</small><h2>Your inspiration</h2><textarea aria-label="Your inspiration" placeholder="Song link, artist/title, or a musical idea" style="width:100%;min-height:110px;background:transparent;color:inherit;font:20px Arial;border:0;border-bottom:1px solid"></textarea><button id="demoUse" style="margin-top:24px;padding:12px;background:#103135;color:#dfb045;border:0">USE IN JUKEBOX</button>';
    document.body.append(d);d.showModal();d.querySelector('button').onclick=()=>{const value=d.querySelector('textarea').value.trim();if(!value)return;demoState.activeInspiration=value;demoState.recentInspirations=[{id:'example',text:value}];d.close();d.remove();HipsterLabStateChanged()};
   }};
  },{scene});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?ai='+(scene==='setup'?'chatgpt&service=spotify':'gemini&service=youtube'));
  await page.waitForFunction(()=>window.labAtlasGlobe&&document.querySelector('[data-atlas-view="robinson"]'));
  await page.evaluate(()=>{const p=document.createElement('span');p.id='captureTap';p.style.cssText='position:fixed;width:32px;height:32px;border:3px solid #f4efdf;box-shadow:0 0 0 2px #103135;border-radius:50%;pointer-events:none;z-index:9999;display:none';document.body.append(p)});
  async function caption(text){await page.evaluate(text=>{let e=document.getElementById('captureCaption');if(!e){e=document.createElement('div');e.id='captureCaption';e.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:10000;padding:12px 18px;background:#103135;color:#f4efdf;font:600 17px/1.35 Arial;pointer-events:none';document.body.append(e)}e.textContent=text},text)}
  async function hold(n){for(let i=0;i<n;i++){await page.screenshot({path:path.join(frames,String(count++).padStart(4,'0')+'.png')});await page.waitForTimeout(55)}}
  async function tap(selector){const l=page.locator(selector).first();await l.scrollIntoViewIfNeeded();const b=await l.boundingBox();await page.evaluate(({x,y})=>{const p=document.getElementById('captureTap');p.style.left=x-16+'px';p.style.top=y-16+'px';p.style.display='block'},{x:b.x+b.width/2,y:b.y+b.height/2});await hold(4);await l.click();await page.evaluate(()=>document.getElementById('captureTap').style.display='none');await hold(8)}
  if(scene==='setup'){
   await page.locator('[data-lab-action=preferences]').first().click();await hold(10);await tap('[data-ai=gemini]');await tap('[data-service=youtube]');await tap('[data-lab-action=close-preferences]');
   await page.locator('[data-lab-tab=manual]').click();await page.locator('#labConnectionsTitle').evaluate(e=>e.scrollIntoView({block:'start'}));await hold(8);await tap('[data-lab-action=setup]');
   assert.match(await page.evaluate(()=>demoCalls.at(-1)[1]),/SETUP CHECK for Gemini \+ YouTube Music/);
  }else{
   if(scene==='inspiration'){
    await page.locator('[data-lab-tab=crate]').click();await caption('1 · Your Crate → ADD');await hold(15);await tap('#labCrateReview');
    await caption('2 · Type an idea. That’s enough to start.');await hold(10);
    for(const word of ['A rainy ','train ride ','after midnight']){await page.locator('#demoEntry textarea').pressSequentially(word,{delay:60});await hold(9)}
    assert.equal(await page.locator('#demoEntry textarea').inputValue(),'A rainy train ride after midnight');await hold(15);
    await caption('3 · Use in Jukebox');await tap('#demoUse');await tap('#labCrateContinue');
    await caption('4 · Add a mood, if you like');
   }
   else{await page.locator('.mood-grid').evaluate(e=>e.scrollIntoView({block:'center'}));await hold(10)}
   await tap('[data-mood=weird]');await tap('[data-mood='+(scene==='inspiration'?'sad':'desire')+']');
   if(scene==='inspiration')await caption('5 · GO copies your request and opens your AI');await page.locator('#goButton').evaluate(e=>e.scrollIntoView({block:'center'}));await hold(8);await tap('#goButton');
   const prompt=await page.evaluate(()=>demoCalls.find(c=>c[0]==='go')[2]);
   if(scene==='inspiration'){assert.match(prompt,/A rainy train ride after midnight/);assert.doesNotMatch(prompt,/Discovery route:/)}else assert.match(prompt,/Discovery route:/);
   if(scene==='inspiration')await caption('Next: paste in Gemini, then send.');await page.locator('#handoffTitle').evaluate(e=>e.scrollIntoView({block:'center'}));await hold(12);
  }
  await hold(8);await page.close();
  execFileSync('ffmpeg',['-y','-loglevel','error','-framerate','10','-i',path.join(frames,'%04d.png'),'-c:v','libx264','-profile:v','baseline','-pix_fmt','yuv420p','-crf','29','-movflags','+faststart','-an',path.join(out,scene+'.mp4')]);
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',path.join(frames,'0000.png'),'-frames:v','1',path.join(out,scene+'.webp')]);
  console.log(scene,count,'frames',fs.statSync(path.join(out,scene+'.mp4')).size,'bytes');
 }
 fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),viewport:{width:390,height:620},fps:10,scenes:['setup','inspiration','submit'],fixture:'Deterministic native bridge; fictional inspiration entered from empty state. Entry dialog is explicitly labelled recreation matching SharedInspiration.java; remaining app UI is real. No messages sent; external Gemini UI not recorded.'},null,2)+'\n');
 }finally{await browser?.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
