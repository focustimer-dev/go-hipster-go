// Inserted inside the Lab-only app.js closure. Shared text never becomes HTML or code.
function labInspiration(){
 try{return window.HipsterLab&&typeof window.HipsterLab.inspiration==="function"?String(window.HipsterLab.inspiration()||""):""}catch(e){return ""}
}
function renderLabInspiration(){
 const anchor=doc.querySelector(".go-options");if(!anchor)return;
 let card=doc.getElementById("labInspiration");
 if(!card){
  card=doc.createElement("aside");card.id="labInspiration";card.setAttribute("aria-label","Shared musical inspiration");
  card.style.cssText="border:1px solid var(--ink,#252320);padding:12px;margin:12px 0;background:var(--paper,#f2e5c7);color:var(--ink,#252320)";
  const label=doc.createElement("strong");label.textContent="FROM YOUR CRATE";label.style.cssText="display:block;font-size:.8rem;letter-spacing:.06em";
  const preview=doc.createElement("p");preview.id="labInspirationPreview";preview.style.cssText="margin:6px 0;overflow-wrap:anywhere;font-size:.9rem;line-height:1.4";
  const actions=doc.createElement("div");actions.style.cssText="display:flex;gap:8px";
  for(const [text,id,method] of [["REVIEW","labReviewInspiration","reviewInspiration"],["REMOVE","labRemoveInspiration","clearInspiration"]]){
   const button=doc.createElement("button");button.type="button";button.id=id;button.textContent=text;
   button.style.cssText="min-height:44px;padding:8px 12px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;cursor:pointer";
   button.addEventListener("click",()=>window.HipsterLab?.[method]?.());actions.appendChild(button);
  }
  card.append(label,preview,actions);anchor.parentNode.insertBefore(card,anchor);
 }
 const value=labInspiration();card.hidden=!value;
 doc.getElementById("labInspirationPreview").textContent=value.length>140?value.slice(0,140)+"…":value;
}
window.HipsterLabRefresh=()=>{copiedPrompt=null;render();status(labInspiration()?"Shared inspiration ready. Your listening choices stay in place.":"Shared inspiration removed.")};
