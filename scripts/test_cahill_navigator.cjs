// Phone-sized, offline Cahill Navigator regression suite. No production build.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
 const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch(_){res.writeHead(404);res.end()}
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const width of [412,320]){
   const page=await browser.newPage({viewport:{width,height:850},isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.HipsterLab={state:()=>'{\"saved\":[]}',inspiration:()=>'',copy:()=>true}});
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,{timeout:25000});
   await page.locator('[data-atlas-view=cahill-keyes]').click();
   await page.waitForFunction(()=>document.getElementById('labAtlasCahill')?.style.opacity==='1'&&
      document.getElementById('labAtlasGlobe')?.style.pointerEvents===''&&
      window.labCahillMap?.navigator?.root?.hidden,{timeout:14000});
   const initial=await page.evaluate(()=>({
    zoom:window.labCahillMap.camera.snapshot().zoom,
    navHidden:window.labCahillMap.navigator.root.hidden,
    visible:!window.labCahillMap.navigator.panel.hidden,
    selected:[...document.querySelectorAll('#labAtlasCahill [data-cahill-region]')].filter(n=>n.getAttribute('fill')==='#a83223').length
   }));
   assert.equal(initial.zoom,1);assert(initial.navHidden);assert(!initial.visible);
   await page.evaluate(()=>{
    const svg=document.getElementById('labAtlasCahill'),r=svg.getBoundingClientRect();
    svg.dispatchEvent(new WheelEvent('wheel',{deltaY:-220,clientX:r.left+r.width/2,
      clientY:r.top+r.height/2,bubbles:true,cancelable:true}));
   });
   await page.waitForFunction(()=>!window.labCahillMap.navigator.root.hidden,{timeout:3000});
   await page.locator('#labCahillNavigator .lab-cahill-nav-toggle').click();
   await page.waitForFunction(()=>window.labCahillMap.navigator.isOpen());
   assert.equal(await page.locator('#labCahillNavigator .lab-cahill-nav-toggle').getAttribute('aria-expanded'),'true');
   // Shared camera and miniature viewport must agree in projection space.
   const compare=async()=>{
    await page.waitForTimeout(45);
    const v=await page.evaluate(()=>{
     const b=window.labCahillMap.camera.snapshot(),n=window.labCahillMap.navigator;
     return {b,mini:{x:+n.windowRect.getAttribute('x'),y:+n.windowRect.getAttribute('y'),
       w:+n.windowRect.getAttribute('width'),h:+n.windowRect.getAttribute('height')},
       chart:document.getElementById('labAtlasCahill').getAttribute('viewBox').split(' ').map(Number)};
    });
    for(const key of ['x','y','w','h'])assert(Math.abs(v.b[key]-v.mini[key])<.02,key+' preview follows camera');
    for(let i=0;i<4;i++)assert(Math.abs(v.chart[i]-[v.b.x,v.b.y,v.b.w,v.b.h][i])<.02,'actual viewBox matches camera');
    return v.b;
   };
   const before=await compare();
   const box=await page.locator('.lab-cahill-nav-scrub').boundingBox();
   assert(box&&box.width>120&&box.height>55,'Miniature is legible on narrow screens');
   await page.mouse.click(box.x+8,box.y+box.height*.52);
   const left=await compare();
   assert(left.x<before.x-20,'Tapping miniature left recentered world');
   // Dragging across disconnected map lobes pans, never stamps geography.
   await page.mouse.move(box.x+15,box.y+box.height*.52);
   await page.mouse.down();
   await page.mouse.move(box.x+box.width-12,box.y+box.height*.52,{steps:6});
   await page.mouse.up();
   const right=await compare();
   assert(right.x>left.x+70,'Navigator drag traverses map interruptions');
   const after=await page.evaluate(()=>[...document.querySelectorAll('#labAtlasCahill [data-cahill-region]')].filter(n=>n.getAttribute('fill')==='#a83223').length);
   assert.equal(after,initial.selected,'Navigator gestures never alter region selection');
   await page.locator('.lab-cahill-nav-scrub').focus();
   await page.keyboard.press('ArrowLeft');
   const keyboard=await compare();
   assert(keyboard.x<right.x,'Arrow keys pan the camera');
   assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Never create horizontal page overflow');
   fs.mkdirSync(path.join(__dirname,'../android-lab/build/navigator-review'),{recursive:true});
   await page.screenshot({path:path.join(__dirname,'../android-lab/build/navigator-review/navigator-'+width+'.png')});
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('.lab-cahill-nav-panel').isVisible(),false,'Escape closes instrument');
   await page.evaluate(()=>window.labCahillMap.reset());
   await page.waitForFunction(()=>window.labCahillMap.navigator.root.hidden);
   await page.locator('[data-atlas-view=globe]').click();
   await page.waitForFunction(()=>document.getElementById('labAtlasCahill')?.style.display==='none'&&
       document.getElementById('labAtlasGlobe')?.style.pointerEvents==='',{timeout:14000});
   assert.equal(await page.locator('#labCahillNavigator').isVisible(),false);
   assert.deepEqual(errors,[],'Browser errors: '+errors.join('; '));
   console.log('Navigator '+width+'px passed:',{zoom:before.zoom,left:left.x,right:right.x,keyboard:keyboard.x});
   await page.close();
  }
 }finally{
  await browser?.close();await new Promise(resolve=>server.close(resolve));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
