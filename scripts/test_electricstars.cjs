const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=process.cwd()+'/android-lab/app/src/main/assets/site';
(async()=>{const server=http.createServer((q,r)=>{let f=root+new URL(q.url,'http://localhost').pathname;if(f.endsWith('/'))f+='index.html';try{r.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f))}catch{r.writeHead(404);r.end()}});await new Promise(r=>server.listen(0,r));const browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{}),args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:412,height:915}});await page.addInitScript(()=>{window.unlocked=false;window.HipsterLab={surpriseUnlocked:()=>window.unlocked,state:()=>JSON.stringify({saved:[]}),inspiration:()=>'',setDialogPalette(){},syncSystemPalette(){}}});await page.goto('http://localhost:'+server.address().port+'/?theme=electricstars&atlas=legacy');await page.waitForTimeout(500);assert.notEqual(await page.evaluate(()=>HipsterLabTheme.current()),'electricstars');assert.equal(await page.locator('[data-lab-theme=electricstars]').isDisabled(),true);assert.equal(await page.evaluate(()=>HipsterLabTheme.set('electricstars',true)),false);await page.evaluate(()=>{window.unlocked=true;window.dispatchEvent(new Event('ghg-surprise-roll'));HipsterLabTheme.set('electricstars',true)});assert.equal(await page.locator('[data-lab-theme=electricstars]').isDisabled(),false);assert.equal(await page.evaluate(()=>HipsterLabTheme.current()),'electricstars');const paint=await page.evaluate(()=>{
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
assert.deepEqual(paint.ticket,{background:navy,ink:lilac},'Onboarding ticket uses dark Petrol Navy with neon lilac text');
assert.equal(paint.mood.background,navy,'Neutral mood tiles use dark Petrol Navy instead of pale stock');
assert.equal(paint.moodLabel.ink,lilac,'Neutral mood labels use high-contrast lilac');
// Assert legibility, not just the names of the palette tokens.
const luminance=color=>{
 const rgb=color.match(/\d+/g).slice(0,3).map(Number).map(v=>{
  const n=v/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;
 });
 return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const ratio=(a,b)=>{const [low,high]=[luminance(a),luminance(b)].sort((x,y)=>x-y);return(high+.05)/(low+.05)};
for(const [name,pair] of Object.entries(paint)){
 if(name==='action'&&pair.background==='rgba(0, 0, 0, 0)')continue;
 assert(ratio(pair.background,pair.ink)>=4.5,name+' must pass WCAG AA normal-text contrast');
}
fs.mkdirSync('android-lab/build/electricstars-review',{recursive:true});
await page.screenshot({path:'android-lab/build/electricstars-review/electricstars.png',fullPage:false});
console.log('PASS ElectricStars dark onboarding and neutral mood contrast',paint);console.log('PASS locked restore, locked selection, unlock refresh and theme activation');await browser.close();server.close()})().catch(e=>{console.error(e);process.exit(1)});
