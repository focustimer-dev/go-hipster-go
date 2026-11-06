// Cahill Navigator: a detachable focus+context chart. No handler touches the land SVG.
function labCahillInstallNavigator({host,make,world,regions,camera}){
 const W=960,H=505,TOP=65,NS='http://www.w3.org/2000/svg';
 const root=doc.createElement('div');
 root.id='labCahillNavigator';root.className='lab-cahill-nav';root.hidden=true;
 const toggle=doc.createElement('button');toggle.type='button';
 toggle.className='lab-cahill-nav-toggle';toggle.textContent='NAV';
 toggle.setAttribute('aria-label','Open Cahill world navigator');
 toggle.setAttribute('aria-expanded','false');
 toggle.setAttribute('aria-controls','labCahillNavigatorPanel');
 root.appendChild(toggle);
 const panel=doc.createElement('div');panel.id='labCahillNavigatorPanel';
 panel.className='lab-cahill-nav-panel';panel.hidden=true;
 const header=doc.createElement('div');header.className='lab-cahill-nav-header';
 const title=doc.createElement('span');title.textContent='CHART NAVIGATOR';
 const close=doc.createElement('button');close.type='button';
 close.className='lab-cahill-nav-close';close.textContent='×';
 close.setAttribute('aria-label','Close chart navigator');
 header.append(title,close);panel.appendChild(header);
 const surface=doc.createElement('div');surface.className='lab-cahill-nav-chart';
 const mini=make('svg',{viewBox:'0 '+TOP+' '+W+' '+H,'aria-hidden':'true',
   preserveAspectRatio:'xMidYMid meet'});
 mini.classList.add('lab-cahill-nav-mini');
 mini.setAttribute('focusable','false');
 const sea=world.querySelector('.lab-cahill-ocean');
 if(sea)mini.appendChild(sea.cloneNode(false));
 const grid=world.querySelector('.lab-cahill-graticule');
 if(grid)mini.appendChild(grid.cloneNode(false));
 const cap=world.querySelector('#labCahillAntarcticOcean');
 if(cap){const circle=cap.cloneNode(false);circle.removeAttribute('id');mini.appendChild(circle)}
 const mapNodes=[];
 for(const {id,node} of regions){
  const miniature=node.cloneNode(false);
  miniature.removeAttribute('id');
  miniature.removeAttribute('data-cahill-region');
  miniature.setAttribute('pointer-events','none');
  miniature.setAttribute('stroke-width','1.15');
  mini.appendChild(miniature);mapNodes.push({id,node:miniature});
 }
 const windowRect=make('rect',{class:'lab-cahill-nav-viewport',x:0,y:TOP,
  width:W,height:H,fill:'#fff3d3','fill-opacity':'.12',
  stroke:'#fff3d3','stroke-width':'2.3','vector-effect':'non-scaling-stroke',
  'pointer-events':'none'});
 // SVG viewBox units and vector-effect keep the viewfinder legible at any scale.
 mini.appendChild(windowRect);surface.appendChild(mini);
 const scrub=doc.createElement('div');scrub.className='lab-cahill-nav-scrub';
 scrub.tabIndex=0; scrub.setAttribute('role','group');
 scrub.setAttribute('aria-label','Navigator chart. Drag to move the map, or use arrow keys.');
 scrub.title='Drag or tap to move the main map';
 surface.appendChild(scrub);panel.appendChild(surface);
 const hint=doc.createElement('div');hint.className='lab-cahill-nav-hint';
 hint.textContent='DRAG THE FRAME · TAP TO JUMP';panel.appendChild(hint);
 root.appendChild(panel);host.appendChild(root);
 // Never forward chart-tool events to MapLibre or the land-selection surface.
 for(const name of ['click','dblclick','pointerdown','pointermove','pointerup'])
  root.addEventListener(name,event=>event.stopPropagation());
 let active=false,open=false,paintFrame=0,pending=null,drag=null;
 const closePanel=({restoreFocus=false}={})=>{
  open=false;panel.hidden=true;toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Open Cahill world navigator');
  root.classList.remove('is-open');
  if(restoreFocus&&!root.hidden)toggle.focus();
 };
 const showPanel=()=>{
  if(!active||root.hidden)return;
  open=true;panel.hidden=false;root.classList.add('is-open');
  toggle.setAttribute('aria-expanded','true');
  toggle.setAttribute('aria-label','Close Cahill world navigator');
 };
 toggle.addEventListener('click',()=>{
  if(open)closePanel();else showPanel();
 });
 close.addEventListener('click',()=>closePanel({restoreFocus:true}));
 const closeEscape=e=>{
  if(e.key==='Escape'&&open){e.preventDefault();closePanel({restoreFocus:true})}
 };
 panel.addEventListener('keydown',closeEscape);
 const paint=()=>{
  paintFrame=0;if(!pending)return;
  const b=pending;pending=null;
  windowRect.setAttribute('x',b.x);
  windowRect.setAttribute('y',b.y);
  windowRect.setAttribute('width',b.w);
  windowRect.setAttribute('height',b.h);
 };
 const onCamera=b=>{
  if(!active)return;
  // Hysteresis prevents the NAV button flickering around resting zoom.
  if(!open&&b.zoom<=1.03){root.hidden=true}
  else if(b.zoom>1.08){root.hidden=false}
  else if(open&&b.zoom<=1.03){closePanel();root.hidden=true}
  pending=b;if(!paintFrame)paintFrame=requestAnimationFrame(paint);
 };
 const pointFromScreen=e=>{
  const p=mini.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
  const ctm=mini.getScreenCTM();
  if(!ctm)return null;
  const q=p.matrixTransform(ctm.inverse());
  return [Math.max(0,Math.min(W,q.x)),Math.max(TOP,Math.min(TOP+H,q.y))];
 };
 const moveTo=e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const p=pointFromScreen(e);if(!p)return;
  camera.centerAt(p[0]-drag.offsetX,p[1]-drag.offsetY);
 };
 scrub.addEventListener('pointerdown',e=>{
  if(!active||!open||(!e.isPrimary&&e.pointerType!=='mouse'))return;
  e.preventDefault();e.stopPropagation();
  const p=pointFromScreen(e),b=camera.snapshot();
  if(!p)return;
  const inside=p[0]>=b.x&&p[0]<=b.x+b.w&&p[1]>=b.y&&p[1]<=b.y+b.h;
  drag={id:e.pointerId,offsetX:inside?p[0]-(b.x+b.w/2):0,
        offsetY:inside?p[1]-(b.y+b.h/2):0};
  scrub.setPointerCapture(e.pointerId);moveTo(e);
 });
 scrub.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  e.preventDefault();e.stopPropagation();moveTo(e);
 });
 const stop=e=>{
  if(!drag||e.pointerId!==drag.id)return;
  drag=null;
  try{if(scrub.hasPointerCapture(e.pointerId))scrub.releasePointerCapture(e.pointerId)}catch(_){}
  e.stopPropagation();
 };
 scrub.addEventListener('pointerup',stop);
 scrub.addEventListener('pointercancel',stop);
 scrub.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)drag=null});
 scrub.addEventListener('keydown',e=>{
  const b=camera.snapshot(),increment=e.shiftKey?.3:.15;
  const d={ArrowLeft:[-b.w*increment,0],ArrowRight:[b.w*increment,0],
    ArrowUp:[0,-b.h*increment],ArrowDown:[0,b.h*increment]}[e.key];
  if(!d)return;
  e.preventDefault();e.stopPropagation();camera.panBy(d[0],d[1]);
 });
 const syncSelection=selected=>{
  for(const {id,node} of mapNodes)
   node.setAttribute('fill',selected.has(id)?'#a83223':'#dfb045');
 };
 const deactivate=()=>{
  active=false;closePanel();
  root.hidden=true;drag=null;
  if(paintFrame){cancelAnimationFrame(paintFrame);paintFrame=0}
  pending=null;
 };
 const activate=()=>{active=true;onCamera(camera.snapshot())};
 camera.subscribe(onCamera);
 syncSelection(crateSelected);
 return {root,toggle,panel,scrub,mini,windowRect,activate,deactivate,
   syncSelection,onCamera,close:closePanel,isOpen:()=>open};
}
