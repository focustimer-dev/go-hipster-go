const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
(async()=>{
 const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://local').pathname;const f=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return}try{const ext=path.extname(f);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.html':'text/html','.png':'image/png','.webp':'image/webp','.woff':'font/woff'})[ext]||'application/octet-stream');res.end(fs.readFileSync(f))}catch{res.writeHead(404);res.end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
 const out='android-lab/build/switch-review';fs.mkdirSync(out,{recursive:true});
 for(const profile of [{name:'phone',width:412,height:915},{name:'narrow',width:320,height:740},{name:'landscape',width:915,height:412},{name:'large-text',width:412,height:915}]){
  const page=await browser.newPage({viewport:profile,isMobile:true,hasTouch:true,reducedMotion:profile.name==='phone'?'no-preference':'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.guideCalls=[];window.guideCopyOK=true;window.HipsterLab={state:()=>JSON.stringify({mode:'open',saved:[],oneTap:true}),copy:t=>{guideCalls.push(['copy',t]);return guideCopyOK},go:()=>guideCalls.push(['go']),open:()=>guideCalls.push(['open']),share:()=>guideCalls.push(['share'])}});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?ai=gemini&service=youtube');
  if(profile.name==='large-text')await page.addStyleTag({content:'html{font-size:200%}'});
  await page.locator('[data-lab-tab=manual]').click();
  await page.locator('#labGuideAction').click();
  assert.match(await page.evaluate(()=>guideCalls.at(-1)[1]),/FIRST-TIME SETUP CHECK for Gemini/);
  for(const step of ['setup','submit','review','publish','cover']){
   await page.locator('[data-guide-step='+step+']').click();
   assert.equal(await page.locator('[data-guide-step='+step+']').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#labGuideDemo .lab-guide-frame').count(),3);
   if(step==='review'||step==='publish'){
    await page.locator('#labGuideAction').click();assert.equal(await page.evaluate(()=>guideCalls.at(-1)[1]),step==='publish'?'Publish':'go de-cheese');assert.match(await page.locator('#labGuideStatus').textContent(),/Command copied/);
   }
   if(profile.name==='phone'||step==='publish')await page.locator('#labTutorial').screenshot({path:out+'/tutorial-'+profile.name+'-'+step+'.png'});
  }
  await page.locator('[data-guide-step=publish]').click();await page.evaluate(()=>guideCopyOK=false);await page.locator('#labGuideAction').click();assert.match(await page.locator('#labGuideStatus').textContent(),/Copy failed.*Type Publish/);await page.evaluate(()=>guideCopyOK=true);
  await page.locator('[data-guide-step=cover]').click();
  assert.equal(await page.evaluate(()=>guideCalls.some(c=>['go','share','open'].includes(c[0]))),false,'Tutorial never submits a request or publishes');
  assert.match(await page.locator('#labGuideNote').textContent(),/Cover art is manual/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'No page overflow: '+profile.name);
  if(profile.name==='phone'){
   await page.locator('#labGuidePlay').click();assert(await page.locator('#labGuideDemo').evaluate(e=>e.classList.contains('is-playing')));
   await page.locator('[data-lab-tab=jukebox]').click();assert.equal(await page.locator('#labGuideDemo').evaluate(e=>e.classList.contains('is-playing')),false,'Leaving Manual stops motion');
  }else assert.equal(await page.locator('#labGuidePlay').isVisible(),false,'Reduced motion keeps the static steps');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: tutorial setup, exact command copies, no submissions, all five demos, stop-on-leave, reduced motion and four layouts');
 }finally{await browser?.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
