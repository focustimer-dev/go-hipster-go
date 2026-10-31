// Functional browser test for the bundled native handoff contract.
const {chromium}=require('playwright');
const http=require('http');
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
(async()=>{
 const server=http.createServer((req,res)=>{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name.endsWith('/'))name+='index.html';
  const file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch{res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
  const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.labCalls=[];
   window.HipsterLab={copy(t){labCalls.push(['copy',t]);return true},go(a,t){labCalls.push(['go',a,t])},open(a,t){labCalls.push(['open',a,t])},share(t){labCalls.push(['share',t])}};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/?ai=chatgpt&service=spotify');
  await page.locator('#goButton').click();
  await page.waitForFunction(()=>labCalls.some(c=>c[0]==='go'));
  let calls=await page.evaluate(()=>labCalls);
  const first=calls.find(c=>c[0]==='go');assert.equal(first[1],'chatgpt');assert.equal(first[2],calls.find(c=>c[0]==='copy')[1]);
  await page.locator('#openAi').click();
  assert.equal((await page.evaluate(()=>labCalls)).filter(c=>c[0]==='open').length,1);
  await page.locator('[data-ai="gemini"]').first().click();
  await page.locator('[data-service="youtube"]').first().click();
  await page.locator('#goButton').click();
  await page.waitForFunction(()=>labCalls.some(c=>c[0]==='go'&&c[1]==='gemini'));
  calls=await page.evaluate(()=>labCalls);assert(calls.find(c=>c[0]==='go'&&c[1]==='gemini')[2].includes('YouTube Music'));
  await page.locator('#shareButton').click();
  assert((await page.evaluate(()=>labCalls)).some(c=>c[0]==='share'));
  assert.deepEqual(errors,[]);
  console.log('PASS: mobile UI, exact-prompt copy, ChatGPT/Gemini GO, Open, and native Share hooks.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
