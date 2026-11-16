// Playwright regression for Android's tokenized first-run AI/music menus.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');
const server=http.createServer((req,res)=>{
 const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(route.endsWith('/')?route+'index.html':route));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch{res.writeHead(404);res.end()}
});
const rgb=hex=>{const s=hex.trim().replace('#','');if(!/^[0-9a-f]{6}$/i.test(s))throw Error('Invalid theme token: '+hex);return 'rgb('+[0,2,4].map(n=>parseInt(s.slice(n,n+2),16)).join(', ')+')'};
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.HipsterLab={
   state:()=>JSON.stringify({saved:[],mode:'share',oneTap:true}),
   inspiration:()=>'',surpriseUnlocked:()=>false,
   setDialogPalette(){},syncSystemPalette(){},haptic(){},copy:()=>true
  }});
  await page.addInitScript(()=>{try{localStorage.setItem('ghg-lab-theme-v1','liberi')}catch(_){}});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?atlas=legacy');
  await page.locator('#fc-ai-trigger').waitFor({state:'attached'});
  // Regression: Libéri previously had no --lab-ui-panel / --lab-ui-on-panel
  // tokens. The last dialog override became invalid at computed time and
  // revealed the Jukebox through a transparent Preferences surface.
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.pwaTheme),'liberi','Explicit Libéri setup-menu smoke');
  await page.locator('.lab-rail [data-lab-action="preferences"]').click();
  const prefs=page.locator('#labPreferences');
  const paint=await prefs.evaluate(el=>{
   const panel=getComputedStyle(el),header=getComputedStyle(el.querySelector('.lab-dialog-head'));
   return {open:el.open,panelBg:panel.backgroundColor,panelInk:panel.color,
    headerBg:header.backgroundColor,headerInk:header.color,opacity:panel.opacity};
  });
  assert.equal(paint.open,true);
  assert.equal(paint.panelBg,'rgb(223, 176, 69)','Libéri Preferences must have opaque gold stock');
  assert.equal(paint.headerBg,'rgb(223, 176, 69)','Sticky Preferences header must cover scrolled content');
  assert.equal(paint.panelInk,'rgb(16, 49, 53)','Libéri Preferences ink');
  assert.equal(paint.headerInk,'rgb(16, 49, 53)','Libéri header ink');
  assert.equal(paint.opacity,'1','No translucent modal opacity');
  fs.mkdirSync('android-lab/build/switch-review',{recursive:true});
  await page.screenshot({path:'android-lab/build/switch-review/liberi-preferences-opaque.png'});
  await page.locator('[data-lab-action="close-preferences"]').click();
  assert.equal(await prefs.evaluate(el=>el.open),false,'Preferences close restores Jukebox');

  // Exercise the normal pairing change handler to reach first-run choose stage.
  await page.evaluate(()=>document.getElementById('fc-ai').dispatchEvent(new Event('change',{bubbles:true})));
  assert(await page.locator('#fc-ai-trigger').isVisible(),'Visible custom AI picker');
  assert.equal(await page.locator('#fc-ai').isVisible(),false,'Native select must not open a system-colored popup');
  await page.locator('#fc-ai-trigger').click();
  assert.equal(await page.locator('#fc-picker-dialog').evaluate(e=>e.open),true);
  assert.equal(await page.locator('.fc-picker-option').count(),4);
  assert.equal(await page.locator('.fc-picker-option[aria-pressed=true]').innerText(),'ChatGPT');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#fc-picker-dialog').evaluate(e=>e.open),false,'Escape closes popup');
  assert.match(await page.locator('#fc-ticket').innerText(),/WHAT.S YOUR SETUP/,'Escape must not abandon setup');
  // Switching from Libéri must activate the optional theme stylesheet.
  // Changing root.dataset directly does not load disabled <link media="not all">.
  await page.evaluate(()=>window.HipsterLabTheme.set('bosque',false));
  await page.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--lab-ui-panel').trim()==='#f5f0e6');
  for(const theme of ['bosque','usiku','michoacan','electricstars']){
   await page.evaluate(theme=>{document.documentElement.dataset.pwaTheme=theme;document.documentElement.dataset.ghgThemeProfile='print'},theme);
   await page.locator('#fc-ai-trigger').click();
   const colors=await page.locator('#fc-picker-dialog').evaluate(el=>{
    const style=getComputedStyle(el),rootStyle=getComputedStyle(document.documentElement);
    return {bg:style.backgroundColor,ink:style.color,wantBg:rootStyle.getPropertyValue('--lab-ui-panel'),wantInk:rootStyle.getPropertyValue('--lab-ui-on-panel')}
   });
   assert.equal(colors.bg,rgb(colors.wantBg),theme+' popup background matches active theme token');
   assert.equal(colors.ink,rgb(colors.wantInk),theme+' popup ink matches active theme token');
   if(theme==='michoacan'||theme==='electricstars'){
    fs.mkdirSync('android-lab/build/switch-review',{recursive:true});
    await page.locator('#fc-picker-dialog').screenshot({path:'android-lab/build/switch-review/setup-picker-'+theme+'.png'});
   }
   await page.locator('#fc-picker-cancel').click();
  }
  await page.locator('#fc-ai-trigger').click();
  await page.locator('.fc-picker-option').filter({hasText:'Gemini'}).click();
  assert.equal(await page.locator('#fc-ai').inputValue(),'Gemini');
  assert.equal(await page.locator('#fc-ai-value').innerText(),'Gemini');
  assert.equal(await page.evaluate(()=>window.HipsterSetup.getPair().ai),'gemini');
  await page.locator('#fc-service-trigger').click();
  assert.equal(await page.locator('.fc-picker-option').count(),3);
  await page.locator('.fc-picker-option').filter({hasText:'Apple Music'}).click();
  assert.equal(await page.locator('#fc-service-value').innerText(),'Apple Music');
  assert.equal(await page.evaluate(()=>window.HipsterSetup.getPair().service),'apple');
  assert.deepEqual(errors,[],'No JavaScript runtime errors');
  console.log('PASS: custom AI/music popups, theme tokens across four palettes, Escape, persisted pairing, and no native picker');
  await page.close();
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
