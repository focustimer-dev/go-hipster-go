// Android-only adapter: MapLibre owns painting and camera; existing app owns requests.
let labGlobe=null,labGlobeReady=false;
function labGlobeBounds(view){
 if(!labGlobeReady)return;
 let regions=crateSelected;
 if(atlasFocus)regions=new Set(crateRegions.filter(r=>r.continent===atlasFocus).map(r=>r.id));
 const points=labGlobeGeography.features.filter(f=>regions.has(f.properties.region)).flatMap(f=>f.geometry.coordinates.flat(2));
 if(!points.length||view===null){labGlobe.easeTo({center:[10,15],zoom:labGlobeHomeZoom(),duration:320});return}
 // Fit mainland extents; offshore fragments must not send the camera across the globe.
 const lon=points.map(p=>p[0]),lat=points.map(p=>p[1]);
 const sorted=values=>values.slice().sort((a,b)=>a-b),xs=sorted(lon),ys=sorted(lat),n=xs.length;
 const west=xs[Math.floor(n*.02)],east=xs[Math.min(n-1,Math.floor(n*.98))],south=ys[Math.floor(n*.02)],north=ys[Math.min(n-1,Math.floor(n*.98))];
 labGlobe.fitBounds([[west,south],[east,north]],{padding:24,maxZoom:3.4,duration:320});
}
function labGlobeHomeZoom(){return Math.log2(Math.max(200,labGlobe.getContainer().clientHeight)/256)-.25}
function labGlobeSync(){
 if(!labGlobeReady)return;
 for(const f of labGlobeGeography.features)labGlobe.setFeatureState({source:'land',id:f.id},{selected:crateSelected.has(f.properties.region)});
}
let labGlobeGeography;
function initLabGlobe(){
 if(new URLSearchParams(location.search).get('atlas')==='legacy'||typeof maplibregl==='undefined')return;
 const old=doc.getElementById('crateAtlasMap'),frame=old?.closest('.crate-map-frame'),geometry=doc.getElementById('labGlobeGeography');if(!frame||!geometry)return;
 labGlobeGeography=JSON.parse(geometry.textContent);
 const host=doc.createElement('div');host.id='labAtlasGlobe';host.style.cssText='position:relative;width:100%;aspect-ratio:720/372;background:transparent';host.setAttribute('aria-label','Interactive regional globe');
 frame.appendChild(host);
 try{
  labGlobe=new maplibregl.Map({container:host,style:{version:8,sources:{land:{type:'geojson',data:labGlobeGeography}},layers:[{id:'ocean',type:'background',paint:{'background-color':'#103135'}},{id:'land',type:'fill',source:'land',paint:{'fill-color':['case',['boolean',['feature-state','selected'],false],'#a83223','#dfb045']}},{id:'borders',type:'line',source:'land',paint:{'line-color':'#103135','line-width':.7}}]},center:[10,15],zoom:0,maxZoom:5.5,minZoom:-1,attributionControl:false,renderWorldCopies:false,dragRotate:false,pitchWithRotate:false,canvasContextAttributes:{antialias:true}});
 }catch(e){host.remove();labGlobe=null;status('Globe graphics unavailable. The original atlas is available.');return}
 window.labAtlasGlobe=labGlobe;
 labGlobe.on('load',()=>{
  labGlobe.setProjection({type:'globe'});labGlobeReady=true;
  const legacy=frame.querySelector('.atlas-camera-viewport');if(legacy)legacy.hidden=true;else old.style.display='none';
  frame.querySelector('.chart-viewport-frame')?.setAttribute('hidden','');
  labGlobe.jumpTo({center:[10,15],zoom:labGlobeHomeZoom()});labGlobeSync();if(crateSelected.size)labGlobeBounds();
  const chart=doc.createElement('canvas');chart.width=chart.height=16;const ctx=chart.getContext('2d');ctx.clearRect(0,0,16,16);ctx.strokeStyle='rgba(16,49,53,.26)';ctx.lineWidth=.7;for(let n=-16;n<32;n+=8){ctx.beginPath();ctx.moveTo(n,16);ctx.lineTo(n+16,0);ctx.stroke()}labGlobe.addImage('engraved-hatch',ctx.getImageData(0,0,16,16));
  labGlobe.addLayer({id:'hatching',type:'fill',source:'land',paint:{'fill-pattern':'engraved-hatch'}},'borders');
  installLabGlobeSecrets(old);
 });
 labGlobe.on('click','land',event=>{
  if(event.originalEvent?._atlasSecret||labGlobe.getLayer('route-targets')&&labGlobe.queryRenderedFeatures(event.point,{layers:['route-targets']}).length)return;
  const id=event.features[0].properties.region;atlasFocus=null;atlasUserNavigated=true;toggleCrateRegion(id);
 });
 labGlobe.on('dragstart',()=>{atlasFocus=null;atlasUserNavigated=true;renderAtlasNavigation()});
 labGlobe.on('zoomstart',event=>{if(event.originalEvent){atlasUserNavigated=true;renderAtlasNavigation()}});
 labGlobe.on('zoomend',()=>{const visible=labGlobe.getZoom()>labGlobeHomeZoom()+.8;old._atlasSecretsSync?.(visible);for(const node of host.querySelectorAll('.lab-globe-secret'))node.hidden=!visible});
 new ResizeObserver(()=>{labGlobe.resize()}).observe(host);
}
function labGlobeUnproject([x,y]){
 const X=[1,.9986,.9954,.99,.9822,.973,.96,.9427,.9216,.8962,.8679,.835,.7986,.7597,.7186,.6732,.6213,.5722,.5322],Y=[0,.062,.124,.186,.248,.31,.372,.434,.4958,.5571,.6176,.6769,.7346,.7903,.8435,.8936,.9394,.9761,1];
 const value=Math.min(1,Math.abs((188-y)/168));let i=0;while(i<17&&Y[i+1]<value)i++;const t=(value-Y[i])/(Y[i+1]-Y[i]),lat=(i+t)*5*Math.sign(188-y);return [Math.max(-180,Math.min(180,(x-360)/335/(X[i]+t*(X[i+1]-X[i]))*180)),lat];
}
function installLabGlobeSecrets(old){
 const features=[],hotspots=[...old.querySelectorAll('.atlas-secret-hotspot')],arts=[...old.querySelectorAll('.chart-details > svg')];
 for(const hot of hotspots){
  const route=hot.querySelector('path.atlas-secret-route-touch');
  if(route){
   // Split at SVG subpaths, including the two halves of the Date Line route.
   for(const part of route.getAttribute('d').match(/M[^M]+/g)||[]){const p=doc.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',part);old.appendChild(p);const length=p.getTotalLength(),coordinates=[];for(let d=0;d<=length;d+=Math.max(1,length/64)){const point=p.getPointAtLength(d);coordinates.push(labGlobeUnproject([point.x,point.y]))}p.remove();features.push({type:'Feature',properties:{secret:hot.dataset.secret},geometry:{type:'LineString',coordinates}})}
  }else{
   const target=hot.querySelector('circle.atlas-secret-target');if(!target)continue;
   const x=+target.getAttribute('cx'),y=+target.getAttribute('cy'),button=doc.createElement('button');button.className='lab-globe-secret';button.hidden=true;button.type='button';button.setAttribute('aria-label',hot.getAttribute('aria-label'));button.style.cssText='width:44px;height:44px;padding:3px;background:transparent;border:0;color:#edc65d';
   const art=arts.find(a=>Math.abs(+a.getAttribute('x')+(+a.getAttribute('width'))/2-x)<1&&Math.abs(+a.getAttribute('y')+(+a.getAttribute('height'))/2-y)<1);
   if(art){const clone=art.cloneNode(true);clone.removeAttribute('x');clone.removeAttribute('y');clone.setAttribute('width','38');clone.setAttribute('height','38');button.appendChild(clone)}else{button.innerHTML='<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor"/><path d="M16 7V25M7 16H25" stroke="currentColor"/></svg>'}
   button.onclick=event=>{event.stopPropagation();old._atlasSecretsSync?.(true);old._atlasOpenSecret?.(hot.dataset.secret)};
   new maplibregl.Marker({element:button}).setLngLat(labGlobeUnproject([x,y])).addTo(labGlobe);
  }
 }
 labGlobe.addSource('routes',{type:'geojson',data:{type:'FeatureCollection',features}});
 labGlobe.addLayer({id:'routes',type:'line',source:'routes',paint:{'line-color':'#edc65d','line-opacity':.65,'line-width':1,'line-dasharray':[3,5]}});
 labGlobe.addLayer({id:'route-targets',type:'line',source:'routes',paint:{'line-color':'rgba(0,0,0,0)','line-width':20}});
 labGlobe.on('click','route-targets',event=>{if(event.originalEvent)event.originalEvent._atlasSecret=true;old._atlasSecretsSync?.(true);old._atlasOpenSecret?.(event.features[0].properties.secret)});
 // Expose discoveries through normal buttons as well as painted map targets.
 const names=doc.createElement('details');const summary=doc.createElement('summary');summary.textContent='SHIPS, ROUTES & MARGINALIA';names.appendChild(summary);
 for(const hot of hotspots){const button=doc.createElement('button');button.type='button';button.textContent=hot.getAttribute('aria-label').replace('Discover: ','');button.onclick=()=>{old._atlasSecretsSync?.(true);old._atlasOpenSecret?.(hot.dataset.secret)};names.appendChild(button)}
 doc.getElementById('atlasSecretCard')?.before(names);
}
