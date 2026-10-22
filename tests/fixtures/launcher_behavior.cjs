const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
class Element{
 constructor(dataset={}){this.dataset=dataset;this.attrs={};this.events={};this.textContent='';this.hidden=false;this.open=false;this.classList={toggle(){}};}
 focus(){this.focused=true}
 replaceChildren(){}
 append(){}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,f){this.events[k]=f}
 querySelector(){return this.span||(this.span=new Element())}
 async click(){const event={preventDefault(){this.prevented=true}};await this.events.click?.(event);return event}
}
function harness(write,search='',page='launch',storage=new Map()){
 const ids=['welcomeSetup','dismissWelcome','aiLabel','copyTailoredSetup','recipeIntro','recipeSteps','recipeResources','recipeCaveat','openSelectedAi','tempoControl','tempoSlider','tempoValue','anyTempo','copyStatus','routeStatus','prompt','moodName','receiptCode','openAi','browserAi','manualOpenAi','receiptSummary','goHint','goButton','stripSetupPrompt','setupPromptText','setupPromptDetails','setupTipStatus','openSetupAi','promptDetails','shareButton'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const ais=['chatgpt','gemini','claude'].map(ai=>new Element({ai}));
 const services=['spotify','youtube','apple'].map(service=>new Element({service}));
 const moods=['happy','angry','sad','weird','criminal'].map(mood=>new Element({mood}));
 const groups={'[data-ai]':ais,'[data-service]':services,'[data-mood]':moods,'[data-setup]':[]};
 const doc={body:{dataset:{page},appendChild(){}},getElementById:id=>elements[id]||null,querySelectorAll:q=>groups[q]||[],createElement:()=>Object.assign(new Element(),{style:{},select(){},remove(){}}),execCommand:()=>false};
 vm.runInNewContext(fs.readFileSync('launcher/assets/app.js','utf8'),{document:doc,navigator:{clipboard:{writeText:write}},localStorage:{getItem(key){return storage.get(key)||null},setItem(key,value){storage.set(key,value)}},URL,URLSearchParams,location:{search,pathname:'/',href:'https://example.test/'},history:{replaceState(){}}});
 return {elements,ais,services,moods};
}
(async()=>{
 // Exercise the full cue cycle, reload persistence, and the cycle boundary.
 const cycleStore=new Map();let cycleCopies=[];
 let cycle=harness(async s=>cycleCopies.push(s),'?mood=happy','launch',cycleStore);
 for(let i=0;i<56;i++){
  if(i===28)cycle=harness(async s=>cycleCopies.push(s),'?mood=happy','launch',cycleStore);
  await cycle.elements.goButton.click();
 }
 const lenses=cycleCopies.map(s=>s.match(/Fresh-crate discovery lens: ([^\n]+)/)[1]);
 assert.equal(new Set(lenses).size,56,'All cues are used before recycling, including after reload');
 const angles=cycleCopies.slice(0,6).map(s=>s.match(/Mood angle: ([^.]+)/)[1]);
 assert.equal(new Set(angles).size,6,'Happy angles rotate before repeating');
 const criminalCopies=[];const criminal=harness(async s=>criminalCopies.push(s),'?mood=criminal','launch',new Map());
 for(let i=0;i<7;i++)await criminal.elements.goButton.click();
 const criminalAngles=criminalCopies.map(s=>s.match(/Mood angle: ([^.]+)/)[1]);
 assert.equal(new Set(criminalAngles).size,7,'Seven Criminal story angles before repeating');
 await cycle.elements.goButton.click();
 assert.notEqual(cycleCopies[56].match(/Fresh-crate discovery lens: ([^\n]+)/)[1],lenses[55]);
 await cycle.moods[1].click();
 assert.doesNotMatch(cycle.elements.prompt.textContent,/Mood angle:/,'Changing mood clears the previous angle');
 for(const selectedMood of ['happy','angry','sad','weird'])for(const ai of ['chatgpt','gemini','claude'])for(const service of ['spotify','youtube','apple']){
  let result='';const h=harness(async s=>result=s,`?ai=${ai}&service=${service}&mood=${selectedMood}&tempo=slow`);
  await h.elements.goButton.click();
  assert.match(result,/Mood angle:/);
  assert.match(result,/Tempo preference: Slow/);
  assert.doesNotMatch(result,/Mood range:|do not claim history access when unavailable/);
 }
 const badStore=new Map([['ghg-crate-routes-v2','not-json'],['ghg-mood-angles-v1-happy','[0,0,-2,900,"bad"]']]);
 const recovered=harness(async()=>{},'?mood=happy','launch',badStore);
 await recovered.elements.goButton.click();
 assert.match(recovered.elements.prompt.textContent,/Mood angle:/,'Corrupt or obsolete cue storage recovers');
 const apple=harness(async()=>{},"?ai=chatgpt&service=apple");
 assert.match(apple.elements.prompt.textContent,/@Go, Hipster, Go! @Apple Music go/);
 assert.match(apple.elements.prompt.textContent,/playlist widget/);
 assert.match(apple.elements.prompt.textContent,/distinguish ready to save from saved/);
 assert.doesNotMatch(apple.elements.prompt.textContent,/subscription/);
 assert.match(apple.elements.setupPromptText.textContent,/do not require an Apple Music subscription/);
 assert.match(apple.elements.setupPromptText.textContent,/even without a direct playlist-writing tool/);
 const claudeApple=harness(async()=>{},"?ai=claude&service=apple");
 assert.match(claudeApple.elements.setupPromptText.textContent,/compatible MCP connector/);
 assert.doesNotMatch(claudeApple.elements.prompt.textContent,/playlist widget/);

 for(const ai of ['chatgpt','gemini','claude']) for(const service of ['spotify','youtube','apple']){
  let copied='';const h=harness(async s=>copied=s,`?ai=${ai}&service=${service}&mood=criminal&tempo=fast`);
  assert.equal(h.moods[4].attrs['aria-pressed'],'true');
  await h.elements.goButton.click();
  assert.match(copied,/go criminal/);assert.match(copied,/song-level crime narratives/);
  assert.match(copied,/strongly prefer non-English/);assert.match(copied,/Mood angle:/);
  assert.match(copied,/Tempo preference: Fast/);
  assert.doesNotMatch(copied,/blatnaya pesnya|canti di malavita|funk proibidao|rebetiko\/hasiklidika/);
  assert.ok(copied.split(/\s+/).length<115,ai+'/'+service+' Criminal prompt stays short');
  await h.moods[4].click();assert.equal(h.moods[4].attrs['aria-pressed'],'false');assert.doesNotMatch(h.elements.prompt.textContent,/Criminal mood:/);
 }

 const jukeboxHtml=fs.readFileSync('launcher/index.html','utf8');
 assert.equal((jukeboxHtml.match(/id="welcomeSetup"/g)||[]).length,1,'One setup disclosure exists');
 assert.equal((jukeboxHtml.match(/id="stripSetupPrompt"/g)||[]).length,1,'One copy setup action exists');
 assert.doesNotMatch(jukeboxHtml,/<section class="setup-check"/,'Always-visible green setup panel is removed');
 const welcomeMarkup=jukeboxHtml.slice(jukeboxHtml.indexOf('id="welcomeSetup"'),jukeboxHtml.indexOf('</aside>',jukeboxHtml.indexOf('id="welcomeSetup"')));
 for(const id of ['stripSetupPrompt','openSetupAi','setupPromptDetails','setupPromptText','setupTipStatus']) assert.ok(welcomeMarkup.includes('id="'+id+'"'),id+' stays inside expandable welcome disclosure');
 const storage=new Map();let welcomeHarness=harness(async()=>{},'','launch',storage);
 assert.equal(welcomeHarness.elements.welcomeSetup.hidden,false,'New visitors can open the setup note');
 await welcomeHarness.elements.dismissWelcome.click();
 assert.equal(welcomeHarness.elements.welcomeSetup.hidden,true,'Dismiss hides the note immediately');
 assert.equal(welcomeHarness.elements.aiLabel.focused,true,'Dismiss moves keyboard focus to service choices');
 welcomeHarness=harness(async()=>{},'','launch',storage);
 assert.equal(welcomeHarness.elements.welcomeSetup.hidden,true,'Dismiss survives a reload');
 welcomeHarness=harness(async()=>{},'','launch',new Map([['hmg-setup-first-tip-dismissed-v3','yes']]));
 assert.equal(welcomeHarness.elements.welcomeSetup.hidden,true,'Existing dismissals are respected');
 let repeatCopies=[];const repeat=harness(async s=>repeatCopies.push(s));
 await repeat.elements.goButton.click();await repeat.elements.goButton.click();
 assert.equal(repeatCopies.length,2,'Each GO press copies once');
 assert.match(repeatCopies[0],/Fresh-crate discovery lens:/,'A GO copies a fresh discovery lens');
 assert.match(repeatCopies[0],/Random crate spark:/,'GO adds an independently combined random phrase');
 const geminiPrompt=harness(async()=>{},'?ai=gemini&service=youtube').elements.prompt.textContent;
 assert.match(geminiPrompt,/Use Go, Hipster, Go!: go\./,'Plain GO is the full experience');
 assert.match(geminiPrompt,/Create one playlist if the connected app permits/,'GO requests a playable playlist');
 assert.doesNotMatch(geminiPrompt,/go live|curate-only/,'GO has no internal mode jargon');
 const geminiPage=fs.readFileSync('launcher/index.html','utf8');
 assert.doesNotMatch(geminiPage,/geminiCurateOnly|geminiCurateOption/,'No curate-only widget on the Jukebox');
 assert.doesNotMatch(geminiPrompt,/Stage 1|TWO-STAGE|YouTube Music PLAYLIST generation action|CURATED — NOT PUBLISHED/,'Repeated policy stays in installed Skill');
 assert.doesNotMatch(geminiPrompt,/@YouTubeMusic/,'Short GO does not activate a music service');
 assert.ok(geminiPrompt.split(/\\s+/).length<85,'Gemini prompt stays concise');
 const geminiSetup=harness(async()=>{},'?ai=gemini&service=youtube','setup').elements.setupPromptText.textContent;
 assert.match(geminiSetup,/3.6.3/,'Setup asks for installed version verification');
 assert.match(geminiSetup,/persistent Skill/,'Setup distinguishes reading a repo from installation');
 assert.match(geminiSetup,/go-hipster-go-gemini-app-skill\.zip/,'Setup installs the Gemini-specific release ZIP');
 assert.match(geminiSetup,/adapters\/gemini\/GEM_KNOWLEDGE\.md/,'Setup identifies the host-filtered GitHub knowledge');
 assert.doesNotMatch(geminiSetup,/Read https:\/\/github\.com\/focustimer-dev\/go-hipster-go\/blob\/main\/SKILL\.md and its four references/,'Setup must not load shared root skill as Gemini native');
 const setupHtml=fs.readFileSync('launcher/setup/index.html','utf8');
 assert.match(setupHtml,/If you can't tell what you're doing ironically from what you actually enjoy, welcome aboard/);
 assert.match(setupHtml,/Manager, Emeritus/);
 assert.doesNotMatch(setupHtml,/Department of Questionable Sonic Decisions/);
 assert.match(criminalCopies[0],/Optional thread only; vary subjects and regions across the set/);

 assert.match(geminiSetup,/choose Task mode beneath the Gemini prompt box/,'Gemini setup requires Task mode before pasting');
 assert.match(geminiSetup,/do not schedule a recurring task/,'Gemini install task must not be scheduled');
 assert.match(geminiSetup,/desktop or mobile WEB BROWSER/,'ZIP fallback must use Gemini web');
 assert.match(geminiSetup,/Do not direct me to upload the ZIP inside the native Gemini app/,'Native app ZIP upload is not offered');
 const nonGemSetup=harness(async()=>{},'?ai=chatgpt&service=spotify','setup').elements.setupPromptText.textContent;
 assert.doesNotMatch(nonGemSetup,/Task mode|native Gemini app/,'ChatGPT setup is not altered');

 assert.notEqual(repeatCopies[0],repeatCopies[1],'Repeats rotate even with no browser crypto');
 assert.notEqual(repeatCopies[0].match(/Random crate spark: ([^\n]+)/)[1],repeatCopies[1].match(/Random crate spark: ([^\n]+)/)[1],'Each GO changes the spark, even without browser crypto');
 assert.doesNotMatch(harness(async()=>{},'?ai=gemini&service=youtube').elements.prompt.textContent,/@youtube-music/,'Do not suggest unofficial @youtube-music spelling');
 assert.equal(repeat.elements.prompt.textContent,repeatCopies[1],'Receipt matches the copied fresh crate');
 let copies=[];let h=harness(async text=>copies.push(text)),e=h.elements;
 await h.moods[2].click();assert.equal(copies.length,0,'Selecting a mood must not copy');
 await e.goButton.click();assert.match(copies.at(-1),/go sad/,'GO must preserve selected mood');assert.equal(e.openAi.attrs['aria-disabled'],'false');assert.equal(e.goButton.attrs['data-copy-state'],'copied');assert.equal(e.openAi.textContent,'NEXT: OPEN CHATGPT');
 await h.services[2].click();assert.equal(copies.length,1,'Changing service must not silently copy');assert.equal(e.goButton.attrs['data-copy-state'],'idle');assert.equal(e.openAi.attrs['aria-disabled'],'true');assert.equal((await e.openAi.click()).prevented,true,'Stale handoff must be blocked');
 await e.goButton.click();assert.match(copies.at(-1),/Apple Music/);assert.match(copies.at(-1),/go sad/);
 await h.ais[1].click();assert.match(e.receiptSummary.textContent,/Gemini · Apple Music/,'Changing AI preserves the music service');assert.equal(e.openAi.attrs['aria-disabled'],'true');await e.goButton.click();assert.match(copies.at(-1),/Apple Music/);
 await h.moods[2].click();await e.goButton.click();assert.doesNotMatch(copies.at(-1),/go sad/,'Second mood tap clears mood');
 await e.stripSetupPrompt.click();assert.match(copies.at(-1),/FIRST-TIME SETUP CHECK/);assert.equal(e.openAi.attrs['aria-disabled'],'true','Setup copy invalidates playlist clipboard');
 e.tempoSlider.value='5';await e.tempoSlider.events.input();assert.equal(e.openAi.attrs['aria-disabled'],'true');assert.equal(copies.length,5,'Tempo selection does not copy');
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
 copies=[];h=harness(async text=>copies.push(text),'','setup');e=h.elements;
 await e.copyTailoredSetup.click();assert.match(copies.at(-1),/FIRST-TIME SETUP CHECK/);assert.equal(e.copyTailoredSetup.attrs['data-copy-state'],'copied');assert.equal(e.openSelectedAi.textContent,'NEXT: OPEN CHATGPT');
 await h.services[0].click();await h.ais[1].click();assert.match(e.recipeIntro.textContent,/Gemini × Spotify/,'Manual preserves service across AI changes');assert.equal(e.copyTailoredSetup.attrs['data-copy-state'],'idle');assert.equal(e.openSelectedAi.textContent,'OPEN GEMINI');
 h=harness(async()=>{throw Error('blocked')},'','setup');await h.elements.copyTailoredSetup.click();assert.equal(h.elements.setupPromptDetails.open,true);assert.equal(h.elements.copyTailoredSetup.attrs['data-copy-state'],'idle');
 h=harness(()=>new Promise(resolve=>{finish=resolve}),'','setup');const setupPending=h.elements.copyTailoredSetup.click();await h.ais[1].click();finish();await setupPending;assert.equal(h.elements.openSelectedAi.attrs['data-copy-ready'],'false');
 console.log('PASS: mood selection, reset, current-copy handoff, setup invalidation, blocked clipboard, copy race');
})().catch(e=>{console.error(e);process.exit(1)});
