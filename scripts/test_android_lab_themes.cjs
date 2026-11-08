// Native Android Lab theme parity visual smoke, including real projection renders.
// Isolated browser test only; no APK signing or production deployment.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const output=path.resolve(__dirname,'../android-lab/build/theme-review');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
const palettes={
 liberi:{page:'rgb(223, 176, 69)',ink:'rgb(16, 49, 53)',land:'#dfb045'},
 bosque:{page:'rgb(245, 240, 230)',ink:'rgb(0, 48, 24)',land:'#004225'},
 usiku:{page:'rgb(17, 17, 17)',ink:'rgb(245, 240, 230)',land:'#f5f0e6'}
};
async function verifyQuietJukebox(page,name,width){
 if(name==='liberi')return;
 const report=await page.evaluate(()=>{
  const el=s=>document.querySelector(s),style=s=>getComputedStyle(el(s));
  const bounds=s=>el(s).getBoundingClientRect();
  const family=s=>style(s).fontFamily;
  const selected=(selector)=>{
   const b=el(selector),old=b.getAttribute('aria-pressed');
   b.setAttribute('aria-pressed','true');
   const selected={background:getComputedStyle(b).backgroundColor,
    border:getComputedStyle(b).borderBottomColor,
    borderSize:parseFloat(getComputedStyle(b).borderBottomWidth)};
   b.setAttribute('aria-pressed',old);
   return selected;
  };
  const section=style('.refinements>.counter-label');
  const pace=getComputedStyle(el('.tempo-control'),'::before');
  return {
   headingFont:section.fontFamily,
   paceFont:pace.fontFamily,
   noteFont:family('#labInspiration strong'),
   shuffleFont:family('#shuffleCrate'),
   paceStopsFont:family('.fader-stops span'),
   artFont:family('.go-extras .option-label'),
   artInk:style('#includeCover .option-label').color,
   hardInk:style('#goHard .option-label').color,
   artIconStroke:style('#includeCover .extra-mark').stroke,
   hardIconStroke:style('#goHard .extra-mark').stroke,
   artSleeveFill:style('#includeCover .art-sleeve').fill,
   receiptFont:family('.receipt-top'),
   atlasBox:style('.lab-atlas-modes').borderLeftWidth,
   atlasSelected:selected('.lab-atlas-modes [data-atlas-view=robinson]'),
   atlasButtonDivider:style('.lab-atlas-modes button+button').borderLeftWidth,
   shuffleBorder:style('#shuffleCrate').borderLeftWidth,
   pinBorder:style('#pinMood').borderLeftWidth,
   pinSelected:selected('#pinMood'),
   extraSurface:style('.go-extras').backgroundColor,
   coverSurface:style('#includeCover').backgroundColor,
   coverBorder:style('#includeCover').borderLeftWidth,
   coverSelected:selected('#includeCover'),
   anyBorder:style('#anyTempo').borderLeftWidth,
   anySelected:selected('#anyTempo'),
   heights:['#shuffleCrate','#pinMood','#pinPace','#pinRegions',
    '#anyTempo','#includeCover','#goHard','.lab-atlas-modes button'].map(s=>[s,bounds(s).height]),
   copiedFont:family('.go-button .go-copy b')
  };
 });
 const rgb=name==='bosque'?'rgb(245, 240, 230)':'rgb(0, 48, 24)';
 for(const key of ['headingFont','paceFont','copiedFont'])
  assert.match(report[key],/Poster/,name+' preserves Poster display voice: '+key);
 for(const key of ['noteFont','shuffleFont','paceStopsFont','artFont'])
  assert.match(report[key],/Arial/,name+' functional UI uses one readable family: '+key);
 assert.match(report.receiptFont,/Courier/,name+' literal receipt serial retains typewriter face');
 for(const key of ['atlasBox','atlasButtonDivider','shuffleBorder','pinBorder','coverBorder','anyBorder'])
  assert.equal(report[key],'0px',name+' '+key+' is no longer an outlined card');
 assert.equal(report.extraSurface,rgb,name+' option toolbar sits on the theme paper');
 assert.equal(report.coverSurface,'rgba(0, 0, 0, 0)',name+' +ART is a flat option');
 const actualInk=name==='bosque'?'rgb(0, 48, 24)':'rgb(245, 240, 230)';
 for(const key of ['artInk','hardInk','artIconStroke','hardIconStroke','artSleeveFill'])
  assert.equal(report[key],actualInk,name+' '+key+' is readable on theme paper');
 for(const key of ['pinSelected','atlasSelected','coverSelected','anySelected']){
  assert(report[key].borderSize>=2,name+' '+key+' has a clear non-color-only selection underline');
  assert.equal(report[key].background,'rgba(0, 0, 0, 0)',
   name+' '+key+' stays flat when selected');
 }
 for(const [label,height] of report.heights)
  assert(height>=44,name+' '+label+' touch target is at least 44 CSS px ('+height+')');
 if(width===390){
  await page.locator('.poster-go-trail').screenshot({path:path.join(output,name+'-quiet-trail.png')});
  await page.locator('.go-options').screenshot({path:path.join(output,name+'-quiet-options.png')});
  await page.locator('.crate-shuffle').screenshot({path:path.join(output,name+'-quiet-shuffle.png')});
  await page.locator('.lab-atlas-modes').screenshot({path:path.join(output,name+'-quiet-atlas-tabs.png')});
  await page.locator('.mood-grid').screenshot({path:path.join(output,name+'-quiet-moods.png')});
 }
}
async function verifyCrateHierarchy(page,name,width){
 const read=()=>page.evaluate(()=>{
  const visible=id=>!document.getElementById(id).hidden;
  return {
   empty:visible('labCrateEmpty'),
   reference:visible('labCrateInspirationSection'),
   recent:visible('labCrateRecentSection'),
   saved:visible('labCrateSavedSection'),
   note:visible('labCrateLocalNote'),
   count:document.getElementById('labSavedCount').textContent.trim()
  };
 });
 const apply=async state=>page.evaluate(next=>{
  Object.assign(window.auditCrate,{saved:[],recentInspirations:[],activeInspiration:''},next);
  window.HipsterLabStateChanged();
 },state);
 assert.deepEqual(await read(),{empty:true,reference:false,recent:false,saved:false,note:false,count:'0 / 10'},
  name+' empty Crate must have one invitation, no empty shelves');
 const button=page.locator('#labCrateEmpty [data-lab-action="inspiration"]');
 assert.equal(await button.count(),1,'Single actionable empty-state invitation');
 if(width===390)await page.locator('#labCrate').screenshot({path:path.join(output,name+'-crate-empty.png')});
 await apply({recentInspirations:[{id:'recent1',text:'Old soul at midnight'}]});
 assert.deepEqual(await read(),{empty:false,reference:false,recent:true,saved:false,note:true,count:'0 / 10'},
  name+' recent-only crate reveals just recent inspirations');
 await apply({saved:[{id:'saved1',prompt:'@go-hipster-go go funky',name:'An old groove',ai:'gemini',time:1780000000000}]});
 assert.deepEqual(await read(),{empty:false,reference:false,recent:false,saved:true,note:true,count:'1 / 10'},
  name+' saved-only crate reveals only saved requests');
 await apply({activeInspiration:'An old dub single'});
 assert.deepEqual(await read(),{empty:false,reference:true,recent:false,saved:false,note:true,count:'0 / 10'},
  name+' active inspiration reveals reference shelf');
 await apply({});
 await button.click();
 assert.equal(await page.locator('#labJukebox').isVisible(),true,
  'Empty Crate CTA opens Jukebox');
 assert.equal(await page.locator('#labInspirationEditor').isVisible(),true,
  'Empty Crate CTA opens the inspiration editor');
 await page.locator('#labInspirationEditor [data-cancel]').click();
}

