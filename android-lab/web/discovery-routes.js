// Lab-only route selection. Only route IDs/families are stored; no listening data.
const labRouteIndex=/*LAB_ROUTE_INDEX*/;
const labRouteKey='ghg-lab-discovery-routes-v1';
let labActiveRoute=null;
function labRouteShuffle(values){
 const out=values.slice();
 for(let i=out.length-1;i>0;i--){
  let j;
  if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1),limit=4294967296-4294967296%(i+1);do{crypto.getRandomValues(a)}while(a[0]>=limit);j=a[0]%(i+1)}
  else j=Math.floor(Math.random()*(i+1));
  [out[i],out[j]]=[out[j],out[i]];
 }
 return out;
}
function nextLabDiscoveryRoute(){
 const routes=labRouteIndex.routes,ids=routes.map(r=>r.id),known=new Set(ids);
 let state={};try{state=JSON.parse(stored(labRouteKey)||'{}')||{}}catch(e){}
 let remaining=Array.isArray(state.remaining)?state.remaining.filter((id,i,a)=>known.has(id)&&a.indexOf(id)===i):[];
 const recent=Array.isArray(state.recent)?state.recent.filter(id=>known.has(id)).slice(-30):[];
 if(!remaining.length)remaining=labRouteShuffle(ids);
 const last=routes.find(r=>r.id===recent.at(-1));
 const family=id=>routes.find(r=>r.id===id).family;
 let pick=remaining.findIndex(id=>!recent.slice(-8).includes(id)&&family(id)!==last?.family);
 if(pick<0)pick=remaining.findIndex(id=>family(id)!==last?.family);
 if(pick<0)pick=0;
 const id=remaining.splice(pick,1)[0];
 store(labRouteKey,JSON.stringify({remaining,recent:[...recent,id].slice(-30)}));
 return 'v'+labRouteIndex.version+'/'+id;
}
function labRoutePrompt(){return labActiveRoute?'Discovery route: '+labActiveRoute+'.':''}
