// Inserted inside the Lab-only app.js closure. Shared text remains plain text.
function labInspirationTitle(title,text){
 const withoutLinks=value=>String(value||'').replace(/(?:https?:\/\/|www\.)[^\s<>]+/gi,'').trim().replace(/\s+[—–|:-]$/, '');
 return labSummary(withoutLinks(title)||withoutLinks(text)||'Shared link');
}
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
let labInspirationAfterSave=null;
function labCloseInspirationEditor(){
 doc.getElementById('labInspirationEditor').hidden=true;
 renderLabInspiration();
}
function labOpenInspirationEditor(){
 const fromCrate=labScreen==='crate';
 labNavigate('jukebox');
 const editor=doc.getElementById('labInspirationEditor');
 editor.querySelector('textarea').value=labInspiration();
 editor.hidden=false;
 renderLabInspiration();
 if(fromCrate)labRevealInspiration(editor);
 editor.querySelector('[data-cancel]').focus({preventScroll:true});
}
function labApplyInspiration(afterSave){
 const editor=doc.getElementById('labInspirationEditor');
 const value=editor.querySelector('textarea').value.trim();
 if(!value || !window.HipsterLab?.applyInspiration)return false;
 if(labInspirationAfterSave)return true;
 labInspirationAfterSave=()=>{labCloseInspirationEditor();afterSave?.()};
 window.HipsterLab.applyInspiration(value);
 return true;
}
function labSubmitDraftBeforeGo(){
 const editor=doc.getElementById('labInspirationEditor');
 return !!editor && !editor.hidden && labApplyInspiration(copyGo);
}
function renderLabInspiration(){
 const anchor=doc.querySelector('.refinements');if(!anchor)return;let card=doc.getElementById('labInspiration');
 if(!card){
  const controls=doc.createElement('div');
  controls.innerHTML=`<button type="button" id="labAddInspiration"><span class="lab-inspiration-add-label"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M6 10h8m-4-4v8"/></svg>Add inspiration</span><small>Song, artist, album, or link</small></button>
   <form id="labInspirationEditor" hidden>
    <label for="labInspirationDraft">What’s inspiring this mix?</label>
    <textarea id="labInspirationDraft" rows="1" maxlength="2000" placeholder="Paste a link or describe the sound" required></textarea>
    <div class="lab-inspiration-editor-actions">
     <button type="submit">Use inspiration</button>
     <button type="button" data-cancel>Cancel</button>
    </div>
    <div id="labLatestInspiration" hidden>
     <button type="button">
      <span class="lab-inspiration-recent-copy"><span>Recent inspiration</span><strong></strong></span>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 5v5H5m4-4-4 4 4 4"/></svg>
     </button>
    </div>
   </form>`;
  anchor.before(controls);
  controls.querySelector('#labAddInspiration').onclick=labOpenInspirationEditor;
  const editor=controls.querySelector('form');
  editor.onsubmit=event=>{
   event.preventDefault();
   labApplyInspiration(()=>doc.getElementById('labReviewInspiration').focus({preventScroll:true}));
  };
  editor.querySelector('[data-cancel]').onclick=()=>{
   labCloseInspirationEditor();
   doc.getElementById(labInspiration()?'labReviewInspiration':'labAddInspiration').focus({preventScroll:true});
  };
  card=doc.createElement('aside');card.id='labInspiration';card.setAttribute('aria-label','Active musical inspiration');
  const text=doc.createElement('div'),label=doc.createElement('strong');label.textContent='INSPIRATION';
  const preview=doc.createElement('p');preview.id='labInspirationPreview';
  const note=doc.createElement('p');note.id='labInspirationMetadataStatus';note.setAttribute('role','status');note.className='lab-inspiration-metadata-status';
  text.append(label,preview,note);
  const actions=doc.createElement('div');actions.className='lab-inspiration-actions';
  const review=doc.createElement('button');review.type='button';review.id='labReviewInspiration';review.textContent='EDIT';review.addEventListener('click',labOpenInspirationEditor);
  const dismiss=doc.createElement('button');dismiss.type='button';dismiss.id='labDismissInspiration';dismiss.textContent='×';dismiss.setAttribute('aria-label','Remove inspiration from Jukebox; keep in recent inspirations');dismiss.addEventListener('click',()=>{window.HipsterLab?.clearInspiration?.();doc.getElementById('labAddInspiration').focus({preventScroll:true})});
  actions.append(review,dismiss);card.append(text,actions);anchor.before(card);
 }
 const value=labInspiration(),editing=!doc.getElementById('labInspirationEditor').hidden;
 card.hidden=!value||editing;
 doc.getElementById('labAddInspiration').hidden=!!value||editing;
 const latest=labState().recentInspirations?.[0];
 const recent=doc.getElementById('labLatestInspiration');
 recent.hidden=!latest?.text;
 const recentButton=recent.querySelector('button');
 recentButton.querySelector('strong').textContent=labInspirationTitle(latest?.title,latest?.text);
 recentButton.onclick=()=>{doc.getElementById('labInspirationDraft').value=latest?.text||''};
 const preview=labState().inspirationPreview||{};
 const title=labInspirationTitle(preview.title,value);
 doc.getElementById('labInspirationPreview').textContent=title;
 const go=doc.querySelector('.grind');
 if(go){
  let slip=doc.getElementById('labInspirationGo');
  if(!slip){
   slip=doc.createElement('p');slip.id='labInspirationGo';
   slip.innerHTML='<strong aria-label="Inspiration">INSP</strong><span></span>';
   go.after(slip);
  }
  slip.hidden=!value;
  slip.querySelector('span').textContent=title;
 }
 const metaNote=doc.getElementById('labInspirationMetadataStatus');
 const hasLink=/https:\/\/[^\s<>]+/i.test(value);
 const message=hasLink?(preview.loading?'Looking up link details…':
   preview.metadataStatus==='unavailable'?'Link details unavailable. Original link saved.':''):'';
 metaNote.textContent=message;metaNote.hidden=!message;
}
window.HipsterLabRefresh=()=>{
 labRefreshState();
 const value=labInspiration(),changed=value!==labLastInspiration;labLastInspiration=value;
 if(changed||(copiedPrompt&&copiedPrompt!==goPrompt(ai,service,mood)))copiedPrompt=null;render();
 const afterSave=labInspirationAfterSave;labInspirationAfterSave=null;
 if(afterSave)afterSave();
 else if(value&&changed){labNavigate('jukebox');labRevealInspiration(doc.getElementById('labInspiration'))}
 if(changed)status(value?'Inspiration kept. Choose moods, pace and places, then press GO.':'Shared inspiration removed.');
};
