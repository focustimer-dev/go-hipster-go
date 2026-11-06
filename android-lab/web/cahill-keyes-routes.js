// Offline Cahill-Keyes nautical route projection.
//
// The M-map deliberately interrupts the world at several octahedral edges.
// These tracks originate in the same geographic waypoints as Robinson/Globe;
// use great-circle interpolation ONLY within each existing route leg and
// start a new SVG subpath when projection space jumps across an interruption.
// No invented bridge segments or straight diagonals across the empty wedges.
function labCahillProjectRoute(coordinates,projection){
 const RAD=Math.PI/180,DEG=180/Math.PI;
 const xyz=([lon,lat])=>[
  Math.cos(lat*RAD)*Math.cos(lon*RAD),
  Math.cos(lat*RAD)*Math.sin(lon*RAD),
  Math.sin(lat*RAD)
 ];
 const pointAlong=(a,b,t)=>{
  const p=xyz(a),q=xyz(b);
  const dot=Math.max(-1,Math.min(1,p.reduce((s,x,i)=>s+x*q[i],0)));
  const omega=Math.acos(dot),sin=Math.sin(omega);
  if(omega<1e-7||Math.abs(sin)<1e-7)return [a[0]*(1-t)+b[0]*t,a[1]*(1-t)+b[1]*t];
  const pa=Math.sin((1-t)*omega)/sin,pb=Math.sin(t*omega)/sin;
  const v=p.map((x,i)=>x*pa+q[i]*pb);
  return [Math.atan2(v[1],v[0])*DEG,Math.atan2(v[2],Math.hypot(v[0],v[1]))*DEG];
 };
 const sampled=[];
 for(let i=0;i<coordinates.length;i++){
  const a=coordinates[Math.max(0,i-1)],b=coordinates[i];
  const ar=xyz(a),br=xyz(b);
  const angle=Math.acos(Math.max(-1,Math.min(1,ar.reduce((s,x,j)=>s+x*br[j],0))));
  const steps=i?Math.max(1,Math.ceil(angle*DEG/1.2)):0;
  for(let k=i?1:0;k<=steps;k++){
   const geographic=steps?pointAlong(a,b,k/steps):b;
   const xy=projection(geographic);
   if(xy?.length===2&&xy.every(Number.isFinite))sampled.push(xy);
  }
 }
 const fragments=[];
 let part=[],breaks=0,maxJump=0;
 const flush=()=>{if(part.length>1)fragments.push(part);part=[]};
 for(const xy of sampled){
  if(part.length){
   const prev=part[part.length-1],dist=Math.hypot(xy[0]-prev[0],xy[1]-prev[1]);
   if(dist>32){maxJump=Math.max(maxJump,dist);breaks++;flush()}
  }
  part.push(xy);
 }
 flush();
 const fmt=n=>n.toFixed(2);
 const d=fragments.map(fragment=>fragment.map(([x,y],i)=>
  (i?'L':'M')+fmt(x)+','+fmt(y)).join('')).join(' ');
 // One accessible marker per route is placed halfway along its longest
 // *continuous* piece, never in a missing wedge of the M-map.
 const midpoint=fragment=>{
  const lengths=fragment.slice(1).map((p,i)=>Math.hypot(p[0]-fragment[i][0],p[1]-fragment[i][1]));
  const total=lengths.reduce((s,v)=>s+v,0);let at=total/2;
  for(let i=0;i<lengths.length;i++){
   if(at<=lengths[i]){
    const t=lengths[i]?at/lengths[i]:0;
    return [fragment[i][0]*(1-t)+fragment[i+1][0]*t,
     fragment[i][1]*(1-t)+fragment[i+1][1]*t];
   }
   at-=lengths[i];
  }
  return fragment[Math.floor(fragment.length/2)];
 };
 const lengthOf=part=>part.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-part[i][0],p[1]-part[i][1]),0);
 const longest=fragments.slice().sort((a,b)=>lengthOf(b)-lengthOf(a))[0];
 return {d,fragments,breaks,maxJump,midpoint:longest?midpoint(longest):null,
  totalLength:fragments.reduce((s,p)=>s+lengthOf(p),0)};
}
