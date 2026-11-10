function labUSRegionBorderGeometry(geography){
 const edges=new Map();
 for(const feature of geography.features){
  if(feature.properties?.country!=='USA')continue;
  const region=feature.properties.region;
  const polygons=feature.geometry.type==='MultiPolygon'
   ?feature.geometry.coordinates:[feature.geometry.coordinates];
  for(const polygon of polygons)for(const ring of polygon){
   for(let i=1;i<ring.length;i++){
    const a=ring[i-1],b=ring[i];
    const ka=a.join(','),kb=b.join(',');
    if(ka===kb)continue;
    const key=ka<kb?ka+'|'+kb:kb+'|'+ka;
    const previous=edges.get(key);
    if(previous){previous.count++;if(previous.region!==region)previous.mixed=true}
    else edges.set(key,{a,b,ka,kb,region,count:1,mixed:false});
   }
  }
 }
 // Preserve geographic accuracy and all state touch polygons, but discard
 // every internal state seam. Join surviving edges into long continuous
 // strokes: hundreds of tiny SVG strokes look broken on the Keyes projection.
 const visible=[...edges.values()].filter(e=>e.count===1||e.mixed);
 const neighbors=new Map();
 visible.forEach((edge,i)=>{
  for(const key of [edge.ka,edge.kb]){
   if(!neighbors.has(key))neighbors.set(key,[]);
   neighbors.get(key).push(i);
  }
 });
 const drawn=new Set(),lines=[];
 const trace=(start,key)=>{
  const first=visible[start],line=[key===first.ka?first.a:first.b];
  let index=start;
  while(index!==undefined&&!drawn.has(index)){
   const edge=visible[index];drawn.add(index);
   const next=key===edge.ka?edge.kb:edge.ka;
   line.push(next===edge.ka?edge.a:edge.b);
   key=next;
   const adjacent=neighbors.get(key);
   // At a three-region junction, finish the stroke instead of guessing
   // which of the three edges to connect through that intersection.
   index=adjacent.length===2?adjacent.find(i=>!drawn.has(i)):undefined;
  }
  if(line.length>1)lines.push(line);
 };
 // Trace from open ends and multi-region junctions first, then closed rings.
 for(const [key,adjacent] of neighbors)if(adjacent.length!==2)
  for(const index of adjacent)if(!drawn.has(index))trace(index,key);
 for(let i=0;i<visible.length;i++)if(!drawn.has(i))trace(i,visible[i].ka);
 return {type:'Feature',properties:{kind:'us-listening-regions'},
  geometry:{type:'MultiLineString',coordinates:lines}};
}
