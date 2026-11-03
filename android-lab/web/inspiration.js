// Inserted inside the Lab-only app.js closure. Shared text remains plain text.
function labInspiration(){return labState().activeInspiration||''}
let labLastInspiration=labInspiration();
function labRevealInspiration(target){
 if(!target)return;
 target.scrollIntoView({block:'start',behavior:'instant'});
 // The receipt becomes floating after scroll. Measure after it settles so
 // neither the sleeve's dismiss control nor the first mood is hidden by it.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(!target.isConnected)return;
  const rail=doc.querySelector('.lab-rail'),ticket=doc.getElementById('selectionTicket');
  const ticketHeight=ticket&&!ticket.hidden&&!ticket.classList.contains('is-docked')?ticket.getBoundingClientRect().height:0;
  target.style.scrollMarginTop=Math.max(72,(rail?.getBoundingClientRect().height||56)+ticketHeight+16)+'px';
  target.scrollIntoView({block:'start',behavior:'instant'});
 }));
}
function labShapeInspiration(){
 labNavigate('jukebox');
 const mood=doc.querySelector('[data-mood]');
 labRevealInspiration(mood);
 mood?.focus({preventScroll:true});
}
function renderLabInspiration(){
 const anchor=doc.querySelector('.refinements');if(!anchor)return;let card=doc.getElementById('labInspiration');
 if(!card){
  card=doc.createElement('aside');card.id='labInspiration';card.setAttribute('aria-label','Active musical inspiration');
  const text=doc.createElement('div'),label=doc.createElement('strong');label.textContent='YOUR CRATE';
  const preview=doc.createElement('p');preview.id='labInspirationPreview';
  const next=doc.createElement('p');next.className='lab-inspiration-next';next.textContent='Choose moods, pace and places below, then GO.';
  text.append(label,preview,next);
  const actions=doc.createElement('div');actions.className='lab-inspiration-actions';
  const review=doc.createElement('button');review.type='button';review.id='labReviewInspiration';review.textContent='REVIEW';review.addEventListener('click',()=>window.HipsterLab?.reviewInspiration?.());
  const dismiss=doc.createElement('button');dismiss.type='button';dismiss.id='labDismissInspiration';dismiss.textContent='×';dismiss.setAttribute('aria-label','Remove inspiration from Jukebox; keep in recent inspirations');dismiss.addEventListener('click',()=>{window.HipsterLab?.clearInspiration?.();doc.querySelector('[data-mood]')?.focus({preventScroll:true})});
  const details=doc.createElement('p');details.id='labInspirationDescription';text.insertBefore(details,next);
  const vinyl=doc.createElement('span');vinyl.className='lab-sleeve-vinyl';vinyl.setAttribute('aria-hidden','true');
  actions.append(review);card.append(text,actions,vinyl,dismiss);anchor.parentNode.insertBefore(card,anchor);
 }
 const value=labInspiration();card.hidden=!value;
 const preview=labState().inspirationPreview||{};
 doc.getElementById('labInspirationPreview').textContent=labSummary(preview.title||value);
 const description=doc.getElementById('labInspirationDescription');description.textContent=preview.description?labSummary(preview.description,180):preview.loading?'Reading link details…':'';description.hidden=!description.textContent;
 let reminder=doc.getElementById('labInspirationGo');
 const options=doc.querySelector('.go-options');
 if(!reminder&&options){reminder=doc.createElement('p');reminder.id='labInspirationGo';reminder.textContent='INSPIRATION INCLUDED IN GO.';options.before(reminder)}
 if(reminder)reminder.hidden=!value;
}
window.HipsterLabRefresh=()=>{
 labRefreshState();
 const value=labInspiration(),changed=value!==labLastInspiration;labLastInspiration=value;
 if(changed)copiedPrompt=null;render();
 if(value&&changed){labNavigate('jukebox');labRevealInspiration(doc.getElementById('labInspiration'))}
 if(changed)status(value?'Inspiration kept. Choose moods, pace and places, then press GO.':'Shared inspiration removed.');
};
