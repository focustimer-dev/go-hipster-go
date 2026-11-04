let labGuideStep='setup';
const labGuideSteps={
 setup:{title:'Set up Gemini',text:'Copy the setup check, paste it into Gemini and send. Confirm the Go, Hipster, Go! Skill is saved and YouTube Music is available.',frames:[['LAB','Copy Setup Check'],['GEMINI','Paste → Send'],['CHECK','Skill saved · YouTube Music available']],note:'Use the latest Skill. A link or playlist preview alone does not confirm setup.',action:'COPY SETUP CHECK'},
 submit:{title:'Send your crate',text:'Choose your moods, pace and regions in Jukebox. Press GO, then review and send the request in Gemini.',frames:[['JUKEBOX','Moods · Pace · Regions'],['GO','Copy + Open Gemini'],['GEMINI','Paste if needed → Send']],note:'Keep the whole workflow in the same Gemini conversation.',action:'OPEN JUKEBOX'},
 review:{title:'Listen. Then de-cheese.',text:'Review the playlist. Send “go de-cheese” for an audit. Read the findings and approve any fixes you want before publishing.',frames:[['GEMINI','go de-cheese'],['REVIEW','Read the findings'],['YOU','Approve fixes, if needed']],note:'De-cheese starts with a read-only audit. It does not change the playlist without your approval.',action:'COPY DE-CHEESE COMMAND'},
 publish:{title:'Make it yours',text:'Send “Publish” in the same Gemini chat to save the playlist, description, tracklist and liner notes to your YouTube Music account.',frames:[['GEMINI','Publish'],['SAVE','Existing playlist + liner notes'],['CHECK','Confirm the saved result']],note:'Open the playlist to check the saved result. If saving or metadata fails, follow Gemini’s recovery step.',action:'COPY PUBLISH COMMAND'},
 cover:{title:'Finish the sleeve',text:'Download the generated cover. Open your saved playlist at music.youtube.com in a browser, edit its artwork, choose the image, crop and save.',frames:[['COVER','Download image'],['BROWSER','Saved playlist → Edit artwork'],['YOU','Choose image → Crop → Save']],note:'Cover art is manual. Try Desktop site if the edit control is missing on mobile; custom artwork may not be available on every account.',action:'OPEN YOUTUBE MUSIC'}
};
function labStopGuide(){
 const demo=doc.getElementById('labGuideDemo');if(demo)demo.classList.remove('is-playing');
 const play=doc.getElementById('labGuidePlay');if(play)play.textContent='REPLAY DEMO';
}
function labRenderGuide(step){
 labStopGuide();labGuideStep=step;const data=labGuideSteps[step];
 doc.querySelectorAll('[data-guide-step]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guideStep===step)));
 doc.getElementById('labGuideTitle').textContent=data.title;doc.getElementById('labGuideText').textContent=data.text;doc.getElementById('labGuideNote').textContent=data.note;doc.getElementById('labGuideAction').textContent=step==='setup'&&(ai!=='gemini'||service!=='youtube')?'CHOOSE GEMINI + YOUTUBE MUSIC':data.action;
 const demo=doc.getElementById('labGuideDemo');demo.replaceChildren();demo.setAttribute('aria-label',data.frames.map(f=>f.join(': ')).join('. '));
 for(const [i,frame] of data.frames.entries()){
  const row=doc.createElement('div');row.className='lab-guide-frame';row.style.setProperty('--guide-order',i);
  const label=doc.createElement('span');label.textContent=frame[0];const content=doc.createElement('strong');content.textContent=frame[1];row.append(label,content);demo.append(row);
 }
 doc.getElementById('labGuidePlay').textContent='PLAY DEMO';
 doc.getElementById('labGuideStatus').textContent='';
}
function labOpenGuide(){
 doc.getElementById('labPreferences')?.close();labNavigate('manual');
 const title=doc.getElementById('labTutorialTitle');title.scrollIntoView({block:'start',behavior:'instant'});title.focus({preventScroll:true});
}
function initLabGuide(){
 const target=doc.getElementById('handoffInstruction');
 if(target){const b=doc.createElement('button');b.id='labGeminiGuide';b.type='button';b.className='lab-text-button';b.textContent='REVIEW → PUBLISH: QUICK GUIDE';b.hidden=true;b.onclick=()=>{labRenderGuide('review');labOpenGuide()};target.after(b)}
 const settings=doc.createElement('button');settings.type='button';settings.className='lab-wide-button';settings.textContent='GEMINI QUICK START';settings.onclick=labOpenGuide;doc.getElementById('labSetupDetails').before(settings);
 doc.querySelectorAll('[data-guide-step]').forEach(b=>b.onclick=()=>labRenderGuide(b.dataset.guideStep));
 const demo=doc.getElementById('labGuideDemo'),play=doc.getElementById('labGuidePlay');
 play.onclick=()=>{if(demo.classList.contains('is-playing')){labStopGuide();return}void demo.offsetWidth;demo.classList.add('is-playing');play.textContent='STOP DEMO'};
 demo.addEventListener('animationend',e=>{if(e.target===demo.lastElementChild)labStopGuide()});
 doc.getElementById('labGuideAction').onclick=async event=>{
  const step=labGuideStep,b=event.currentTarget;
  if(step==='setup'){
   if(ai!=='gemini'||service!=='youtube'){labPreferences();status('Choose Gemini and YouTube Music, then copy the setup check.');return}
   await labCopySetup(b);doc.getElementById('labGuideStatus').textContent=doc.getElementById('labSetupStatus').textContent;return;
  }
  if(step==='submit'){labNavigate('jukebox');return}
  if(step==='cover'){window.open('https://music.youtube.com/','_blank','noopener');return}
  b.disabled=true;
  try{const ok=await copyText(step==='publish'?'Publish':'go de-cheese');doc.getElementById('labGuideStatus').textContent=(ok?'Command copied. Paste it into the same Gemini conversation.':'Copy failed. Type '+(step==='publish'?'Publish':'go de-cheese')+' in the same Gemini conversation.')}finally{b.disabled=false}
 };
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)labStopGuide()});
 labRenderGuide('setup');
}
