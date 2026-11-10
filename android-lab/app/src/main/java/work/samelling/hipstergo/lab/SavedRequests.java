package work.samelling.hipstergo.lab;

import android.app.*;
import android.content.SharedPreferences;
import android.os.Build;
import android.text.InputFilter;
import android.text.format.DateFormat;
import android.util.TypedValue;
import android.widget.*;
import org.json.*;
import java.util.*;

/** Explicitly saved requests, private to this app. Nothing is saved automatically. */
final class SavedRequests {
    interface Replay { void open(String ai,String prompt); }
    interface TextAction { void run(String text); }
    interface CopyAction { boolean run(String text); }
    private final Activity activity;
    private final SharedPreferences prefs;
    private final Replay replay;
    private final CopyAction copy;
    private final TextAction share;
    private final Runnable changed;
    private final NativeDialogPalette dialogs;
    SavedRequests(Activity activity,SharedPreferences prefs,Replay replay,CopyAction copy,TextAction share,Runnable changed,NativeDialogPalette dialogs) {
        this.activity=activity;this.prefs=prefs;this.replay=replay;this.copy=copy;this.share=share;this.changed=changed;this.dialogs=dialogs;
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
        dialogs.show(new AlertDialog.Builder(activity).setTitle("Save this request")
            .setMessage("Saved only on this device. Keeps the exact prompt, not the generated playlist. Up to 10 requests; delete an older one if full.")
            .setView(name).setPositiveButton("Save",(d,n)->{
                JSONArray entries=load();
                if(entries.length()>=10){Toast.makeText(activity,"Shelf is full. Delete a saved request first.",Toast.LENGTH_LONG).show();return;}
                try {
                    String label=name.getText().toString().trim();if(label.isEmpty())label="Untitled crate";
                    entries.put(new JSONObject().put("id",UUID.randomUUID().toString()).put("name",label).put("ai",ai).put("prompt",prompt).put("time",System.currentTimeMillis()));
                    prefs.edit().putString("savedRequests",entries.toString()).apply();changed.run();Toast.makeText(activity,"Request saved on this device.",Toast.LENGTH_SHORT).show();
                }catch(JSONException e){Toast.makeText(activity,"Couldn't save this request.",Toast.LENGTH_LONG).show();}
            }).setNegativeButton("Cancel",null));
    }
    private void actions(JSONObject entry) {
        String name=entry.optString("name"),prompt=entry.optString("prompt"),ai=entry.optString("ai");
        boolean manual=SavedRequestPolicy.isManual(ai);
        String provider="chatgpt".equals(ai)?"ChatGPT":"gemini".equals(ai)?"Gemini":"Claude";
        String mode=prefs.getString("mode","open");
        String primary=manual?"Copy request":"share".equals(mode)?"Share to "+provider
            :"browser".equals(mode)?"Open "+provider+" in browser":"Open "+provider;

        LinearLayout tools=new LinearLayout(activity);
        tools.setPadding(dp(16),dp(8),dp(16),dp(4));
        AlertDialog dialog=new AlertDialog.Builder(activity).setTitle(name).setView(tools)
            .setPositiveButton(primary,(d,n)->{
                if(manual)copyRequest(prompt,true);
                else replay.open(ai,prompt);
            }).setNegativeButton("Close",null).create();
        addTool(tools,dialog,R.drawable.ic_crate_preview,"Preview request",()->preview(entry));
        if(!manual)addTool(tools,dialog,R.drawable.ic_crate_copy,"Copy request",()->copyRequest(prompt,false));
        addTool(tools,dialog,R.drawable.ic_crate_share,"Share request",()->share.run(prompt));
        addTool(tools,dialog,R.drawable.ic_crate_delete,"Delete saved request",()->confirmDelete(entry));
        dialogs.show(dialog);
    }

    private int dp(int value) {
        return Math.round(value*activity.getResources().getDisplayMetrics().density);
    }

    private void addTool(LinearLayout row,AlertDialog dialog,int icon,String label,Runnable action) {
        ImageButton button=new ImageButton(activity);
        button.setImageResource(icon);
        button.setContentDescription(label);
        if(Build.VERSION.SDK_INT>=26)button.setTooltipText(label);
        button.setScaleType(ImageView.ScaleType.CENTER);
        button.setFocusable(true);
        TypedValue selectable=new TypedValue();
        activity.getTheme().resolveAttribute(android.R.attr.selectableItemBackground,selectable,true);
        button.setBackgroundResource(selectable.resourceId);
        button.setOnClickListener(view->{dialog.dismiss();action.run();});
        row.addView(button,new LinearLayout.LayoutParams(0,dp(48),1));
    }

    private void copyRequest(String prompt,boolean manual) {
        boolean ok=copy.run(prompt);
        String message=!ok?"Clipboard unavailable. Preview the request to copy it manually."
            :manual?"Saved request copied. Open your AI manually, paste and send.":"Saved request copied.";
        Toast.makeText(activity,message,Toast.LENGTH_LONG).show();
    }

    private void preview(JSONObject entry) {
        TextView text=new TextView(activity);
        text.setText(entry.optString("prompt"));
        text.setTextIsSelectable(true);
        text.setPadding(dp(16),dp(12),dp(16),dp(12));
        ScrollView scroll=new ScrollView(activity);
        scroll.addView(text);
        dialogs.show(new AlertDialog.Builder(activity).setTitle(entry.optString("name")).setView(scroll)
            .setPositiveButton("Back",(dialog,which)->actions(entry)));
    }

    private void confirmDelete(JSONObject entry) {
        dialogs.show(new AlertDialog.Builder(activity).setTitle("Delete saved request?")
            .setMessage("Remove ‘"+entry.optString("name")+"’ from this device?")
            .setPositiveButton("Delete",(dialog,which)->{
                JSONArray current=load(),kept=new JSONArray();
                for(int i=0;i<current.length();i++){
                    JSONObject item=current.optJSONObject(i);
                    if(item!=null&&!entry.optString("id").equals(item.optString("id")))kept.put(item);
                }
                prefs.edit().putString("savedRequests",kept.toString()).apply();changed.run();
            }).setNegativeButton("Cancel",null));
    }
}
