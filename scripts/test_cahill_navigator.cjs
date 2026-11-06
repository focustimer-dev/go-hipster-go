// Cahill pan-strip regression for real Android Lab WebView-like browser surface.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch(_){res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const width of [320,412]){
   const page=await browser.newPage({viewport:{width,height:900},isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.HipsterLab={state:()=>'{\"saved\":[]}',inspiration:()=>'',copy:()=>true}});
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,{timeout:25000});
   await page.locator('[data-atlas-view=cahill-keyes]').click();
   await page.waitForFunction(()=>document.getElementById('labAtlasCahill')?.style.opacity==='1'&&
    document.getElementById('labAtlasGlobe')?.style.pointerEvents==='',null,{timeout:14000});
   assert.equal(await page.locator('#labCahillNavigator').isVisible(),false,
     'Full-world view should have no extra strip or chart obstruction');
   const selected=await page.evaluate(()=>[...document.querySelectorAll('#labAtlasCahill [data-cahill-region]')].filter(n=>n.getAttribute('fill')==='#a83223').length);
   await page.evaluate(()=>{
    const svg=document.getElementById('labAtlasCahill'),r=svg.getBoundingClientRect();
    svg.dispatchEvent(new WheelEvent('wheel',{deltaY:-340,clientX:r.left+r.width/2,
      clientY:r.top+r.height/2,bubbles:true,cancelable:true}));
   });
   await page.waitForFunction(()=>!window.labCahillMap.navigator.root.hidden);
   const rail=page.locator('#labCahillNavigator .lab-cahill-pan-rail');
   const box=await rail.boundingBox();
   assert(box&&box.height>=44&&box.width>=120,'Small visual rail keeps a 44px high hit area');
   const host=await page.locator('#labAtlasGlobe').boundingBox();
   assert(host&&box.y>=host.y+host.height-50,'Strip must hug bottom of atlas');
   assert.equal(await page.locator('#labCahillNavigator svg').count(),0,'No second miniature map');
   assert.equal(await page.locator('#labCahillNavigator .lab-cahill-pan-end').count(),0,'No W/E labels');
   const visual=await page.locator('#labCahillNavigator .lab-cahill-pan-track').boundingBox();
   assert(visual&&visual.height<=7&&visual.width<=204,'Strip visual remains minimal');
   const view=()=>page.evaluate(()=>window.labCahillMap.camera.snapshot());
   const initial=await view();
   await page.mouse.click(box.x+12,box.y+box.height/2);
   const west=await view();
   await page.mouse.click(box.x+box.width-12,box.y+box.height/2);
   const east=await view();
   assert(west.x<initial.x,'Left tap moves west');
   assert(east.x>west.x+30,'Right tap crosses interrupted lobes');
   const progress=+(await rail.getAttribute('aria-valuenow'));
   assert(progress>=0&&progress<=100,'Accessible pan position');
   await rail.focus();
   await page.keyboard.press('ArrowLeft');
   const keyboard=await view();
   assert(keyboard.x<east.x,'Arrow left nudges west');
   await page.mouse.move(box.x+box.width-16,box.y+box.height/2);
   await page.mouse.down();
   await page.mouse.move(box.x+16,box.y+box.height/2,{steps:6});
   await page.mouse.up();
   const dragged=await view();
   assert(dragged.x<keyboard.x,'Scrub moves camera');
   const after=await page.evaluate(()=>[...document.querySelectorAll('#labAtlasCahill [data-cahill-region]')].filter(n=>n.getAttribute('fill')==='#a83223').length);
   assert.equal(after,selected,'Strip interaction never changes stamps');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal page overflow');
   await page.evaluate(()=>window.labCahillMap.reset());
   await page.waitForFunction(()=>window.labCahillMap.navigator.root.hidden);
   await page.locator('[data-atlas-view=globe]').click();
   await page.waitForFunction(()=>document.getElementById('labAtlasCahill')?.style.display==='none'&&
    document.getElementById('labAtlasGlobe')?.style.pointerEvents==='',null,{timeout:14000});
   assert.equal(await page.locator('#labCahillNavigator').isVisible(),false);
   assert.deepEqual(errors,[]);
   console.log('Pan strip '+width+'px passed',{west:west.x,east:east.x,dragged:dragged.x});
   await page.close();
  }
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
