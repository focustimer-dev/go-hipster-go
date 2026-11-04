package work.samelling.hipstergo.lab;
import org.json.*;
import java.util.UUID;
/** Newest first; identical references move to the front without losing metadata. */
final class InspirationHistory {
 static JSONArray remember(JSONArray previous,String text,long time) {
  JSONArray result=new JSONArray();JSONObject first=null;
  for(int i=0;i<previous.length();i++){JSONObject entry=previous.optJSONObject(i);if(entry!=null&&text.equals(entry.optString("text"))){first=entry;break;}}
  try{
   if(first==null)first=new JSONObject().put("id",UUID.randomUUID().toString()).put("text",text);
   first.put("time",time);result.put(first);
   for(int i=0;i<previous.length()&&result.length()<3;i++){
    JSONObject entry=previous.optJSONObject(i);
    if(entry!=null&&!entry.optString("text").isEmpty()&&!text.equals(entry.optString("text")))result.put(entry);
   }
  }catch(JSONException ignored){}
  return result;
 }
 private InspirationHistory(){}
}
