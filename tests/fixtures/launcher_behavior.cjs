const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
class Element{
 constructor(dataset={}){this.dataset=dataset;this.attrs={};this.events={};this.children=[];this.textContent='';this.hidden=false;this.open=false;this.classList={toggle(){}};}
 focus(){this.focused=true;if(this.ownerDocument)this.ownerDocument.activeElement=this}
 replaceChildren(){this.children=[]}
 append(...children){for(const child of children)this.insertBefore(child,null)}
 insertBefore(child,before){child.remove();const index=before?this.children.indexOf(before):this.children.length;this.children.splice(index,0,child);child.parentElement=this}
 remove(){if(this.parentElement){const siblings=this.parentElement.children;siblings.splice(siblings.indexOf(this),1);this.parentElement=null}if(this.ownerDocument?.activeElement===this)this.ownerDocument.activeElement=this.ownerDocument.body}
 setAttribute(k,v){this.attrs[k]=v}
 getAttribute(k){return this.attrs[k]||'0 0 720 372'}
 getBoundingClientRect(){return {left:0,top:0,width:360,height:300}}
 addEventListener(k,f,options){this.events[k]=f;this.eventOptions||={};this.eventOptions[k]=options}
 querySelector(){return this.span||(this.span=Object.assign(new Element(),{ownerDocument:this.ownerDocument}))}
 async click(){this.focus();const event={preventDefault(){this.prevented=true}};await this.events.click?.(event);return event}
}
function harness(write,search='',page='launch',storage=new Map(),runtime={}){
 const ids=['welcomeSetup','dismissWelcome','crateGeo','atlasPassport','atlasNamedRegions','atlasLocator','atlasHome','atlasInstruction','atlasStamps','crateAtlasMap','crateGeoStatus','crateGeoClear','aiLabel','copyTailoredSetup','recipeIntro','recipeSteps','recipeResources','recipeCaveat','openSelectedAi','dealerPair','tempoControl','tempoDetails','tempoSummary','tempoHelp','moodHelp','tempoSlider','tempoValue','anyTempo','copyStatus','routeStatus','prompt','moodName','receiptCode','promptReceipt','receiptCopy','openAi','browserAi','manualOpenAi','receiptSummary','goHint','goButton','stripSetupPrompt','setupPromptText','setupPromptDetails','setupTipStatus','openSetupAi','promptDetails','shareButton'];
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const ais=['chatgpt','gemini','claude'].map(ai=>new Element({ai}));
 const services=['spotify','youtube','apple'].map(service=>new Element({service}));
 const moods=['happy','angry','sad','weird','criminal'].map(mood=>new Element({mood}));
 const launchMarkup=fs.readFileSync('launcher/index.html','utf8');
 const crateRegions=[...launchMarkup.matchAll(/data-crate-region="([^"]+)" data-continent="([^"]+)"/g)].map(m=>new Element({crateRegion:m[1],continent:m[2]}));
 const crateContinents=[...launchMarkup.matchAll(/data-crate-continent="([^"]+)"/g)].map(m=>new Element({crateContinent:m[1]}));
 const atlasCountries=[...launchMarkup.matchAll(/data-atlas-country="([^"]+)" data-atlas-region="([^"]+)" data-atlas-continent="([^"]+)"/g)].map(m=>new Element({atlasCountry:m[1],atlasRegion:m[2],atlasContinent:m[3]}));
 const atlasZones=[...launchMarkup.matchAll(/class="crate-map-zone" data-atlas-zone="([^"]*)"/g)].map(m=>new Element({atlasZone:m[1]}));
 const groups={'[data-ai]':ais,'[data-service]':services,'[data-mood]':moods,'[data-crate-region]':crateRegions,'[data-crate-continent]':crateContinents,'[data-atlas-country]':atlasCountries,'[data-atlas-zone]':atlasZones,'[data-setup]':[]};
 const doc={activeElement:null,body:{dataset:{page},appendChild(){}},getElementById:id=>elements[id]||null,querySelectorAll:q=>groups[q]||[],createElement:()=>Object.assign(new Element(),{ownerDocument:doc,style:{},select(){}}),execCommand:()=>false};
 for(const node of [...Object.values(elements),...Object.values(groups).flat()])node.ownerDocument=doc;
 vm.runInNewContext(fs.readFileSync('launcher/assets/app.js','utf8'),{document:doc,navigator:{clipboard:{writeText:write}},localStorage:{getItem(key){return storage.get(key)||null},setItem(key,value){storage.set(key,value)}},URL,URLSearchParams,location:{search,pathname:'/',href:'https://example.test/'},history:{replaceState(){}},...runtime});
 return {elements,ais,services,moods,crateRegions,crateContinents,atlasCountries,atlasZones,doc};
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
 // Cartographer's Desk: authentic land polygons and continent drilldown.
 const geographicMarkup=fs.readFileSync('launcher/index.html','utf8');
 assert.ok((geographicMarkup.match(/data-atlas-country=/g)||[]).length>=175,'Actual country-shaped hit paths rather than rectangular overlays');
 assert.equal((geographicMarkup.match(/<rect class="crate-map-region"/g)||[]).length,0,'No old rectangular hitboxes');
 assert.equal((geographicMarkup.match(/<button type="button" data-crate-region=/g)||[]).length,24);
 assert.equal((geographicMarkup.match(/data-atlas-country="USA"/g)||[]).length,2,'US has distinct East and West path hit targets');
 assert.equal((geographicMarkup.match(/data-atlas-country="CAN"/g)||[]).length,2,'Canada has distinct East and West path hit targets');
 assert.equal((geographicMarkup.match(/data-atlas-region="mexico"/g)||[]).length,1,'Mexico has its own hit area');
 assert.match(geographicMarkup,/data-atlas-region="central-america"/);
 assert.match(geographicMarkup,/class="crate-zone-boundaries"/,'Map draws unified listening-zone and coastline borders');
 assert.match(geographicMarkup,/<title>Central Asia · listening territory<\/title>/,'Hover names listening zones, not countries');
 assert.doesNotMatch(geographicMarkup,/<title>Afghanistan ·/,'Country names no longer imply geographic precision in tooltip');
 const atlasCss=fs.readFileSync('launcher/assets/hipster.css','utf8');
 assert.match(atlasCss,/\.crate-map-countries \.crate-map-zone path\{fill:[^}]+stroke:none/,'Country borders are suppressed');
 assert.match(geographicMarkup,/class="crate-accessibility"/);
 assert.ok(geographicMarkup.indexOf('class="crate-accessibility"')<geographicMarkup.indexOf('data-crate-continent='),'Text continent controls are behind the disclosure');
 assert.doesNotMatch(geographicMarkup,/id="atlasPaintAll"|id="crateGeoCount"|id="atlasStampCount"/,'No redundant map confirmations');
 assert.match(geographicMarkup,/id="atlasPassport"/);
 assert.equal((geographicMarkup.match(/data-crate-continent=/g)||[]).length,6);
 assert.match(geographicMarkup,/id="atlasStamps"/);
 assert.match(geographicMarkup,/id="crateAtlasMap"/);
 const atlasStore=new Map(),atlasCopies=[];
 let atlas=harness(async text=>atlasCopies.push(text),'?ai=gemini&service=youtube&mood=criminal','launch',atlasStore);
 assert.equal(atlas.elements.atlasPassport.hidden,true,'Blank map has no passport strip');
 assert.doesNotMatch(atlas.elements.prompt.textContent,/Regional exploration:/);
 const africa=atlas.crateContinents.find(b=>b.dataset.crateContinent==='africa');
 await africa.click();
 assert.equal(africa.attrs['aria-pressed'],'true','Continent click zooms without selecting any regions');
 assert.equal(atlas.elements.atlasPassport.hidden,true,'Zoom alone must not restrict discovery');
 assert.equal(atlas.elements.atlasHome.hidden,false,'Return-to-world control available');
 assert.equal(atlas.crateRegions.filter(b=>!b.hidden).length,4,'Only African regional buttons visible');
 assert.equal(atlas.elements.crateAtlasMap.attrs.viewBox, '304 128 190 231', 'ViewBox moves on focus in environments without animation');
 // One finger pans the camera; taps remain region selections.
 const svg=atlas.elements.crateAtlasMap;
 let consumed=false;
 svg.events.touchstart({touches:[{clientX:120,clientY:115}],cancelable:true,preventDefault(){consumed=true}});
 assert.equal(consumed,false,'A stationary one-finger start leaves tapping available');
 svg.events.touchmove({touches:[{clientX:120,clientY:160}],cancelable:true,preventDefault(){consumed=true}});
 assert.equal(consumed,true,'One finger drags the map');
 assert.notEqual(svg.getAttribute('viewBox'),'304 128 190 231','One-finger dragging changes camera position');
 svg.events.touchend({touches:[]});
 await atlas.atlasCountries.find(b=>b.dataset.atlasRegion==='east-africa').click();
 assert.equal(atlas.elements.atlasPassport.hidden,true,'Dragging cannot accidentally stamp a territory');
 const touch=(x,y)=>({clientX:x,clientY:y});
 let claimedStart=false;
 svg.events.touchstart({touches:[touch(120,120),touch(220,120)],cancelable:true,preventDefault(){claimedStart=true}});
 assert.equal(claimedStart,true,'Two-finger start claims the gesture before the browser takes over');
 assert.equal(svg.eventOptions.touchstart.passive,false,'Touchstart permits cancellation only for two fingers');
 let consumedPinch=false;
 svg.events.touchmove({touches:[touch(85,130),touch(245,130)],cancelable:true,preventDefault(){consumedPinch=true}});
 assert.equal(consumedPinch,true,'Two finger pinch is handled without page zoom');
 const zoomed=svg.getAttribute('viewBox').split(/\s+/).map(Number);
 assert.ok(zoomed[2]<190&&zoomed[3]<231,'Pinching outward magnifies the selected continent');
 await atlas.atlasCountries.find(b=>b.dataset.atlasRegion==='east-africa').click();
 assert.equal(atlas.elements.atlasPassport.hidden,true,'A pinch cannot accidentally select a region');
 const oldX=zoomed[0],oldY=zoomed[1];
 svg.events.touchmove({touches:[touch(105,150),touch(265,150)],cancelable:true,preventDefault(){}});
 const panned=svg.getAttribute('viewBox').split(/\s+/).map(Number);
 assert.ok(panned[0]!==oldX||panned[1]!==oldY,'Two-finger translation pans map');
 svg.events.touchend({touches:[]});
 assert.equal(atlas.elements.atlasHome.hidden,false,'Return-home accessible after pinch');
 // Ctrl-wheel from a trackpad should also zoom without selecting countries.
 const beforeWheel=svg.getAttribute('viewBox').split(/\s+/).map(Number);
 svg.events.wheel({clientX:160,clientY:130,deltaX:0,deltaY:-50,ctrlKey:true,cancelable:true,preventDefault(){}});
 const afterWheel=svg.getAttribute('viewBox').split(/\s+/).map(Number);
 assert.ok(afterWheel[2]<beforeWheel[2],'Trackpad pinch zooms map');
 let pageScrollBlocked=false;
 const ordinaryView=svg.getAttribute('viewBox');
 svg.events.wheel({clientX:160,clientY:130,deltaX:0,deltaY:100,cancelable:true,preventDefault(){pageScrollBlocked=true}});
 assert.equal(pageScrollBlocked,false,'Ordinary mouse/trackpad scrolling stays with the page');
 assert.equal(svg.getAttribute('viewBox'),ordinaryView,'Ordinary scrolling does not pan the map');
 let panHandled=false;
 svg.events.wheel({clientX:160,clientY:130,deltaX:20,deltaY:10,shiftKey:true,cancelable:true,preventDefault(){panHandled=true}});
 assert.equal(panHandled,true,'Shift-scroll intentionally pans the map');


 await atlas.crateRegions.find(b=>b.dataset.crateRegion==='east-africa').click();
 assert.equal(atlas.elements.atlasPassport.hidden,false,'Selection reveals the passport');
 assert.match(atlas.elements.prompt.textContent,/Regional exploration: East Africa/);
 assert.match(atlasStore.get('ghg-crate-map-regions-v1'),/east-africa/);
 assert.equal(atlas.elements.atlasStamps.children.length,1,'Selected region creates a removable stamp');
 assert.equal(atlas.elements.atlasStamps.children[0].children[0].textContent,'E AFR','Compact stamp label is regional');
 assert.equal(atlas.atlasZones.find(z=>z.dataset.atlasZone==='east-africa').attrs['data-selected'],'true','Map matches stamp selection');
 const originalStamp=atlas.elements.atlasStamps.children[0];
 originalStamp.focus();
 svg.events.wheel({clientX:160,clientY:130,deltaX:0,deltaY:-10,ctrlKey:true,cancelable:true,preventDefault(){}});
 assert.equal(atlas.elements.atlasStamps.children[0],originalStamp,'Viewport movement preserves stamp nodes');
 assert.equal(atlas.doc.activeElement,originalStamp,'Viewport movement preserves keyboard focus');
 await atlas.elements.goButton.click();
 assert.match(atlasCopies.at(-1),/East Africa/);
 const country=atlas.atlasCountries.find(b=>b.dataset.atlasRegion==='west-africa');
 await country.click();
 assert.doesNotMatch(atlas.elements.prompt.textContent,/West Africa/,'Immediate post-pinch click cannot stamp an accidental location');
 await new Promise(resolve=>setTimeout(resolve,730));
 await country.click();
 assert.match(atlas.elements.prompt.textContent,/West Africa/,'Deliberate country tap works after gesture protection');
 for(const id of ['north-africa','central-southern-africa'])await atlas.crateRegions.find(b=>b.dataset.crateRegion===id).click();
 assert.match(atlas.elements.prompt.textContent,/Africa/,'Whole-continent inking compresses prompt to one term');
 assert.equal(atlas.elements.openAi.attrs['aria-disabled'],'true');
 await atlas.elements.atlasStamps.children[0].click();
 assert.doesNotMatch(atlas.elements.prompt.textContent,/Regional exploration: Africa\./,'Stamp is removable without reset');
 await atlas.elements.atlasHome.click();
 assert.equal(atlas.elements.atlasHome.hidden,true);
 await atlas.crateContinents.find(b=>b.dataset.crateContinent==='europe').click();
 assert.equal(atlas.crateRegions.filter(b=>!b.hidden).length,4);
 assert.equal(atlas.elements.atlasLocator.textContent,'LISTENING MAP / Europe');

 // Visible shapes stay selectable after navigating beyond a focused continent.
 const crossAtlas=harness(async()=>{});
 await crossAtlas.crateContinents.find(b=>b.dataset.crateContinent==='europe').click();
 const crossView=crossAtlas.elements.crateAtlasMap.getAttribute('viewBox');
 await crossAtlas.atlasCountries.find(b=>b.dataset.atlasRegion==='north-africa').click();
 assert.match(crossAtlas.elements.prompt.textContent,/North Africa/,'Adjacent continent can be selected without Whole World');
 assert.equal(crossAtlas.elements.atlasLocator.textContent,'LISTENING MAP / Africa','Named controls follow the tapped region');
 assert.equal(crossAtlas.elements.crateAtlasMap.getAttribute('viewBox'),crossView,'Cross-continent selection does not move the target away');
 await crossAtlas.atlasCountries.find(b=>b.dataset.atlasRegion==='mediterranean-europe').click();
 assert.match(crossAtlas.elements.prompt.textContent,/Mediterranean & Balkans/,'Can select back across the boundary without reset');
 assert.match(crossAtlas.elements.prompt.textContent,/North Africa/,'Cross-continent selection preserves earlier stamps');
 assert.doesNotMatch(atlasCss,/path\[data-remote=true\]\{pointer-events:none/,'Painted regions must not be disabled by a stale continent focus');

 // A fresh one-finger tap after a pinch is not the pinch's synthetic click.
 const touchAtlas=crossAtlas.elements.crateAtlasMap;
 touchAtlas.events.touchstart({touches:[touch(120,120),touch(220,120)]});
 touchAtlas.events.touchmove({touches:[touch(110,120),touch(230,120)],cancelable:true,preventDefault(){}});
 touchAtlas.events.touchend({touches:[]});
 const eastAsia=crossAtlas.atlasCountries.find(b=>b.dataset.atlasRegion==='east-asia');
 await eastAsia.click();
 assert.doesNotMatch(crossAtlas.elements.prompt.textContent,/East Asia/,'Pinch synthetic click remains suppressed');
 touchAtlas.events.touchstart({touches:[touch(150,130)]});
 touchAtlas.events.touchend({touches:[]});
 await eastAsia.click();
 assert.match(crossAtlas.elements.prompt.textContent,/East Asia/,'A deliberate fresh tap works immediately after pinch');

 // North America is not a redundant listening category: US/Canada sides,
 // Mexico and Central America are each independent.
 await atlas.elements.atlasHome.click();
 await atlas.crateContinents.find(b=>b.dataset.crateContinent==='americas-north').click();
 assert.equal(atlas.crateRegions.filter(b=>!b.hidden).length,7,'North America has seven distinct listening territories');
 await atlas.crateRegions.find(b=>b.dataset.crateRegion==='us-west').click();
 await atlas.crateRegions.find(b=>b.dataset.crateRegion==='canada-east').click();
 await atlas.crateRegions.find(b=>b.dataset.crateRegion==='mexico').click();
 assert.match(atlas.elements.prompt.textContent,/US West/);
 assert.match(atlas.elements.prompt.textContent,/Canada East/);
 assert.match(atlas.elements.prompt.textContent,/Mexico/);
 assert.doesNotMatch(atlas.elements.prompt.textContent,/Mexico & Central America/,'Mexico is no longer bundled with Central America');
 assert.doesNotMatch(atlas.elements.prompt.textContent,/Regional exploration: N\. America/,'The generic continent cannot override detailed region selections');
 const legacyNorth=harness(async()=>{},'?mood=criminal','launch',new Map([['ghg-crate-map-regions-v1','["north-america","mexico-central"]']]));
 assert.equal(legacyNorth.elements.atlasStamps.children.length,6,'Legacy broad areas migrate to six precise stamps');
 assert.match(legacyNorth.elements.prompt.textContent,/US East/);
 assert.match(legacyNorth.elements.prompt.textContent,/Canada West/);
 assert.match(legacyNorth.elements.prompt.textContent,/Mexico/);
 assert.match(legacyNorth.elements.prompt.textContent,/Central America/);
 assert.doesNotMatch(legacyNorth.elements.prompt.textContent,/North America/);
 atlas=harness(async()=>{},'?mood=criminal','launch',atlasStore);
 assert.match(atlas.elements.prompt.textContent,/West Africa/,'Inked regions survive reloading');
 await atlas.elements.crateGeoClear.click();
 assert.equal(atlas.elements.atlasPassport.hidden,true,'Clearing hides passport');
 assert.doesNotMatch(atlas.elements.prompt.textContent,/Regional exploration:/);
 const badAtlas=harness(async()=>{},'?mood=criminal','launch',new Map([['ghg-crate-map-regions-v1','["ghost-region",3,"caribbean"]']]));
 assert.equal(badAtlas.elements.atlasStamps.children.length,1,'Invalid persisted region IDs ignored');
 await badAtlas.crateRegions.find(b=>b.dataset.crateRegion==='caribbean').click();
 assert.equal(badAtlas.elements.atlasPassport.hidden,true,'Removing final stamp hides passport');

 const focusAtlas=harness(async()=>{});
 const choose=id=>focusAtlas.crateRegions.find(b=>b.dataset.crateRegion===id).click();
 await choose('us-east');await choose('canada-west');await choose('us-west');
 let stamps=focusAtlas.elements.atlasStamps.children;
 assert.deepEqual(stamps.map(b=>b.dataset.crateStampRegion),['us-west','us-east','canada-west'],'Stamp ordering stays geographic, not click order');
 const survivingStamp=stamps[1];
 await stamps[0].click();
 assert.equal(focusAtlas.doc.activeElement,survivingStamp,'Removing a stamp focuses the next stamp');
 await focusAtlas.moods[0].click();
 assert.equal(focusAtlas.elements.atlasStamps.children[0],survivingStamp,'Unrelated mood changes preserve stamp identity');
 await focusAtlas.elements.atlasStamps.children[1].click();
 assert.equal(focusAtlas.doc.activeElement,survivingStamp,'Removing the last stamp in a list focuses the previous stamp');
 await survivingStamp.click();
 assert.equal(focusAtlas.doc.activeElement,focusAtlas.elements.atlasNamedRegions.querySelector('summary'),'Removing the final selection focuses Choose by name');

 let nextFrame=0;const frames=new Map();
 const batched=harness(async()=>{},'','launch',new Map(),{requestAnimationFrame:callback=>{frames.set(++nextFrame,callback);return nextFrame},cancelAnimationFrame:id=>frames.delete(id)});
 const batchedMap=batched.elements.crateAtlasMap;
 let viewWrites=0;const originalSet=batchedMap.setAttribute.bind(batchedMap);
 batchedMap.setAttribute=(key,value)=>{if(key==='viewBox')viewWrites++;originalSet(key,value)};
 for(let i=0;i<20;i++)batchedMap.events.wheel({clientX:160,clientY:130,deltaX:0,deltaY:-1,ctrlKey:true,cancelable:true,preventDefault(){}});
 assert.equal(frames.size,1,'A burst of map events schedules one frame');
 assert.equal(viewWrites,0,'Map viewBox waits for the frame');
 const callbacks=[...frames.values()];frames.clear();for(const callback of callbacks)callback(0);
 assert.equal(viewWrites,1,'A burst paints one map frame');
 assert.ok(Number(batchedMap.getAttribute('viewBox').split(' ')[2])<720,'Batched input retains accumulated zoom');
 await batched.crateContinents.find(b=>b.dataset.crateContinent==='europe').click();
 assert.equal(frames.size,1,'Opening a continent schedules a zoom');
 const pressedView=batchedMap.getAttribute('viewBox');
 batchedMap.events.pointerdown();
 assert.equal(frames.size,0,'A new press stops the camera from moving under the pointer');
 assert.equal(batchedMap.getAttribute('viewBox'),pressedView,'Stopping a zoom preserves the visible hit geometry');
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
 await e.tempoSlider.events.pointerup();assert.equal(e.tempoControl.attrs['data-tempo'],'moderate','Touching the parked fader explicitly selects its pace');
 e.tempoSlider.value='3';await e.tempoSlider.events.input();assert.equal(e.tempoControl.attrs['data-tempo'],'moderate','Mid-tempo has its own position, separate from Any');
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

 const usedStore=new Map();const used=harness(async()=>{},'','launch',usedStore);
 assert.equal(used.elements.tempoSlider.value,3,'Bypassed fader parks at the center; Any remains separate');
 for(const [value,label] of [[1,'Slow'],[2,'Relaxed'],[3,'Mid-tempo'],[4,'Brisk'],[5,'Fast']]){
  used.elements.tempoSlider.value=String(value);await used.elements.tempoSlider.events.input();
  assert.equal(used.elements.tempoSummary.textContent,label,'Collapsed tempo summary follows the actual preference');
  assert.match(used.elements.prompt.textContent,new RegExp('Tempo preference: '+label));
 }
 await used.elements.anyTempo.click();
 assert.equal(used.elements.tempoSummary.textContent,'Any tempo');
 assert.doesNotMatch(used.elements.prompt.textContent,/Tempo preference:/,'Any tempo adds no false pace instruction');
 assert.equal(usedStore.has('ghg-jukebox-used-v1'),false,'Selecting preferences alone does not claim a completed visit');
 await used.elements.goButton.click();
 assert.equal(usedStore.get('ghg-jukebox-used-v1'),'yes','Successful GO remembers repeat-use layout');
 const root={dataset:{}};const bootstrap=jukeboxHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
 vm.runInNewContext(bootstrap,{document:{documentElement:root},localStorage:{getItem:key=>usedStore.get(key)},URLSearchParams,location:{search:""}});
 assert.equal(root.dataset.returning,'true','Repeat-use layout is established before the stylesheet loads');
 const introRoot={dataset:{}};
 vm.runInNewContext(bootstrap,{document:{documentElement:introRoot},localStorage:{getItem:key=>usedStore.get(key)},URLSearchParams,location:{search:'?intro=1'}});
 assert.equal(introRoot.dataset.returning,undefined,'URL override previews the first visit despite saved successful use');
 assert.equal(usedStore.get('ghg-jukebox-used-v1'),'yes','Intro preview preserves normal returning state');

 assert.ok(!jukeboxHtml.includes('<details class="dealer-drawer"'),'Service controls require no disclosure tap');
 assert.ok(!jukeboxHtml.includes('id="tempoDetails"'),'Tempo requires no disclosure tap');
 const deniedStore=new Map(),denied=harness(async()=>{throw Error('blocked')},'','launch',deniedStore);
 await denied.elements.goButton.click();
 assert.equal(deniedStore.has('ghg-jukebox-used-v1'),false,'Failed clipboard copy does not mark first use complete');
 await used.moods[4].click();assert.match(used.elements.moodHelp.textContent,/Songs about crime/,'Criminal explains narrative meaning at selection');
 assert.equal((setupHtml.match(/data-setup="universal"/g)||[]).length,1,'Universal installation has one secondary home');
 assert.ok(jukeboxHtml.indexOf('id="crateGeo"')<jukeboxHtml.indexOf('class="mood-grid"'),'Optional exploration precedes the mood-to-GO workbench');
 assert.ok(jukeboxHtml.indexOf('class="mood-grid"')<jukeboxHtml.indexOf('id="goButton"'),'Mood choice leads directly to GO');
 const stamped=harness(async()=>{});
 assert.equal(stamped.elements.receiptCopy.textContent,'REQUEST DRAFT');
 await stamped.elements.goButton.click();
 assert.equal(stamped.elements.receiptCopy.textContent,'COPIED TO CLIPBOARD','Only successful current copies earn a receipt stamp');
 await stamped.moods[0].click();
 assert.equal(stamped.elements.promptReceipt.attrs['data-copy-state'],'idle','Changed preferences invalidate the stamped request');
 assert.equal(stamped.elements.receiptCopy.textContent,'REQUEST DRAFT');
 assert.match(stamped.elements.moodHelp.textContent,/Happy selected.*Optimism/);
 const unstamped=harness(async()=>{throw Error('blocked')});
 await unstamped.elements.goButton.click();
 assert.equal(unstamped.elements.receiptCopy.textContent,'REQUEST DRAFT','Clipboard failures cannot earn a stamp');
 let release;const racingStamp=harness(()=>new Promise(resolve=>{release=resolve}));
 const copyingStamp=racingStamp.elements.goButton.click();
 assert.equal(racingStamp.elements.receiptCopy.textContent,'COPYING…');
 await racingStamp.moods[1].click();release();await copyingStamp;
 assert.equal(racingStamp.elements.receiptCopy.textContent,'REQUEST DRAFT','An outdated in-flight copy cannot stamp the new request');
 const sparkBank=JSON.parse(fs.readFileSync('references/mood-spark-bank.json','utf8'));
 for(const selected of ['happy','angry','sad','weird','criminal']){
  const sparkStore=new Map(),outputs=[];
  let sparkHarness=harness(async t=>outputs.push(t),'?mood='+selected,'launch',sparkStore);
  for(let n=0;n<50;n++){
   if(n===25)sparkHarness=harness(async t=>outputs.push(t),'?mood='+selected,'launch',sparkStore);
   await sparkHarness.elements.goButton.click();
  }
  const parts=outputs.map(t=>t.match(/Random crate spark: ([^\n]+)/)[1].replace(/\.$/,'').split(' / '));
  assert.equal(new Set(parts.map(p=>p[2])).size,50,'Every mood image is used before recycling, including across reloads');
  assert.ok(parts.every(p=>sparkBank[selected].map(s=>s.toLowerCase()).includes(p[2])),'Images stay in the selected mood');
  assert.equal(new Set(parts.slice(0,10).map(p=>p[0])).size,10,'Texture rotates independently');
  assert.equal(new Set(parts.slice(0,10).map(p=>p[1])).size,10,'Setting rotates independently');
 }
 const slowCopies=[],slowSparks=harness(async t=>slowCopies.push(t),'?mood=angry&tempo=slow');
 for(let i=0;i<50;i++)await slowSparks.elements.goButton.click();
 assert.ok(slowCopies.every(t=>!/blast beats|breakcore|frenz|redline|tempo push|headbang|mosh/i.test(t.match(/Random crate spark: ([^\n]+)/)[1])),'Slow anger avoids overt speed-conflicting sparks');
 console.log('PASS: mood selection, reset, current-copy handoff, setup invalidation, blocked clipboard, copy race');
})().catch(e=>{console.error(e);process.exit(1)});
