// Shared PWA and bundled Lab portrait state/geometry contract.
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const names=['happy','angry','sad','weird','criminal','funky'];
async function serve(root){const server=http.createServer((req,res)=>{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff':'font/woff','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));return server}
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.LAB_CHROMIUM?{executablePath:process.env.LAB_CHROMIUM}:{})});
try{for(const surface of ['pwa','lab']){const root=path.resolve(__dirname,surface==='pwa'?'../launcher':'../android-lab/app/src/main/assets/site');const server=await serve(root);
try{for(const viewport of [{width:360,height:800},{width:412,height:915},{width:915,height:412},{width:1280,height:900}]){
const page=await browser.newPage({viewport,isMobile:viewport.width<1000,hasTouch:viewport.width<1000,deviceScaleFactor:3});const errors=[];page.on('pageerror',e=>errors.push(e.message));
if(surface==='lab')await page.addInitScript(()=>{window.HipsterLab={state:()=>JSON.stringify({saved:[],mode:'share',oneTap:true}),inspiration:()=>'',copy:()=>true}});
await page.goto('http://127.0.0.1:'+server.address().port+(surface==='pwa'?'/editions/gig-poster/':'/'));await page.evaluate(()=>document.fonts.ready);
await page.evaluate(async()=>{for(const state of ['neutral','selected']){const im=new Image();im.src='/editions/gig-poster/assets/moods-'+state+'-ink-v2.webp';await im.decode();if(im.naturalWidth!==1536||im.naturalHeight!==1024)throw Error('Sprite dimensions changed')}});
const boxes=()=>page.locator('.mood-grid .mood').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [r.x+scrollX,r.y+scrollY,r.width,r.height]}));const before=await boxes();assert.equal(before.length,8);assert(before.every(r=>r[2]>=48&&r[3]>=48));
for(const name of names){await page.locator('.mood-grid [data-mood="'+name+'"]').click();await page.waitForFunction(sel=>{const el=document.querySelector('.mood-grid [data-mood="'+sel+'"] .face');if(!el)return false;return Number(getComputedStyle(el,'::before').opacity)<.02&&Number(getComputedStyle(el,'::after').opacity)>.98},name,{timeout:2000});const layers=await page.locator('.mood-grid [data-mood="'+name+'"] .face').evaluate(el=>['::before','::after'].map(p=>{const s=getComputedStyle(el,p);return {opacity:s.opacity,filter:s.filter,url:s.backgroundImage}}));assert(Number(layers[0].opacity)<.02,JSON.stringify({surface,viewport,name,layers}));assert(Number(layers[1].opacity)>.98,JSON.stringify({surface,viewport,name,layers}));assert(layers.every(s=>s.url.includes('-ink-v2.webp')),JSON.stringify({surface,viewport,name,layers}));
// Android's approved selected Funk has its own orange-gold portrait treatment;
// the PWA and every other original selected portrait remain unfiltered.
const canonicalFunk=surface==='lab'&&name==='funky';
assert.equal(layers[0].filter,'none',JSON.stringify({surface,viewport,name,layers}));
if(canonicalFunk){
 assert.notEqual(layers[1].filter,'none',JSON.stringify({surface,viewport,name,layers}));
 assert(layers[1].filter.includes('hue-rotate'),JSON.stringify({surface,viewport,name,layers}));
}else assert.equal(layers[1].filter,'none',JSON.stringify({surface,viewport,name,layers}));assert.deepEqual(await boxes(),before,'Mood toggling moved portrait controls');await page.locator('.mood-grid [data-mood="'+name+'"]').click();assert.equal(await page.locator('.mood-grid [data-mood="'+name+'"]').getAttribute('aria-pressed'),'false','Test must clear each selected mood before checking the next');}
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.mood-grid [data-mood="happy"]').click();assert.equal(await page.locator('[data-mood="happy"] .face').evaluate(e=>getComputedStyle(e,'::after').transitionDuration),'0s');
if(process.env.MOOD_INK_CAPTURE&&[360,915,1280].includes(viewport.width))await page.locator('.mood-grid').screenshot({path:'/tmp/mood-ink-'+surface+'-'+viewport.width+'.png'});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');assert.deepEqual(errors,[]);console.log('PASS',surface,viewport.width+'x'+viewport.height,'six original states plus eight-key geometry, exclusive layers, reduced motion and touch targets');await page.close();
}}finally{await new Promise(r=>server.close(r))}}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
