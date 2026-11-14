package work.samelling.hipstergo.lab;
import java.net.*;
import java.io.*;
import java.util.*;
import java.util.regex.*;
/** Bounded public HTTPS metadata only. Never executes pages or fetches media. */
final class LinkPreview {
 static final class Result { final String url,title,description;Result(String u,String t,String d){url=u;title=t;description=d;} }
 static String firstUrl(String text){
  Matcher m=Pattern.compile("https://[^\\s<>\"']+",Pattern.CASE_INSENSITIVE).matcher(text);if(!m.find())return "";
  String url=m.group().replaceAll("[.,;]+$","");
  int balance=0;for(int i=0;i<url.length();i++){if(url.charAt(i)=='(')balance++;if(url.charAt(i)==')')balance--;}
  while(url.endsWith(")")&&balance<0){url=url.substring(0,url.length()-1);balance++;}
  return url;
 }
 static boolean publicAddress(InetAddress a){
  byte[] b=a.getAddress();
  int first=b[0]&255,second=b.length>1?b[1]&255:0;
  if(a.isAnyLocalAddress()||a.isLoopbackAddress()||a.isLinkLocalAddress()||
     a.isSiteLocalAddress()||a.isMulticastAddress())return false;
  if(b.length==4){
   int third=b[2]&255;
   // The JVM's site-local check does not cover all non-public special-use
   // ranges. Reject benchmark, documentation and deprecated relay networks as
   // well as CGNAT. See IANA IPv4 Special-Purpose Address Registry.
   return first!=0&&first<224
    &&!(first==100&&second>=64&&second<=127)
    &&!(first==192&&second==0&&(third==0||third==2))
    &&!(first==192&&second==88&&third==99)
    &&!(first==198&&(second==18||second==19||(second==51&&third==100)))
    &&!(first==203&&second==0&&third==113);
  }
  if(b.length==16){
   int third=b[2]&255,fourth=b[3]&255;
   // Deny non-public documentation and 6to4 tunnel endpoints without
   // rejecting ordinary carrier NAT64 addresses used on IPv6-only phones.
   return (first&254)!=252
    &&!(first==0x20&&second==0x01&&third==0x0d&&fourth==0xb8)
    &&!(first==0x20&&second==0x02)
    &&!(first==0x3f&&second==0xff&&(third&0xf0)==0);
  }
  return false;
 }
 static URL allowedUrl(String value)throws IOException {
  URL u=new URL(value);String host=u.getHost().toLowerCase(Locale.ROOT);
  if(!"https".equals(u.getProtocol())||u.getUserInfo()!=null||(u.getPort()!=-1&&u.getPort()!=443)||!host.contains(".")||host.endsWith(".local")||host.endsWith(".localhost"))throw new IOException("Public HTTPS required");
  // Literal addresses must pass the same check even if the HTTP client skips DNS.
  if(host.matches("[0-9.]+")||host.contains(":"))for(InetAddress a:InetAddress.getAllByName(host))if(!publicAddress(a))throw new IOException("Private destination");
  return u;
 }
 private static final java.util.concurrent.ThreadPoolExecutor resolver=new java.util.concurrent.ThreadPoolExecutor(0,2,30,java.util.concurrent.TimeUnit.SECONDS,new java.util.concurrent.SynchronousQueue<>(),r->{Thread t=new Thread(r,"preview-dns");t.setDaemon(true);return t;});
 static final okhttp3.Dns PUBLIC_DNS=host->resolvePublic(host,okhttp3.Dns.SYSTEM,2000);
 static List<InetAddress> resolvePublic(String host,okhttp3.Dns dns,long timeoutMillis)throws UnknownHostException {
  java.util.concurrent.Future<List<InetAddress>> lookup;
  try{lookup=resolver.submit(()->{
   List<InetAddress> addresses=dns.lookup(host);
   for(InetAddress a:addresses)if(!publicAddress(a))throw new UnknownHostException("Private destination");
   return addresses;
  });}catch(java.util.concurrent.RejectedExecutionException busy){throw new UnknownHostException("Resolver busy");}
  try{return lookup.get(timeoutMillis,java.util.concurrent.TimeUnit.MILLISECONDS);}
  catch(Exception failure){lookup.cancel(true);if(failure instanceof InterruptedException)Thread.currentThread().interrupt();throw new UnknownHostException("Preview DNS unavailable");}
 }
 private static final okhttp3.OkHttpClient client=new okhttp3.OkHttpClient.Builder()
  .dns(PUBLIC_DNS).proxy(Proxy.NO_PROXY).followRedirects(false).followSslRedirects(false)
  .connectTimeout(3,java.util.concurrent.TimeUnit.SECONDS).readTimeout(3,java.util.concurrent.TimeUnit.SECONDS)
  .callTimeout(12,java.util.concurrent.TimeUnit.SECONDS).build();
 static final class Request {
  private volatile okhttp3.Call call;private volatile boolean cancelled;
  void cancel(){cancelled=true;okhttp3.Call active=call;if(active!=null)active.cancel();}
  void attach(okhttp3.Call next)throws IOException{call=next;if(cancelled){next.cancel();throw new IOException("Preview cancelled");}}
 }

