const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=process.cwd()+'/android-lab/app/src/main/assets/site';
(async()=>{const server=http.createServer((q,r)=>{let f=root+new URL(q.url,'http://localhost').pathname;if(f.endsWith('/'))f+='index.html';try{r.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f))}catch{r.writeHead(404);r.end()}});await new Promise(r=>server.listen(0,r));const browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{}),args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:412,height:915}});await page.addInitScript(()=>{window.unlocked=false;window.HipsterLab={surpriseUnlocked:()=>window.unlocked,state:()=>JSON.stringify({saved:[]}),inspiration:()=>'',setDialogPalette(){},syncSystemPalette(){}}});await page.goto('http://localhost:'+server.address().port+'/?theme=electricstars&atlas=legacy');await page.waitForTimeout(500);assert.notEqual(await page.evaluate(()=>HipsterLabTheme.current()),'electricstars');assert.equal(await page.locator('[data-lab-theme=electricstars]').isDisabled(),true);assert.equal(await page.evaluate(()=>HipsterLabTheme.set('electricstars',true)),false);await page.evaluate(()=>{window.unlocked=true;window.dispatchEvent(new Event('ghg-surprise-roll'));HipsterLabTheme.set('electricstars',true)});assert.equal(await page.locator('[data-lab-theme=electricstars]').isDisabled(),false);assert.equal(await page.evaluate(()=>HipsterLabTheme.current()),'electricstars');// A theme switch changes CSS media and the root palette; capture only after
// the WebView has applied the new frame rather than the previous print stock.
await page.waitForFunction(()=>{
 const ticket=document.querySelector('#firstCrateSetup .ticket');
 const mood=document.querySelector('.mood-grid .mood[aria-pressed=false]');
 return ticket&&mood&&getComputedStyle(ticket).backgroundColor==='rgb(12, 66, 109)'&&
  getComputedStyle(mood).backgroundColor==='rgb(190, 116, 205)';
},null,{timeout:8000});
const paint=await page.evaluate(()=>{
 const css=selector=>{
  const el=document.querySelector(selector);
  if(!el)throw Error('ElectricStars contract missing '+selector);
  const style=getComputedStyle(el);
  return {background:style.backgroundColor,ink:style.color};
 };
 return {
  ticket:css('#firstCrateSetup .ticket'),
  action:css('#firstCrateSetup .ticket .primary'),
  mood:css('.mood-grid .mood[aria-pressed=false]'),
  moodLabel:css('.mood-grid .mood[aria-pressed=false] .word')
 };
});
const navy='rgb(12, 66, 109)',lilac='rgb(246, 184, 251)';
const orchid='rgb(190, 116, 205)',plum='rgb(55, 43, 104)',midnight='rgb(1, 22, 41)';
assert.deepEqual(paint.ticket,{background:navy,ink:lilac},'Onboarding remains dark Petrol Navy');
assert.deepEqual(paint.mood,{background:orchid,ink:plum},'Orchid Mesh neutral tile and Velvet Plum portrait ink');
assert.equal(paint.moodLabel.ink,midnight,'Small neutral mood label uses accessible midnight ink');
const inks=await page.evaluate(()=>Object.fromEntries(['themeMoodNeutralEngraving','themeMoodSelectedEngraving'].map(id=>{
 const filter=document.getElementById(id);
 if(!filter)throw Error('Missing '+id+' portrait transfer');
 return [id,['R','G','B'].map(channel=>Number(filter.querySelector('feFunc'+channel).getAttribute('intercept')))];
})));
for(const [name,channels] of Object.entries(inks)){
 for(const [i,value] of channels.entries())assert(Math.abs(value-[55,43,104][i]/255)<.005,name+' must map the dark Velvet Plum character engraving');
}
// Assert legibility, not just the names of the palette tokens.
const luminance=color=>{
 const rgb=color.match(/\d+/g).slice(0,3).map(Number).map(v=>{
  const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;
 });
 return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const ratio=(a,b)=>{const [low,high]=[luminance(a),luminance(b)].sort((x,y)=>x-y);return(high+.05)/(low+.05)};
for(const name of ['ticket','moodLabel']){
 const pair=name==='moodLabel'?{background:orchid,ink:paint.moodLabel.ink}:paint.ticket;
 assert(ratio(pair.background,pair.ink)>=4.5,name+' must meet AA normal-text contrast');
}
assert(ratio(paint.action.background,paint.action.ink)>=4.5,'Setup action contrast');
assert(ratio(orchid,plum)>=3,'Velvet Plum portrait engraving must exceed 3:1 graphical contrast');
fs.mkdirSync('android-lab/build/electricstars-review',{recursive:true});
await page.screenshot({path:'android-lab/build/electricstars-review/electricstars.png',fullPage:false});
// The pressed state uses a translucent lilac film over Orchid -- not a
// second inverted portrait. Check the real background layers and SVG ink.
await page.locator('.mood-grid .mood[data-mood=happy]').evaluate(el=>el.click());
await page.waitForFunction(()=>document.querySelector('.mood-grid .mood[data-mood=happy]').getAttribute('aria-pressed')==='true');
const selected=await page.evaluate(()=>{
 const el=document.querySelector('.mood-grid .mood[data-mood=happy]');
 const style=getComputedStyle(el);
 return {background:style.backgroundColor,overlay:style.backgroundImage,ink:style.color,word:getComputedStyle(el.querySelector('.word')).color};
});
assert.equal(selected.background,orchid,'Selected tile retains Orchid Mesh underneath translucent wash');
assert(selected.overlay.includes('linear-gradient(')&&selected.overlay.includes('rgba(246, 184, 251, 0.28)'),'Selected tile uses 28% transparent lilac overlay');
assert.equal(selected.ink,plum,'Selected tile retains Velvet Plum portrait ink');
assert.equal(selected.word,plum,'Selected mood label uses Velvet Plum');
const composed='rgb(206, 135, 218)'; // Orchid + 28% Neon Lilac
assert(ratio(composed,plum)>=4.5,'Selected wash and Velvet Plum must meet AA text contrast');
// Preserve Funk's approved selected composition (gold ink, deep magenta,
// engraved image and lasers); the generic mood wash must never touch it.
await page.locator('.mood-grid .mood[data-mood=funky]').evaluate(el=>el.click());
await page.waitForFunction(()=>document.querySelector('.mood-grid .mood[data-mood=funky]').getAttribute('aria-pressed')==='true');
const funk=await page.evaluate(()=>{
 const el=document.querySelector('.mood-grid .mood[data-mood=funky]');
 const style=getComputedStyle(el);
 return {background:style.backgroundColor,overlay:style.backgroundImage,ink:getComputedStyle(el.querySelector('.word')).color,art:getComputedStyle(el.querySelector('.face'),'::after').backgroundImage};
});
assert.equal(funk.background,'rgb(110, 34, 92)','Funk selected artwork background is unchanged');
assert.equal(funk.ink,'rgb(242, 200, 78)','Funk selected gold lettering is unchanged');
assert(funk.overlay.includes('radial-gradient('),'Funk retains its unique selected gradient');
assert(funk.art.includes('funk-selected-engraved.webp'),'Funk retains its baked selected engraving');
await page.locator('.mood-grid').scrollIntoViewIfNeeded();
await page.screenshot({path:'android-lab/build/electricstars-review/electricstars-moods-selected.png',fullPage:false});
await page.locator('.mood-grid').screenshot({path:'android-lab/build/electricstars-review/electricstars-mood-tiles.png'});
console.log('PASS ElectricStars Orchid/Plum portraits, accessible labels, translucent selection and immutable selected Funk',paint,selected,funk);console.log('PASS locked restore, locked selection, unlock refresh and theme activation');await browser.close();server.close()})().catch(e=>{console.error(e);process.exit(1)});
