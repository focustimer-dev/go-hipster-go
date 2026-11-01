package work.samelling.hipstergo.lab;

import android.app.*;
import android.content.SharedPreferences;
import android.text.InputFilter;
import android.widget.*;

/** Incoming shares are reviewed before being applied; nothing is sent to an AI here. */
final class SharedInspiration {
    private final Activity activity;
    private final SharedPreferences prefs;
    private final Runnable changed;
    SharedInspiration(Activity activity,SharedPreferences prefs,Runnable changed) {
        this.activity=activity;this.prefs=prefs;this.changed=changed;
    }
    String value(){return prefs.getString("sharedInspiration","");}
    void clear(){prefs.edit().remove("sharedInspiration").apply();changed.run();}
    void review(){edit(value(),false);}
    void receive(String text){edit(text,true);}
    private void edit(String text,boolean incoming) {
        EditText input=new EditText(activity);input.setText(text);input.setHint("Song link, artist/title, or a musical idea");
        input.setMinLines(3);input.setMaxLines(7);input.setGravity(android.view.Gravity.TOP);
        input.setFilters(new InputFilter[]{new InputFilter.LengthFilter(InspirationText.LIMIT)});
        LinearLayout content=new LinearLayout(activity);content.setOrientation(1);content.setPadding(32,16,32,0);
        TextView explanation=new TextView(activity);
        explanation.setText("Review or edit this reference. It will be included in GO until removed. Your region, mood and tempo choices stay in place. Links are passed to your AI; Lab does not open or inspect them.");
        content.addView(explanation);content.addView(input);
        AlertDialog.Builder dialog=new AlertDialog.Builder(activity).setTitle(incoming?"Shared inspiration":"Your inspiration")
            .setView(content).setPositiveButton("Use inspiration",(d,n)->{
                String value=InspirationText.normalize(null,input.getText().toString());
                if(value.isEmpty()){Toast.makeText(activity,"No inspiration added. Use Remove to clear an existing reference.",Toast.LENGTH_LONG).show();return;}
                prefs.edit().putString("sharedInspiration",value).apply();changed.run();
                Toast.makeText(activity,"Inspiration added. Choose your brief, then press GO.",Toast.LENGTH_LONG).show();
            }).setNegativeButton("Cancel",null);
        if(!value().isEmpty())dialog.setNeutralButton("Remove",(d,n)->clear());
        dialog.show();
    }
}
