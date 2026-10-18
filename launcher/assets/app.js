/* HIPSTER GO: user-selectable crate digging, no imaginary music writers. */
(function(){
"use strict";
const doc=document,body=doc.body;
const defaultService={chatgpt:"spotify",gemini:"youtube",claude:"apple"};
const aiNames={chatgpt:"ChatGPT",gemini:"Gemini",claude:"Claude"};
const serviceNames={spotify:"Spotify",youtube:"YouTube Music",apple:"Apple Music"};
const destinations={chatgpt:"https://chatgpt.com/",gemini:"https://gemini.google.com/app",claude:"https://claude.ai/"};
const geminiIntent="intent://gemini.google.com/app#Intent;scheme=https;package=com.google.android.apps.bard;S.browser_fallback_url=https%3A%2F%2Fgemini.google.com%2Fapp;end";
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
 chatgpt:[{name:"Hipster Music Generator source",url:repo},{name:"Open ChatGPT",url:destinations.chatgpt}],
 gemini:[{name:"Gemini Skill ZIP",url:releases+"hipster-music-generator-gemini-app-skill.zip"},{name:"Gemini installation guide",url:repo+"/blob/main/adapters/gemini/README.md"}],
 claude:[{name:"Claude Skill ZIP",url:releases+"hipster-music-generator-claude-skill.zip"},{name:"Claude Plugin ZIP",url:releases+"hipster-music-generator-claude-plugin.zip"},{name:"Which one? Claude guide",url:repo+"/blob/main/adapters/claude/README.md"}]
};
function routeInfo(ai,service){
 if(ai==="chatgpt"&&service==="spotify")return {tone:"ready",message:"ChatGPT + Spotify: playlist creation and exact-track insertion can work when both apps and their writer actions are available.",note:"You still need to select and authorize both apps in ChatGPT; mentioning them in text alone may not activate them."};
 if(ai==="gemini"&&service==="youtube")return {tone:"ready",message:"Gemini + YouTube Music: mood-based playlist generation is supported; exact song versions/order may differ.",note:"Use Gemini's YouTube Music connected app, and tap Save to library when offered."};
 if(ai==="gemini"&&service==="spotify")return {tone:"warn",message:"Gemini + Spotify: search and playback work on supported mobile accounts, but Google's Spotify connection cannot create playlists.",note:"You can still curate an exact text tracklist and play/search Spotify; don't expect a new saved Spotify playlist."};
 if(ai==="claude"&&service==="spotify")return {tone:"ready",message:"Claude + Spotify: connected discovery works; prompted playlists are a Premium feature and provider save behavior can vary.",note:"Enable Spotify in Claude's connectors and verify whether the available writer can actually create/save the playlist."};
 if((ai==="chatgpt"||ai==="claude")&&service==="apple")return {tone:"warn",message:aiNames[ai]+" + Apple Music: possible when the relevant music app/connector is available, but playlist-writing access must be checked.",note:"Look for Apple Music in your AI's apps/connectors; do not assume the connection permits exact playlist creation."};
 return {tone:"warn",message:aiNames[ai]+" + "+serviceNames[service]+": playlist-writing support isn't confirmed for this pairing.",note:"The skill can still curate a verified text playlist; publish only if the AI exposes a real authorized writer."};
}
function setupPrompt(ai,service){
 let first;
 if(ai==="chatgpt")first="@Hipster Music Generator setup change "+serviceNames[service]+".";
 else if(ai==="gemini")first="@hipster-music-generator setup change "+serviceNames[service]+".";
 else first="Use Hipster Music Generator. Run setup; prefer "+serviceNames[service]+".";
 return first+"\nCheck that the Hipster Music Generator skill/plugin is actually loaded, that "+serviceNames[service]+" is connected, and whether this session has tools to CREATE and FILL a playlist, not just search or play. If the writer isn't available, keep the verified ordered 12-track list and report that nothing was saved. Do not request login credentials in chat.";
}
const universalPrompt="Load Hipster Music Generator from "+repo+". Read SKILL.md and the referenced musical taxonomy. Use your supported skill/plugin installation mechanism, confirm what actually loaded and whether it persists, then run setup. Do not assume a streaming playlist writer exists.";
function goCommand(ai,service,mood){
 const go=mood==="go"?"go":"go "+mood;
 if(ai==="chatgpt"&&service==="spotify")return "@Hipster Music Generator @Spotify "+go;
 if(ai==="gemini"&&service==="youtube")return "@hipster-music-generator "+go+" @youtube-music";
 if(ai==="gemini"&&service==="spotify")return "@hipster-music-generator "+go+" @Spotify";
 if(ai==="claude")return "Use Hipster Music Generator: "+go+". Preferred music service: "+serviceNames[service]+".";
 return "@Hipster Music Generator "+go+" — destination "+serviceNames[service];
}
const thesis="Curate 12 verified deep-cut recordings around a cohesive sonic thesis. Explore surprising links across scenes, eras, rhythm, voice, production and instrumentation. Keep the transitions listenable, not just clever. Avoid recycled example-artist lists and never invent track matches.";
function goPrompt(ai,service,mood){
 const info=routeInfo(ai,service);
 let handoff;
 if(ai==="chatgpt"&&service==="spotify")handoff="Resolve exact Spotify track versions and publish in the chosen order if an authorized writer is exposed. Read back the saved count/order if possible.";
 else if(ai==="gemini"&&service==="youtube")handoff="Choose real artist/title/version tracks FIRST. Ask YouTube Music to match them. If it can only make a similar mood mix, label it approximate, note substitutions, and mention Save to library.";
 else if(ai==="gemini"&&service==="spotify")handoff="Gemini's Spotify connected app does not create playlists. Give me a verified ordered tracklist, and use Spotify only for supported search/playback.";
 else handoff="Target "+serviceNames[service]+", but only write if this AI actually exposes a connected, authorized playlist writer. Otherwise give the verified ordered tracklist; don't claim it was saved.";
 return goCommand(ai,service,mood)+"\n\n"+thesis+"\n\n"+handoff;
}
const params=new URLSearchParams(location.search);
const isLegacyGemini=location.pathname.startsWith("/gemini/");
let ai=(params.get("ai")||(isLegacyGemini?"gemini":stored("hmg-ai"))||"chatgpt").toLowerCase();
if(!defaultService[ai])ai="chatgpt";
let service=(params.get("service")||(isLegacyGemini?"youtube":stored("hmg-service"))||defaultService[ai]).toLowerCase();
if(!serviceNames[service])service=defaultService[ai];
let mood=(params.get("mood")||"go").toLowerCase();if(!moods.has(mood))mood="go";
function renderSelections(){
 doc.querySelectorAll("[data-ai]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ai===ai)));
 doc.querySelectorAll("[data-service]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.service===service)));
 const info=routeInfo(ai,service),r=doc.getElementById("routeStatus");
 if(r){const span=r.querySelector("span");if(span)span.textContent=info.message;r.classList.toggle("warn",info.tone==="warn")}
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
 intro.textContent="YOUR MIX: "+aiNames[ai]+" × "+serviceNames[service]+". Try GO first; if it fails, use these steps.";
 let install="",connection="";
 if(ai==="chatgpt")install="In ChatGPT, select Hipster Music Generator. If missing, install/load it using the project source or app directory.";
 else if(ai==="gemini")install="In Gemini Customize → Skills, upload the Gemini Skill ZIP (or Replace skill to update it), then choose Hipster Music Generator using @ or /.";
 else install="In Claude Customize, install Hipster Music Generator. Use the Skill ZIP for Skills, or the Plugin ZIP for Plugins; they are not interchangeable.";
 if(service==="spotify"&&ai==="gemini")connection="On Gemini mobile, link Spotify if offered. Google's connected app supports search/play, not playlist creation.";
 else if(service==="spotify"&&ai==="claude")connection="Connect Spotify in Claude. Premium is required for personalized prompted playlists; inspect whether saving is supported here.";
 else if(service==="spotify")connection="In ChatGPT, connect and select Spotify in the same conversation as Hipster Music Generator.";
 else if(service==="youtube"&&ai==="gemini")connection="Enable YouTube Music in Gemini Connected Apps and choose it in the prompt. You may need to tap Save to library.";
 else if(service==="apple"&&(ai==="chatgpt"||ai==="claude"))connection="In your AI's apps/connectors, locate and connect Apple Music if offered. Verify whether it can create and fill playlists; don't assume.";
 else connection="Check whether "+serviceNames[service]+" is available as a connected writer in "+aiNames[ai]+". If not, use a text playlist instead.";
 const stepsText=[install,connection,"Copy the tailored setup prompt only if the trial didn't work, then try GO again."];
 steps.replaceChildren();for(const text of stepsText){const li=doc.createElement("li");li.textContent=text;steps.append(li)}
 setupLinks(links,resourceInfo[ai]);
 const caveat=doc.getElementById("recipeCaveat");if(caveat)caveat.textContent=q.note;
 const target=doc.getElementById("openSelectedAi");if(target){target.href=destinations[ai];target.textContent="↗ OPEN "+aiNames[ai].toUpperCase()}
 const test=doc.getElementById("tryFirstFromSetup");if(test)test.href="/?ai="+encodeURIComponent(ai)+"&service="+encodeURIComponent(service);
}
function renderLaunch(){
 renderSelections();
 doc.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===mood)));
 const e={prompt:doc.getElementById("prompt"),mood:doc.getElementById("moodName"),code:doc.getElementById("receiptCode"),open:doc.getElementById("openAi"),browser:doc.getElementById("browserAi")};
 if(!e.prompt)return;
 e.prompt.textContent=goPrompt(ai,service,mood);
 e.mood.textContent=mood==="go"?"SURPRISE":mood.toUpperCase();
 e.code.textContent=(ai==="chatgpt"?"CG":ai==="gemini"?"GM":"CL")+"-"+mood.slice(0,3).toUpperCase()+"-01";
 e.open.href=ai==="gemini"?geminiIntent:destinations[ai];e.open.textContent="↗ OPEN "+aiNames[ai].toUpperCase();
 e.browser.href=destinations[ai];e.browser.textContent="open "+aiNames[ai]+" in browser";
 const u=new URL(location.href);u.searchParams.set("ai",ai);u.searchParams.set("service",service);
 if(mood==="go")u.searchParams.delete("mood");else u.searchParams.set("mood",mood);
 history.replaceState(null,"",u.pathname+u.search);
}
function render(){if(body.dataset.page==="launch")renderLaunch();else renderSetup()}
doc.querySelectorAll("[data-ai]").forEach(b=>b.addEventListener("click",()=>{
 ai=b.dataset.ai;service=defaultService[ai];render();status("AI selected. Try GO first; setup only if needed.");
}));
doc.querySelectorAll("[data-service]").forEach(b=>b.addEventListener("click",()=>{
 service=b.dataset.service;render();status("Music service selected. Your instructions are tailored below.");
}));
doc.querySelectorAll("[data-setup]").forEach(b=>b.addEventListener("click",async()=>{
 const prompt=b.dataset.setup==="universal"?universalPrompt:setupPrompt(ai,service);
 status(await copyText(prompt)?"Installation prompt copied. Paste into your chosen AI.":"Clipboard blocked; please copy the instructions manually.");
}));
const copyTailored=doc.getElementById("copyTailoredSetup");
if(copyTailored)copyTailored.addEventListener("click",async()=>status(await copyText(setupPrompt(ai,service))?"Setup prompt copied. Paste it into "+aiNames[ai]+".":"Clipboard unavailable. Try again."));
if(body.dataset.page!=="launch"){render();return}
// A dismissible hint, never a blocking onboarding gate. Changing its version lets existing visitors see Try First.
const welcome=doc.getElementById("welcomeSetup");
if(welcome&&!stored("hmg-try-first-tip-dismissed-v2")){
 welcome.hidden=false;const close=doc.getElementById("dismissWelcome");
 if(close)close.addEventListener("click",()=>{welcome.hidden=true;store("hmg-try-first-tip-dismissed-v2","yes")});
}
async function copyGo(){
 status(await copyText(goPrompt(ai,service,mood))?"COPIED. Open "+aiNames[ai]+", paste and send. Select your app/skill if needed.":"Clipboard blocked. Long-press the receipt and copy the text.");
}
doc.querySelectorAll("[data-mood]").forEach(b=>b.addEventListener("click",()=>{
 // Tap a selected mood again to clear it and return to unmodified 'go'.
 mood=mood===b.dataset.mood?"go":b.dataset.mood;render();copyGo();
}));
const go=doc.getElementById("goButton");if(go)go.addEventListener("click",()=>{mood="go";render();copyGo()});
const copy=doc.getElementById("copyButton");if(copy)copy.addEventListener("click",copyGo);
const share=doc.getElementById("shareButton");if(share)share.addEventListener("click",async()=>{
 if(!navigator.share){status("No share sheet available. Copy the prompt instead.");return}
 try{await navigator.share({text:goPrompt(ai,service,mood)})}catch(e){if(e.name!=="AbortError")status("Share failed. Copy the prompt instead.")}
});
render();
})();