// Lightweight Android Final Five contract gate: no screenshots or tween
// benchmarks, and just ONE MapLibre initialization for three palettes.
// The existing phone matrix separately exercises real map transitions.
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css',
 '.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff':'font/woff'};
const specs=[
 {id:'addis',ocean:'#0f4a48',stock:'rgb(242, 232, 206)'},
 {id:'polish',ocean:'#172c40',stock:'rgb(246, 242, 230)'},
 {id:'beirut',ocean:'#1c3240',stock:'rgb(227, 216, 191)'}
];
(async()=>{
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch(_){res.writeHead(404);res.end()}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:860},isMobile:true,hasTouch:true});
  page.setDefaultTimeout(9000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?theme=addis',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,null,{timeout:25000});
  for(const spec of specs){
   if(spec.id!=='addis')assert.equal(await page.evaluate(id=>window.HipsterLabTheme.set(id,false),spec.id),true);
   // Wait for the new palette to SETTLE. Stock and selected ink have a
   // short CSS transition, so reading immediately after set() reports
   // the previous theme's paper, even though selection is already updated.
   await page.waitForFunction(([theme,ocean,stock])=>
    window.HipsterLabTheme.current()===theme&&
    window.labAtlasGlobe.getPaintProperty('robinson-ocean','fill-color')===ocean&&
    getComputedStyle(document.querySelector('.mood[data-mood=happy]')).backgroundColor===stock&&
    getComputedStyle(document.querySelector('.mood[data-mood=funky]')).backgroundColor===stock,
    [spec.id,spec.ocean,spec.stock],{timeout:9000});
   const neutral=await page.evaluate(()=>{
    const cs=selector=>getComputedStyle(document.querySelector(selector));
    const f=document.querySelector('.mood[data-mood=funky]'),h=document.querySelector('.mood[data-mood=happy]');
    f.setAttribute('aria-pressed','false');h.setAttribute('aria-pressed','false');
    return {theme:window.HipsterLabTheme.current(),profile:document.documentElement.dataset.ghgThemeProfile,
     paper:cs('.mood[data-mood=happy]').backgroundColor,
     funkPaper:cs('.mood[data-mood=funky]').backgroundColor,
     ink:cs('.mood[data-mood=happy] .word').color,
     funkInk:cs('.mood[data-mood=funky] .word').color,
     before:getComputedStyle(f.querySelector('.face'),'::before').filter,
     ocean:window.GHGAtlasPaintColors().ocean,
     cahill:cs('#labAtlasCahill .lab-cahill-ocean').fill,
     heading:cs('.refinements>.counter-label').fontFamily};
   });
   assert.equal(neutral.theme,spec.id);
   assert.equal(neutral.profile,'print');
   assert.equal(neutral.paper,spec.stock);
   assert.equal(neutral.funkPaper,neutral.paper,'Neutral Funk must share '+spec.id+' stock');
   assert.equal(neutral.funkInk,neutral.ink,'Neutral Funk must share '+spec.id+' ink');
   assert.match(neutral.before,/themeMoodNeutralEngraving/);
   assert.equal(neutral.ocean,spec.ocean);
   const rgb='rgb('+spec.ocean.slice(1).match(/.{2}/g).map(v=>parseInt(v,16)).join(', ')+')';
   assert.equal(neutral.cahill,rgb,'Cahill and Robinson share the palette');
   assert.match(neutral.heading,/Poster/);
   // CSS transitions briefly retain the old neutral tile and 0-opacity
   // lasers even while the selected artwork and gold text have switched.
   // Assert the SETTLED selected performance, not its first animation frame.
   await page.evaluate(()=>document.querySelector('.mood[data-mood=funky]').setAttribute('aria-pressed','true'));
   await page.waitForFunction(()=>{
    const f=document.querySelector('.mood[data-mood=funky]');
    return f.getAttribute('aria-pressed')==='true' &&
     getComputedStyle(f).backgroundColor==='rgb(110, 34, 92)' &&
     getComputedStyle(f.querySelector('.funk-rays')).opacity==='0.82';
   },null,{timeout:5000});
   const selected=await page.evaluate(()=>{
    const f=document.querySelector('.mood[data-mood=funky]');
    const st=getComputedStyle(f),art=getComputedStyle(f.querySelector('.face'),'::after');
    const rays=getComputedStyle(f.querySelector('.funk-rays'));
    const value={stock:st.backgroundColor,label:getComputedStyle(f.querySelector('.word')).color,
     selectedAttribute:f.getAttribute('aria-pressed'),selectedMatches:f.matches('[aria-pressed=true]'),
     canonicalSelector:f.matches('body.gig-poster.lab-workspace .mood-grid .mood[data-mood=funky][aria-pressed=true]'),
     rootProfile:document.documentElement.dataset.ghgThemeProfile,
     pageContext:document.body.dataset.page,
     image:art.backgroundImage,ink:art.filter,rays:rays.filter,opacity:rays.opacity};
    f.setAttribute('aria-pressed','false');return value;
   });
   assert.equal(selected.selectedAttribute,'true','Funk select state stays enabled during pressed visual');
   assert.equal(selected.selectedMatches,true,'Funk uses canonical selected-attribute selector');
   assert.equal(selected.canonicalSelector,true,'Funk is in the canonical Android Jukebox');
   assert.equal(selected.stock,'rgb(110, 34, 92)','Selected Funk is canonical, not theme-colored: '+JSON.stringify(selected));
   assert.equal(selected.label,'rgb(242, 200, 78)');
   assert.match(selected.image,/moods-selected-ink-v2.webp/);
   assert.match(selected.ink,/hue-rotate\(324deg\)/);
   assert.match(selected.rays,/hue-rotate\(23deg\)/);
   assert.equal(selected.opacity,'0.82');
   const iframe=await page.evaluate(()=>document.getElementById('labManualFrame')?.contentDocument?.documentElement?.dataset);
   assert.equal(iframe?.pwaTheme,spec.id);
   assert.equal(iframe?.ghgThemeProfile,'print');
   // The compass is pressed in the same ink as selected countries;
   // the unchanged hero artwork uses its transparent engraving as a mask.
   const ornament=await page.evaluate(()=>{
    const root=getComputedStyle(document.documentElement);
    const bird=document.querySelector('.poster-bird');
    return {
     atlasInk:root.getPropertyValue('--lab-atlas-selected').trim(),
     stampInk:root.getPropertyValue('--lab-print-stamp').trim(),
     compass:getComputedStyle(document.querySelector('.chart-rose-north')).fill,
     hub:getComputedStyle(document.querySelector('.chart-rose-hub')).fill,
     birdInk:getComputedStyle(bird).backgroundColor,
     birdMask:getComputedStyle(bird).maskImage,
     heroText:[...document.querySelectorAll('.poster-hero .poster-line')]
      .map(x=>x.textContent).join(' ')
    };
   });
   const colorAsRgb=hex=>'rgb('+hex.slice(1).match(/.{2}/g).map(v=>parseInt(v,16)).join(', ')+')';
   assert.equal(ornament.compass,colorAsRgb(ornament.atlasInk),'Compass matches selected countries');
   assert.equal(ornament.hub,ornament.compass,'Compass center matches north');
   assert.equal(ornament.birdInk,colorAsRgb(ornament.stampInk),'Etched bird uses theme stamp ink');
   assert.match(ornament.birdMask,/bird-globe\\.webp/);
   assert.equal(ornament.heroText,'YOUR TASTE IS A PROBLEM');
   console.log('PASS: '+spec.id+' print tokens, neutral/selected Funk, map palette, Manual and hero');
  }
  assert.deepEqual(errors,[],'No theme runtime errors');
  await page.close();
 }finally{
  try{await browser?.close()}catch(_){}
  await new Promise(done=>server.close(done));
 }
})().catch(err=>{console.error(err);process.exitCode=1});