async function verifyManualHierarchy(page,name,width){
 const guide=page.frameLocator('#labManualFrame');
 await guide.locator('#manualNavigation').waitFor({state:'visible',timeout:15000});
 const actual=await guide.locator('#manualHome').evaluate(home=>{
  const index=home.querySelector('.manual-index'),liner=home.querySelector('.manual-liner');
  const heading=index?.querySelector('h2');
  const nav=index?.querySelector('nav');
  return {
   indexFirst:!!(index.compareDocumentPosition(liner)&Node.DOCUMENT_POSITION_FOLLOWING),
   title:home.ownerDocument.getElementById('crateTitle')?.textContent,
   category:home.ownerDocument.getElementById('crateCategory')?.textContent,
   headingHidden:heading?.classList.contains('manual-home-heading'),
   guideCount:nav?.querySelectorAll('a').length,
   linerCollapsed:!liner.open,
   includesSetup:!!nav?.querySelector('a[href="#setup"]'),
   includesUse:!!nav?.querySelector('a[href="#idea"]')
  };
 });
 assert.equal(actual.indexFirst,true,name+' guide choices precede optional explanation');
 assert.equal(actual.headingHidden,true,'The repeated Manual heading is visually hidden, not removed from accessibility');
 assert.equal(actual.guideCount,6,'All six practical guides remain accessible');
 assert.equal(actual.includesSetup&&actual.includesUse,true,'Both Setup and Using guides remain linked');
 assert.equal(actual.linerCollapsed,true,'Optional background remains collapsed');
 assert.equal(actual.category,'Manual','The overview is Manual, not incorrectly labeled Setup');
 assert.equal(actual.title,'Choose a guide','Picker advertises the immediate task');
 if(width===390)await page.screenshot({path:path.join(output,name+'-manual-refined.png')});
}

