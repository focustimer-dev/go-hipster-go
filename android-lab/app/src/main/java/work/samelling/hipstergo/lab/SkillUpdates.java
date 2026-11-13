package work.samelling.hipstergo.lab;

import android.app.*;
import android.content.SharedPreferences;
import android.text.format.DateFormat;
import android.widget.*;
import org.json.*;
import javax.net.ssl.HttpsURLConnection;
import java.net.URL;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/** Native-only metadata checker. Never downloads, installs or executes a skill. */
final class SkillUpdates {
    interface OpenUrl { void open(String url); }
    private final Activity activity;
    private final SharedPreferences prefs;
    private final OpenUrl opener;
    private final Runnable changed;
    private final NativeDialogPalette dialogs;
    private final ExecutorService executor=Executors.newSingleThreadExecutor();
    private volatile boolean checking=false;
    private String status="";
    SkillUpdates(Activity activity, SharedPreferences prefs, OpenUrl opener, Runnable changed, NativeDialogPalette dialogs) {
        this.activity=activity;this.prefs=prefs;this.opener=opener;this.changed=changed;this.dialogs=dialogs;
    }
    String channel(){return prefs.getString("skillChannel","stable");}
    private String key(String name,String channel){return "skill."+channel+"."+name;}
    private ReleasePolicy.Release cached(String channel) {
        try {
            JSONObject o=new JSONObject(prefs.getString(key("release",channel),"{}"));
            ReleasePolicy.Release r=fromCache(o);
            return ReleasePolicy.allowed(r,channel)?r:null;
        }catch(Exception e){return null;}
    }
    private static ReleasePolicy.Release fromCache(JSONObject o)throws JSONException {
        return new ReleasePolicy.Release(o.getString("tag"),o.optString("notes"),o.getString("page"),
            o.getString("download"),o.getLong("id"),o.getString("updated"),o.optString("digest"),false,o.getBoolean("prerelease"));
    }
    private static JSONObject serialize(ReleasePolicy.Release r)throws JSONException {
        return new JSONObject().put("tag",r.tag).put("notes",r.notes).put("page",r.page)
            .put("download",r.download).put("id",r.assetId).put("updated",r.updated)
            .put("digest",r.digest).put("prerelease",r.prerelease);
    }
    // Dismissal applies to one package identity and one channel, never to
    // the entire app. A new release asset becomes actionable again.
    static boolean actionable(ReleasePolicy.Release release,String confirmed,String dismissed) {
        return release!=null&&!release.identity().equals(confirmed)&&!release.identity().equals(dismissed);
    }
    boolean available() {
        final String channel=channel();
        return actionable(cached(channel),prefs.getString(key("confirmed",channel),""),
            prefs.getString(key("dismissed",channel),""));
    }
    String summary() {
        final String channel=channel();
        ReleasePolicy.Release r=cached(channel);
        if(r==null)return "No release checked yet";
        if(r.identity().equals(prefs.getString(key("confirmed",channel),"")))return "Installation recorded · "+r.tag;
        if(r.identity().equals(prefs.getString(key("dismissed",channel),"")))return "Update dismissed · "+r.tag;
        return "Package available · "+r.tag;
    }
    String latestVersion(){ReleasePolicy.Release r=cached(channel());return r==null?"Not checked":r.tag;}
    String recordedVersion(){return prefs.getString(key("confirmedLabel",channel()),"Not recorded");}
    String detail() {
        long time=prefs.getLong(key("checked",channel()),0);
        return ("stable".equals(channel())?"Stable":"Lab")+" · Last successful check: "+
            (time==0?"Never":DateFormat.format("MMM d, h:mm a",new Date(time)))+". Confirmations are self-reported.";
    }
    void onLaunch() {
        changed.run();
        if(prefs.getBoolean("skillAuto",true) && System.currentTimeMillis()-prefs.getLong(key("attempt",channel()),0)>86400000L)check(false);
    }
    void show() {
        final String channel=channel();
        final ReleasePolicy.Release release=cached(channel);
        String confirmed=recordedVersion();
        long time=prefs.getLong(key("checked",channel),0);
        String message="Channel: "+("stable".equals(channel)?"Stable":"Lab (includes prereleases)")+
            "\nYou confirmed: "+confirmed+"\nLatest checked package: "+(release==null?"Not checked":release.tag)+
            "\nLast successful check: "+(time==0?"Never":DateFormat.format("MMM d, h:mm a",new Date(time)))+
            (status.isEmpty()?"":"\n\n"+status)+"\n\nLab checks public GitHub release metadata. Nothing is downloaded or installed automatically. Gemini's installed version cannot be read by this app.";
        LinearLayout panel=new LinearLayout(activity);panel.setOrientation(1);panel.setPadding(32,16,32,16);
        TextView info=new TextView(activity);info.setText(message);panel.addView(info);
        AlertDialog dialog=new AlertDialog.Builder(activity).setTitle("Gemini skill updates")
            .setNegativeButton("Close",null).create();
        add(panel,checking?"Checking…":"Check for updates",()->{dialog.dismiss();check(true);});
        if(release!=null) {
            add(panel,"View release changes",()->opener.open(release.page));
            add(panel,"Download ZIP & replacement steps",()->instructions(release));
            if(!release.identity().equals(prefs.getString(key("confirmed",channel),""))) {
                if(release.identity().equals(prefs.getString(key("dismissed",channel),""))) {
                    add(panel,"Show this update again",()->{
                        prefs.edit().remove(key("dismissed",channel)).apply();
                        changed.run();dialog.dismiss();show();
                    });
                }else{
                    add(panel,"Not now — hide this package's badge",()->{
                        prefs.edit().putString(key("dismissed",channel),release.identity()).apply();
                        changed.run();dialog.dismiss();show();
                    });
                }
            }
            add(panel,"I installed this package",()->dialogs.show(new AlertDialog.Builder(activity)
                .setTitle("Record your installation?")
                .setMessage("Confirm only after replacing the skill in Gemini with "+release.tag+". This records your confirmation; it does not verify Gemini or install anything.")
                .setPositiveButton("I installed it",(d,n)->{
                    prefs.edit().putString(key("confirmed",channel),release.identity())
                        .putString(key("confirmedLabel",channel),release.tag)
                        .remove(key("dismissed",channel)).apply();changed.run();dialog.dismiss();show();
                }).setNegativeButton("Cancel",null)));
        }
        add(panel,"Release channel: "+channel,()->{
            dialogs.show(new AlertDialog.Builder(activity).setTitle("Choose release channel")
                .setSingleChoiceItems(new String[]{"Stable — approved releases","Lab — includes experimental prereleases"},"stable".equals(channel)?0:1,(d,n)->{
                    prefs.edit().putString("skillChannel",n==0?"stable":"lab").apply();status="";d.dismiss();dialog.dismiss();changed.run();show();
                }).setNegativeButton("Cancel",null));
        });
        add(panel,"Daily in-app checks: "+(prefs.getBoolean("skillAuto",true)?"on":"off"),()->{
            prefs.edit().putBoolean("skillAuto",!prefs.getBoolean("skillAuto",true)).apply();dialog.dismiss();show();
        });
        ScrollView scroll=new ScrollView(activity);scroll.addView(panel);dialog.setView(scroll);dialogs.show(dialog);
    }
    private void add(LinearLayout panel,String label,Runnable action) {
        Button b=new Button(activity);b.setText(label);b.setAllCaps(false);
        b.setOnClickListener(v->action.run());panel.addView(b);
    }
    private void instructions(ReleasePolicy.Release release) {
        dialogs.show(new AlertDialog.Builder(activity).setTitle("Update "+release.tag)
            .setMessage("1. Review the release changes.\n2. Download the Gemini Skill ZIP.\n3. In Gemini web: Customize → Skills → Go, Hipster, Go! → More → Replace skill.\n4. Upload the ZIP and Save.\n5. Return here; choose ‘I installed this package’ only after confirming the replacement.\n\n‘Not now’ hides only this exact package's badge. A newer release will alert you again. Downloads alone never prove installation.")
            .setPositiveButton("Download ZIP",(d,n)->opener.open(release.download))
            .setNeutralButton("Gemini web",(d,n)->opener.open("https://gemini.google.com/app"))
            .setNegativeButton("Back",(d,n)->show()));
    }
    private void check(boolean display) {
        if(checking)return;
        checking=true;final String selected=channel();
        prefs.edit().putLong(key("attempt",selected),System.currentTimeMillis()).apply();
        if(display)Toast.makeText(activity,"Checking GitHub releases…",Toast.LENGTH_SHORT).show();
        executor.execute(()->{
            String result;
            try {
                ReleasePolicy.Release release=readRelease(selected);
                SharedPreferences.Editor edit=prefs.edit().putLong(key("checked",selected),System.currentTimeMillis());
                if(release==null)edit.remove(key("release",selected));else edit.putString(key("release",selected),serialize(release).toString());
                edit.apply();
                result=release==null?"No matching skill package found in the latest 100 releases.":"Release check completed. Review the package before updating.";
            }catch(Exception e) {
                result="Couldn't check GitHub. Your recorded version and any cached release details are unchanged. Try again when connected.";
            }
            final String outcome=result;
            activity.runOnUiThread(()->{
                checking=false;if(activity.isDestroyed()||activity.isFinishing())return;
                if(channel().equals(selected))status=outcome;changed.run();if(display&&channel().equals(selected))show();
            });
        });
    }
    private ReleasePolicy.Release readRelease(String channel)throws Exception {
        URL endpoint=new URL("https://api.github.com/repos/"+ReleasePolicy.REPO+"/releases?per_page=100");
        HttpsURLConnection c=(HttpsURLConnection)endpoint.openConnection();
        c.setConnectTimeout(10000);c.setReadTimeout(10000);c.setInstanceFollowRedirects(false);
        c.setRequestProperty("Accept","application/vnd.github+json");
        c.setRequestProperty("User-Agent","Hipster-Go-Lab/0.4.0");
        c.setRequestProperty("X-GitHub-Api-Version","2022-11-28");
        c.setUseCaches(false);
        try {
            if(c.getResponseCode()!=200)throw new IOException("Release request unavailable");
            ByteArrayOutputStream bytes=new ByteArrayOutputStream();
            try(InputStream in=c.getInputStream()) {
                byte[] buffer=new byte[8192];int n;
                while((n=in.read(buffer))!=-1){if(bytes.size()+n>4000000)throw new IOException("Response too large");bytes.write(buffer,0,n);}
            }
            return selectJson(new String(bytes.toByteArray(),StandardCharsets.UTF_8),channel);
        }finally{c.disconnect();}
    }
    static ReleasePolicy.Release selectJson(String json,String channel)throws JSONException {
        JSONArray releases=new JSONArray(json);List<ReleasePolicy.Release> candidates=new ArrayList<>();
        for(int i=0;i<releases.length();i++) {
            JSONObject r=releases.optJSONObject(i);if(r==null)continue;
            JSONArray assets=r.optJSONArray("assets");if(assets==null)continue;
            for(int j=0;j<assets.length();j++) {
                JSONObject a=assets.optJSONObject(j);
                if(a==null || !ReleasePolicy.ASSET.equals(a.optString("name")) || !"uploaded".equals(a.optString("state")) || a.optLong("size",0)<=0)continue;
                candidates.add(new ReleasePolicy.Release(r.optString("tag_name"),r.optString("body"),r.optString("html_url"),
                    a.optString("browser_download_url"),a.optLong("id",0),a.optString("updated_at"),a.optString("digest"),r.optBoolean("draft",true),r.optBoolean("prerelease",true)));
            }
        }
        return ReleasePolicy.select(candidates,channel);
    }
    void close(){executor.shutdownNow();}
}
