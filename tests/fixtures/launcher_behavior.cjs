const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
class Element{
 constructor(dataset={}){this.dataset=dataset;this.attrs={};this.events={};this.textContent='';this.hidden=false;this.open=false;this.classList={toggle(){}};}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,f){this.events[k]=f}
 querySelector(){return this.span||(this.span=new Element())}
 async click(){const event={preventDefault(){this.prevented=true}};await this.events.click?.(event);return event}
}
function harness(write,search=''){
 const ids=['tempoControl','tempoSlider','tempoValue','anyTempo','copyStatus','routeStatus','prompt','moodName','receiptCode','openAi','browserAi','manualOpenAi','receiptSummary','goHint','goButton','stripSetupPrompt','setupPromptText','setupPromptDetails','setupTipStatus','openSetupAi','promptDetails','shareButton'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const ais=['chatgpt','gemini','claude'].map(ai=>new Element({ai}));
 const services=['spotify','youtube','apple'].map(service=>new Element({service}));
 const moods=['happy','angry','sad','weird'].map(mood=>new Element({mood}));
 const groups={'[data-ai]':ais,'[data-service]':services,'[data-mood]':moods,'[data-setup]':[]};
 const doc={body:{dataset:{page:'launch'},appendChild(){}},getElementById:id=>elements[id]||null,querySelectorAll:q=>groups[q]||[],createElement:()=>({style:{},select(){},remove(){}}),execCommand:()=>false};
 vm.runInNewContext(fs.readFileSync('launcher/assets/app.js','utf8'),{document:doc,navigator:{clipboard:{writeText:write}},localStorage:{getItem(){return null},setItem(){}},URL,URLSearchParams,location:{search,pathname:'/',href:'https://example.test/'},history:{replaceState(){}}});
 return {elements,ais,services,moods};
}
(async()=>{
 let copies=[];let h=harness(async text=>copies.push(text)),e=h.elements;
 await h.moods[2].click();assert.equal(copies.length,0,'Selecting a mood must not copy');
 await e.goButton.click();assert.match(copies.at(-1),/go sad/,'GO must preserve selected mood');assert.equal(e.openAi.attrs['aria-disabled'],'false');assert.equal(e.goButton.attrs['data-copy-state'],'copied');assert.equal(e.openAi.textContent,'NEXT: OPEN CHATGPT');
 await h.services[2].click();assert.equal(copies.length,1,'Changing service must not silently copy');assert.equal(e.goButton.attrs['data-copy-state'],'idle');assert.equal(e.openAi.attrs['aria-disabled'],'true');assert.equal((await e.openAi.click()).prevented,true,'Stale handoff must be blocked');
 await e.goButton.click();assert.match(copies.at(-1),/Apple Music/);assert.match(copies.at(-1),/go sad/);
 await h.moods[2].click();await e.goButton.click();assert.doesNotMatch(copies.at(-1),/go sad/,'Second mood tap clears mood');
 await e.stripSetupPrompt.click();assert.match(copies.at(-1),/FIRST-TIME SETUP CHECK/);assert.equal(e.openAi.attrs['aria-disabled'],'true','Setup copy invalidates playlist clipboard');
 e.tempoSlider.value='5';await e.tempoSlider.events.input();assert.equal(e.openAi.attrs['aria-disabled'],'true');assert.equal(copies.length,4,'Tempo selection does not copy');
 await e.goButton.click();assert.match(copies.at(-1),/Tempo preference: Fast/);assert.match(e.receiptSummary.textContent,/Fast/);
 await h.moods[2].click();await e.goButton.click();assert.match(copies.at(-1),/go sad/);assert.match(copies.at(-1),/Tempo preference: Fast/);
 await e.anyTempo.click();await e.goButton.click();assert.doesNotMatch(copies.at(-1),/Tempo preference:/);assert.match(copies.at(-1),/go sad/);
 await e.anyTempo.click();assert.equal(e.tempoControl.attrs['data-tempo'],'any');
 await e.tempoSlider.events.pointerup();assert.equal(e.tempoControl.attrs['data-tempo'],'moderate','Tapping the parked cap selects the center pace');
 await e.goButton.click();assert.match(copies.at(-1),/Tempo preference: Mid-tempo/);
 let restored=harness(async()=>{},'?tempo=slow');assert.match(restored.elements.prompt.textContent,/Tempo preference: Slow/);
 restored=harness(async()=>{},'?tempo=bogus');assert.doesNotMatch(restored.elements.prompt.textContent,/Tempo preference:/);
 h=harness(async()=>{throw Error('blocked')});await h.elements.goButton.click();assert.equal(h.elements.promptDetails.open,true);assert.equal(h.elements.goButton.attrs['data-copy-state'],'idle','Failed copies never show a success stamp');assert.equal(h.elements.openAi.attrs['aria-disabled'],'true');await h.elements.stripSetupPrompt.click();assert.equal(h.elements.setupPromptDetails.open,true);
 let finish;h=harness(()=>new Promise(resolve=>{finish=resolve}));const pending=h.elements.goButton.click();assert.equal(h.elements.goButton.attrs['data-copy-state'],'copying');assert.equal(h.elements.goButton.attrs['aria-busy'],'true');assert.equal(h.elements.openAi.attrs['aria-disabled'],'true');await h.moods[0].click();finish();await pending;assert.equal(h.elements.goButton.attrs['data-copy-state'],'idle');assert.equal(h.elements.goButton.attrs['aria-busy'],'false');assert.equal(h.elements.openAi.attrs['aria-disabled'],'true','Selection change during copy cannot enable stale handoff');
 console.log('PASS: mood selection, reset, current-copy handoff, setup invalidation, blocked clipboard, copy race');
})().catch(e=>{console.error(e);process.exit(1)});
