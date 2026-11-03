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
 @Test public void urlAndUnicodeBounds(){assertEquals("https://example.com/song",LinkPreview.firstUrl("Try https://example.com/song)."));assertEquals("a🎵…",LinkPreview.clean("a🎵bc",3));}
}
