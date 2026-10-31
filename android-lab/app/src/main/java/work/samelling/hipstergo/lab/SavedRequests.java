package work.samelling.hipstergo.lab;

import android.app.*;
import android.content.SharedPreferences;
import android.text.InputFilter;
import android.text.format.DateFormat;
import android.widget.*;
import org.json.*;
import java.util.*;

/** Explicitly saved requests, private to this app. Nothing is saved automatically. */
final class SavedRequests {
    interface Replay { void open(String ai,String prompt); }
    interface TextAction { void run(String text); }
    private final Activity activity;
    private final SharedPreferences prefs;
    private final Replay replay;
    private final TextAction copy, share;
    SavedRequests(Activity activity,SharedPreferences prefs,Replay replay,TextAction copy,TextAction share) {
        this.activity=activity;this.prefs=prefs;this.replay=replay;this.copy=copy;this.share=share;
    }
    private JSONArray load(){try{return new JSONArray(prefs.getString("savedRequests","[]"));}catch(Exception e){return new JSONArray();}}
    void save(String ai,String prompt) {
        if(prompt==null || prompt.isEmpty()){Toast.makeText(activity,"Press GO first to prepare a request.",Toast.LENGTH_LONG).show();return;}
        EditText name=new EditText(activity);name.setSingleLine(true);name.setHint("Name this request");
        name.setFilters(new InputFilter[]{new InputFilter.LengthFilter(60)});
        name.setText("Crate · "+DateFormat.format("MMM d, h:mm a",new Date()));
        new AlertDialog.Builder(activity).setTitle("Save this request")
            .setMessage("Saved only on this device. Keeps the exact prompt, not the generated playlist. Up to 10 requests; delete an older one if full.")
            .setView(name).setPositiveButton("Save",(d,n)->{
                JSONArray entries=load();
                if(entries.length()>=10){Toast.makeText(activity,"Shelf is full. Delete a saved request first.",Toast.LENGTH_LONG).show();show();return;}
                try {
                    String label=name.getText().toString().trim();if(label.isEmpty())label="Untitled crate";
                    entries.put(new JSONObject().put("id",UUID.randomUUID().toString()).put("name",label).put("ai",ai).put("prompt",prompt).put("time",System.currentTimeMillis()));
                    prefs.edit().putString("savedRequests",entries.toString()).apply();Toast.makeText(activity,"Request saved on this device.",Toast.LENGTH_SHORT).show();
                }catch(JSONException e){Toast.makeText(activity,"Couldn't save this request.",Toast.LENGTH_LONG).show();}
            }).setNegativeButton("Cancel",null).show();
    }
    void show() {
        JSONArray entries=load();
        if(entries.length()==0){new AlertDialog.Builder(activity).setTitle("Saved requests")
            .setMessage("Your shelf is empty. Press GO, return to Lab, then choose Save current request. Nothing is saved automatically.")
            .setPositiveButton("Got it",null).show();return;}
        List<JSONObject> valid=new ArrayList<>();
        for(int i=0;i<entries.length();i++){JSONObject o=entries.optJSONObject(i);if(o!=null&&!o.optString("prompt").isEmpty())valid.add(o);}
        String[] labels=new String[valid.size()];
        for(int i=0;i<valid.size();i++){JSONObject o=valid.get(i);labels[i]=o.optString("name","Untitled crate")+" · "+o.optString("ai");}
        new AlertDialog.Builder(activity).setTitle("Saved requests · "+valid.size()+"/10")
            .setItems(labels,(d,index)->actions(valid.get(index))).setNegativeButton("Close",null).show();
    }
    private void actions(JSONObject entry) {
        String prompt=entry.optString("prompt"),ai=entry.optString("ai");
        new AlertDialog.Builder(activity).setTitle(entry.optString("name"))
            .setItems(new String[]{"Open in "+ai,"Copy exact request","Share exact request","Delete"},(d,n)->{
                if(n==0)replay.open(ai,prompt);
                else if(n==1){copy.run(prompt);Toast.makeText(activity,"Saved request copied.",Toast.LENGTH_SHORT).show();}
                else if(n==2)share.run(prompt);
                else new AlertDialog.Builder(activity).setTitle("Delete saved request?")
                    .setMessage("Remove ‘"+entry.optString("name")+"’ from this device?")
                    .setPositiveButton("Delete",(dialog,which)->{
                        JSONArray current=load(),kept=new JSONArray();
                        for(int i=0;i<current.length();i++){JSONObject o=current.optJSONObject(i);if(o!=null&&!entry.optString("id").equals(o.optString("id")))kept.put(o);}
                        prefs.edit().putString("savedRequests",kept.toString()).apply();show();
                    }).setNegativeButton("Cancel",null).show();
            }).setNegativeButton("Back",(d,n)->show()).show();
    }
}
