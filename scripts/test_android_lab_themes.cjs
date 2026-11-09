// Native Android Lab theme parity visual smoke, including real projection renders.
// Isolated browser test only; no APK signing or production deployment.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const output=path.resolve(__dirname,'../android-lab/build/theme-review');
const reviewBuild=fs.readFileSync(path.join(__dirname,'../android-lab/web/workspace.html'),'utf8').includes('data-lab-theme="detroit"');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff'};
const palettes={
 liberi:{page:'rgb(223, 176, 69)',ink:'rgb(16, 49, 53)',land:'#dfb045'},
 bosque:{page:'rgb(245, 240, 230)',ink:'rgb(0, 48, 24)',land:'#004225'},
 usiku:{page:'rgb(17, 17, 17)',ink:'rgb(245, 240, 230)',land:'#f5f0e6'}
};
// Headless screenshot capture is diagnostic, not a functional gate.
// SwiftShader can stall even after projection and selected-state checks pass.
async function diagnosticCapture(target,file){
 try{
  await target.screenshot({path:path.join(output,file),
   animations:'disabled',timeout:6500});
 }catch(e){
  if(e.name!=='TimeoutError')throw e;
  console.warn('DIAGNOSTIC: snapshot skipped after 6.5s: '+file);
 }
}
const themeContract={
 liberi:{ocean:'#103135',land:'#dfb045',route:'#edc65d',selected:'#a83223',graticule:'#dfb045',moodInk:'#103135'},
 bosque:{ocean:'#e8e9df',land:'#004225',route:'#8c6239',selected:'#e5cf42',graticule:'#8c6239',moodInk:'#003018'},
 usiku:{ocean:'#111111',land:'#f5f0e6',route:'#b77b4d',selected:'#e5cf42',graticule:'#b77b4d',moodInk:'#063821'}
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
   trailFont:family('.poster-go-trail-word'),
   atlasFont:family('.lab-atlas-modes button'),
   anyFont:family('#anyTempo'),
   pinFont:family('#pinMood'),
   inspirationNameFont:family('#labInspirationPreview'),
   helpFont:family('.mood-hint'),
   optionHelpFont:family('#includeCover .option-copy small'),
   artFont:family('#includeCover .option-label'),
   hardFont:family('#goHard .option-label'),
   artTypography:['fontSize','fontWeight','lineHeight','letterSpacing'].map(k=>style('#includeCover .option-label')[k]),
   hardTypography:['fontSize','fontWeight','lineHeight','letterSpacing'].map(k=>style('#goHard .option-label')[k]),
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
 for(const key of ['noteFont','shuffleFont','paceStopsFont','trailFont',
  'atlasFont','anyFont','pinFont','inspirationNameFont','artFont','hardFont'])
  assert.match(report[key],/Poster/,name+' keeps branded Poster control typography: '+key);
 for(const key of ['helpFont','optionHelpFont'])
  assert.match(report[key],/Arial/,name+' readable description remains a simple sans: '+key);
 assert.equal(report.hardFont,report.artFont,name+' +ART / TRY HARD have the same font family');
 assert.deepEqual(report.hardTypography,report.artTypography,
  name+' +ART / TRY HARD have identical size, weight, leading and spacing');
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
    // The single contract must feed the actual map registry, CSS and moods
    // after EVERY theme change; don't pass by comparing two hardcoded sheets.
    const tokenState=await page.evaluate(()=>{
     const atlas=window.GHGAtlasPaintColors(),moods=window.HipsterLabTheme.moods();
     const root=getComputedStyle(document.documentElement);
     const val=role=>root.getPropertyValue(role).trim();
     return {
      atlas:{ocean:atlas.ocean,land:atlas.land,route:atlas.route,
       selected:atlas.selected,graticule:atlas.graticule},
      css:{ocean:val('--lab-atlas-ocean'),land:val('--lab-atlas-land'),
       route:val('--lab-atlas-route'),selected:val('--lab-atlas-selected'),
       graticule:val('--lab-atlas-graticule')},
      moodInk:moods.neutralInk,neutralInk:val('--lab-mood-neutral-ink'),
      selectedPaper:val('--lab-mood-selected-paper'),
      selectedInk:val('--lab-mood-selected-ink')
     };
    });
    const expectedTheme=themeContract[name];
    for(const role of ['ocean','land','route','selected','graticule']){
     assert.equal(tokenState.atlas[role],expectedTheme[role],name+' atlas '+role+' registry');
     assert.equal(tokenState.css[role],expectedTheme[role],name+' atlas '+role+' CSS paint');
    }
    assert.equal(tokenState.moodInk,expectedTheme.moodInk,name+' original neutral portrait ink');
    assert.equal(tokenState.neutralInk,expectedTheme.moodInk,name+' neutral sprite mask role');
    assert.equal(tokenState.selectedPaper,name==='liberi'?'#d64b30':'#e5cf42',
     name+' selected portrait paper');
    assert.equal(tokenState.selectedInk,name==='liberi'?'#103135':'#003018',
     name+' selected label/outline ink');
    if(name!=='liberi'){
     // Test the real neutral and selected style states without changing
     // user selections, portrait source image or click behavior.
     const mood=await page.locator('.mood[data-mood=happy]').evaluate(el=>{
      const old=el.getAttribute('aria-pressed');
      el.setAttribute('aria-pressed','false');
      const neutral={paper:getComputedStyle(el).backgroundImage,
       mask:getComputedStyle(el.querySelector('.face'),'::before').maskImage};
      el.setAttribute('aria-pressed','true');
      const selected={paper:getComputedStyle(el).backgroundColor,
       label:getComputedStyle(el.querySelector('.word')).color,
       expression:getComputedStyle(el.querySelector('.face'),'::after').opacity};
      el.setAttribute('aria-pressed',old);
      return {neutral,selected};
     });
     assert.equal(mood.selected.paper,'rgb(229, 207, 66)',name+' selected tile uses shared stock');
     assert.equal(mood.selected.label,'rgb(0, 48, 24)',name+' selected label uses shared ink');
     assert.equal(mood.selected.expression,'1',name+' selected portrait uses approved expression plate');
     if(name==='usiku'){
      assert.match(mood.neutral.paper,/radial-gradient/,'Usiku neutral remains the saddle vignette');
      assert.match(mood.neutral.mask,/moods-neutral-ink-v2.webp/,'Usiku retains original alpha engraving');
     }
    }
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
      return {background:style.backgroundColor,gradient:style.backgroundImage,
       topBorder:style.borderTopColor,headline:headline.color,caption:caption.color,
       height:parseFloat(style.minHeight),stampBackground:stamp.backgroundColor,
       stampInk:stamp.color,stampSize:parseFloat(stamp.fontSize)};
     });
     assert.equal(go.background,name==='bosque'?'rgb(0, 66, 37)':'rgb(126, 76, 48)',
      name+' GO uses the approved theme action material');
     if(name==='bosque')assert.equal(go.gradient,'none','Bosque stays flat forest ink');
     if(name==='usiku'){
      assert.match(go.gradient,/radial-gradient/,'Usiku GO uses the saddle vignette');
      for(const tone of ['rgb(146, 91, 57)','rgb(126, 76, 48)','rgb(56, 38, 28)'])
       assert(go.gradient.includes(tone),'Usiku GO reuses existing saddle tone '+tone);
      // Poster-scale yellow has >=3:1 contrast on the lightest saddle stop;
      // the smaller cream handoff label clears 4.5:1 on the same stop.
      const l=hex=>{
       const srgb=hex.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16)/255);
       const linear=srgb.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
       return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
      };
      const ratio=(x,y)=>{const a=l(x),b=l(y);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
      assert(ratio('925b39','e5cf42')>=3,'GO yellow on the brightest saddle has display-text contrast');
      assert(ratio('925b39','f5f0e6')>=4.5,'GO handoff cream on the brightest saddle has body-text contrast');
     }
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
       background:getComputedStyle(el).backgroundColor,
       border:getComputedStyle(el).borderBottomColor,
       ink:getComputedStyle(el).color,
       saveBackground:getComputedStyle(el.querySelector('.lab-save-button')).backgroundColor,
       saveInk:getComputedStyle(el.querySelector('.lab-save-button')).color,
       saveHeight:el.querySelector('.lab-save-button').getBoundingClientRect().height
      }));
      assert.equal(receipt.gradient,'none','Usiku receipt is no longer a second saddle hero');
      assert.equal(receipt.background,'rgba(0, 0, 0, 0)','Usiku receipt header stays on native green paper');
      assert.equal(receipt.border,'rgb(183, 123, 77)','Receipt uses existing saddle trim');
      assert.equal(receipt.ink,'rgb(245, 240, 230)','Receipt heading stays readable');
      assert.equal(receipt.saveBackground,'rgba(0, 0, 0, 0)','Save Request is a quiet outlined action');
      assert.equal(receipt.saveInk,'rgb(245, 240, 230)','Save Request keeps cream ink');
      assert(receipt.saveHeight>=44,'Save Request touch target remains at least 44px');
     }
     if(width===390){
      await page.locator('.go-options').screenshot({path:path.join(output,`${name}-go-action.png`)});
      await page.locator('#goButton').evaluate(el=>el.dataset.copyState='copied');
      await page.locator('#goButton').screenshot({path:path.join(output,`${name}-copied-stamp.png`)});
      await page.locator('#goButton').evaluate(el=>el.dataset.copyState='idle');
      if(name==='usiku')
       await page.locator('.receipt-heading').screenshot({path:path.join(output,'usiku-receipt-restored.png')});
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
   // Pilot is ONLY opened by a deliberate preview URL. It must not create
   // a fourth installed preference or modify the user's stored appearance.
   const pilot=await browser.newPage({viewport:{width,height:860},isMobile:true,hasTouch:true});
   const pilotErrors=[];
   pilot.on('pageerror',e=>pilotErrors.push(e.message));
   await pilot.goto('http://127.0.0.1:'+server.address().port+'/?theme=kingston',{waitUntil:'domcontentloaded'});
   await pilot.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,null,{timeout:30000});
   await pilot.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await pilot.evaluate(()=>window.HipsterLabTheme?.current()),'kingston');
   assert.equal(await pilot.evaluate(()=>document.documentElement.dataset.ghgThemeProfile),'print');
   assert.equal(await pilot.locator('link[data-lab-print-style]').getAttribute('media'),'all');
   assert.equal(await pilot.locator('[data-lab-theme=kingston]').count(),reviewBuild?1:0,'Theme picker matches release/review build');
   assert.equal(await pilot.evaluate(()=>localStorage.getItem('ghg-lab-theme-v1')),null,
    'Pilot must not overwrite the saved production theme');
   const pilotInk=await pilot.evaluate(()=>{
    const root=getComputedStyle(document.documentElement),map=window.labAtlasGlobe;
    const css=name=>root.getPropertyValue('--lab-atlas-'+name).trim();
    const el=selector=>getComputedStyle(document.querySelector(selector));
    const face=document.querySelector('.mood[data-mood=happy] .face');
    const tile=face.closest('.mood'),old=tile.getAttribute('aria-pressed');
    tile.setAttribute('aria-pressed','false');
    const neutral={tile:el('.mood[data-mood=happy]').backgroundColor,
     image:getComputedStyle(face,'::before').backgroundImage,
     mask:getComputedStyle(face,'::before').maskImage};
    tile.setAttribute('aria-pressed','true');
    const selected={tile:el('.mood[data-mood=happy]').backgroundColor,
     image:getComputedStyle(face,'::after').backgroundImage,
     mask:getComputedStyle(face,'::after').maskImage,
     word:el('.mood[data-mood=happy] .word').color};
    tile.setAttribute('aria-pressed',old);
    return {
     theme:window.GHGAtlasPaintColors(),
     ocean:map.getPaintProperty('robinson-ocean','fill-color'),
     atlasCssOcean:css('ocean'),atlasCssLand:css('land'),
     canvas:el('#labAtlasGlobe').backgroundColor,
     page:el('#labJukebox').backgroundColor,
     go:el('#goButton').backgroundColor,
     goHeadline:el('#goButton .go-copy b').color,
     goCaption:el('#goButton .go-copy>span:not(.go-stamp)').color,
     neutral,selected
    };
   });
   assert.equal(pilotInk.theme.ocean,'#273d3b','Pilot ocean uses dark teal vinyl ink');
   assert.equal(pilotInk.theme.land,'#d3c4a8','Pilot map land uses aged label paper');
   assert.equal(pilotInk.theme.selected,'#6d9991','Pilot map selected ink');
   assert.equal(pilotInk.atlasCssOcean,'#273d3b','One ocean role across renderers');
   assert.equal(pilotInk.atlasCssLand,'#d3c4a8','One land role across renderers');
   assert.equal(pilotInk.ocean,'#273d3b','Real Robinson ocean uses palette ink');
   assert.equal(pilotInk.canvas,'rgb(227, 217, 194)','Map exterior uses warm paper, not sea');
   const selectorPaint=await pilot.locator('[data-atlas-view=robinson]').evaluate(el=>{
    const st=getComputedStyle(el);
    return {background:st.backgroundColor,ink:st.color,
     accent:st.borderBottomColor,style:el.getAttribute('style')||''};
   });
   assert.equal(selectorPaint.background,'rgba(0, 0, 0, 0)','Atlas selector remains unboxed');
   assert.equal(selectorPaint.ink,'rgb(38, 63, 62)','Atlas selector uses dark stamp ink');
   assert.equal(selectorPaint.accent,'rgb(155, 58, 43)','Selected tab uses active red ink, not registration teal');
   assert(!selectorPaint.style.includes('#103135')&&!selectorPaint.style.includes('#dfb045'),
    'Atlas buttons never inject Libéri inline paint');
   assert.equal(pilotInk.page,'rgb(227, 217, 194)','Jukebox uses aged record-label paper');
   assert.equal(pilotInk.go,'rgb(56, 94, 90)','GO uses dark teal instead of black');
   assert.equal(pilotInk.goHeadline,'rgb(239, 228, 203)','GO display type stays readable');
   assert.equal(pilotInk.goCaption,'rgb(239, 228, 203)','GO supporting type stays readable');
   assert.equal(pilotInk.neutral.tile,'rgb(227, 217, 194)','Neutral portrait stock');
   assert.match(pilotInk.neutral.image,/moods-neutral-ink-v2.webp/,'Original neutral engraved artwork');
   assert.equal(pilotInk.neutral.mask,'none','Neutral engraving keeps original shading');
   assert.equal(pilotInk.selected.tile,'rgb(210, 195, 166)','Selected portrait uses warm paper, not full cyan');
   assert.equal(pilotInk.selected.word,'rgb(36, 70, 67)','Selected label ink is readable');
   assert.match(pilotInk.selected.image,/moods-selected-ink-v2.webp/,'Selected expression is original artwork');
   assert.equal(pilotInk.selected.mask,'none','Selected engraving keeps its full original shading');
   const printHeading=await pilot.evaluate(()=>({
    vibe:getComputedStyle(document.querySelector('.refinements>.counter-label')).fontFamily,
    tempo:getComputedStyle(document.querySelector('.tempo-control'),'::before').fontFamily
   }));
   assert.match(printHeading.vibe,/Poster/,'Kingston inherits canonical Android Poster heading');
   assert.match(printHeading.tempo,/Poster/,'Kingston inherits canonical tempo heading');
   const printedExtra=await pilot.evaluate(()=>{
    const tile=document.querySelector('#firstCrateSetup');
    const style=getComputedStyle(tile);
    const star=getComputedStyle(document.querySelector('#goButton .star-glyph'));
    const cta=getComputedStyle(document.querySelector('#labCrateEmpty .lab-wide-button'));
    const funk=document.querySelector('.mood[data-mood=funky]'),old=funk.getAttribute('aria-pressed');
    funk.setAttribute('aria-pressed','true');
    const figure=funk.querySelector('.face');
    const before=getComputedStyle(figure,'::before'),after=getComputedStyle(figure,'::after');
    const rays=getComputedStyle(funk.querySelector('.funk-rays'));
    const selectedFunk={beforeOpacity:before.opacity,afterOpacity:after.opacity,
     image:after.backgroundImage,mask:after.maskImage,spriteFilter:after.filter,
     raysFilter:rays.filter,raysOpacity:rays.opacity,stock:getComputedStyle(funk).backgroundColor,
     label:getComputedStyle(funk.querySelector('.word')).color,
     gradient:getComputedStyle(funk).backgroundImage};
    funk.setAttribute('aria-pressed',old);
    const flood=getComputedStyle(document.querySelector('#referenceInk feFlood'));
    return {ticketRule:style.getPropertyValue('--setup-rule').trim(),
     receiptInk:style.getPropertyValue('--receipt-red').trim(),starFilter:star.filter,
     crateAction:cta.backgroundColor,crateLabel:cta.color,
     selectedFunk,desireInk:flood.floodColor};
   });
   assert.equal(printedExtra.ticketRule,'#7bb0aa','Setup ticket uses muted stamp accent');
   assert.equal(printedExtra.receiptInk,'#263f3e','Small ticket print remains legible');
   assert.notEqual(printedExtra.starFilter,'none','GO stamp uses the subdued profile ink');
   assert.equal(printedExtra.crateAction,'rgb(48, 71, 67)','Crate CTA shares teal action');
   assert.equal(printedExtra.crateLabel,'rgb(239, 228, 203)','Crate CTA text has cream contrast');
   assert.equal(printedExtra.selectedFunk.beforeOpacity,'0','Funk selected hides the neutral pose');
   assert.equal(printedExtra.selectedFunk.afterOpacity,'1','Funk selected shows the approved star-glasses pose');
   assert.match(printedExtra.selectedFunk.image,/moods-selected-ink-v2.webp/,'Funk uses the original selected artwork');
   assert.equal(printedExtra.selectedFunk.mask,'none','Funk is never flattened into an ink mask');
   assert.match(printedExtra.selectedFunk.raysFilter,/hue-rotate\(23deg\)/,'Funk uses canonical laser colors');
   assert.equal(printedExtra.selectedFunk.raysOpacity,'0.82','Funk retains canonical laser strength');
   assert.match(printedExtra.selectedFunk.spriteFilter,/hue-rotate\(324deg\)/,'Funk selected engraving uses canonical orange-gold');
   assert.match(printedExtra.selectedFunk.gradient,/linear-gradient/,'Funk canonical violet-magenta pressing');
   assert.equal(printedExtra.selectedFunk.label,'rgb(242, 200, 78)','Funk canonical gold label');
   assert.equal(printedExtra.selectedFunk.stock,'rgb(110, 34, 92)','Funk canonical violet base');
   assert.notEqual(printedExtra.selectedFunk.stock,'rgb(210, 195, 166)','Funk selected pink pressing stays distinct');
   assert.equal(printedExtra.desireInk,'rgb(38, 63, 62)','Desire and Triumph use shared engraving ink');
   // Exercise every approved character in its selected pose. Do not mutate
   // the underlying artwork or depend on only one easy-to-color portrait.
   const selectedCast=await pilot.locator('.mood-grid .mood[data-mood]').evaluateAll(tiles=>
    tiles.map(tile=>{
     const prior=tile.getAttribute('aria-pressed');
     tile.setAttribute('aria-pressed','true');
     const style=getComputedStyle(tile),word=getComputedStyle(tile.querySelector('.word'));
     const face=tile.querySelector('.face'),after=getComputedStyle(face,'::after');
     const result={mood:tile.dataset.mood,paper:style.backgroundColor,
      label:word.color,selectedPlateOpacity:after.opacity};
     tile.setAttribute('aria-pressed',prior);
     return result;
    }));
   assert.equal(selectedCast.length,8,'All eight original characters render in pilot');
   for(const portrait of selectedCast){
    const special=portrait.mood==='funky';
    if(!special)assert.equal(portrait.paper,'rgb(210, 195, 166)',
     portrait.mood+' selected paper');
    else assert.notEqual(portrait.paper,'rgb(210, 195, 166)','Funk retains its own pink paper');
    assert.equal(portrait.label,special?'rgb(242, 200, 78)':'rgb(36, 70, 67)',
     portrait.mood+' selected label');
    assert.equal(portrait.selectedPlateOpacity,portrait.mood==='desire'?'0':'1',
     portrait.mood+' approved expression visibility');
   }
   // New print themes choose two ink roles once. Prove every consumer
   // changes automatically when these values change: no theme-name patches.
   const inkPlacements=await pilot.evaluate(()=>{
    const root=document.documentElement;
    const mood=document.querySelector('.mood[data-mood=happy]');
    const hard=document.getElementById('goHard');
    const atlas=document.querySelector('.lab-atlas-modes button[aria-pressed=true]');
    const go=document.getElementById('goButton');
    const priorMood=mood.getAttribute('aria-pressed');
    const priorHard=hard.getAttribute('aria-pressed');
    const styles=()=>({
      atlas:getComputedStyle(atlas).borderBottomColor,
      mood:getComputedStyle(mood).boxShadow,
      hard:getComputedStyle(hard).borderBottomColor,
      goInk:getComputedStyle(go).borderTopColor,
      goFill:getComputedStyle(go).backgroundColor,
      ocean:window.GHGAtlasPaintColors().ocean
    });
    mood.setAttribute('aria-pressed','true');
    hard.setAttribute('aria-pressed','true');
    try{
      const defaultInk=styles();
      root.style.setProperty('--lab-print-active-ink','#7157a4');
      const activeOverride=styles();
      root.style.setProperty('--lab-print-stamp','#40806a');
      const bothOverrides=styles();
      return {defaultInk,activeOverride,bothOverrides};
    }finally{
      root.style.removeProperty('--lab-print-active-ink');
      root.style.removeProperty('--lab-print-stamp');
      mood.setAttribute('aria-pressed',priorMood);
      hard.setAttribute('aria-pressed',priorHard);
    }
   });
   assert.equal(inkPlacements.defaultInk.atlas,'rgb(155, 58, 43)','Default active ink on Atlas tab');
   assert(inkPlacements.defaultInk.mood.includes('rgb(155, 58, 43)'),'Default active ink on selected mood rim');
   assert.equal(inkPlacements.defaultInk.hard,'rgb(155, 58, 43)','Default active ink on TRY HARD');
   assert.equal(inkPlacements.activeOverride.atlas,'rgb(113, 87, 164)','New theme ink automatically reaches Atlas');
   assert(inkPlacements.activeOverride.mood.includes('rgb(113, 87, 164)'),'New theme ink automatically reaches portraits');
   assert.equal(inkPlacements.activeOverride.hard,'rgb(113, 87, 164)','New theme ink automatically reaches toggles');
   assert.equal(inkPlacements.bothOverrides.goInk,'rgb(64, 128, 106)','Registration ink travels separately to GO');
   assert.equal(inkPlacements.bothOverrides.atlas,'rgb(113, 87, 164)','Registration never overrides activation');
   assert.equal(inkPlacements.bothOverrides.ocean,'#273d3b','Accents never recolor map water');
   assert.equal(inkPlacements.bothOverrides.goFill,inkPlacements.defaultInk.goFill,
    'Accents never recolor GO hero surface');
   if(width===390){
    await pilot.locator('.mood-grid .mood[data-mood]').evaluateAll(tiles=>
     tiles.forEach(tile=>tile.setAttribute('aria-pressed','true')));
    await diagnosticCapture(pilot.locator('.mood-grid'),'kingston-390-all-selected.png');
    await pilot.locator('.mood-grid .mood[data-mood]').evaluateAll(tiles=>
     tiles.forEach(tile=>tile.setAttribute('aria-pressed','false')));
   }
   if(width===390){
    await pilot.locator('.mood[data-mood=happy]').click();
    await pilot.locator('.mood[data-mood=funky]').click();
   }
   await pilot.locator('.mood-grid').scrollIntoViewIfNeeded();
   if(width===390)await diagnosticCapture(pilot,'kingston-390-portraits.png');
   await pilot.locator('#labAtlasGlobe').scrollIntoViewIfNeeded();
   if(width===390)await diagnosticCapture(pilot,'kingston-390-robinson.png');
   await pilot.locator('[data-atlas-view=cahill-keyes]').click();
   await pilot.waitForFunction(()=>{const s=window.HipsterAtlasState?.();return s?.projection==='cahill-keyes'&&!s.transitioning},
    null,{timeout:20000});
   const octant=await pilot.evaluate(()=>{
    const ocean=document.querySelector('#labAtlasCahill .lab-cahill-ocean');
    const grid=document.querySelector('#labAtlasCahill .lab-cahill-graticule');
    return {ocean:getComputedStyle(ocean).fill,grid:getComputedStyle(grid).stroke,
     field:getComputedStyle(document.getElementById('labAtlasGlobe')).backgroundColor}
   });
   assert.equal(octant.ocean,'rgb(39, 61, 59)','Keyes sea matches Robinson');
   assert.equal(octant.grid,'rgb(109, 153, 145)','Cahill grid uses desaturated stamp ink');
   assert.equal(octant.field,'rgb(227, 217, 194)','Keyes stage uses aged paper');
   if(width===390)await diagnosticCapture(pilot,'kingston-390-keyes.png');
   await pilot.locator('[data-atlas-view=globe]').click();
   await pilot.waitForFunction(()=>{const s=window.HipsterAtlasState?.();return s?.projection==='globe'&&!s.transitioning},
    null,{timeout:20000});
   if(width===390)await diagnosticCapture(pilot,'kingston-390-globe.png');
   await pilot.locator('[data-atlas-view=robinson]').click();
   await pilot.waitForFunction(()=>{const s=window.HipsterAtlasState?.();return s?.projection==='robinson'&&!s.transitioning},
    null,{timeout:20000});
   await pilot.locator('[data-lab-tab=manual]').click();
   await pilot.frameLocator('#labManualFrame').locator('#manualNavigation').waitFor({state:'visible',timeout:15000});
   const manual=await pilot.frameLocator('#labManualFrame').locator('body.embedded-guide').evaluate(el=>({
    theme:el.ownerDocument.documentElement.dataset.pwaTheme,
    profile:el.ownerDocument.documentElement.dataset.ghgThemeProfile,
    ink:getComputedStyle(el).color,stock:getComputedStyle(el).backgroundColor
   }));
   assert.equal(manual.theme,'kingston','Manual inherits pilot');
   assert.equal(manual.profile,'print','Manual inherits print profile');
   assert.equal(manual.ink,'rgb(38, 63, 62)','Manual ink');
   assert.equal(manual.stock,'rgb(227, 217, 194)','Manual matches Jukebox paper');
   const manualActive=await pilot.frameLocator('#labManualFrame').locator('body.embedded-guide').evaluate(body=>{
    const root=body.ownerDocument.documentElement;
    const tab=body.ownerDocument.querySelector('.crate-tabs button[aria-selected=true]');
    const before=getComputedStyle(tab).borderBottomColor;
    try{
     root.style.setProperty('--lab-print-active-ink','#7157a4');
     const after=getComputedStyle(tab).borderBottomColor;
     return {before,after};
    }finally{root.style.removeProperty('--lab-print-active-ink')}
   });
   assert.equal(manualActive.before,'rgb(155, 58, 43)','Manual uses the same accent as Jukebox');
   assert.equal(manualActive.after,'rgb(113, 87, 164)','Manual active ink also swaps with one token');
   if(width===390)await diagnosticCapture(pilot,'kingston-390-manual.png');
   await pilot.locator('[data-lab-tab=crate]').click();
   if(width===390)await diagnosticCapture(pilot,'kingston-390-crate.png');
   assert.deepEqual(pilotErrors,[],'Kingston pilot JS exceptions');
   await pilot.reload({waitUntil:'domcontentloaded'});
   assert.equal(await pilot.evaluate(()=>window.HipsterLabTheme?.current()),'kingston','Preview URL persists without storage');
   assert.equal(await pilot.evaluate(()=>localStorage.getItem('ghg-lab-theme-v1')),null);
   await pilot.close();
   // Second print theme: one bounded 390px proof. No additional animation
   // profiling or screenshot loops at smaller sizes; the shared engine is
   // already covered by the Kingston + installed-theme 320/390 matrix.
   if(width===390){
    const xerox=await browser.newPage({viewport:{width,height:860},isMobile:true,hasTouch:true});
    const errors=[];
    xerox.on('pageerror',err=>errors.push(err.message));
    try{
     await xerox.goto('http://127.0.0.1:'+server.address().port+'/?theme=detroit',{waitUntil:'domcontentloaded'});
     await xerox.waitForFunction(()=>window.labAtlasGlobe?.loaded()&&window.labCahillMap?.ready,
      null,{timeout:25000});
     await xerox.emulateMedia({reducedMotion:'reduce'});
     const colors=await xerox.evaluate(()=>{
      const css=s=>getComputedStyle(document.querySelector(s));
      const root=getComputedStyle(document.documentElement);
      const selected=document.querySelector('.mood[data-mood=happy]');
      const old=selected.getAttribute('aria-pressed');
      selected.setAttribute('aria-pressed','true');
      const tile=css('.mood[data-mood=happy]').backgroundColor;
      const rim=css('.mood[data-mood=happy]').boxShadow;
      const plateFilter=getComputedStyle(document.querySelector('.mood[data-mood=happy] .face'),'::after').filter;
      const neutralFilter=getComputedStyle(document.querySelector('.mood[data-mood=happy] .face'),'::before').filter;
      const svgFilter=document.getElementById('themeMoodSelectedEngraving');
      const inkIntercept=svgFilter?.querySelector('feFuncR')?.getAttribute('intercept');
      selected.setAttribute('aria-pressed',old);
      return {
       theme:window.HipsterLabTheme.current(),
       profile:document.documentElement.dataset.ghgThemeProfile,
       ocean:window.GHGAtlasPaintColors().ocean,
       mapOcean:window.labAtlasGlobe.getPaintProperty('robinson-ocean','fill-color'),
       page:css('#labJukebox').backgroundColor,
       paperTexture:css('#labJukebox').backgroundImage,
       selected:tile,selectedRim:rim,plateFilter,neutralFilter,inkIntercept,go:css('#goButton').backgroundColor,
       stamp:root.getPropertyValue('--lab-print-stamp').trim(),
       active:root.getPropertyValue('--lab-print-active-ink').trim(),
       checkboxAccent:css('.lab-choice input').accentColor,
       selectedTab:css('.lab-atlas-modes [aria-pressed=true]').borderBottomColor
      };
     });
     assert.equal(colors.theme,'detroit','URL-only Detroit theme');
     assert.equal(colors.profile,'print','Second theme shares the print profile');
     assert.equal(colors.ocean,'#151515','Toner-black ocean palette');
     assert.equal(colors.mapOcean,colors.ocean,'Robinson uses the shared palette');
     assert.equal(colors.page,'rgb(231, 229, 219)','Photocopy paper stock');
     assert.match(colors.paperTexture,/repeating-linear-gradient/,'Generic printed texture token');
     assert.equal(colors.selected,'rgb(245, 0, 147)','Selected mood overlays the original engraving with highlighter pink');
     assert.ok(colors.selectedRim.includes('rgb(23, 23, 23)'),'Dark outline survives neon selected paper');
     assert.equal(colors.selectedTab,'rgb(245, 0, 147)','Active Atlas tab uses pink');
     assert.equal(colors.checkboxAccent,'rgb(245, 0, 147)','Checkbox ink is theme selectable');
     assert.match(colors.plateFilter,/themeMoodSelectedEngraving/,'Selected plate uses real palette ink transfer');
     assert.match(colors.neutralFilter,/themeMoodNeutralEngraving/,'Neutral plate uses tokenized ink transfer');
     assert.equal(Number(colors.inkIntercept).toFixed(4),'0.0902','Engraving has toner-black ink endpoints');
     assert.equal(colors.go,'rgb(23, 23, 23)','Toner-black GO key');
     assert.equal(colors.stamp,'#555555','Graphite registration stays neutral');
     assert.equal(colors.active,'#f50093','Highlighter pink activates the selection roles');
     assert.equal(await xerox.locator('[data-lab-theme=detroit]').count(),reviewBuild?1:0,'Theme picker matches release/review build');
     assert.equal(await xerox.evaluate(()=>localStorage.getItem('ghg-lab-theme-v1')),null,'Pilot not persisted');
     await diagnosticCapture(xerox,'detroit-390-jukebox.png');
     const cast=await xerox.locator('.mood-grid .mood[data-mood]').evaluateAll(tiles=>{
      for(const tile of tiles)tile.setAttribute('aria-pressed','true');
      const funk=document.querySelector('.mood[data-mood=funky]');
      const sprite=getComputedStyle(funk.querySelector('.face'),'::after');
      const rays=getComputedStyle(funk.querySelector('.funk-rays'));
      return {size:tiles.length,
       funkImage:sprite.backgroundImage,mask:sprite.maskImage,
       raysFilter:rays.filter,raysOpacity:rays.opacity,
       spriteFilter:sprite.filter,
       funkyWord:getComputedStyle(funk.querySelector('.word')).color,
       funkyStock:getComputedStyle(funk).backgroundColor,
       funkyGradient:getComputedStyle(funk).backgroundImage};
     });
     assert.equal(cast.size,8,'All original portraits selected');
     assert.match(cast.funkImage,/moods-selected-ink-v2.webp/,'Funk original selected sprite');
     assert.equal(cast.mask,'none','Funk engraving is not flattened');
     assert.match(cast.raysFilter,/hue-rotate\(23deg\)/,'Funk canonical laser colors');
     assert.equal(cast.raysOpacity,'0.82','Funk canonical laser intensity');
     assert.match(cast.spriteFilter,/hue-rotate\(324deg\)/,'Funk canonical selected engraving');
     assert.equal(cast.funkyWord,'rgb(242, 200, 78)','Funk canonical star-gold text');
     assert.equal(cast.funkyStock,'rgb(110, 34, 92)','Funk canonical violet base');
     assert.match(cast.funkyGradient,/linear-gradient/,'Funk magenta pressing preserved');
     assert.notEqual(cast.funkyStock,'rgb(245, 0, 147)','Funk retains its own pink pressing, not Detroit neon');
     // Canonical Android typography MUST survive every print treatment.
     const typography=await xerox.evaluate(()=>{
      const style=sel=>getComputedStyle(document.querySelector(sel));
      return {vibe:style('.refinements>.counter-label').fontFamily,
       tempo:getComputedStyle(document.querySelector('.tempo-control'),'::before').fontFamily,
       label:style('#labInspiration strong').fontFamily,
       help:style('.mood-hint').fontFamily};
     });
     for(const family of [typography.vibe,typography.tempo,typography.label])
      assert.match(family,/Poster/,'Detroit reuses canonical Android Poster headings');
     assert.match(typography.help,/Arial/,'Supporting instructions retain readable sans');
     await diagnosticCapture(xerox.locator('.mood-grid'),'detroit-390-all-selected.png');
     await xerox.locator('.mood-grid .mood[data-mood]').evaluateAll(tiles=>{
      for(const tile of tiles)tile.setAttribute('aria-pressed','false');
     });
     // UI copy is tied to REAL selection, not a permanent Funk tagline.
     await xerox.locator('.mood[data-mood=funky]').click();
     assert.match(await xerox.locator('#moodHelp').textContent(),/The pocket has diplomatic immunity\./,
      'Funk immunity appears when selected');
     assert.equal(await xerox.locator('.mood[data-mood=funky]').getAttribute('aria-pressed'),'true');
     await xerox.locator('.mood[data-mood=funky]').click();
     assert.doesNotMatch(await xerox.locator('#moodHelp').textContent(),/diplomatic immunity/,
      'Funk immunity disappears when deselected');
     await xerox.locator('#labAtlasGlobe').scrollIntoViewIfNeeded();
     await diagnosticCapture(xerox,'detroit-390-robinson.png');
     await xerox.locator('[data-atlas-view=cahill-keyes]').click();
     await xerox.waitForFunction(()=>{
      const s=window.HipsterAtlasState?.();return s?.projection==='cahill-keyes'&&!s.transitioning
     },null,{timeout:16000});
     const ocean=await xerox.locator('#labAtlasCahill .lab-cahill-ocean')
      .evaluate(el=>getComputedStyle(el).fill);
     assert.equal(ocean,'rgb(21, 21, 21)','Cahill sea matches Robinson');
     await diagnosticCapture(xerox,'detroit-390-keyes.png');
     await xerox.locator('[data-atlas-view=globe]').click();
     await xerox.waitForFunction(()=>{
      const s=window.HipsterAtlasState?.();return s?.projection==='globe'&&!s.transitioning
     },null,{timeout:16000});
     await diagnosticCapture(xerox,'detroit-390-globe.png');
     await xerox.locator('[data-lab-tab=manual]').click();
     await xerox.frameLocator('#labManualFrame').locator('#manualNavigation')
      .waitFor({state:'visible',timeout:12000});
     const manual=await xerox.frameLocator('#labManualFrame')
      .locator('body.embedded-guide').evaluate(body=>({
       theme:body.ownerDocument.documentElement.dataset.pwaTheme,
       profile:body.ownerDocument.documentElement.dataset.ghgThemeProfile,
       ink:getComputedStyle(body).color
      }));
     assert.deepEqual(manual,{theme:'detroit',profile:'print',ink:'rgb(23, 23, 23)'},
      'Manual consumes the same second print profile');
     await diagnosticCapture(xerox,'detroit-390-manual.png');
     await xerox.locator('[data-lab-tab=crate]').click();
     await xerox.locator('#labCrate').waitFor({state:'visible',timeout:8000});
     const crate=await xerox.locator('#labCrate').evaluate(el=>{
      const ink=getComputedStyle(el);
      return {paper:ink.backgroundColor,color:ink.color};
     });
     assert.equal(crate.paper,'rgb(231, 229, 219)','Crate inherits toner paper stock');
     assert.equal(crate.color,'rgb(23, 23, 23)','Crate preserves readable print ink');
     await diagnosticCapture(xerox,'detroit-390-crate.png');
     assert.deepEqual(errors,[],'No Detroit preview runtime errors');
     console.log('PASS: second print theme is token-only; Detroit Atlas, Funk, Manual and 390px snapshots');
    }finally{await xerox.close()}
   }
  }
  // Additional print themes have a separate short, no-screenshot contract test.
  console.log('PASS: Android Libéri/Bosque/Usiku and URL-only Kingston/Detroit pilots have matching Atlas, portrait and Manual roles at 390px / 320px');
 }finally{await browser?.close();await new Promise(ok=>server.close(ok))}
})().catch(e=>{console.error(e);process.exitCode=1});
