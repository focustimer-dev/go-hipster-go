// Cahill chart rail: horizontal focus+context without a second map or overlay panel.
// Its own surface handles navigation, leaving the repaired country pointerup path intact.
function labCahillInstallNavigator({host,camera}){
 const W=960;
 const root=doc.createElement('div');
 root.id='labCahillNavigator';
 root.className='lab-cahill-pan-strip';
 root.hidden=true;
 root.setAttribute('role','group');
 root.setAttribute('aria-label','Cahill map horizontal navigation');
 const left=doc.createElement('span');
 left.className='lab-cahill-pan-end';
 left.textContent='W';
 left.setAttribute('aria-hidden','true');
 const right=doc.createElement('span');
 right.className='lab-cahill-pan-end';
 right.textContent='E';
 right.setAttribute('aria-hidden','true');
 const rail=doc.createElement('div');
 rail.className='lab-cahill-pan-rail';
 rail.tabIndex=0;
 rail.setAttribute('role','slider');
 rail.setAttribute('aria-label','Pan Cahill world map west or east');
 rail.setAttribute('aria-orientation','horizontal');
 rail.setAttribute('aria-valuemin','0');
 rail.setAttribute('aria-valuemax','100');
 rail.setAttribute('aria-valuenow','0');
 rail.title='Drag along the strip or tap to travel east or west';
 const track=doc.createElement('div');
 track.className='lab-cahill-pan-track';
 track.setAttribute('aria-hidden','true');
 const thumb=doc.createElement('div');
 thumb.className='lab-cahill-pan-window';
 track.appendChild(thumb);
 rail.appendChild(track);
 root.append(left,rail,right);
 host.appendChild(root);
 // The rail is a sibling of the map SVG, not a nested map gesture handler.
 for(const name of ['click','dblclick','pointerdown','pointermove','pointerup'])
  root.addEventListener(name,e=>e.stopPropagation());
 let active=false,paintFrame=0,nextView=null,drag=null;
 const render=()=>{
  paintFrame=0;
  if(!nextView)return;
  const b=nextView;nextView=null;
  // Horizontal span is truthful: width=visible world / complete world.
  const width=b.w/W*100,position=b.x/W*100;
  thumb.style.width=width.toFixed(4)+'%';
  thumb.style.left=position.toFixed(4)+'%';
  const available=Math.max(0,W-b.w);
  const progress=available<.0001?0:Math.round(b.x/available*100);
  rail.setAttribute('aria-valuenow',String(progress));
  rail.setAttribute('aria-valuetext',
    'World view '+progress+' percent toward east. Use arrow keys to pan.');
 };
 const onCamera=b=>{
  if(!active)return;
  // Hysteresis keeps the rail out of the full-world view and prevents flicker.
  if(b.zoom>1.12)root.hidden=false;
  else if(b.zoom<1.04)root.hidden=true;
  nextView=b;
  if(!paintFrame)paintFrame=requestAnimationFrame(render);
 };
 const getTrackPoint=e=>{
  const box=rail.getBoundingClientRect();
  if(!box.width)return null;
  return {x:Math.max(0,Math.min(box.width,e.clientX-box.left)),width:box.width};
 };
 const move=e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const p=getTrackPoint(e);if(!p)return;
  const b=camera.snapshot();
  const centerX=(p.x-drag.offsetPx)/p.width*W;
  camera.centerAt(centerX,b.y+b.h/2);
 };
 rail.addEventListener('pointerdown',e=>{
  if(!active||root.hidden||drag||e.button>0)return;
  const p=getTrackPoint(e);if(!p)return;
  e.preventDefault();e.stopPropagation();
  const b=camera.snapshot();
  const start=b.x/W*p.width,end=(b.x+b.w)/W*p.width;
  const inside=p.x>=start&&p.x<=end;
  const center=(start+end)/2;
  drag={id:e.pointerId,offsetPx:inside?p.x-center:0};
  try{rail.setPointerCapture(e.pointerId)}catch(_){}
  move(e);
 });
 rail.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  e.preventDefault();e.stopPropagation();move(e);
 });
 const end=e=>{
  if(!drag||drag.id!==e.pointerId)return;
  drag=null;
  try{if(rail.hasPointerCapture(e.pointerId))rail.releasePointerCapture(e.pointerId)}catch(_){}
  e.stopPropagation();
 };
 rail.addEventListener('pointerup',end);
 rail.addEventListener('pointercancel',end);
 rail.addEventListener('lostpointercapture',e=>{
  if(drag?.id===e.pointerId)drag=null;
 });
 rail.addEventListener('keydown',e=>{
  const b=camera.snapshot(),cy=b.y+b.h/2,step=b.w*(e.shiftKey?.5:.18);
  let next=null;
  if(e.key==='ArrowLeft')next=b.x+b.w/2-step;
  if(e.key==='ArrowRight')next=b.x+b.w/2+step;
  if(e.key==='Home')next=b.w/2;
  if(e.key==='End')next=W-b.w/2;
  if(next===null)return;
  e.preventDefault();e.stopPropagation();camera.centerAt(next,cy);
 });
 const deactivate=()=>{
  active=false;root.hidden=true;drag=null;nextView=null;
  if(paintFrame)cancelAnimationFrame(paintFrame);
  paintFrame=0;
 };
 const activate=()=>{active=true;onCamera(camera.snapshot())};
 camera.subscribe(onCamera);
 return {root,rail,thumb,activate,deactivate,onCamera};
}
