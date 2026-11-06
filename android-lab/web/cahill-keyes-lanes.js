// Accessible, map-specific nautical ink for the Cahill–Keyes interruptions.
// Coordinates are inherited from the same original Robinson/Globe route notes.
// Route strokes never connect disconnected octahedral lobes (see projected-route helper).
function labCahillInstallLanes({make,world,routes,projection,legacy,markers,canActivate,activateOnTap}){
 const lines=make('g',{'class':'lab-cahill-routes','pointer-events':'none'});
 const hits=make('g',{'class':'lab-cahill-route-hits'});
 const pins=make('g',{'class':'lab-cahill-route-pins'});
 world.append(lines,hits,pins);
 const bySecret=new Map(),hitPaths=[],pinNodes=[];
 const describe=id=>legacy?.querySelector('.atlas-secret-hotspot[data-secret="'+id+'"]')
  ?.getAttribute('aria-label')||('Discover '+id.replace(/-/g,' '));
 const open=id=>{
  legacy?._atlasSecretsSync?.(true);
  legacy?._atlasOpenSecret?.(id);
 };
 for(const feature of routes?.features||[]){
  const id=feature.properties?.secret;
  if(!id)continue;
  const route=labCahillProjectRoute(feature.geometry?.coordinates||[],projection);
  if(!route.d)continue;
  lines.appendChild(make('path',{d:route.d,'data-cahill-route':id,
   fill:'none',stroke:'#edc65d','stroke-opacity':'.7',
   'stroke-width':'1.25','stroke-dasharray':'3 5','stroke-linecap':'round',
   'vector-effect':'non-scaling-stroke','pointer-events':'none'}));
  const target=make('path',{d:route.d,'data-cahill-route-target':id,
   fill:'none',stroke:'transparent','stroke-width':'14','stroke-linecap':'round',
   'vector-effect':'non-scaling-stroke','pointer-events':'none'});
  target.addEventListener('click',event=>{
   if(!canActivate())return;
   event.stopPropagation();activateOnTap(()=>open(id),event);
  });
  hits.appendChild(target);hitPaths.push(target);
  const previous=bySecret.get(id);
  if(!previous){
   bySecret.set(id,{id,fragments:route.fragments.length,
    breaks:route.breaks,maxJump:route.maxJump,
    length:route.totalLength,midpoint:route.midpoint});
  }else{
   previous.fragments+=route.fragments.length;
   previous.breaks+=route.breaks;previous.maxJump=Math.max(previous.maxJump,route.maxJump);
   if(route.totalLength>previous.length){
    previous.length=route.totalLength;previous.midpoint=route.midpoint;
   }
  }
 }
 const pin=(id,xy,label)=>{
  if(!xy||!xy.every(Number.isFinite))return;
  const g=make('g',{'class':'lab-cahill-discovery','data-cahill-discovery':id,
   role:'button',tabindex:'-1','aria-label':label});
  const [x,y]=xy;
  g.appendChild(make('circle',{cx:x,cy:y,r:5.5,fill:'#103135',
   stroke:'#edc65d','stroke-width':'1.8','pointer-events':'none'}));
  // SVG vector-effect keeps the hit area roughly finger-sized at ANY
  // magnification, rather than shrinking with the projected geography.
  g.appendChild(make('circle',{cx:x,cy:y,r:5.5,fill:'transparent',
   stroke:'transparent','stroke-width':'37',
   'vector-effect':'non-scaling-stroke','pointer-events':'all'}));
  const activate=event=>{
   if(!canActivate())return;
   event.stopPropagation();activateOnTap(()=>open(id),event);
  };
  g.addEventListener('click',activate);
  g.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();activate(event)}
  });
  pins.appendChild(g);pinNodes.push(g);
 };
 for(const {id,midpoint} of bySecret.values())pin(id,midpoint,describe(id));
 for(const item of markers){
  const p=projection(item.point);
  if(item.secret)pin(item.secret,p,item.label||describe(item.secret));
 }
 const setZoom=zoom=>{
  const available=zoom>=1.55;
  pins.style.display=available?'':'none';
  hits.setAttribute('aria-hidden',String(!available));
  for(const g of pinNodes)g.setAttribute('tabindex',available?'0':'-1');
  for(const path of hitPaths)path.setAttribute('pointer-events',available?'stroke':'none');
 };
 setZoom(1);
 return {setZoom,open,stats:[...bySecret.values()].map(({id,fragments,breaks,maxJump})=>
  ({id,fragments,breaks,maxJump})),pinCount:pinNodes.length};
}