 // Android is offline-first for the app itself, but public metadata is opt-in.
 // Prefer our first-party, provider-bounded oEmbed resolver for music services:
 // many music pages block generic HTML scrapers. Fall back to local HTML/OG
 // parsing for unsupported sites and when the service is unavailable.
 static boolean serviceCandidate(String value){
  try{String host=allowedUrl(value).getHost().toLowerCase(Locale.ROOT);
   for(String domain:new String[]{"spotify.com","spotify.link","youtube.com","youtu.be",
    "soundcloud.com","bandcamp.com","music.apple.com","tidal.com","deezer.com",
    "mixcloud.com","audiomack.com","vimeo.com","instagram.com","tiktok.com","discogs.com"})
    if(host.equals(domain)||host.endsWith("."+domain))return true;
  }catch(IOException ignored){}
  return false;
 }
 static Result parseServiceResult(String original,String json)throws IOException{
  try{
   org.json.JSONObject result=new org.json.JSONObject(json);
   if(!"ok".equals(result.optString("status")))throw new IOException("Metadata not available");
   String title=truncate(result.optString("title"),140);
   if(title.isEmpty())throw new IOException("Missing link title");
   return new Result(original,title,truncate(result.optString("description"),240));
  }catch(org.json.JSONException bad){throw new IOException("Malformed preview response",bad);}
 }
 static Result fetchWithFallback(String value,Request token)throws IOException{
  if(serviceCandidate(value)){
   try{return fetchViaService(value,token);}catch(IOException failure){
    if(Thread.currentThread().isInterrupted())throw failure;
   }
  }
  return fetch(value,token);
 }
 static Result fetchViaService(String value,Request request)throws IOException{
  allowedUrl(value);
  String endpoint="https://hipster-go.samelling.workers.dev/api/inspiration-preview?url="+
    java.net.URLEncoder.encode(value,"UTF-8");
  okhttp3.Call call=client.newCall(new okhttp3.Request.Builder()
   .url(endpoint).header("Accept","application/json").build());
  call.timeout().timeout(6500,java.util.concurrent.TimeUnit.MILLISECONDS);
  request.attach(call);
  try(okhttp3.Response response=call.execute()){
   if(response.code()!=200||response.body()==null)throw new IOException("Preview endpoint unavailable");
   String type=String.valueOf(response.header("Content-Type")).toLowerCase(Locale.ROOT);
   if(!type.contains("application/json"))throw new IOException("Invalid preview type");
   try(InputStream input=response.body().byteStream()){
    ByteArrayOutputStream output=new ByteArrayOutputStream();
    byte[] buffer=new byte[2048];int n;
    while(output.size()<16384&&(n=input.read(buffer,0,Math.min(buffer.length,16384-output.size())))!=-1)
     output.write(buffer,0,n);
    if(output.size()==16384)throw new IOException("Oversized preview response");
    return parseServiceResult(value,output.toString("UTF-8"));
   }
  }
 }

