package work.samelling.hipstergo.lab;
import org.junit.Test;
import static org.junit.Assert.*;
public class LinkPreviewTest {
 @Test public void extractsMetadataRegardlessOfAttributeOrder(){
  LinkPreview.Result p=LinkPreview.parse("https://example.com/","<title>Fallback</title><meta content='Song &amp; Artist' property='og:title'><meta name=description content='A short &#x1F3B5; description'>");
  assertEquals("Song & Artist",p.title);assertEquals("A short 🎵 description",p.description);
 }
 @Test public void fallbackAndUntrustedMarkupRemainText(){
  LinkPreview.Result p=LinkPreview.parse("https://example.com/","<title>Title &lt;script&gt;</title>");assertEquals("Title <script>",p.title);assertEquals("",p.description);
 }
 @Test public void rejectsLocalAndCredentialUrls(){
  for(String url:new String[]{"http://example.com/","https://127.0.0.1/","https://user:secret@example.com/","https://printer.local/"}){
   try{LinkPreview.allowedUrl(url);fail("Unsafe preview URL accepted");}catch(java.io.IOException expected){}
  }
 }
 @Test public void urlAndUnicodeBounds(){assertEquals("https://example.com/song",LinkPreview.firstUrl("Try https://example.com/song)."));assertEquals("https://en.wikipedia.org/wiki/Song_(music)",LinkPreview.firstUrl("https://en.wikipedia.org/wiki/Song_(music)"));assertEquals("a🎵…",LinkPreview.clean("a🎵bc",3));}

 @Test public void ignoresScriptCommentAndBodyMetadata(){
  LinkPreview.Result p=LinkPreview.parse("https://example.com/","<head><title>Real &amp; title</title><!-- <meta property='og:title' content='Comment'> --><script>var html=\"<meta property='og:title' content='Script'>\";</script></head><body><meta property='og:title' content='Body'></body>");
  assertEquals("Real & title",p.title);
 }
 @Test public void doesNotDecodeEntitiesTwice(){
  assertEquals("Literal &amp;",LinkPreview.parse("https://example.com/","<title>Literal &amp;amp;</title>").title);
 }
 @Test public void deniesSpecialUseIpv4OutsideSiteLocalRanges()throws Exception {
  for(String address:new String[]{
   "100.64.0.1","100.127.255.254",
   "192.0.0.1","192.0.2.25","192.88.99.2",
   "198.18.0.1","198.19.255.250","198.51.100.3","203.0.113.24"
  }){
   assertFalse("Allowed reserved endpoint: "+address,
    LinkPreview.publicAddress(java.net.InetAddress.getByName(address)));
  }
  for(String address:new String[]{"8.8.8.8","1.1.1.1","9.9.9.9"}){
   assertTrue("Rejected public DNS endpoint: "+address,
    LinkPreview.publicAddress(java.net.InetAddress.getByName(address)));
  }
  for(String address:new String[]{"https://192.0.2.1/","https://198.18.0.1/",
   "https://203.0.113.25/"}) {
   try{LinkPreview.allowedUrl(address);fail("Accepted reserved literal "+address);}
   catch(java.io.IOException expected){}
  }
 }
 @Test public void deniesSpecialUseIpv6DocsAndTunnels()throws Exception {
  for(String address:new String[]{"2001:db8::1","2002:c0a8:0101::1",
    "3fff:0000::42","fc00::42","fe80::1"}){
   assertFalse("Allowed nonpublic IPv6 "+address,
    LinkPreview.publicAddress(java.net.InetAddress.getByName(address)));
  }
  assertTrue(LinkPreview.publicAddress(java.net.InetAddress.getByName("2606:4700:4700::1111")));
 }

 @Test public void rejectsMixedPublicAndPrivateDnsResults()throws Exception {
  okhttp3.Dns mixed=host->java.util.Arrays.asList(java.net.InetAddress.getByName("8.8.8.8"),java.net.InetAddress.getByName("127.0.0.1"));
  try{LinkPreview.resolvePublic("example.com",mixed,1000);fail("Mixed DNS accepted");}catch(java.net.UnknownHostException expected){}
 }
 @Test public void boundsDnsWaitAndSupportsCancellation()throws Exception {
  okhttp3.Dns delayed=host->{try{Thread.sleep(5000);}catch(InterruptedException e){Thread.currentThread().interrupt();}return java.util.Collections.emptyList();};
  long start=System.nanoTime();
  try{LinkPreview.resolvePublic("example.com",delayed,30);fail("Slow DNS accepted");}catch(java.net.UnknownHostException expected){}
  assertTrue(java.util.concurrent.TimeUnit.NANOSECONDS.toMillis(System.nanoTime()-start)<1000);
  LinkPreview.Request token=new LinkPreview.Request();token.cancel();
  okhttp3.Call call=new okhttp3.OkHttpClient().newCall(new okhttp3.Request.Builder().url("https://example.com/").build());
  try{token.attach(call);fail("Cancelled preview attached");}catch(java.io.IOException expected){}
  assertTrue(call.isCanceled());
 }

 @Test public void serviceResultAcceptsOnlySuccessfulTitles()throws Exception{
  LinkPreview.Result p=LinkPreview.parseServiceResult("https://open.spotify.com/track/a",
   "{\"status\":\"ok\",\"title\":\"A song & its artist\",\"description\":\"From a public service\"}");
  assertEquals("A song & its artist",p.title);
  assertEquals("https://open.spotify.com/track/a",p.url);
  for(String json:new String[]{"{\"status\":\"unavailable\"}","{\"status\":\"ok\",\"title\":\"\"}","{broken"}){
   try{LinkPreview.parseServiceResult("https://open.spotify.com/track/a",json);fail("Accepted unusable metadata");}
   catch(java.io.IOException expected){}
  }
 }
 @Test public void serviceCandidateIsLimitedToSupportedProviders(){
  assertTrue(LinkPreview.serviceCandidate("https://open.spotify.com/track/a"));
  assertTrue(LinkPreview.serviceCandidate("https://music.youtube.com/watch?v=x"));
  assertFalse(LinkPreview.serviceCandidate("https://open.spotify.com.evil.test/track/a"));
  assertFalse(LinkPreview.serviceCandidate("https://127.0.0.1/foo"));
  assertFalse(LinkPreview.serviceCandidate("https://example.com/album"));
 }
}
