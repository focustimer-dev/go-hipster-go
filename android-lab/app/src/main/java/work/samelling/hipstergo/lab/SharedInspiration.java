package work.samelling.hipstergo.lab;

import android.app.*;
import android.content.SharedPreferences;
import android.text.InputFilter;
import android.widget.*;
import org.json.*;
import java.util.concurrent.*;

/** Incoming shares are reviewed before being applied; nothing is sent to an AI here. */
final class SharedInspiration {
    private final Activity activity;
    private final SharedPreferences prefs;
    private final Runnable changed;
    private final NativeDialogPalette dialogs;
    private final ExecutorService worker=Executors.newSingleThreadExecutor();
    private Future<?> pending;
    private LinkPreview.Request previewRequest;
    private long generation;
    private boolean closed;
    private volatile boolean previewLoading;
    private volatile String loadingText="";
    SharedInspiration(Activity activity,SharedPreferences prefs,Runnable changed,NativeDialogPalette dialogs) {
        this.activity=activity;this.prefs=prefs;this.changed=changed;this.dialogs=dialogs;
        if(!value().isEmpty())remember(value());
    }
    String value(){return prefs.getString("sharedInspiration","");}
    JSONArray recent(){try{return new JSONArray(prefs.getString("recentInspirationsV1","[]"));}catch(Exception e){return new JSONArray();}}
    JSONObject preview(){
        JSONArray entries=recent();String active=value();
        for(int i=0;i<entries.length();i++){
            JSONObject entry=entries.optJSONObject(i);
            if(entry!=null&&active.equals(entry.optString("text"))){
                try{entry.put("loading",previewLoading&&active.equals(loadingText));}catch(JSONException ignored){}
                return entry;
            }
        }
        return new JSONObject();
    }
    private void remember(String text){prefs.edit().putString("recentInspirationsV1",InspirationHistory.remember(recent(),text,System.currentTimeMillis()).toString()).apply();}
    void clear(){previewLoading=false;cancelPreview();prefs.edit().remove("sharedInspiration").apply();changed.run();}
    void reuse(String id){JSONArray entries=recent();for(int i=0;i<entries.length();i++){JSONObject e=entries.optJSONObject(i);if(e!=null&&id.equals(e.optString("id"))){use(e.optString("text"));return;}}}
    void close(){closed=true;cancelPreview();worker.shutdownNow();}
    private void cancelPreview(){generation++;if(previewRequest!=null)previewRequest.cancel();if(pending!=null)pending.cancel(true);}
    private void use(String text){
        cancelPreview();
        remember(text);prefs.edit().putString("sharedInspiration",text).apply();
        String url=LinkPreview.firstUrl(text);previewLoading=!url.isEmpty()&&preview().optString("title").isEmpty();loadingText=text;changed.run();
        if(!previewLoading)return;
        final long version=generation;final LinkPreview.Request request=new LinkPreview.Request();previewRequest=request;
        pending=worker.submit(()->{
            try{LinkPreview.Result result=LinkPreview.fetchWithFallback(url,request);if(result.title.isEmpty())throw new java.io.IOException("No page title");activity.runOnUiThread(()->{
                if(closed||version!=generation)return;if(text.equals(loadingText))previewLoading=false;JSONArray entries=recent();boolean found=false;
                for(int i=0;i<entries.length();i++){JSONObject entry=entries.optJSONObject(i);if(entry!=null&&text.equals(entry.optString("text"))){try{entry.put("title",result.title).put("description",result.description).put("url",result.url).put("metadataStatus","ok");found=true;}catch(JSONException ignored){}}}
                if(found){prefs.edit().putString("recentInspirationsV1",entries.toString()).apply();changed.run();}
            });}catch(Exception failure){activity.runOnUiThread(()->{
                if(closed||version!=generation||!text.equals(loadingText))return;
                previewLoading=false;
                JSONArray entries=recent();
                for(int i=0;i<entries.length();i++){
                    JSONObject entry=entries.optJSONObject(i);
                    if(entry!=null&&text.equals(entry.optString("text"))){
                        try{entry.put("metadataStatus","unavailable");}catch(JSONException ignored){}
                    }
                }
                prefs.edit().putString("recentInspirationsV1",entries.toString()).apply();
                changed.run();
            });}
        });
    }
    void apply(String text){
        String normalized=InspirationText.normalize(null,text);
        if(normalized.isEmpty()){changed.run();return;}
        use(normalized);
    }
    void review(){edit(value(),false);}
    void receive(String text){edit(text,true);}
    private void edit(String text,boolean incoming) {
        EditText input=new EditText(activity);input.setText(text);input.setHint("Song link, artist/title, or a musical idea");
        input.setMinLines(3);input.setMaxLines(7);input.setGravity(android.view.Gravity.TOP);
        input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(InspirationText.LIMIT)});
        LinearLayout content=new LinearLayout(activity);content.setOrientation(1);content.setPadding(32,16,32,0);
        content.addView(input);
        AlertDialog.Builder dialog=new AlertDialog.Builder(activity).setTitle(incoming?"Shared inspiration":"Your inspiration")
            .setView(content).setPositiveButton("Use in Jukebox",(d,n)->{
                String value=InspirationText.normalize(null,input.getText().toString());
                if(value.isEmpty()){Toast.makeText(activity,"No inspiration added. Use Remove to clear an existing reference.",Toast.LENGTH_LONG).show();return;}
                use(value);
                Toast.makeText(activity,"Inspiration added.",Toast.LENGTH_LONG).show();
            }).setNegativeButton("Cancel",null);
        if(!value().isEmpty())dialog.setNeutralButton("Remove",(d,n)->clear());
        dialogs.show(dialog);
    }
}