 static Result fetch(String value)throws IOException{return fetch(value,new Request());}
 static Result fetch(String value,Request request)throws IOException {
  URL u=allowedUrl(value);long deadline=System.nanoTime()+java.util.concurrent.TimeUnit.SECONDS.toNanos(12);
  for(int redirect=0;redirect<4;redirect++){
   long remaining=deadline-System.nanoTime();
   if(Thread.currentThread().isInterrupted()||remaining<=0)throw new IOException("Preview timed out");
   u=allowedUrl(u.toString());
   okhttp3.Call call=client.newCall(new okhttp3.Request.Builder().url(u).header("User-Agent","HipsterGOLinkPreview/1.0").header("Accept","text/html,application/xhtml+xml").build());
   call.timeout().timeout(remaining,java.util.concurrent.TimeUnit.NANOSECONDS);request.attach(call);
   try(okhttp3.Response response=call.execute()){
    int code=response.code();
    if(code>=300&&code<400){String location=response.header("Location");if(location==null)throw new IOException("No redirect target");u=allowedUrl(new URL(u,location).toString());continue;}
    okhttp3.ResponseBody body=response.body();String type=String.valueOf(response.header("Content-Type")).toLowerCase(Locale.ROOT);
    if(code!=200||body==null||!(type.startsWith("text/html")||type.startsWith("application/xhtml+xml")))throw new IOException("No page metadata");
    ByteArrayOutputStream bytes=new ByteArrayOutputStream();
    try(InputStream in=body.byteStream()){
     byte[] buffer=new byte[4096];int n;
     while(bytes.size()<262144&&(n=in.read(buffer,0,Math.min(buffer.length,262144-bytes.size())))!=-1){bytes.write(buffer,0,n);if(System.nanoTime()>deadline||Thread.currentThread().isInterrupted())throw new IOException("Preview timed out");}
    }
    String charset="UTF-8";Matcher encoding=Pattern.compile("charset=[\\\"']?([a-zA-Z0-9_-]+)").matcher(type);if(encoding.find())charset=encoding.group(1);
    return parse(u.toString(),new String(bytes.toByteArray(),charset));
   }
  }
  throw new IOException("Too many redirects");
 }
 static Result parse(String url,String html){
  org.jsoup.nodes.Document document=org.jsoup.Jsoup.parse(html,url);
  org.jsoup.nodes.Element head=document.head();String title="",description="",fallbackTitle="",fallbackDescription="";
  for(org.jsoup.nodes.Element tag:head.select("meta")){
   String name=tag.hasAttr("property")?tag.attr("property"):tag.attr("name"),content=tag.attr("content");
   if("og:title".equalsIgnoreCase(name))title=content;else if("og:description".equalsIgnoreCase(name))description=content;else if("twitter:title".equalsIgnoreCase(name))fallbackTitle=content;else if("description".equalsIgnoreCase(name)||"twitter:description".equalsIgnoreCase(name))fallbackDescription=content;
  }
  if(title.isEmpty())title=fallbackTitle;
  if(title.isEmpty())title=document.title();
  return new Result(url,truncate(title,140),truncate(description.isEmpty()?fallbackDescription:description,240));
 }
 static String truncate(String text,int limit){
  String value=text.replaceAll("[\\p{Cntrl}\\s]+"," ").trim();
  return value.codePointCount(0,value.length())>limit?value.substring(0,value.offsetByCodePoints(0,limit-1))+"…":value;
 }
 static String clean(String text,int limit){
  Matcher m=Pattern.compile("&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);").matcher(text);StringBuffer out=new StringBuffer();
  while(m.find()){
   String entity=m.group(1),value=m.group();
   try{if(entity.startsWith("#")){int cp=Integer.parseInt(entity.substring(entity.startsWith("#x")?2:1),entity.startsWith("#x")?16:10);if(Character.isValidCodePoint(cp)&&!(cp>=0xD800&&cp<=0xDFFF))value=new String(Character.toChars(cp));}else value=entity.equals("amp")?"&":entity.equals("lt")?"<":entity.equals("gt")?">":entity.equals("quot")?"\"":entity.equals("apos")?"'":" ";}catch(Exception ignored){}
   m.appendReplacement(out,Matcher.quoteReplacement(value));
  }m.appendTail(out);String value=out.toString().replaceAll("[\\p{Cntrl}\\s]+"," ").trim();
  return value.codePointCount(0,value.length())>limit?value.substring(0,value.offsetByCodePoints(0,limit-1))+"…":value;
 }
 private LinkPreview(){}
}
