// Inserted inside the Lab-only app.js closure. Shared text remains plain text.
function labInspiration(){try{return window.HipsterLab&&typeof window.HipsterLab.inspiration==="function"?String(window.HipsterLab.inspiration()||""):""}catch(e){return ""}}
let labLastInspiration=labInspiration();
function labShapeInspiration(){
 labNavigate('jukebox');
 const mood=doc.querySelector('[data-mood]');
 mood?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 mood?.focus({preventScroll:true});
}
function renderLabInspiration(){
 const anchor=doc.querySelector('.refinements');if(!anchor)return;let card=doc.getElementById('labInspiration');
 if(!card){
  card=doc.createElement('aside');card.id='labInspiration';card.setAttribute('aria-label','Active musical inspiration');
  const text=doc.createElement('div'),label=doc.createElement('strong');label.textContent='YOUR CRATE';
  const preview=doc.createElement('p');preview.id='labInspirationPreview';
  const next=doc.createElement('p');next.className='lab-inspiration-next';next.textContent='Reference kept. Choose moods, pace and places below, then GO.';
  text.append(label,preview,next);
  const actions=doc.createElement('div');actions.className='lab-inspiration-actions';
  const shape=doc.createElement('button');shape.type='button';shape.id='labShapeInspiration';shape.textContent='SHAPE THIS CRATE';shape.addEventListener('click',labShapeInspiration);
  const review=doc.createElement('button');review.type='button';review.id='labReviewInspiration';review.textContent='REVIEW';review.addEventListener('click',()=>window.HipsterLab?.reviewInspiration?.());
  actions.append(shape,review);card.append(text,actions);anchor.parentNode.insertBefore(card,anchor);
 }
 const value=labInspiration();card.hidden=!value;
 doc.getElementById('labInspirationPreview').textContent=labSummary(value);
 let reminder=doc.getElementById('labInspirationGo');
 const options=doc.querySelector('.go-options');
 if(!reminder&&options){reminder=doc.createElement('p');reminder.id='labInspirationGo';reminder.textContent='YOUR INSPIRATION IS INCLUDED. READY? PRESS GO.';options.before(reminder)}
 if(reminder)reminder.hidden=!value;
}
window.HipsterLabRefresh=()=>{
 const value=labInspiration(),changed=value!==labLastInspiration;labLastInspiration=value;
 copiedPrompt=null;render();
 if(value&&changed){labNavigate('jukebox');doc.getElementById('labInspiration')?.scrollIntoView({block:'start',behavior:'instant'})}
 status(value?'Inspiration kept. Choose moods, pace and places, then press GO.':'Shared inspiration removed.');
};
