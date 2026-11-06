import test from 'node:test';
import assert from 'node:assert/strict';
import {firstUrl,checkUrl,parseHtml,resolveMetadata,respondMetadata} from '../cloudflare/link-preview.js';
const html=(body,headers={'content-type':'text/html; charset=utf-8'})=>new Response(body,{status:200,headers});
test('extracts shared URL without swallowing punctuation or musical parentheses',()=>{
 assert.equal(firstUrl('New album https://open.spotify.com/track/abc?si=xyz).'),'https://open.spotify.com/track/abc?si=xyz');
 assert.equal(firstUrl('https://en.wikipedia.org/wiki/Brian_Eno_(album)'), 'https://en.wikipedia.org/wiki/Brian_Eno_(album)');
 assert.equal(firstUrl('a tune with no link'),'');
});
test('strict allowlist prevents local, arbitrary and confused-domain SSRF',()=>{
 for(const u of ['http://open.spotify.com/track/abc','https://127.0.0.1/',
 'https://localhost/','https://open.spotify.com.evil.test/','https://user:pass@open.spotify.com/',
 'https://192.168.0.1/','https://example.com/','https://open.spotify.com:444/track/x']){
  assert.equal(checkUrl(u),null,u);
 }
 assert.equal(checkUrl('https://music.youtube.com/watch?v=abc').provider,'YouTube');
 assert.equal(checkUrl('https://artist.bandcamp.com/album/a').provider,'Bandcamp');
});
test('Spotify oEmbed returns title without interpreting embed HTML',async()=>{
 const calls=[];
 const fetcher=async(url,init)=>{
  calls.push({url,redirect:init.redirect});
  assert.equal(init.redirect,'manual');
  assert.ok(url.startsWith('https://open.spotify.com/oembed?url='));
  return new Response(JSON.stringify({
   title:'The Real Song – Artist & More',html:'<script>evil()</script>',
   provider_name:'Spotify'
  }),{status:200,headers:{'content-type':'application/json'}});
 };
 const r=await resolveMetadata('https://open.spotify.com/track/a?si=123',fetcher);
 assert.deepEqual({status:r.status,title:r.title,provider:r.provider},
  {status:'ok',title:'The Real Song – Artist & More',provider:'Spotify'});
 assert.equal(calls.length,1);
 assert.equal(r.url,'https://open.spotify.com/track/a?si=123');
});
test('HTML fallback reads OG metadata with attributes out of order, never scripts or body',async()=>{
 const result=await resolveMetadata('https://artist.bandcamp.com/track/a',async()=>
  html('<html><head><title>Fallback</title><!-- <meta property="og:title" content="Spoof"> -->'+
  '<script>var x="<meta property=og:title content=bad>"</script>'+
  '<meta content="Artist &amp; Track" property="og:title"><meta name="description" content="Audio &quot;notes&quot;">'+
  '</head><body><meta property="og:title" content="Fake"></body></html>'));
 assert.equal(result.title,'Artist & Track');
 assert.equal(result.description,'Audio "notes"');
});
test('does not follow unapproved redirects or return the target as a proxy',async()=>{
 let count=0;
 const result=await resolveMetadata('https://artist.bandcamp.com/track/a',async()=>{count++;return new Response(null,{
  status:302,headers:{location:'https://127.0.0.1/admin'}})});
 assert.equal(count,1);assert.equal(result.status,'unavailable');
});
test('blocked providers yield explicit fallback without losing the URL',async()=>{
 const link='https://music.apple.com/us/album/a';
 const result=await resolveMetadata(link,async()=>new Response('Denied',{status:403,headers:{'content-type':'text/html'}}));
 assert.equal(result.status,'unavailable');
 assert.equal(result.url,link);
 assert.equal(result.title,'');
});
test('input limits and HTTP method are enforced without upstream calls',async()=>{
 const post=await respondMetadata(new Request('https://example.com/api/inspiration-preview',{method:'POST'}));
 assert.equal(post.status,405);
 let requests=0;
 const blocked=await respondMetadata(new Request('https://example.com/api/inspiration-preview?url='+encodeURIComponent('https://internal.test')),async()=>{requests++;throw Error('Fetched invalid URL')});
 assert.equal(blocked.status,200);
 assert.equal((await blocked.json()).status,'unsupported');
 assert.equal(requests,0);
});
test('very large upstream bodies are abandoned, not downloaded for parsing',async()=>{
 const result=await resolveMetadata('https://artist.bandcamp.com/track/a',async()=>
  new Response('x',{status:200,headers:{'content-type':'text/html','content-length':'5000000'}}));
 assert.equal(result.status,'unavailable');
});
