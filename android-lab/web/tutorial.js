let labGuideStep='inspiration';
const labGuideSteps={
 setup:{title:'Set up Gemini',text:'Copy the setup check, paste it into Gemini and send. Confirm the Go, Hipster, Go! Skill is saved and YouTube Music is available.',frames:[['LAB','Copy Setup Check'],['GEMINI','Paste → Send'],['CHECK','Skill saved · YouTube Music available']],note:'Use the latest Skill. A link or playlist preview alone does not confirm setup.',action:'COPY SETUP CHECK'},
 inspiration:{title:'An idea is all you need',text:'Your Crate → ADD. Type “A rainy train ride after midnight”. Tap Use in Jukebox, then GO. Paste the request in Gemini and send.',frames:[['1 · ADD','Type: A rainy train ride after midnight'],['2 · USE IN JUKEBOX','Add a mood if you like. Or leave it to us.'],['3 · GO','Paste in Gemini → Send. Wait for your playlist.']],note:'Active inspiration replaces the random discovery route. Your chosen moods, regions and pace still apply. Remove it to return to random routes.',action:'OPEN YOUR CRATE'},
 submit:{title:'Send your crate',text:'Choose your moods, pace and regions in Jukebox. Press GO, then review and send the request in Gemini.',frames:[['JUKEBOX','Moods · Pace · Regions'],['GO','Copy + Open Gemini'],['GEMINI','Paste if needed → Send']],note:'Keep the whole workflow in the same Gemini conversation.',action:'OPEN JUKEBOX'},
 review:{title:'Give it a listen. Then de-cheese.',text:'Stay in the same Gemini chat. Send “go de-cheese”. Read the audit and tell Gemini which fixes you want.',frames:[['GEMINI','go de-cheese'],['READ','Look for weak fits in your rainy-night playlist'],['REPLY','Happy with it? Move on. Want changes? Say which.']],note:'De-cheese starts with a read-only audit. It does not change the playlist without your approval.',action:'COPY DE-CHEESE COMMAND'},
 publish:{title:'One word: Publish',text:'Send “Publish” in the same Gemini chat to save the playlist, description, tracklist and liner notes to your YouTube Music account.',frames:[['GEMINI','Publish'],['WAIT','Gemini saves this playlist and its liner notes'],['OPEN YOUTUBE MUSIC','Library → Playlists. Check your playlist and description.']],note:'Open the playlist to check the saved result. If saving or metadata fails, follow Gemini’s recovery step.',action:'COPY PUBLISH COMMAND'},
 cover:{title:'Finish the sleeve',text:'Download the generated cover. Open your saved playlist at music.youtube.com in a browser, edit its artwork, choose the image, crop and save.',frames:[['COVER','Download image'],['BROWSER','Saved playlist → Edit artwork'],['YOU','Choose image → Crop → Save']],note:'Cover art is manual. Try Desktop site if the edit control is missing on mobile; custom artwork may not be available on every account.',action:'OPEN YOUTUBE MUSIC'}
};
const labGuideOutcomes={
 setup:['Before you start','Gemini confirms the Skill and YouTube Music tools are available.','inspiration','START YOUR PLAYLIST'],
 inspiration:['1 · Build your playlist','Your Gemini request includes your reference and chosen settings.','review','NEXT: REVIEW'],
 submit:['1 · Build your playlist','Gemini has returned a playlist you can open and review.','review','NEXT: REVIEW'],
 review:['2 · Review your playlist','You have read the audit and approved any fixes you want.','publish','NEXT: PUBLISH'],
 publish:['3 · Save your playlist','Gemini reports it saved, and you can find the playlist and notes in your YouTube Music library.','cover','OPTIONAL: COVER ART'],
 cover:['Optional · Cover art','The saved playlist shows your chosen image.','inspiration','MAKE ANOTHER PLAYLIST']
};
function labStopGuide(){
 const demo=doc.getElementById('labGuideDemo');if(demo){demo.classList.remove('is-playing');const video=demo.querySelector('video');if(video){if(!video.paused)video.pause();try{video.currentTime=0}catch(e){}}}
 const play=doc.getElementById('labGuidePlay');if(play)play.textContent='REPLAY DEMO';
}
function labRenderGuide(step){
 if(!Object.hasOwn(labGuideSteps,step))step='inspiration';
 labStopGuide();labGuideStep=step;const data=labGuideSteps[step],outcome=labGuideOutcomes[step];
 try{localStorage.setItem('ghg-guide-step-v1',step)}catch(e){}
 doc.getElementById('labGuidePhase').textContent=outcome[0];
 doc.querySelectorAll('.lab-guide-start,.lab-guide-shortcuts').forEach(el=>el.hidden=!['setup','inspiration','submit'].includes(step));
 doc.querySelector('.lab-guide-fallback').hidden=step!=='setup';
 doc.querySelector('#labGuideHelp>summary').textContent=({setup:'Setup not working?',inspiration:'How does inspiration change GO?',submit:'Where do I send the request?',review:'Does de-cheese change the playlist?',publish:'Playlist or notes not saved?',cover:'Can’t find the artwork control?'})[step];
 doc.getElementById('labGuideReady').textContent='Ready to move on when: '+outcome[1];
 doc.getElementById('labGuideNext').textContent=outcome[3];
 doc.getElementById('labGuideBack').hidden=step==='inspiration'||step==='setup';
 doc.getElementById('labGuideWatch').open=step==='inspiration';doc.getElementById('labGuideHelp').open=false;
 doc.querySelectorAll('[data-guide-step]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guideStep===step)));
 doc.getElementById('labGuideTitle').textContent=data.title;doc.getElementById('labGuideText').textContent=data.text;doc.getElementById('labGuideNote').textContent=data.note;doc.getElementById('labGuideAction').textContent=step==='setup'&&(ai!=='gemini'||service!=='youtube')?'CHOOSE GEMINI + YOUTUBE MUSIC':data.action;
 const demo=doc.getElementById('labGuideDemo');demo.replaceChildren();demo.setAttribute('aria-label',data.frames.map(f=>f.join(': ')).join('. '));
 const recorded=['setup','inspiration','submit'].includes(step);
 demo.setAttribute('role',recorded?'group':'img');
 doc.getElementById('labGuideWatchLabel').textContent=recorded?'Watch the '+(step==='inspiration'?'17':'7')+'-second app demo':'See the steps';
 doc.querySelector('.lab-guide-controls').hidden=recorded;
 let transcript=demo;
 if(recorded){
  const video=doc.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.width=390;video.height=620;video.poster='/assets/tutorial-media/'+step+'.webp';video.src='/assets/tutorial-media/'+step+'.mp4';video.setAttribute('aria-label','App recording: '+data.title);
  video.addEventListener('play',()=>{demo.classList.add('is-playing');doc.getElementById('labGuidePlay').textContent='PAUSE DEMO'});
  video.addEventListener('pause',()=>{demo.classList.remove('is-playing');doc.getElementById('labGuidePlay').textContent='PLAY DEMO'});
  video.addEventListener('ended',labStopGuide);
  const caption=doc.createElement('p');caption.className='lab-help';caption.textContent=step==='inspiration'?'Real app walkthrough · Android entry dialog recreated and labelled. No request sent.':'App recording · Demo choices. Nothing sent to Gemini.';
  const details=doc.createElement('details'),summary=doc.createElement('summary');summary.textContent='Steps in this clip';details.append(summary);demo.append(video,caption,details);transcript=details;
  if(step==='inspiration'){const chapters=doc.createElement('div');chapters.className='lab-guide-chapters';chapters.setAttribute('aria-label','Replay a part of the walkthrough');for(const [label,time] of [['Add an idea',0],['Type it',2.7],['Use it',7.9],['GO',12.7]]){const b=doc.createElement('button');b.type='button';b.className='lab-text-button';b.textContent=label;b.onclick=()=>{video.currentTime=time;video.play().catch(()=>{doc.getElementById('labGuideStatus').textContent='Use the video play button to continue.'})};chapters.append(b)}video.after(chapters)}
 }
 for(const [i,frame] of data.frames.entries()){
  const row=doc.createElement('div');row.className='lab-guide-frame';row.style.setProperty('--guide-order',i);
  const label=doc.createElement('span');label.textContent=frame[0];const content=doc.createElement('strong');content.textContent=frame[1];row.append(label,content);transcript.append(row);
 }
 doc.getElementById('labGuidePlay').textContent='PLAY DEMO';
 doc.getElementById('labGuideStatus').textContent='';
}
function labOpenGuide(){
 doc.getElementById('labPreferences')?.close();labNavigate('manual');
 labRenderGuide(labGuideStep);
 const title=doc.getElementById('labTutorialTitle');title.scrollIntoView({block:'start',behavior:'instant'});title.focus({preventScroll:true});
}
function initLabGuide(){
 const target=doc.getElementById('handoffInstruction');
 if(target){const b=doc.createElement('button');b.id='labGeminiGuide';b.type='button';b.className='lab-text-button';b.textContent='REVIEW → PUBLISH: QUICK GUIDE';b.hidden=true;b.onclick=()=>{labRenderGuide('review');labOpenGuide()};target.after(b)}
 const settings=doc.createElement('button');settings.type='button';settings.className='lab-wide-button';settings.textContent='GEMINI QUICK START';settings.onclick=labOpenGuide;doc.getElementById('labSetupDetails').before(settings);
 doc.querySelectorAll('[data-guide-step],[data-guide-start]').forEach(b=>b.onclick=()=>{labRenderGuide(b.dataset.guideStep||b.dataset.guideStart);doc.getElementById('labGuideJump').open=false;doc.getElementById('labGuideTitle').setAttribute('tabindex','-1');doc.getElementById('labGuideTitle').focus({preventScroll:true})});
 const advance=step=>{labRenderGuide(step);const title=doc.getElementById('labGuideTitle');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});title.scrollIntoView({block:'start',behavior:'instant'})};
 doc.getElementById('labGuideNext').onclick=()=>advance(labGuideOutcomes[labGuideStep][2]);
 doc.getElementById('labGuideBack').onclick=()=>advance(labGuideStep==='publish'?'review':labGuideStep==='cover'?'publish':'inspiration');
 doc.getElementById('labGuideWatch').addEventListener('toggle',e=>{if(!e.target.open)labStopGuide()});
 const demo=doc.getElementById('labGuideDemo'),play=doc.getElementById('labGuidePlay');
 play.onclick=()=>{const video=demo.querySelector('video');if(video){if(video.paused)video.play().catch(()=>{doc.getElementById('labGuideStatus').textContent='Playback unavailable. Open Steps in this clip instead.'});else video.pause();return}if(demo.classList.contains('is-playing')){labStopGuide();return}void demo.offsetWidth;demo.classList.add('is-playing');play.textContent='STOP DEMO'};
 demo.addEventListener('animationend',e=>{if(e.target===demo.lastElementChild)labStopGuide()});
 doc.getElementById('labGuideAction').onclick=async event=>{
  const step=labGuideStep,b=event.currentTarget;
  if(step==='setup'){
   if(ai!=='gemini'||service!=='youtube'){labPreferences();status('Choose Gemini and YouTube Music, then copy the setup check.');return}
   await labCopySetup(b);doc.getElementById('labGuideStatus').textContent=doc.getElementById('labSetupStatus').textContent;return;
  }
  if(step==='inspiration'){labNavigate('crate');return}
  if(step==='submit'){labNavigate('jukebox');return}
  if(step==='cover'){window.open('https://music.youtube.com/','_blank','noopener');return}
  b.disabled=true;
  try{const ok=await copyText(step==='publish'?'Publish':'go de-cheese');doc.getElementById('labGuideStatus').textContent=(ok?'Command copied. Paste it into the same Gemini conversation.':'Copy failed. Type '+(step==='publish'?'Publish':'go de-cheese')+' in the same Gemini conversation.')}finally{b.disabled=false}
 };
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)labStopGuide()});
 let saved='inspiration';try{saved=localStorage.getItem('ghg-guide-step-v1')||saved}catch(e){}
 labRenderGuide(saved);
}
