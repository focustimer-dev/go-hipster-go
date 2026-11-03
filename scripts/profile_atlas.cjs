// Compare exact bundled atlas code under the same mobile/CPU conditions.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const roots=process.argv.slice(2);if(roots.length!==2)throw Error('Provide baseline and candidate site roots');
(async()=>{
 const browser=await chromium.launch({headless:true});const reports=[];
 const cases=[{root:roots[0],label:'baseline'},{root:roots[1],label:'candidate'},{root:roots[1],label:'diagnostic-containment',css:'.crate-map-frame{contain:layout paint style}'},{root:roots[1],label:'diagnostic-no-art',css:'.chart-details{display:none!important}'},{root:roots[1],label:'diagnostic-solid-land',css:'.crate-map-zone path{fill:#dfb045!important}'}];
 try{for(const [index,test] of cases.entries()){const rootArg=test.root;
  const root=path.resolve(rootArg),server=http.createServer((req,res)=>{let name=new URL(req.url,'http://local').pathname;if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
   try{res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.html':'text/html','.png':'image/png','.webp':'image/webp','.woff':'font/woff'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const context=await browser.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,reducedMotion:'no-preference'}),page=await context.newPage(),cdp=await context.newCDPSession(page);
  try{
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Performance.enable');
   await page.addInitScript(()=>{window.HipsterLab={state:()=>'{"saved":[]}',inspiration:()=>'',copy:()=>true};window.perfLongTasks=[];new PerformanceObserver(list=>perfLongTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});});
   const started=Date.now();await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.evaluate(()=>document.fonts.ready);const loaded=Date.now()-started;
   if(test.css)await page.addStyleTag({content:test.css});
   await page.locator('#crateAtlasMap').scrollIntoViewIfNeeded();
   const before=(await cdp.send('Performance.getMetrics')).metrics;
   const result=await page.evaluate(async()=>{
    const map=document.querySelector('#crateAtlasMap'),mutations={details:0,tabindex:0,viewBox:0};
    const observer=new MutationObserver(records=>{for(const r of records){if(r.attributeName==='data-details')mutations.details++;if(r.attributeName==='tabindex')mutations.tabindex++;if(r.target===map&&r.attributeName==='viewBox')mutations.viewBox++;}});observer.observe(map,{subtree:true,attributes:true});
    const intervals=[];let last=performance.now(),running=true;function tick(now){intervals.push(now-last);last=now;if(running)requestAnimationFrame(tick)}requestAnimationFrame(tick);
    const start=performance.now();
    for(let i=0;i<12;i++){document.querySelector('[data-crate-continent="europe"]').click();await new Promise(r=>setTimeout(r,360));}
    running=false;observer.disconnect();intervals.sort((a,b)=>a-b);
    return {elapsedMs:performance.now()-start,mutations,frames:intervals.length,frameP95:intervals[Math.floor(intervals.length*.95)],slowFrames:intervals.filter(n=>n>32).length,longTasks:perfLongTasks.length,maxLongTask:Math.max(0,...perfLongTasks),finalViewBox:map.getAttribute('viewBox')};
   });
   const after=(await cdp.send('Performance.getMetrics')).metrics,metric=n=>(after.find(x=>x.name===n)?.value||0)-(before.find(x=>x.name===n)?.value||0);
   reports.push({label:test.label,loadMs:loaded,...result,scriptMs:metric('ScriptDuration')*1000,layoutMs:metric('LayoutDuration')*1000,recalcMs:metric('RecalcStyleDuration')*1000,taskMs:metric('TaskDuration')*1000});
   await page.screenshot({path:'android-lab/build/atlas-perf/'+test.label+'.png'});
  }finally{await context.close();server.close()}
 }}finally{await browser.close()}
 fs.writeFileSync('android-lab/build/atlas-perf/results.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));
 assert(reports[1].mutations.tabindex<reports[0].mutations.tabindex/2,'Hotspot attributes must not be rewritten every frame');
 assert.equal(reports[1].finalViewBox,reports[0].finalViewBox,'Camera destination must be preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
