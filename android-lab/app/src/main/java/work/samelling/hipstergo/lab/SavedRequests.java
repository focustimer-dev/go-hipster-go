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
    private final Runnable changed;
    SavedRequests(Activity activity,SharedPreferences prefs,Replay replay,TextAction copy,TextAction share,Runnable changed) {
        this.activity=activity;this.prefs=prefs;this.replay=replay;this.copy=copy;this.share=share;this.changed=changed;
    }
    private JSONArray load(){try{return new JSONArray(prefs.getString("savedRequests","[]"));}catch(Exception e){return new JSONArray();}}
    JSONArray entries(){return load();}
    void showEntry(String id) {
        JSONArray entries=load();
        for(int i=0;i<entries.length();i++){
            JSONObject entry=entries.optJSONObject(i);
            if(entry!=null&&id.equals(entry.optString("id"))){actions(entry);return;}
        }
        Toast.makeText(activity,"That saved request is no longer on this device.",Toast.LENGTH_SHORT).show();changed.run();
    }
    void save(String ai,String prompt) {
        if(prompt==null || prompt.isEmpty()){Toast.makeText(activity,"Press GO first to prepare a request.",Toast.LENGTH_LONG).show();return;}
        EditText name=new EditText(activity);name.setSingleLine(true);name.setHint("Name this request");
        name.setFilters(new InputFilter[]{new InputFilter.LengthFilter(60)});
        name.setText("Crate · "+DateFormat.format("MMM d, h:mm a",new Date()));
        new AlertDialog.Builder(activity).setTitle("Save this request")
            .setMessage("Saved only on this device. Keeps the exact prompt, not the generated playlist. Up to 10 requests; delete an older one if full.")
            .setView(name).setPositiveButton("Save",(d,n)->{
                JSONArray entries=load();
                if(entries.length()>=10){Toast.makeText(activity,"Shelf is full. Delete a saved request first.",Toast.LENGTH_LONG).show();return;}
                try {
                    String label=name.getText().toString().trim();if(label.isEmpty())label="Untitled crate";
                    entries.put(new JSONObject().put("id",UUID.randomUUID().toString()).put("name",label).put("ai",ai).put("prompt",prompt).put("time",System.currentTimeMillis()));
                    prefs.edit().putString("savedRequests",entries.toString()).apply();changed.run();Toast.makeText(activity,"Request saved on this device.",Toast.LENGTH_SHORT).show();
                }catch(JSONException e){Toast.makeText(activity,"Couldn't save this request.",Toast.LENGTH_LONG).show();}
            }).setNegativeButton("Cancel",null).show();
    }
    private void actions(JSONObject entry) {
        String prompt=entry.optString("prompt"),ai=entry.optString("ai");
        String[] choices=SavedRequestPolicy.isManual(ai)
            ? new String[]{"Copy exact request","Share exact request","Delete"}
            : new String[]{("share".equals(prefs.getString("mode","open"))?"Share to ":"browser".equals(prefs.getString("mode","open"))?"Open browser for ":"Open app for ")+ai,"Copy exact request","Share exact request","Delete"};
        new AlertDialog.Builder(activity).setTitle(entry.optString("name"))
            .setItems(choices,(d,n)->{
                int action=SavedRequestPolicy.action(ai,n);
                if(action==0)replay.open(ai,prompt);
                else if(action==1){copy.run(prompt);Toast.makeText(activity,SavedRequestPolicy.isManual(ai)?"Saved request copied. Open your AI manually, paste and send.":"Saved request copied.",Toast.LENGTH_SHORT).show();}
                else if(action==2)share.run(prompt);
                else new AlertDialog.Builder(activity).setTitle("Delete saved request?")
                    .setMessage("Remove ‘"+entry.optString("name")+"’ from this device?")
                    .setPositiveButton("Delete",(dialog,which)->{
                        JSONArray current=load(),kept=new JSONArray();
                        for(int i=0;i<current.length();i++){JSONObject o=current.optJSONObject(i);if(o!=null&&!entry.optString("id").equals(o.optString("id")))kept.put(o);}
                        prefs.edit().putString("savedRequests",kept.toString()).apply();changed.run();
                    }).setNegativeButton("Cancel",null).show();
            }).setNegativeButton("Close",null).setNeutralButton("View exact request",(d,n)->{
                TextView text=new TextView(activity);text.setText(prompt);text.setTextIsSelectable(true);text.setPadding(32,24,32,24);
                ScrollView scroll=new ScrollView(activity);scroll.addView(text);
                new AlertDialog.Builder(activity).setTitle(entry.optString("name")).setView(scroll)
                    .setPositiveButton("Back",(dialog,which)->actions(entry)).show();
            }).show();
    }
}
