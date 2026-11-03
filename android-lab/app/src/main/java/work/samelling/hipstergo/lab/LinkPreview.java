package work.samelling.hipstergo.lab;
import java.net.*;
import java.io.*;
import java.util.*;
import java.util.regex.*;
/** Bounded public HTTPS metadata only. Never executes pages or fetches media. */
final class LinkPreview {
 static final class Result { final String url,title,description;Result(String u,String t,String d){url=u;title=t;description=d;} }
 static String firstUrl(String text){Matcher m=Pattern.compile("https://[^\\s<>\\\"]+",Pattern.CASE_INSENSITIVE).matcher(text);return m.find()?m.group().replaceAll("[).,;]+$",""):"";}
 static URL allowedUrl(String value)throws IOException {
  URL u=new URL(value);String host=u.getHost().toLowerCase(Locale.ROOT);
  if(!"https".equals(u.getProtocol())||u.getUserInfo()!=null||(u.getPort()!=-1&&u.getPort()!=443)||!host.contains(".")||host.endsWith(".local")||host.endsWith(".localhost"))throw new IOException("Public HTTPS required");
  for(InetAddress a:InetAddress.getAllByName(host)){
   byte[] b=a.getAddress();int first=b[0]&255,second=b.length>1?b[1]&255:0;
   if(a.isAnyLocalAddress()||a.isLoopbackAddress()||a.isLinkLocalAddress()||a.isSiteLocalAddress()||a.isMulticastAddress()||(b.length==4&&(first==0||first>=224||(first==100&&second>=64&&second<=127)))||(b.length==16&&(first&254)==252))throw new IOException("Private destination");
  }
  return u;
 }
 static Result fetch(String value)throws IOException {
  URL u=allowedUrl(value);long deadline=System.currentTimeMillis()+12000;
  for(int redirect=0;redirect<4;redirect++){
   if(Thread.currentThread().isInterrupted()||System.currentTimeMillis()>deadline)throw new IOException("Preview timed out");
   u=allowedUrl(u.toString());HttpURLConnection c=(HttpURLConnection)u.openConnection();
   c.setInstanceFollowRedirects(false);c.setConnectTimeout(3000);c.setReadTimeout(3000);c.setRequestProperty("User-Agent","HipsterGOLinkPreview/1.0");c.setRequestProperty("Accept","text/html,application/xhtml+xml");c.setRequestProperty("Accept-Encoding","identity");c.setUseCaches(false);
   try{
    int code=c.getResponseCode();
    if(code>=300&&code<400){String location=c.getHeaderField("Location");if(location==null)throw new IOException("No redirect target");u=allowedUrl(new URL(u,location).toString());continue;}
    String type=String.valueOf(c.getContentType()).toLowerCase(Locale.ROOT);
    if(code!=200||!(type.startsWith("text/html")||type.startsWith("application/xhtml+xml")))throw new IOException("No page metadata");
    ByteArrayOutputStream bytes=new ByteArrayOutputStream();
    try(InputStream in=c.getInputStream()){
     byte[] buffer=new byte[4096];int n;while(bytes.size()<262144&&(n=in.read(buffer,0,Math.min(buffer.length,262144-bytes.size())))!=-1){bytes.write(buffer,0,n);if(System.currentTimeMillis()>deadline||Thread.currentThread().isInterrupted())throw new IOException("Preview timed out");}
    }
    String charset="UTF-8";Matcher encoding=Pattern.compile("charset=[\\\"']?([a-zA-Z0-9_-]+)").matcher(type);if(encoding.find())charset=encoding.group(1);
    return parse(u.toString(),new String(bytes.toByteArray(),charset));
   }finally{c.disconnect();}
  }
  throw new IOException("Too many redirects");
 }
 static Result parse(String url,String html){
  String title="",description="",fallbackTitle="",fallbackDescription="";
  Matcher tags=Pattern.compile("<meta\\b(?:[^\\\"'>]|\\\"[^\\\"]*\\\"|'[^']*')*>",Pattern.CASE_INSENSITIVE).matcher(html);
  while(tags.find()){
   Map<String,String> attrs=new HashMap<>();Matcher attr=Pattern.compile("([\\w:-]+)\\s*=\\s*(?:\\\"([^\\\"]*)\\\"|'([^']*)'|([^\\s>]+))").matcher(tags.group());
   while(attr.find())attrs.put(attr.group(1).toLowerCase(Locale.ROOT),attr.group(2)!=null?attr.group(2):attr.group(3)!=null?attr.group(3):attr.group(4));
   String name=attrs.containsKey("property")?attrs.get("property"):attrs.get("name"),content=attrs.get("content");if(name==null||content==null)continue;
   if("og:title".equalsIgnoreCase(name))title=content;else if("og:description".equalsIgnoreCase(name))description=content;else if("twitter:title".equalsIgnoreCase(name))fallbackTitle=content;else if("description".equalsIgnoreCase(name)||"twitter:description".equalsIgnoreCase(name))fallbackDescription=content;
  }
  if(title.isEmpty())title=fallbackTitle;
  if(title.isEmpty()){Matcher t=Pattern.compile("<title[^>]*>(.*?)</title\\s*>",Pattern.CASE_INSENSITIVE|Pattern.DOTALL).matcher(html);if(t.find())title=t.group(1);}
  return new Result(url,clean(title,140),clean(description.isEmpty()?fallbackDescription:description,240));
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
