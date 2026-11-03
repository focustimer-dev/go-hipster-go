package work.samelling.hipstergo.lab;
import org.json.*;
import org.junit.Test;
import static org.junit.Assert.*;
public class InspirationHistoryTest {
 @Test public void newestThreeAndDeduplicate()throws Exception {
  JSONArray items=new JSONArray();for(String text:new String[]{"A","B","C","D"})items=InspirationHistory.remember(items,text,1);
  assertEquals(3,items.length());assertEquals("D",items.getJSONObject(0).getString("text"));assertEquals("B",items.getJSONObject(2).getString("text"));
  items.getJSONObject(2).put("title","Remembered title");items=InspirationHistory.remember(items,"B",2);
  assertEquals(3,items.length());assertEquals("B",items.getJSONObject(0).getString("text"));assertEquals("Remembered title",items.getJSONObject(0).getString("title"));
 }
 @Test public void ignoresBrokenEntries(){JSONArray items=new JSONArray().put(JSONObject.NULL).put(false).put(new JSONObject());assertEquals(1,InspirationHistory.remember(items,"Reference",1).length());}
}