(async()=>{
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
  catch(_){res.writeHead(404);res.end()}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;
 try{
  fs.mkdirSync(output,{recursive:true});
  browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const width of [390,320]){
   const page=await browser.newPage({viewport:{width,height:860},isMobile:true,hasTouch:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.auditHandoff={mode:'share',oneTap:true};
    window.auditCrate={saved:[],recentInspirations:[],activeInspiration:''};
    window.HipsterLab={state:()=>JSON.stringify({...window.auditCrate,...window.auditHandoff}),inspiration:()=>window.auditCrate.activeInspiration,copy:()=>true,go:()=>{}};
   });
   await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,null,{timeout:30000});
   await page.emulateMedia({reducedMotion:'reduce'});
   for(const name of Object.keys(palettes)){
    await page.locator('.lab-rail [data-lab-action=preferences]').click();
    await page.locator('[data-lab-theme='+name+']').click();
    assert.equal(await page.locator('[data-lab-theme][aria-pressed=true]').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),name);
    assert.equal(await page.evaluate(()=>window.HipsterLabTheme?.current()),name);
    assert.equal(await page.evaluate(()=>localStorage.getItem('ghg-lab-theme-v1')),name);
    assert.equal(await page.evaluate(()=>window.GHGAtlasPaintColors?.().theme),name);
    assert.deepEqual(await page.locator('link[data-lab-palette-style]').evaluateAll(els=>els.map(e=>e.media)),
     [name==='liberi'?'not all':'all',name==='liberi'?'not all':'all',name==='liberi'?'not all':'all'],
     'Inactive Libéri palette styles must not slow down the base map');
    if(name!=='liberi'){
     const ui=await page.evaluate(()=>{
      const root=getComputedStyle(document.documentElement);
      const val=name=>root.getPropertyValue('--lab-ui-'+name).trim();
      const color=selector=>getComputedStyle(document.querySelector(selector)).color;
      const background=selector=>getComputedStyle(document.querySelector(selector)).backgroundColor;
      return {
       surface:val('surface'),ink:val('ink'),panel:val('panel'),
       action:val('action'),onAction:val('on-action'),ticket:val('ticket-stock'),
       firstCrateInk:color('#firstCrateSetup .ticket'),firstCratePaper:background('#firstCrateSetup .ticket'),
       rail:background('.lab-rail'),railInk:color('.lab-rail'),
       jukebox:background('#labJukebox'),jukeboxInk:color('#labJukebox'),
       crate:background('#labCrate'),crateInk:color('#labCrate'),
       manual:background('#labManual'),manualInk:color('#labManual')
      };
     });
     const hexColor=hex=>[
      parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)
     ];
     const CSS=hex=>'rgb('+hexColor(hex).join(', ')+')';
     assert.equal(ui.firstCrateInk,'rgb(0, 48, 24)',name+' setup keeps dark ink');
     assert.equal(ui.firstCratePaper,CSS(ui.ticket),name+' setup uses shared paper token');
     assert.equal(ui.railInk,CSS(ui.onAction),name+' rail label contrast');
     assert.equal(ui.jukeboxInk,CSS(ui.ink),name+' Jukebox uses current ink');
     assert.equal(ui.jukebox,CSS(ui.surface),name+' Jukebox uses current surface');
     assert.equal(ui.crateInk,CSS(ui.ink),name+' Crate uses current ink');
     assert.equal(ui.crate,CSS(ui.surface),name+' Crate uses current surface');
     assert.equal(ui.manualInk,CSS(ui.ink),name+' Manual uses current ink');
     assert.equal(ui.manual,CSS(ui.panel),name+' Manual uses panel surface');
     assert.equal(ui.action,'#004225',name+' action palette is forest, not Libéri red');
     if(name==='bosque'){
      const finish=await page.evaluate(()=>{
       const root=getComputedStyle(document.documentElement),paint=id=>getComputedStyle(document.querySelector(id));
       return {
        goToken:root.getPropertyValue('--lab-ui-go').trim(),
        action:root.getPropertyValue('--lab-ui-action').trim(),
        goPaint:paint('#goButton').backgroundColor,
        crateTexture:paint('#labCrate').backgroundImage,
        manualTexture:paint('#labManual').backgroundImage,
        jukeboxTexture:paint('#labJukebox').backgroundImage
       };
      });
      assert.equal(finish.goToken,finish.action,'Bosque GO uses the existing action green');
      assert.equal(finish.goPaint,'rgb(0, 66, 37)','Bosque GO painted with shared forest ink');
      for(const area of ['crateTexture','manualTexture','jukeboxTexture'])
       assert.equal(finish[area],'none','Bosque clean paper must have no grain in '+area);
     }
    }
    if(width===390)await page.screenshot({path:path.join(output,`${name}-preferences.png`)});
    await page.locator('[data-lab-action=close-preferences]').click();
    await page.waitForTimeout(150);
    await verifyQuietJukebox(page,name,width);
    if(name==='usiku'&&width===390){
     // Any intentionally hides its slider thumb. Select Mid to inspect the
     // actual saddle-painted circle, then restore the user's Any state.
     await page.locator('#tempoSlider').evaluate(el=>{
      el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}));
     });
     assert.equal(await page.locator('#tempoControl').getAttribute('data-tempo'),'moderate');
     await page.locator('.tempo-control').screenshot({path:path.join(output,'usiku-tempo-saddle-thumb.png')});
     await page.locator('#anyTempo').click();
     assert.equal(await page.locator('#tempoControl').getAttribute('data-tempo'),'any');
    }
    if(name==='usiku')await page.locator('#firstCrateSetup [data-action="choose"]').first().click();
    if(name==='usiku'){
     const contrast=await page.evaluate(()=>{
      const ticket=document.querySelector('#firstCrateSetup .ticket');
      const inspiration=document.querySelector('#labInspiration');
      const wasHidden=inspiration.hidden;inspiration.hidden=false;
      const color=selector=>getComputedStyle(document.querySelector(selector)).color;
      const result={
       card:color('#labInspiration'),title:color('#labInspirationPreview'),
       label:color('#labInspiration strong'),edit:color('#labReviewInspiration'),
       reminder:color('#labInspirationGo'),
       ticket:color('#firstCrateSetup .ticket'),
       ai:color('#fc-ai'),music:color('#fc-service'),
       selectTextFill:getComputedStyle(document.querySelector('#fc-ai')).webkitTextFillColor,
       primary:color('#firstCrateSetup .ticket .primary'),
       ticketStock:getComputedStyle(ticket).backgroundColor
      };
      inspiration.hidden=wasHidden;
      return result;
     });
     for(const key of ['card','title','label','edit','reminder'])
      assert.equal(contrast[key],'rgb(245, 240, 230)','Usiku inspiration '+key+' needs cream contrast');
     for(const key of ['ticket','ai','music','selectTextFill'])
      assert.equal(contrast[key],'rgb(0, 48, 24)','Cream setup '+key+' needs dark ink');
     assert.equal(contrast.primary,'rgb(245, 240, 230)','Setup primary is cream on petrol');
     assert.equal(contrast.ticketStock,'rgb(244, 239, 223)','Keep historic paper setup card');
     if(width===390){
      await page.locator('#firstCrateSetup .ticket').screenshot({path:path.join(output,'usiku-setup-contrast.png')});
      await page.locator('#labInspiration').evaluate(el=>el.hidden=false);
      await page.locator('#labInspiration').screenshot({path:path.join(output,'usiku-inspiration-contrast.png')});
      await page.locator('#labInspiration').evaluate(el=>el.hidden=true);
     }
    }
    // A valid handoff must not inherit Liberi's vermilion in the new skins.
    if(name!=='liberi'){
     const buttonInk=await page.locator('#openAi').evaluate(el=>{
      el.setAttribute('aria-disabled','false');
      const st=getComputedStyle(el);
      const result={bg:st.backgroundColor,fg:st.color};
      el.setAttribute('aria-disabled','true');
      return result;
     });
     assert.equal(buttonInk.bg,'rgb(0, 66, 37)',name+' has a forest handoff key');
     assert.equal(buttonInk.fg,'rgb(245, 240, 230)',name+' handoff lettering must be cream');
    }
    // Source map paint is not a post-hoc CSS bitmap filter.
    const paint=await page.evaluate(()=>({
     land:JSON.stringify(window.labAtlasGlobe.getPaintProperty('land','fill-color')),
     page:getComputedStyle(document.querySelector('#labJukebox')).backgroundColor,
     isWide:document.documentElement.scrollWidth>innerWidth+2
    }));
    assert(paint.land.includes(palettes[name].land),'Missing '+name+' MapLibre land fill: '+paint.land);
    assert(!paint.isWide,'Horizontal scroll/zoom introduced for '+name+' on '+width+'px');
    if(name!=='liberi'){
     const go=await page.locator('#goButton').evaluate(el=>{
      const style=getComputedStyle(el);
      const stamp=getComputedStyle(el.querySelector('.go-stamp'));
      const headline=getComputedStyle(el.querySelector('.go-copy b'));
      const caption=getComputedStyle(el.querySelector('.go-copy>span:not(.go-stamp)'));
      return {background:style.backgroundColor,topBorder:style.borderTopColor,
       headline:headline.color,caption:caption.color,
       height:parseFloat(style.minHeight),stampBackground:stamp.backgroundColor,
       stampInk:stamp.color,stampSize:parseFloat(stamp.fontSize)};
     });
     assert.equal(go.background,name==='bosque'?'rgb(0, 66, 37)':'rgb(0, 97, 59)',name+' GO uses the approved action green');
     assert.equal(go.headline,'rgb(229, 207, 66)',name+' GO label uses selected yellow');
     assert.equal(go.topBorder,'rgb(229, 207, 66)',name+' GO has a slim selected-yellow crown');
     assert.equal(go.caption,'rgb(245, 240, 230)',name+' secondary action label stays readable');
     assert(go.height>=110,name+' GO remains visually prominent');
     assert.equal(go.stampBackground,'rgb(229, 207, 66)',name+' COPIED stamp is selected yellow');
     assert.equal(go.stampInk,'rgb(0, 48, 24)',name+' COPIED stamp uses dark contrast');
     assert(go.stampSize>=24,name+' COPIED stamp keeps Libéri scale at phone width');
     if(name==='usiku'){
      const receipt=await page.locator('.receipt-heading').evaluate(el=>({
       gradient:getComputedStyle(el).backgroundImage,
       saveBackground:getComputedStyle(el.querySelector('.lab-save-button')).backgroundColor,
       saveInk:getComputedStyle(el.querySelector('.lab-save-button')).color
      }));
      assert.match(receipt.gradient,/radial-gradient/,'Usiku receipt repeats the portrait vignette');
      for(const shade of ['rgb(183, 123, 77)','rgb(168, 108, 67)','rgb(146, 91, 57)','rgb(126, 76, 48)'])
       assert(receipt.gradient.includes(shade),'Missing Usiku vignette step '+shade);
      assert.equal(receipt.saveBackground,'rgb(0, 48, 24)','Save Request stays readable on saddle');
      assert.equal(receipt.saveInk,'rgb(245, 240, 230)','Save Request has cream lettering');
     }
     if(width===390){
      await page.locator('.go-options').screenshot({path:path.join(output,`${name}-go-action.png`)});
      await page.locator('#goButton').evaluate(el=>el.dataset.copyState='copied');
      await page.locator('#goButton').screenshot({path:path.join(output,`${name}-copied-stamp.png`)});
      await page.locator('#goButton').evaluate(el=>el.dataset.copyState='idle');
      if(name==='usiku')
       await page.locator('.receipt-heading').screenshot({path:path.join(output,'usiku-receipt-vignette.png')});
     }
    }
    const routes=await page.evaluate(()=>{
     const m=window.labAtlasGlobe;
     const source=m.getSource('routes')?.serialize?.().data?.features||[];
     const stroke=document.querySelector('#labAtlasCahill .lab-cahill-routes path');
     const ink=stroke?getComputedStyle(stroke):null;
     return {count:source.length,color:m.getPaintProperty('routes','line-color'),
      opacity:m.getPaintProperty('routes','line-opacity'),
      width:m.getPaintProperty('routes','line-width'),
      keyesCount:document.querySelectorAll('#labAtlasCahill .lab-cahill-routes path').length,
      keyesWidth:ink?parseFloat(ink.strokeWidth):0,
      keyesColor:ink?.stroke||''};
    });
    assert(routes.count>0&&routes.keyesCount>0,'Original shipping lanes must remain in both atlas engines');
    const expected=name==='liberi'?'#edc65d':name==='bosque'?'#8c6239':'#b77b4d';
    assert.equal(routes.color,expected,'Route ink '+name+' must match original/theme palette');
    assert.equal(routes.width,name==='liberi'?1:1.2,'Routes must read at phone size for '+name);
    assert.equal(routes.opacity,name==='liberi'?.65:.88,'Routes must not fade away in '+name);
    const water=await page.evaluate(()=>window.labAtlasGlobe.getPaintProperty('ocean','background-color'));
    assert.equal(water,'rgba(0,0,0,0)',
     'Robinson exterior field must not be painted with the water color');
    const plate=await page.evaluate(()=>window.labAtlasGlobe.getPaintProperty('robinson-ocean','fill-color'));
    assert.equal(plate,({liberi:'#103135',bosque:'#e8e9df',usiku:'#111111'})[name],
     'Robinson ocean polygon must preserve '+name+' actual sea ink');
    if(name!=='liberi')assert.equal(routes.keyesWidth,1.2,'Keyes routes must be slim and readable at '+width+'px');
    assert.equal(await page.evaluate(()=>!!window.labAtlasGlobe.getLayer('robinson-outline')),false,
     'No orphaned Robinson stroke; ocean ink separates map from its paper');
    if(width===390){
     await page.locator('.mood-grid').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(output,`${name}-portraits.png`)});
     await page.locator('#labAtlasGlobe').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(output,`${name}-robinson.png`)});
     await page.locator('[data-atlas-view=cahill-keyes]').click();
     await page.waitForFunction(()=>{const state=window.HipsterAtlasState?.();
      return state?.projection==='cahill-keyes'&&!state.transitioning;
     },null,{timeout:20000});
     if(name==='usiku'){
      const octantSea=await page.locator('#labAtlasCahill .lab-cahill-ocean').first()
       .evaluate(el=>getComputedStyle(el).fill);
      assert.equal(octantSea,'rgb(17, 17, 17)',
       'Usiku Keyes water must match the dark Robinson and Globe ocean');
      assert.match(await page.locator('#labAtlasGlobe').evaluate(el=>getComputedStyle(el).backgroundImage),
       /radial-gradient/,'Usiku Keyes background is the shared forest vignette');
     }
     assert.equal(await page.locator('#labAtlasGlobe .maplibregl-canvas-container').evaluate(el=>getComputedStyle(el).visibility),
      'hidden','Keyes must not expose the previous Robinson or Globe underlay');
     await page.screenshot({path:path.join(output,`${name}-keyes.png`)});
     await page.locator('[data-atlas-view=globe]').click();
     await page.waitForFunction(()=>{const state=window.HipsterAtlasState?.();
      return state?.projection==='globe'&&!state.transitioning;
     },null,{timeout:20000});
     assert.equal(await page.locator('#labAtlasGlobe .maplibregl-canvas-container').evaluate(el=>getComputedStyle(el).visibility),
      'visible','Returning from Keyes must restore the real Globe');
     await page.screenshot({path:path.join(output,`${name}-globe.png`)});
     await page.locator('[data-atlas-view=robinson]').click();
     await page.waitForFunction(()=>{const state=window.HipsterAtlasState?.();
      return state?.projection==='robinson'&&!state.transitioning;
     },null,{timeout:20000});
     // Theme review is not complete until Crate AND native Manual agree.
     await page.locator('[data-lab-tab=crate]').click();
     await page.locator('#labCrate').waitFor({state:'visible'});
     await page.screenshot({path:path.join(output,`${name}-crate.png`)});
     await verifyCrateHierarchy(page,name,width);
     await page.locator('[data-lab-tab=manual]').click();
     await page.frameLocator('#labManualFrame').locator('#manualNavigation').waitFor({state:'visible',timeout:15000});
     await page.waitForFunction(name=>{
      const doc=document.getElementById('labManualFrame')?.contentDocument;
      return doc?.documentElement.dataset.pwaTheme===name;
     },name,{timeout:8000});
     if(name!=='liberi'){
      const manualRoles=await page.frameLocator('#labManualFrame').locator('body.embedded-guide')
       .evaluate(el=>{
        const root=getComputedStyle(el.ownerDocument.documentElement);
        return {
         sheet:root.getPropertyValue('--lab-ui-panel').trim(),
         ink:root.getPropertyValue('--lab-ui-on-panel').trim(),
         color:getComputedStyle(el).color,
         background:getComputedStyle(el).backgroundColor
        };
       });
      assert.equal(manualRoles.sheet, name==='bosque'?'#f5f0e6':'#111111',
       name+' iframe imports the exact shared panel token');
      assert.equal(manualRoles.ink,name==='bosque'?'#003018':'#f5f0e6',
       name+' iframe imports the exact shared ink token');
      assert.equal(manualRoles.color,name==='bosque'?'rgb(0, 48, 24)':'rgb(245, 240, 230)',
       name+' Manual body respects shared ink');
      assert.equal(manualRoles.background,name==='bosque'?'rgb(245, 240, 230)':'rgb(17, 17, 17)',
       name+' Manual body respects shared surface');
     }
     if(name==='usiku'){
      const eject=await page.frameLocator('#labManualFrame').locator('.crate-action .deck-key svg')
       .evaluate(el=>({
        ink:getComputedStyle(el).color,
        keycap:getComputedStyle(el.closest('.deck-key')).backgroundImage,
        housing:getComputedStyle(el.closest('.crate-action')).backgroundColor
       }));
      assert.equal(eject.ink,'rgb(245, 240, 230)','Usiku eject icon keeps cream contrast');
      assert(eject.keycap.includes('rgb(126, 76, 48)'),
       'Usiku eject keycap is deep saddle, not cream');
      assert.equal(eject.housing,'rgb(56, 38, 28)','Usiku transport housing is visibly recessed');
      const setupInk=await page.frameLocator('#labManualFrame').locator('#setupSendChat .receipt')
       .evaluate(card=>{
        const button=card.querySelector('#setupCopyChat'),b=getComputedStyle(button);
        return {paper:getComputedStyle(card).backgroundColor,
         ink:getComputedStyle(card).color,buttonInk:b.color,
         font:b.fontFamily,fontSize:parseFloat(b.fontSize)};
       });
      assert.equal(setupInk.paper,'rgb(244, 239, 223)','Usiku setup ticket remains cream stock');
      assert.equal(setupInk.ink,'rgb(0, 48, 24)','Usiku setup ticket has dark ink');
      assert.equal(setupInk.buttonInk,'rgb(0, 48, 24)','Copy Setup Check uses dark ink');
      assert.match(setupInk.font,/Poster/,'Copy Setup Check uses the branded display font');
      assert(setupInk.fontSize>=24,'Copy Setup Check remains readable on phone');
     }
     await verifyManualHierarchy(page,name,width);
     await page.screenshot({path:path.join(output,`${name}-manual.png`)});
     if(name==='usiku'&&width===390){
      await page.frameLocator('#labManualFrame').locator('body')
       .evaluate(body=>{body.ownerDocument.defaultView.location.hash='#setupSendChat';});
      await page.frameLocator('#labManualFrame').locator('#setupSendChat')
       .waitFor({state:'visible',timeout:8000});
      await page.frameLocator('#labManualFrame').locator('#setupSendChat .receipt')
       .screenshot({path:path.join(output,'usiku-setup-copy-ink.png')});
     }
     await page.locator('[data-lab-tab=jukebox]').click();
    }
    if(width===320){
     await page.locator('[data-lab-tab=crate]').click();
     await verifyCrateHierarchy(page,name,width);
     await page.locator('[data-lab-tab=manual]').click();
     await verifyManualHierarchy(page,name,width);
     await page.locator('[data-lab-tab=jukebox]').click();
    }
   }
   // One copy confirmation on GO, no red duplicate receipt stamp.
   await page.locator('#goButton').click();
   await page.waitForFunction(()=>document.getElementById('promptReceipt')?.dataset.copyState==='copied');
   const copied=await page.evaluate(()=>({
    receiptVisible:getComputedStyle(document.getElementById('receiptCopy')).display,
    receiptHidden:document.getElementById('receiptCopy').hidden,
    receiptText:document.getElementById('receiptCopy').textContent,
    heading:document.getElementById('handoffTitle').textContent,
    goState:document.getElementById('goButton').dataset.copyState,
    handoffBackground:getComputedStyle(document.getElementById('openAi')).backgroundColor,
    openHidden:document.getElementById('openAi').hidden,
    manualOpenHidden:document.getElementById('manualOpenAi').hidden,
    retryLabel:document.getElementById('shareButton').textContent,
    retryVisible:getComputedStyle(document.getElementById('shareButton')).display!=='none'
   }));
   assert.equal(copied.goState,'copied','GO still confirms successful clipboard write');
   assert.equal(copied.receiptVisible,'none','Android receipt has no duplicate copied stamp');
   assert.equal(copied.receiptHidden,true,'Receipt copy mark is omitted semantically');
   assert.equal(copied.receiptText,'','Receipt copy status is not repeated');
   assert.match(copied.heading,/^CONTINUE IN /,'Handoff communicates next step, not another copy stamp');
   assert.equal(copied.handoffBackground,'rgb(0, 66, 37)','Usiku handoff never injects vermilion');
   assert.equal(copied.openHidden,true,'One-Tap sharing must not add a duplicate full-width share action');
   assert.equal(copied.manualOpenHidden,true,'A successful copy should not show manual-only recovery');
   assert.match(copied.retryLabel,/Share this request again/,'Recovery remains a single explicitly named share link');
   assert.equal(copied.retryVisible,true,'Existing retry path must remain reachable');
   await page.evaluate(()=>{
    window.auditHandoff.oneTap=false;
    window.HipsterLabStateChanged();
   });
   assert.equal(await page.locator('#openAi').evaluate(el=>el.hidden),false,'Two-step GO must retain the explicit Open/Share control');
   await page.evaluate(()=>{
    window.auditHandoff.oneTap=true;
    window.HipsterLabStateChanged();
   });
   if(width===390)await page.locator('#promptReceipt').screenshot({path:path.join(output,'usiku-copied-receipt.png')});
   await page.reload({waitUntil:'domcontentloaded'});
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),'usiku','Persisted theme must apply before paint');
   assert.deepEqual(errors,[],'Android theme picker or renderer JS exceptions');
   await page.close();
  }
  console.log('PASS: Android Libéri/Bosque/Usiku are persistent, readable and map color-matched at 390px / 320px');
 }finally{await browser?.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=1});
