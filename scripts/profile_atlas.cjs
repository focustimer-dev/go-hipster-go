// Compare exact bundled atlas code under the same mobile/CPU conditions.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const roots=process.argv.slice(2);if(roots.length!==2)throw Error('Provide baseline and candidate site roots');
(async()=>{
 const browser=await chromium.launch({headless:true});const samples=[];
 // Four independent pairs balance first/second position. Keep all raw samples.
 const builds=[{root:roots[0],label:'baseline'},{root:roots[1],label:'candidate'}];
 const cases=Array.from({length:4},(_,round)=>(round%2?[...builds].reverse():builds).map(test=>({...test,round:round+1}))).flat();
 try{for(const [index,test] of cases.entries()){const rootArg=test.root;
  const root=path.resolve(rootArg),server=http.createServer((req,res)=>{let name=new URL(req.url,'http://local').pathname;if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
   try{res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.html':'text/html','.png':'image/png','.webp':'image/webp','.woff':'font/woff'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const context=await browser.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:3,reducedMotion:'no-preference'}),page=await context.newPage(),cdp=await context.newCDPSession(page);
  try{
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:8});await cdp.send('Performance.enable');
   await page.addInitScript(()=>{window.HipsterLab={state:()=>'{"saved":[]}',inspiration:()=>'',copy:()=>true};window.perfLongTasks=[];new PerformanceObserver(list=>perfLongTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});});
   const started=Date.now();await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.evaluate(()=>document.fonts.ready);const loaded=Date.now()-started;
   await page.locator('.crate-map-frame').scrollIntoViewIfNeeded();
   // Selection is a different workload from camera motion. Measure both ink/unink.
   await page.evaluate(()=>document.querySelector('[data-crate-continent="europe"]').click());await page.waitForTimeout(400);
   const selection=await page.evaluate(async()=>{
    const samples=[],unrelated=document.querySelector('.mood-grid');let unrelatedMutations=0;
    const observer=new MutationObserver(records=>{unrelatedMutations+=records.length});observer.observe(unrelated,{attributes:true,subtree:true,childList:true,characterData:true});
    for(const id of ['atlantic-europe','northern-europe','mediterranean-europe','eastern-europe']){
     for(const selected of [true,false]){
      observer.takeRecords();unrelatedMutations=0;const start=performance.now();
      const land=document.querySelector('[data-atlas-country][data-atlas-region="'+id+'"]');
      const tap=new MouseEvent('click',{bubbles:true,cancelable:true,detail:1,clientX:120,clientY:120});Object.defineProperty(tap,'pointerType',{value:'touch'});
      land.dispatchEvent(tap);
      const handlerMs=performance.now()-start;
      // Include the touch double-tap arbitration delay in the baseline measurement.
      while(land.getAttribute('data-inked')!==String(selected)&&performance.now()-start<2000)await new Promise(requestAnimationFrame);
      if(land.getAttribute('data-inked')!==String(selected))throw Error('Selection ink incorrect: '+id);
      const prompt=document.querySelector('#prompt').textContent;
      const button=document.querySelector('[data-crate-region="'+id+'"]');
      if(button.getAttribute('aria-pressed')!==String(selected))throw Error('Named control state incorrect');
      if(selected&&!prompt.includes('Regional exploration:'))throw Error('Selected region missing from request');
      if(!selected&&prompt.includes('Regional exploration:'))throw Error('Removed region retained in request');
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      samples.push({id,selected,handlerMs,nextPaintMs:performance.now()-start,unrelatedMutations:unrelatedMutations+observer.takeRecords().length});
      await new Promise(resolve=>setTimeout(resolve,420));
     }
    }
    observer.disconnect();
    const p95=key=>{const values=samples.map(s=>s[key]).sort((a,b)=>a-b);return values[Math.floor(values.length*.95)]};
    return {handlerP95:p95('handlerMs'),nextPaintP95:p95('nextPaintMs'),unrelatedMutations:samples.reduce((n,s)=>n+s.unrelatedMutations,0),samples};
   });
   await page.evaluate(()=>document.querySelector('[data-crate-continent="europe"]').click());await page.waitForTimeout(400);
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
   // Actual browser touch events exercise drag and pinch paths, not synthetic clicks.
   await page.evaluate(()=>document.querySelector('[data-crate-continent="europe"]').click());await page.waitForTimeout(400);
   await page.locator('.crate-map-frame').scrollIntoViewIfNeeded();
   const box=await page.locator('.crate-map-frame').boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
   await page.evaluate(()=>{window.touchFrames=[];window.touchFrameActive=true;let last=performance.now();function tick(now){touchFrames.push(now-last);last=now;if(touchFrameActive)requestAnimationFrame(tick)}requestAnimationFrame(tick)});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy}]});
   for(let i=1;i<=24;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+Math.sin(i/24*Math.PI*2)*45,y:cy+Math.cos(i/24*Math.PI*2)*20}]});await page.waitForTimeout(16)}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-35,y:cy},{x:cx+35,y:cy}]});
   for(let i=1;i<=24;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-35-i,y:cy},{x:cx+35+i,y:cy}]});await page.waitForTimeout(16)}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   result.touch=await page.evaluate(()=>{touchFrameActive=false;touchFrames.sort((a,b)=>a-b);return {frames:touchFrames.length,p95:touchFrames[Math.floor(touchFrames.length*.95)],slowFrames:touchFrames.filter(n=>n>32).length}});
   result.touch.finalViewBox=await page.locator('#crateAtlasMap').getAttribute('viewBox');
   await page.evaluate(()=>document.querySelector('[data-crate-continent="europe"]').click());await page.waitForTimeout(150);
   await page.screenshot({path:'android-lab/build/atlas-perf/'+test.label+'-'+test.round+'-mid-zoom-out.png'});await page.waitForTimeout(400);
   assert.equal(await page.locator('#crateAtlasMap').evaluate(el=>el.style.transform),'','Camera transform clears at rest');
   const after=(await cdp.send('Performance.getMetrics')).metrics,metric=n=>(after.find(x=>x.name===n)?.value||0)-(before.find(x=>x.name===n)?.value||0);
   samples.push({label:test.label,round:test.round,loadMs:loaded,selection,...result,scriptMs:metric('ScriptDuration')*1000,layoutMs:metric('LayoutDuration')*1000,recalcMs:metric('RecalcStyleDuration')*1000,taskMs:metric('TaskDuration')*1000});
   await page.screenshot({path:'android-lab/build/atlas-perf/'+test.label+'-'+test.round+'.png'});
   await page.locator('.crate-map-frame').scrollIntoViewIfNeeded();
   await page.evaluate(()=>document.querySelector('[data-crate-continent="europe"]').click());await page.waitForTimeout(80);
   const retarget=await page.evaluate(()=>new Promise(resolve=>{
    const map=document.querySelector('#crateAtlasMap'),before={rect:map.getBoundingClientRect().toJSON(),viewBox:map.getAttribute('viewBox')};
    document.querySelector('[data-crate-continent="europe"]').click();
    requestAnimationFrame(()=>resolve({before,rect:map.getBoundingClientRect().toJSON(),viewBox:map.getAttribute('viewBox')}));
   }));
   if(test.label==='candidate'){
    assert.equal(retarget.viewBox,retarget.before.viewBox,'Retarget must not commit the SVG between destinations');
    for(const key of ['x','y','width','height'])assert(Math.abs(retarget.rect[key]-retarget.before.rect[key])<.1,'Retarget starts at visible camera '+key);
   }
   const pressBox=await page.locator('.crate-map-frame').boundingBox();
   await page.evaluate(()=>document.querySelector('#crateAtlasMap').addEventListener('touchstart',()=>{const map=document.querySelector('#crateAtlasMap');window.pressBefore={rect:map.getBoundingClientRect().toJSON(),viewBox:map.getAttribute('viewBox')}},{capture:true,once:true}));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pressBox.x+pressBox.width/2,y:pressBox.y+pressBox.height/2}]});
   const interrupted=await page.evaluate(()=>({before:pressBefore,after:document.querySelector('#crateAtlasMap').getBoundingClientRect().toJSON(),viewBox:document.querySelector('#crateAtlasMap').getAttribute('viewBox')}));
   if(test.label==='candidate'){
    assert.equal(interrupted.viewBox,interrupted.before.viewBox,'Press must not force an SVG camera commit');
    for(const key of ['x','y','width','height'])assert(Math.abs(interrupted.after[key]-interrupted.before.rect[key])<.1,'Press preserves visual camera '+key);
   }
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.waitForTimeout(350);
   assert.equal(await page.locator('#crateAtlasMap').evaluate(el=>el.style.transform),'','Interrupted zoom leaves no stale transform');
  }finally{await context.close();server.close()}
 }}finally{await browser.close()}
 // Compare medians of per-run metrics, not pooled frames (which overweight faster runs).
 const median=values=>{const sorted=[...values].sort((a,b)=>a-b),i=Math.floor(sorted.length/2);return sorted.length%2?sorted[i]:(sorted[i-1]+sorted[i])/2};
 const reports=builds.map(({label})=>{
  const runs=samples.filter(sample=>sample.label===label);
  return {label,runs:runs.length,...Object.fromEntries(['loadMs','taskMs','frameP95','scriptMs','layoutMs','recalcMs'].map(key=>[key,median(runs.map(run=>run[key]))])),selection:{handlerP95:median(runs.map(run=>run.selection.handlerP95)),nextPaintP95:median(runs.map(run=>run.selection.nextPaintP95)),unrelatedMutations:median(runs.map(run=>run.selection.unrelatedMutations))},touch:{p95:median(runs.map(run=>run.touch.p95))}};
 });
 fs.writeFileSync('android-lab/build/atlas-perf/results.json',JSON.stringify({reports,samples},null,2));console.log(JSON.stringify({reports,samples},null,2));
 // Every pair must preserve behavior; timing aggregation never hides a camera failure.
 for(let round=1;round<=4;round++){
  const baseline=samples.find(sample=>sample.round===round&&sample.label==='baseline'),candidate=samples.find(sample=>sample.round===round&&sample.label==='candidate');
  assert(candidate.mutations.viewBox<=baseline.mutations.viewBox+1,'Camera viewBox work must not regress in round '+round);
  assert.equal(candidate.touch.finalViewBox,baseline.touch.finalViewBox,'Drag/pinch destinations must be preserved in round '+round);
  assert.equal(candidate.finalViewBox,baseline.finalViewBox,'Camera destination must be preserved in round '+round);
 }
 // Same-run relative budgets tolerate runner noise while flagging material regressions.
 const baseline=reports[0],candidate=reports[1];
 assert(candidate.selection.unrelatedMutations===0,'Region taps must leave mood portraits untouched');
 assert(candidate.selection.nextPaintP95<=baseline.selection.nextPaintP95*1.25+16.7,'Selection paint exceeded baseline budget');
 assert(candidate.loadMs<=baseline.loadMs*1.25+250,'Startup exceeded baseline budget');
 assert(candidate.taskMs<=baseline.taskMs*1.25+100,'Main-thread work exceeded baseline budget');
 assert(candidate.frameP95<=Math.max(33.4,baseline.frameP95*1.25),'Zoom frame time exceeded baseline budget');
 assert(candidate.touch.p95<=Math.max(33.4,baseline.touch.p95*1.25),'Touch frame time exceeded baseline budget');
})().catch(e=>{console.error(e);process.exitCode=1});
