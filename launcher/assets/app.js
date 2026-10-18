/* HIPSTER GO — reverse-engineered from the ashes of a MySpace top eight. */
(function(){
"use strict";
const doc=document,body=doc.body;
const defaultService={chatgpt:"spotify",gemini:"youtube"};
const destinations={chatgpt:"https://chatgpt.com/",gemini:"https://gemini.google.com/app"};
const geminiIntent="intent://gemini.google.com/app#Intent;scheme=https;package=com.google.android.apps.bard;S.browser_fallback_url=https%3A%2F%2Fgemini.google.com%2Fapp;end";
const moods=new Set(["go","happy","angry","sad","weird"]);
function stored(name){try{return localStorage.getItem(name)}catch(e){return null}}
function store(name,value){try{localStorage.setItem(name,value)}catch(e){}}
function status(message){const el=doc.getElementById("copyStatus");if(el)el.textContent=message}
async function copyText(text){
 try{await navigator.clipboard.writeText(text);return true}
 catch(err){
   const area=doc.createElement("textarea");area.value=text;area.setAttribute("aria-hidden","true");area.style.cssText="position:fixed;left:-9999px;opacity:0";
   doc.body.appendChild(area);area.select();let ok=false;
   try{ok=doc.execCommand("copy")}catch(e){}area.remove();return ok;
 }
}
const setupPrompts={
 chatgpt:"@Hipster Music Generator @Spotify setup\nCheck which Spotify playlist-creation and track-insertion actions are available here. Use the complete musical taxonomy, confirm both apps are active, and explain the publishing status without assuming that connection means write access.",
 gemini:"@hipster-music-generator setup change YouTube Music @youtube-music\nConfirm my installed Hipster Music Generator skill is active and YouTube Music is accessible. Prefer actual curated recordings; be clear when YouTube Music produces only an inspired mix rather than the exact ordered playlist.",
 universal:"Load Hipster Music Generator from https://github.com/focustimer-dev/hipster-music-generator . Read SKILL.md and referenced music-taxonomy files. Use your supported skill/plugin installation method. Confirm what loaded, whether it persists, and which music services can actually create playlists. Then run setup."
};
doc.querySelectorAll("[data-setup]").forEach(button=>{
 button.addEventListener("click",async()=>{
  const key=button.dataset.setup;const ok=await copyText(setupPrompts[key]||"");
  status(ok?"Setup prompt copied. Your future playlist is now someone else's problem.":"Clipboard blocked. Please try again.");
  if(ok){const old=button.textContent;button.textContent="✓ COPIED";setTimeout(()=>{button.textContent=old},1400)}
 });
});
if(body.dataset.page!=="launch")return;
const u=new URL(location.href),params=u.searchParams;
const isGeminiShortcut=location.pathname.startsWith("/gemini");
let ai=(params.get("ai")||(isGeminiShortcut?"gemini":stored("hmg-ai"))||"chatgpt").toLowerCase();
if(!defaultService[ai])ai="chatgpt";
let service=(params.get("service")||(isGeminiShortcut?"youtube":stored("hmg-service"))||defaultService[ai]).toLowerCase();
if(!["spotify","youtube"].includes(service))service=defaultService[ai];
let mood=(params.get("mood")||"go").toLowerCase();if(!moods.has(mood))mood="go";
const el={
 prompt:doc.getElementById("prompt"),mood:doc.getElementById("moodName"),code:doc.getElementById("receiptCode"),
 route:doc.getElementById("routeStatus"),open:doc.getElementById("openAi"),browser:doc.getElementById("browserAi")
};
const thesis="Use the full Hipster Music Generator skill to curate a fresh, coherent set of 12 verified deep cuts. Search beyond the obvious artists and genre labels: discover subtle cross-scene links through rhythm, voice, instrumentation, production methods and musical function. Make the choices surprising yet convincingly listenable. Keep emotional momentum, don't recycle example artists just because they appear in the skill, and keep the final song sequence worth replaying.";
function prompt(){
 let command;
 if(ai==="chatgpt"&&service==="spotify")command="@Hipster Music Generator @Spotify "+(mood==="go"?"go":"go "+mood);
 else if(ai==="gemini"&&service==="youtube")command="@hipster-music-generator "+(mood==="go"?"go":"go "+mood)+" @youtube-music";
 else command=(ai==="gemini"?"@hipster-music-generator ":"@Hipster Music Generator ")+(mood==="go"?"go":"go "+mood)+" — destination "+(service==="youtube"?"YouTube Music":"Spotify");
 let handoff;
 if(ai==="chatgpt"&&service==="spotify"){
  handoff="Resolve the exact Spotify recordings first. Publish them in the intended order through a genuinely connected playlist writer; read back the saved track count/order when possible. Never claim success without confirmation.";
 }else if(ai==="gemini"&&service==="youtube"){
  handoff="Curate the actual artist/title/version list FIRST. Ask YouTube Music to reproduce those selections where supported. If it only generates an inspired mix, say it's approximate and identify any known substitutions, unverified ordering or Save to library step.";
 }else{
  handoff="No precise playlist-writing route is confirmed for this AI/service pairing. Produce the verified ordered list; only publish if an authorized writer is actually available, and explicitly state when it is text-only or unsaved.";
 }
 return command+"\n\n"+thesis+"\n\n"+handoff;
}
function routeText(){
 if(ai==="chatgpt"&&service==="spotify")return "THE CLASSIC PRESSING: ChatGPT + Spotify can save exact resolved tracks when both apps and the actual writer are available.";
 if(ai==="gemini"&&service==="youtube")return "THE BOOTLEG EDITION: Gemini + YouTube Music can generate a mix, but exact tracks and running order may differ.";
 return "EXPERIMENTAL IMPORT: this AI + music service combination has no confirmed playlist writer. Text curation remains available.";
}
function render(){
 doc.querySelectorAll("[data-ai]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ai===ai)));
 doc.querySelectorAll("[data-service]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.service===service)));
 doc.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===mood)));
 el.prompt.textContent=prompt();el.mood.textContent=mood==="go"?"SURPRISE":mood.toUpperCase();el.code.textContent=(ai==="gemini"?"GM":"CG")+"-"+mood.slice(0,3).toUpperCase()+"-01";
 const p=el.route.querySelector("span");if(p)p.textContent=routeText();
 el.route.classList.toggle("warn",defaultService[ai]!==service);
 el.open.textContent=ai==="gemini"?"↗ OPEN GEMINI":"↗ OPEN CHATGPT";
 el.open.href=ai==="gemini"?geminiIntent:destinations.chatgpt;
 el.browser.textContent="open "+(ai==="gemini"?"Gemini":"ChatGPT")+" in browser";el.browser.href=destinations[ai];
 store("hmg-ai",ai);store("hmg-service",service);
 const updated=new URL(location.href);updated.searchParams.set("ai",ai);updated.searchParams.set("service",service);
 if(mood==="go")updated.searchParams.delete("mood");else updated.searchParams.set("mood",mood);
 history.replaceState(null,"",updated.pathname+updated.search);
}
async function copyCurrent(){
 const ok=await copyText(prompt());
 status(ok?"COPIED. Open your AI, paste & send. Select the skill and music app if needed.":"Clipboard denied. Long-press the receipt above and copy the text manually.");
}
doc.querySelectorAll("[data-ai]").forEach(b=>b.addEventListener("click",()=>{
 ai=b.dataset.ai;service=defaultService[ai];render();status("Dealer changed. The questionable musical intent remains intact.");
}));
doc.querySelectorAll("[data-service]").forEach(b=>b.addEventListener("click",()=>{
 service=b.dataset.service;render();status("Destination changed. You may require a different music-service connection.");
}));
doc.querySelectorAll("[data-mood]").forEach(b=>b.addEventListener("click",()=>{
 mood=b.dataset.mood;render();copyCurrent();
}));
doc.getElementById("goButton").addEventListener("click",()=>{mood="go";render();copyCurrent()});
doc.getElementById("copyButton").addEventListener("click",copyCurrent);
doc.getElementById("shareButton").addEventListener("click",async()=>{
 if(!navigator.share){status("Android share sheet unavailable here. Copy the prompt instead.");return}
 try{await navigator.share({text:prompt()})}catch(e){if(e.name!=="AbortError")status("Share failed. Our lawyers recommend Copy Prompt.")}
});
render();
})();
