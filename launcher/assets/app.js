/* HIPSTER GO: user-selectable crate digging, no imaginary music writers. */
(function(){
"use strict";
const doc=document,body=doc.body;
const defaultService={chatgpt:"spotify",gemini:"youtube",claude:"apple"};
const aiNames={chatgpt:"ChatGPT",gemini:"Gemini",claude:"Claude"};
const serviceNames={spotify:"Spotify",youtube:"YouTube Music",apple:"Apple Music"};
const destinations={chatgpt:"https://chatgpt.com/",gemini:"https://gemini.google.com/app",claude:"https://claude.ai/"};
const geminiIntent="intent://gemini.google.com/app#Intent;scheme=https;package=com.google.android.apps.bard;S.browser_fallback_url=https%3A%2F%2Fgemini.google.com%2Fapp;end";
let copiedPrompt=null;
const tempoNames={slow:"Slow",relaxed:"Relaxed",moderate:"Mid-tempo",brisk:"Brisk",fast:"Fast"};
const tempoSteps=Object.keys(tempoNames);
const moods=new Set(["go","happy","angry","sad","weird"]);
function stored(key){try{return localStorage.getItem(key)}catch(e){return null}}
function store(key,v){try{localStorage.setItem(key,v)}catch(e){}}
function status(message){const e=doc.getElementById("copyStatus");if(e)e.textContent=message}
async function copyText(text){
 try{await navigator.clipboard.writeText(text);return true}
 catch(e){
  const t=doc.createElement("textarea");t.value=text;t.style.cssText="position:fixed;left:-9999px;opacity:0";doc.body.appendChild(t);t.select();
  let ok=false;try{ok=doc.execCommand("copy")}catch(err){}t.remove();return ok;
 }
}
const repo="https://github.com/focustimer-dev/hipster-music-generator";
const releases=repo+"/releases/latest/download/";
const resourceInfo={
 chatgpt:[{name:"Go, Hipster, Go! source",url:repo}],
 gemini:[{name:"Gemini Skill ZIP",url:releases+"go-hipster-go-gemini-app-skill.zip"},{name:"Gemini installation guide",url:repo+"/blob/main/adapters/gemini/README.md"}],
 claude:[{name:"Claude Skill ZIP",url:releases+"go-hipster-go-claude-skill.zip"},{name:"Claude Plugin ZIP",url:releases+"go-hipster-go-claude-plugin.zip"},{name:"Which one? Claude guide",url:repo+"/blob/main/adapters/claude/README.md"}]
};
function routeInfo(ai,service){
 if(ai==="chatgpt"&&service==="spotify")return {tone:"ready",message:"ChatGPT + Spotify: playlist creation and exact-track insertion can work when both apps and their writer actions are available.",note:"You still need to select and authorize both apps in ChatGPT; mentioning them in text alone may not activate them."};
 if(ai==="gemini"&&service==="youtube")return {tone:"ready",message:"Gemini + YouTube Music: mood-based playlist generation is supported; exact song versions/order may differ.",note:"Use Gemini's YouTube Music connected app, and tap Save to library when offered."};
 if(ai==="gemini"&&service==="spotify")return {tone:"warn",message:"Gemini + Spotify: search and playback work on supported mobile accounts, but Google's Spotify connection cannot create playlists.",note:"You can still curate an exact text tracklist and play/search Spotify; don't expect a new saved Spotify playlist."};
 if(ai==="claude"&&service==="spotify")return {tone:"ready",message:"Claude + Spotify: connected discovery works; prompted playlists are a Premium feature and provider save behavior can vary.",note:"Enable Spotify in Claude's connectors and verify whether the available writer can actually create/save the playlist."};
 if(ai==="claude"&&service==="apple")return {tone:"warn",message:"Claude + Apple Music: requires an Apple Music MCP connector with playlist-writing tools.",note:"Use a compatible local connector on Desktop or a hosted connector for web/mobile. Run the setup check to verify track search and playlist creation."};
 if(ai==="chatgpt"&&service==="apple")return {tone:"warn",message:aiNames[ai]+" + Apple Music: possible when the relevant music app/connector is available, but playlist-writing access must be checked.",note:"Look for Apple Music in your AI's apps/connectors; do not assume the connection permits exact playlist creation."};
 return {tone:"warn",message:aiNames[ai]+" + "+serviceNames[service]+": playlist-writing support isn't confirmed for this pairing.",note:"The skill can still curate a verified text playlist; publish only if the AI exposes a real authorized writer."};
}
function setupPrompt(ai,service){
 const name=aiNames[ai],target=serviceNames[service];
 const intro=ai==="chatgpt"?"In ChatGPT, check for the Go, Hipster, Go! plugin/app.":ai==="gemini"?"In Gemini, check for the installed Go, Hipster, Go! Skill (not a Gem).":"In Claude, check for the Go, Hipster, Go! skill or plugin.";
 const install=ai==="gemini"?"If missing, guide me to Customize → Skills and the current Gemini Skill ZIP.":ai==="claude"?"If missing, identify whether I need Claude's Skills ZIP or Plugins ZIP; they are different.":"If missing, use the available app/skill installation flow or show how to install from the project's GitHub repository.";
 return "FIRST-TIME SETUP CHECK for "+name+" + "+target+".\n"+intro+" "+install+" Source: "+repo+
 (ai==="claude"&&service==="apple"?"\nApple Music requires a compatible MCP connector: local for Desktop or hosted for web/mobile. Check which Claude app I use and help me connect it if missing. Verify catalog track search, playlist creation and adding tracks; library-only search may not find new recordings.":"")+
 "\nIf the skill is available, run its setup for "+target+", guide me through connecting or selecting that music service, and CHECK whether playlist creation and adding tracks are actually supported—not just search/playback. Tell me the smallest action needed to finish setup. If everything is already ready, say so and tell me to run go. Do NOT generate a new playlist during this setup check, claim a playlist was saved, or ask me to paste credentials into chat.";
}
const universalPrompt="Load Go, Hipster, Go! from "+repo+". Read SKILL.md and the referenced musical taxonomy. Use your supported skill/plugin installation mechanism, confirm what actually loaded and whether it persists, then run setup. Do not assume a streaming playlist writer exists.";
function goCommand(ai,service,mood){
 const go=mood==="go"?"go":"go "+mood;
 if(ai==="chatgpt"&&service==="spotify")return "@Go, Hipster, Go! @Spotify "+go;
 if(ai==="gemini"&&service==="youtube")return "@go-hipster-go "+go+" @youtube-music";
 if(ai==="gemini"&&service==="spotify")return "@go-hipster-go "+go+" @Spotify";
 if(ai==="claude")return "Use Go, Hipster, Go!: "+go+". Preferred music service: "+serviceNames[service]+".";
 return "@Go, Hipster, Go! "+go+" — destination "+serviceNames[service];
}
const thesis="Curate 12 verified deep-cut recordings around a cohesive sonic thesis. Explore surprising links across scenes, eras, rhythm, voice, production and instrumentation. Keep the transitions listenable, not just clever. Avoid recycled example-artist lists and never invent track matches.";
function goPrompt(ai,service,mood){
 let handoff;
 if(ai==="chatgpt"&&service==="spotify")handoff="Resolve exact Spotify track versions and publish in the chosen order if an authorized writer is exposed. Read back the saved count/order if possible.";
 else if(ai==="gemini"&&service==="youtube")handoff="Choose real artist/title/version tracks FIRST. Ask YouTube Music to match them. If it can only make a similar mood mix, label it approximate, note substitutions, and mention Save to library.";
 else if(ai==="gemini"&&service==="spotify")handoff="Gemini's Spotify connected app does not create playlists. Give me a verified ordered tracklist, and use Spotify only for supported search/playback.";
 else handoff="Target "+serviceNames[service]+", but only write if this AI actually exposes a connected, authorized playlist writer. Otherwise give the verified ordered tracklist; don't claim it was saved.";
 return goCommand(ai,service,mood)+"\n\n"+thesis+(tempo?"\n\nTempo preference: "+tempoNames[tempo]+". Favor recordings with this perceived pace while respecting the selected mood. Treat this as a curation preference, not a verified BPM filter; do not invent BPM values.":"")+"\n\n"+handoff;
}
const params=new URLSearchParams(location.search);
const isLegacyGemini=location.pathname.startsWith("/gemini/");
let ai=(params.get("ai")||(isLegacyGemini?"gemini":stored("hmg-ai"))||"chatgpt").toLowerCase();
if(!defaultService[ai])ai="chatgpt";
let service=(params.get("service")||(isLegacyGemini?"youtube":stored("hmg-service"))||defaultService[ai]).toLowerCase();
if(!serviceNames[service])service=defaultService[ai];
let mood=(params.get("mood")||"go").toLowerCase();if(!moods.has(mood))mood="go";
let tempo=params.get("tempo")||"";if(!Object.hasOwn(tempoNames,tempo))tempo="";
function updateHandoff(){
 const ready=copiedPrompt===goPrompt(ai,service,mood);
 const button=doc.getElementById("goButton");
 if(button)button.setAttribute("data-copy-state",button.disabled?"copying":ready?"copied":"idle");
 for(const id of ["openAi","browserAi"]){const a=doc.getElementById(id);if(a)a.setAttribute("aria-disabled",String(!ready))}
 const a=doc.getElementById("openAi");if(a)a.textContent=ready?"NEXT: OPEN "+aiNames[ai].toUpperCase():"COPY WITH GO FIRST";
}
function selectionChanged(){
 render();
 if(body.dataset.page==="launch")status("Prompt changed. Press GO to copy the current selection.");
 else status("Selection updated. Copy your tailored setup check below.");
 const tip=doc.getElementById("setupTipStatus");if(tip)tip.textContent="";
}
function renderSelections(){
 doc.querySelectorAll("[data-ai]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ai===ai)));
 doc.querySelectorAll("[data-service]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.service===service)));
 const info=routeInfo(ai,service),r=doc.getElementById("routeStatus");
 if(r){const span=r.querySelector("span");if(span)span.textContent=info.message;r.classList.toggle("warn",info.tone==="warn")}
 const setupText=doc.getElementById("setupPromptText");if(setupText)setupText.textContent=setupPrompt(ai,service);
 const setupCopy=doc.getElementById("stripSetupPrompt");if(setupCopy)setupCopy.textContent="COPY SETUP · "+aiNames[ai]+" + "+serviceNames[service];
 const setupOpen=doc.getElementById("openSetupAi");if(setupOpen){setupOpen.href=destinations[ai];setupOpen.textContent="OPEN "+aiNames[ai].toUpperCase()}
 store("hmg-ai",ai);store("hmg-service",service);
}
function setupLinks(parent,items){
 parent.replaceChildren();
 for(const item of items){const a=doc.createElement("a");a.className="resource";a.href=item.url;a.target="_blank";a.rel="noopener";a.textContent="↗ "+item.name;parent.append(a)}
}
function renderSetup(){
 renderSelections();
 const q=routeInfo(ai,service);
 const intro=doc.getElementById("recipeIntro"),steps=doc.getElementById("recipeSteps"),links=doc.getElementById("recipeResources");
 if(!intro||!steps||!links)return;
 intro.textContent="YOUR MIX: "+aiNames[ai]+" × "+serviceNames[service]+". Copy the setup-check prompt first; if you're already connected, it should simply tell you to run GO.";
 let install="",connection="";
 if(ai==="chatgpt")install="In ChatGPT, select Go, Hipster, Go!. If missing, install/load it using the project source or app directory.";
 else if(ai==="gemini")install="In Gemini Customize → Skills, upload the Gemini Skill ZIP (or Replace skill to update it), then choose Go, Hipster, Go! using @ or /.";
 else install="In Claude Customize, install Go, Hipster, Go!. Use the Skill ZIP for Skills, or the Plugin ZIP for Plugins; they are not interchangeable.";
 if(service==="spotify"&&ai==="gemini")connection="On Gemini mobile, link Spotify if offered. Google's connected app supports search/play, not playlist creation.";
 else if(service==="spotify"&&ai==="claude")connection="Connect Spotify in Claude. Premium is required for personalized prompted playlists; inspect whether saving is supported here.";
 else if(service==="spotify")connection="In ChatGPT, connect and select Spotify in the same conversation as Go, Hipster, Go!.";
 else if(service==="youtube"&&ai==="gemini")connection="Enable YouTube Music in Gemini Connected Apps and choose it in the prompt. You may need to tap Save to library.";
 else if(service==="apple"&&ai==="claude")connection="Connect an Apple Music MCP connector compatible with your Claude app: local on Desktop, hosted for web/mobile. Verify it can find recordings, create playlists and add tracks.";
 else if(service==="apple"&&ai==="chatgpt")connection="In your AI's apps/connectors, locate and connect Apple Music if offered. Verify whether it can create and fill playlists; don't assume.";
 else connection="Check whether "+serviceNames[service]+" is available as a connected writer in "+aiNames[ai]+". If not, use a text playlist instead.";
 const stepsText=[install,connection,"Copy the tailored setup prompt to verify the connection. When your AI confirms everything is ready, go back to the Jukebox and press GO."];
 steps.replaceChildren();for(const text of stepsText){const li=doc.createElement("li");li.textContent=text;steps.append(li)}
 setupLinks(links,resourceInfo[ai]);
 const caveat=doc.getElementById("recipeCaveat");if(caveat)caveat.textContent=q.note;
 const setupReady=copiedPrompt===setupPrompt(ai,service);
 const copyButton=doc.getElementById("copyTailoredSetup");if(copyButton){copyButton.setAttribute("data-copy-state",copyButton.disabled?"copying":setupReady?"copied":"idle");copyButton.textContent=copyButton.disabled?"COPYING…":setupReady?"COPIED — COPY AGAIN":"COPY MY SETUP PROMPT"}
 const target=doc.getElementById("openSelectedAi");if(target){target.href=destinations[ai];target.textContent=(setupReady?"NEXT: OPEN ":"OPEN ")+aiNames[ai].toUpperCase();target.setAttribute("data-copy-ready",String(setupReady))}
 const tryFirst=doc.getElementById("trySetupPrompt");if(tryFirst)tryFirst.dataset.readyPair=ai+":"+service;
}
function renderLaunch(){
 renderSelections();
 const slider=doc.getElementById("tempoSlider"),tempoValue=doc.getElementById("tempoValue"),anyTempo=doc.getElementById("anyTempo");
 if(slider){slider.value=tempo?tempoSteps.indexOf(tempo)+1:3;slider.setAttribute("aria-valuetext",tempo?tempoNames[tempo]:"Any tempo — move to choose a pace")}
 const tempoControl=doc.getElementById("tempoControl");if(tempoControl)tempoControl.setAttribute("data-tempo",tempo||"any");
 if(tempoValue)tempoValue.textContent=tempo?tempoNames[tempo]:"Any tempo";
 if(anyTempo)anyTempo.setAttribute("aria-pressed",String(!tempo));
 doc.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===mood)));
 const e={prompt:doc.getElementById("prompt"),mood:doc.getElementById("moodName"),code:doc.getElementById("receiptCode"),open:doc.getElementById("openAi"),browser:doc.getElementById("browserAi")};
 if(!e.prompt)return;
 e.prompt.textContent=goPrompt(ai,service,mood);
 e.mood.textContent=mood==="go"?"SURPRISE":mood.toUpperCase();
 e.code.textContent=(ai==="chatgpt"?"CG":ai==="gemini"?"GM":"CL")+"-"+mood.slice(0,3).toUpperCase()+"-01";
 e.open.href=ai==="gemini"?geminiIntent:destinations[ai];e.open.textContent="↗ OPEN "+aiNames[ai].toUpperCase();
 const summary=doc.getElementById("receiptSummary");if(summary)summary.textContent=aiNames[ai]+" · "+serviceNames[service]+" · "+(mood==="go"?"Surprise":mood[0].toUpperCase()+mood.slice(1))+(tempo?" · "+tempoNames[tempo]:"")+" · 12 tracks";
 const hint=doc.getElementById("goHint");if(hint)hint.textContent="Copy "+(mood==="go"?"surprise":mood)+" prompt · 12 tracks";
 const goButton=doc.getElementById("goButton");if(goButton)goButton.setAttribute("aria-label","GO! Copy "+(mood==="go"?"surprise":mood)+" playlist prompt");
 const manual=doc.getElementById("manualOpenAi");if(manual){manual.href=destinations[ai];manual.textContent="I COPIED IT MANUALLY — OPEN "+aiNames[ai].toUpperCase()}
 updateHandoff();
 e.browser.hidden=ai!=="gemini";e.browser.href=destinations[ai];e.browser.textContent="open "+aiNames[ai]+" in browser";
 const u=new URL(location.href);u.searchParams.set("ai",ai);u.searchParams.set("service",service);
 if(mood==="go")u.searchParams.delete("mood");else u.searchParams.set("mood",mood);
 if(tempo)u.searchParams.set("tempo",tempo);else u.searchParams.delete("tempo");
 history.replaceState(null,"",u.pathname+u.search);
}
function render(){if(body.dataset.page==="launch")renderLaunch();else renderSetup()}
doc.querySelectorAll("[data-ai]").forEach(b=>b.addEventListener("click",()=>{
 ai=b.dataset.ai;service=defaultService[ai];copiedPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-service]").forEach(b=>b.addEventListener("click",()=>{
 service=b.dataset.service;copiedPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-setup]").forEach(b=>b.addEventListener("click",async()=>{
 copiedPrompt=null;if(body.dataset.page==="setup")renderSetup();
 const prompt=b.dataset.setup==="universal"?universalPrompt:setupPrompt(ai,service);
 status(await copyText(prompt)?"Installation prompt copied. Paste into your chosen AI.":"Clipboard blocked; please copy the instructions manually.");
}));
async function copyFirstSetup(){
 copiedPrompt=null;if(body.dataset.page==="launch")updateHandoff();
 const ok=await copyText(setupPrompt(ai,service));
 const details=doc.getElementById("setupPromptDetails");if(!ok&&details)details.open=true;
 const msg=ok?"Setup check copied for "+aiNames[ai]+" + "+serviceNames[service]+". Open that AI, paste and send.":"Clipboard unavailable. Copy the setup prompt shown below, then open your AI.";
 const tip=doc.getElementById("setupTipStatus"),setupTip=doc.getElementById("setupTryStatus");
 if(tip)tip.textContent=msg;
 if(setupTip)setupTip.textContent=msg;
 if(body.dataset.page!=="launch")status(msg);
 else status("Setup check selected. For a playlist, press GO to copy your music prompt.");
}
for(const id of ["quickSetupPrompt","stripSetupPrompt","trySetupPrompt"]){
 const b=doc.getElementById(id);if(b)b.addEventListener("click",copyFirstSetup);
}
const copyTailored=doc.getElementById("copyTailoredSetup");
if(copyTailored)copyTailored.addEventListener("click",async()=>{
 if(copyTailored.disabled)return;
 const prompt=setupPrompt(ai,service);copiedPrompt=null;copyTailored.disabled=true;copyTailored.setAttribute("aria-busy","true");renderSetup();status("Copying your setup prompt…");
 const ok=await copyText(prompt);
 copyTailored.disabled=false;copyTailored.setAttribute("aria-busy","false");copiedPrompt=ok?prompt:null;renderSetup();
 if(prompt!==setupPrompt(ai,service)){status("Selection changed while copying. Copy the current setup prompt again.");return}
 if(ok)status("Copied. Open "+aiNames[ai]+", paste and send your setup check.");
 else{const details=doc.getElementById("setupPromptDetails");if(details)details.open=true;status("Clipboard unavailable. Copy the setup prompt below, then open your AI.")}
});
if(body.dataset.page!=="launch"){render();return}
// A dismissible hint, never a blocking onboarding gate. Changing its version lets existing visitors see Try First.
const welcome=doc.getElementById("welcomeSetup");
if(welcome&&!stored("hmg-setup-first-tip-dismissed-v3")){
 welcome.hidden=false;const close=doc.getElementById("dismissWelcome");
 if(close)close.addEventListener("click",()=>{welcome.hidden=true;store("hmg-setup-first-tip-dismissed-v3","yes")});
}
async function copyGo(){
 const prompt=goPrompt(ai,service,mood);
 const button=doc.getElementById("goButton");
 if(button&&button.disabled)return;
 if(button){button.disabled=true;button.setAttribute("aria-busy","true");button.setAttribute("data-copy-state","copying")}
 copiedPrompt=null;updateHandoff();
 status("Copying your prompt…");
 const ok=await copyText(prompt);
 if(button){button.disabled=false;button.setAttribute("aria-busy","false")}
 copiedPrompt=ok?prompt:null;updateHandoff();
 if(prompt!==goPrompt(ai,service,mood)){status("Selection changed while copying. Press GO again for the current prompt.");return}
 if(ok)status("Copied. Open "+aiNames[ai]+", paste and send. Select your skill and music app if needed.");
 else{const details=doc.getElementById("promptDetails");if(details)details.open=true;status("Clipboard blocked. Copy the full prompt in the receipt below, then use its manual Open link.")}
}
doc.querySelectorAll("[data-mood]").forEach(b=>b.addEventListener("click",()=>{
 mood=mood===b.dataset.mood?"go":b.dataset.mood;copiedPrompt=null;selectionChanged();
}));
const tempoSlider=doc.getElementById("tempoSlider");
function selectTempo(){tempo=tempoSteps[Number(tempoSlider.value)-1]||"";copiedPrompt=null;selectionChanged()}
if(tempoSlider){
 tempoSlider.addEventListener("input",selectTempo);
 // A tap on the parked center cap also chooses Mid-tempo from bypass.
 tempoSlider.addEventListener("pointerup",()=>{if(!tempo)selectTempo()});
 tempoSlider.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectTempo()}});
}
const anyTempo=doc.getElementById("anyTempo");
if(anyTempo)anyTempo.addEventListener("click",()=>{tempo="";copiedPrompt=null;selectionChanged()});
const go=doc.getElementById("goButton");if(go)go.addEventListener("click",copyGo);
for(const id of ["openAi","browserAi"]){const a=doc.getElementById(id);if(a)a.addEventListener("click",event=>{
 if(copiedPrompt!==goPrompt(ai,service,mood)){event.preventDefault();status("Press GO to copy the current prompt before opening your AI.")}
})}
const share=doc.getElementById("shareButton");if(share)share.addEventListener("click",async()=>{
 if(!navigator.share){status("No share sheet available. Copy the prompt instead.");return}
 try{await navigator.share({text:goPrompt(ai,service,mood)})}catch(e){if(e.name!=="AbortError")status("Share failed. Copy the prompt instead.")}
});
render();
})();