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
 {id:'kingston',ocean:'#273d3b',stock:'rgb(227, 217, 194)'},
 {id:'detroit',ocean:'#151515',stock:'rgb(231, 229, 219)'},
 {id:'michoacan',ocean:'#24191b',stock:'rgb(209, 173, 145)'},
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
   assert.equal(await page.evaluate(id=>window.HipsterLabTheme.set(id,false),spec.id),true);
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
   // Real computed styles must bind to the shared semantic roles for all
   // six printed palettes. Test the historical controls, not just token strings.
   const controls=await page.evaluate(()=>{
    const root=getComputedStyle(document.documentElement);
    const role=n=>root.getPropertyValue(n).trim();
    const style=s=>getComputedStyle(document.querySelector(s));
    const probe=document.createElement('span');
    probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const coloredRole=n=>{probe.style.color='var('+n+')';return getComputedStyle(probe).color;};
    const report={
     linkRole:coloredRole('--lab-ui-link-ink'),link:style('#labAddInspiration').color,
     statusRole:coloredRole('--lab-ui-status-ink'),status:style('#copyStatus').color,
     metaRole:coloredRole('--lab-ui-receipt-meta-ink'),meta:style('#promptReceipt .receipt-top').color,
     accentRole:coloredRole('--lab-ui-receipt-accent-ink'),save:style('.receipt-heading .lab-save-button').color,
     trailRole:coloredRole('--lab-ui-trail-mark-ink'),trail:style('.poster-go-trail-mark').color,
     trailLabelRole:coloredRole('--lab-ui-trail-label-ink'),trailLabel:style('.poster-go-trail-word').color,
     disabledRole:coloredRole('--lab-ui-disabled-ink'),
     primaryRole:role('--lab-ui-primary-bg'),baseActionRole:role('--lab-ui-action'),
     crate:style('#labCrateEmpty .lab-wide-button').backgroundColor,
     selectedRole:role('--lab-theme-selected-bg'),themeChoice:style('.lab-theme-choice[aria-pressed=true]').backgroundColor
    };
    probe.remove();
    return report;
   });
   const rgbRole=hex=>'rgb('+hex.slice(1).match(/.{2}/g).map(v=>parseInt(v,16)).join(', ')+')';
   for(const [role,value] of [['linkRole','link'],['statusRole','status'],['metaRole','meta'],
     ['accentRole','save'],['trailRole','trail'],['trailLabelRole','trailLabel']]){
    assert(controls[role],spec.id+' missing computed '+role);
    assert.equal(controls[value],controls[role],spec.id+' '+value+' bypasses semantic token '+role);
   }
   for(const [role,value] of [['primaryRole','crate'],['selectedRole','themeChoice']]){
    assert.match(controls[role],/^#[0-9a-f]{6}$/,spec.id+' missing concrete '+role);
    assert.equal(controls[value],rgbRole(controls[role]),spec.id+' '+value+' bypasses semantic token '+role);
   }
   assert.equal(controls.primaryRole,spec.id==='michoacan'?'#24191b':controls.baseActionRole,
    'Michoacán retains its special approved Crate gold-on-lacquer plate');
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
     image:art.backgroundImage,ink:art.filter,size:art.backgroundSize,
     position:art.backgroundPosition,rays:rays.filter,opacity:rays.opacity};
    f.setAttribute('aria-pressed','false');return value;
   });
   assert.equal(selected.selectedAttribute,'true','Funk select state stays enabled during pressed visual');
   assert.equal(selected.selectedMatches,true,'Funk uses canonical selected-attribute selector');
   assert.equal(selected.canonicalSelector,true,'Funk is in the canonical Android Jukebox');
   assert.equal(selected.stock,'rgb(110, 34, 92)','Selected Funk is canonical, not theme-colored: '+JSON.stringify(selected));
   assert.equal(selected.label,'rgb(242, 200, 78)');
   assert.match(selected.image,/funk-selected-engraved.webp/,'Baked original Funk engraving');
   assert.equal(selected.ink,'none','Android WebView should not need a pseudo-element SVG filter');
   assert.equal(selected.size,'100% 100%','Funk uses the canonical square crop');
   assert.equal(selected.position,'50% 50%');
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
   assert.match(ornament.birdMask,/bird-globe\.webp/);
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
