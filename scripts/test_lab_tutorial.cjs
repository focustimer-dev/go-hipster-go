const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert');(async()=>{const root=path.resolve(__dirname,'../android-lab/app/src/main/assets/site');const server=http.createServer((q,r)=>{try{r.end(fs.readFileSync(path.join(root,new URL(q.url,'http://x').pathname)))}catch{r.statusCode=404;r.end()}});await new Promise(r=>server.listen(0,r));const b=await chromium.launch({...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:390,height:750}});let errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:'+server.address().port+'/index.html?ai=gemini&service=youtube');await p.locator('[data-lab-tab=manual]').click();const f=p.frameLocator('#labManualFrame');await f.locator('#cratePicker > summary').click();await f.locator('[data-crate-tab=use]').click();assert.equal(await f.locator('[data-crate-tab=use]').getAttribute('aria-selected'),'true');assert.equal(await f.locator('#cratePanelSetup').isVisible(),false);await f.locator('.crate-dividers a[href="#surprise"]').click();await f.locator('#keep').waitFor({state:'visible'});assert(await f.locator('#keep').isVisible());for(const id of ['claude','other','setup','resources','manual']){await f.locator('#cratePicker > summary').click();await f.locator('[data-crate-tab=setup]').click();await f.locator('.crate-dividers a[href="#'+id+'"]').click();await p.waitForTimeout(100);assert.equal(await f.locator('[data-manual-page]:visible').count(),1)}await f.locator('#cratePicker > summary').click();await f.locator('[data-crate-tab=use]').focus();await p.keyboard.press('ArrowLeft');assert.equal(await f.locator('[data-crate-tab=setup]').getAttribute('aria-selected'),'true');await p.keyboard.press('Escape');assert.equal(await f.locator('#cratePicker').getAttribute('open'),null);assert.equal(await f.locator('#resources a').count(),7);assert(await f.locator('.manual-liner summary').isVisible());for(const width of [320,390,1100]){
await p.setViewportSize({width,height:750});
assert(await p.locator('#labManualTitle').evaluate(el=>el.getBoundingClientRect().height<=1),'Manual heading takes no visible space');
await f.locator('#cratePicker > summary').click();
await f.locator('[data-crate-tab=setup]').click();
await f.locator('.crate-dividers a[href="#setupChat"]').click();
await f.locator('#setupWatchChat').waitFor({state:'visible'});
await f.locator('#setupWatchChat').click();
await f.locator('#player').waitFor({state:'visible'});
const reading=await f.locator('main.wrap').boundingBox(),controls=await f.locator('#player').boundingBox();
assert(reading.y+reading.height<=controls.y+1,'Playback controls reserve space below the reading viewport');
assert(controls.width<=width,'Playback strip fits the viewport');
assert(await f.locator('#stop').isVisible());
fs.mkdirSync('android-lab/build/switch-review',{recursive:true});
await p.screenshot({path:'android-lab/build/switch-review/manual-playback-'+width+'.png'});
await f.locator('#stop').click();
await f.locator('#player').waitFor({state:'hidden'});
await f.locator('main.wrap').evaluate(el=>el.scrollTo({top:200,behavior:'instant'}));
await p.waitForTimeout(450);
assert.equal(await f.locator('#manualNavigation').evaluate(el=>el.classList.contains('is-compact')),true,'Inner reading scroll condenses guide selector');
}
assert.deepEqual(errors,[]);console.log('PASS native Manual guide, Normal GO closing steps, More Resources preserved controls and return');await b.close();server.close()})()
