/* Unfurl public music links without proxying arbitrary destinations or HTML.
   Fixed provider allowlist, HTTPS only, bounded reads, manual safe redirects. */
const providers=[
 ['Spotify',['spotify.com','spotify.link']],['YouTube',['youtube.com','youtu.be']],
 ['SoundCloud',['soundcloud.com']],['Bandcamp',['bandcamp.com']],
 ['Apple Music',['music.apple.com']],['TIDAL',['tidal.com']],['Deezer',['deezer.com']],
 ['Mixcloud',['mixcloud.com']],['Audiomack',['audiomack.com']],
 ['Amazon Music',['music.amazon.com','music.amazon.co.uk']],['Vimeo',['vimeo.com']],
 ['Instagram',['instagram.com']],['TikTok',['tiktok.com']],
 ['Discogs',['discogs.com']],['Wikipedia',['wikipedia.org']],
 ['Pitchfork',['pitchfork.com']],['NTS',['nts.live']],['Resident Advisor',['ra.co']]
];
const MAX_URL=2048;
export function firstUrl(text){
 const found=String(text||'').match(/https:\/\/[^\s<>"']+/i);if(!found)return '';
 let value=found[0].replace(/[.,;!?]+$/,'');
 let excess=0;for(const c of value){if(c==='(')excess++;if(c===')')excess--}
 while(excess<0&&value.endsWith(')')){value=value.slice(0,-1);excess++}
 return value;
}
export function checkUrl(input){
 if(typeof input!=='string'||input.length>MAX_URL)return null;
 let u;try{u=new URL(input)}catch(_){return null}
 const host=u.hostname.toLowerCase();
 if(u.protocol!=='https:'||u.username||u.password||u.port&&!['443'].includes(u.port)||
   !host.includes('.')||!/^[a-z0-9.-]+$/.test(host)||host.startsWith('-')||host.endsWith('-')||
   /^[0-9.]+$/.test(host))return null;
 const entry=providers.find(([,hosts])=>hosts.some(domain=>host===domain||host.endsWith('.'+domain)));
 if(!entry)return null;
 u.hash='';return {url:u.href,provider:entry[0]};
}
const entities={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' ',hellip:'…',mdash:'—',ndash:'–'};
export function decode(value){
 return String(value||'').replace(/&(#x[\da-f]+|#\d+|[a-z][a-z\d]+);/gi,(_,entity)=>{
  if(entity[0]==='#'){const n=entity[1]?.toLowerCase()==='x'?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
   return n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):' '}
  return entities[entity.toLowerCase()]??'&'+entity+';';
 });
}
export function shorten(value,n){
 const normalized=String(value||'').replace(/<[^>]*>/g,' ').replace(/[\u0000-\u001f\u007f\u200b-\u200d\ufeff]/g,' ').replace(/\s+/g,' ').trim();
 return [...normalized].length>n?[...normalized].slice(0,n-1).join('')+'…':normalized;
}
function attr(tag,key){
 const matches=tag.match(/[\w:-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g)||[];
 for(const part of matches){const i=part.indexOf('=');
  if(part.slice(0,i).trim().toLowerCase()!==key)continue;
  const val=part.slice(i+1).trim();return val.startsWith('"')||val.startsWith("'")?val.slice(1,-1):val;
 }
 return '';
}
export function parseHtml(source){
 const text=String(source||'');
 const head=text.match(/<head\b[^>]*>([\s\S]*?)(?:<\/head>|$)/i)?.[1]||text.slice(0,160000);
 const clean=head.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const fields={};
 for(const tag of clean.match(/<meta\b[^>]*>/gi)||[]){
  const name=(attr(tag,'property')||attr(tag,'name')).toLowerCase(),value=attr(tag,'content');
  if(name&&value&&!fields[name])fields[name]=decode(value);
 }
 const title=clean.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]||'';
 return {title:shorten(fields['og:title']||fields['twitter:title']||decode(title),140),
  description:shorten(fields['og:description']||fields['twitter:description']||fields.description||'',240)};
}
async function readLimited(url,fetcher,kind,max){
 const response=await fetcher(url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(5000),
  headers:{Accept:kind==='json'?'application/json':'text/html,application/xhtml+xml'}});
 if(response.status>=300&&response.status<400){await response.body?.cancel();return {redirect:response.headers.get('location')}}
 if(!response.ok||!(response.headers.get('content-type')||'').toLowerCase().includes(kind)){
  await response.body?.cancel();return {}}
 if(Number(response.headers.get('content-length'))>max){await response.body?.cancel();return {}}
 if(!response.body)return {};
 const reader=response.body.getReader(),decoder=new TextDecoder();let total=0,text='';
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;
   if(total>max)return {};text+=decoder.decode(value,{stream:true})}
  return {text:text+decoder.decode()};
 }finally{await reader.cancel().catch(()=>{})}
}
async function oEmbed(page,fetcher){
 let endpoint='';
 if(page.provider==='Spotify')endpoint='https://open.spotify.com/oembed?url='+encodeURIComponent(page.url);
 if(page.provider==='YouTube')endpoint='https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(page.url);
 if(page.provider==='SoundCloud')endpoint='https://soundcloud.com/oembed?format=json&url='+encodeURIComponent(page.url);
 if(page.provider==='Vimeo')endpoint='https://vimeo.com/api/oembed.json?url='+encodeURIComponent(page.url);
 if(!endpoint)return null;
 try{const r=await readLimited(endpoint,fetcher,'json',32768);if(!r.text)return null;
  const data=JSON.parse(r.text),title=shorten(data.title,140);
  return title?{title,description:shorten(data.description||'',240)}:null;
 }catch(_){return null}
}
export async function resolveMetadata(value,fetcher=fetch){
 const input=checkUrl(value);
 if(!input)return {status:'unsupported',title:'',description:'',provider:'',url:String(value||'').slice(0,MAX_URL)};
 const base={...input,title:'',description:''};
 const quick=await oEmbed(input,fetcher);
 if(quick)return {...base,...quick,status:'ok'};
 let current=input.url;
 for(let i=0;i<4;i++){
  let r;try{r=await readLimited(current,fetcher,'html',192*1024)}catch(_){break}
  if(r.redirect){
   let safe;try{safe=checkUrl(new URL(r.redirect,current).href)}catch(_){}
   if(!safe)break;current=safe.url;continue;
  }
  if(!r.text)break;
  const parsed=parseHtml(r.text);if(parsed.title)return {...base,...parsed,url:current,status:'ok'};
  break;
 }
 return {...base,status:'unavailable'};
}
export async function respondMetadata(request,fetcher=fetch){
 const respond=(result,status=200)=>new Response(JSON.stringify(result),{status,
  headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
 if(request.method!=='GET')return respond({status:'invalid'},405);
 const url=new URL(request.url).searchParams.get('url')||'';
 if(url.length>MAX_URL||!url.startsWith('https://'))return respond({status:'invalid'},400);
 return respond(await resolveMetadata(url,fetcher));
}
