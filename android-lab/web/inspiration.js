// Inserted inside the Lab-only app.js closure. Shared text never becomes HTML or code.
function labInspiration(){try{return window.HipsterLab&&typeof window.HipsterLab.inspiration==="function"?String(window.HipsterLab.inspiration()||""):""}catch(e){return ""}}
function renderLabInspiration(){
 const anchor=doc.querySelector('.go-options');if(!anchor)return;let card=doc.getElementById('labInspiration');
 if(!card){card=doc.createElement('aside');card.id='labInspiration';card.setAttribute('aria-label','Shared musical inspiration');const text=doc.createElement('div'),label=doc.createElement('strong');label.textContent='FROM YOUR CRATE';const preview=doc.createElement('p');preview.id='labInspirationPreview';text.append(label,preview);const button=doc.createElement('button');button.type='button';button.id='labReviewInspiration';button.textContent='REVIEW';button.addEventListener('click',()=>window.HipsterLab?.reviewInspiration?.());card.append(text,button);anchor.parentNode.insertBefore(card,anchor)}
 const value=labInspiration();card.hidden=!value;doc.getElementById('labInspirationPreview').textContent=value.length>140?value.slice(0,140)+'…':value;
}
window.HipsterLabRefresh=()=>{copiedPrompt=null;render();status(labInspiration()?"Shared inspiration ready. Your listening choices stay in place.":"Shared inspiration removed.")};
