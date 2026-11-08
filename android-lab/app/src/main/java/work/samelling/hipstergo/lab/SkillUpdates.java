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
    private final ExecutorService executor=Executors.newSingleThreadExecutor();
    private volatile boolean checking=false;
    private String status="";
    SkillUpdates(Activity activity, SharedPreferences prefs, OpenUrl opener, Runnable changed) {
        this.activity=activity;this.prefs=prefs;this.opener=opener;this.changed=changed;
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
    boolean available() {
        ReleasePolicy.Release r=cached(channel());
        return r!=null&&!r.identity().equals(prefs.getString(key("confirmed",channel()),""));
    }
    String summary() {
        ReleasePolicy.Release r=cached(channel());
        return r==null?"No release checked yet":available()?"Package available · "+r.tag:"Installation recorded · "+r.tag;
    }
    String recordedVersion() {return prefs.getString(key("confirmedLabel",channel()),"Not recorded");}
    String latestVersion() {
        ReleasePolicy.Release release=cached(channel());
        return release==null?"Not checked":release.tag;
    }
    String detail() {
        long time=prefs.getLong(key("checked",channel()),0);
        return ("stable".equals(channel())?"Stable":"Lab")+" · Last successful check: "+
            (time==0?"Never":DateFormat.format("MMM d, h:mm a",new Date(time)))+". Confirmations are self-reported.";
    }
    void onLaunch() {
        changed.run();
        if(prefs.getBoolean("skillAuto",true) && System.currentTimeMillis()-prefs.getLong(key("attempt",channel()),0)>86400000L)check(false);
    }

    // The WebView owns the appearance choice. Keep this native-only dialog in
    // the same three-ink family without assuming Android's default Material
    // light dialog (which otherwise paints every theme mustard and gray).
    private static final class Palette {
        final int paper,ink,key,keyInk,accent,border;
        Palette(String paper,String ink,String key,String keyInk,String accent,String border) {
            this.paper=android.graphics.Color.parseColor(paper);
            this.ink=android.graphics.Color.parseColor(ink);
            this.key=android.graphics.Color.parseColor(key);
            this.keyInk=android.graphics.Color.parseColor(keyInk);
            this.accent=android.graphics.Color.parseColor(accent);
            this.border=android.graphics.Color.parseColor(border);
        }
    }
    private Palette palette() {
        String theme=prefs.getString("labAppearance","liberi");
        if("usiku".equals(theme))
            return new Palette("#111111","#f5f0e6","#004225","#e5cf42","#e5cf42","#b77b4d");
        if("bosque".equals(theme))
            return new Palette("#f5f0e6","#003018","#004225","#f5f0e6","#8c6239","#8c6239");
        return new Palette("#dfb045","#103135","#103135","#dfb045","#a83223","#103135");
    }
    private int dp(int pixels) {
        return (int)(pixels*activity.getResources().getDisplayMetrics().density+0.5f);
    }
    private android.graphics.drawable.GradientDrawable surface(Palette p,boolean key) {
        android.graphics.drawable.GradientDrawable bg=new android.graphics.drawable.GradientDrawable();
        bg.setColor(key?p.key:p.paper);
        bg.setCornerRadius(dp(key?2:0));
        bg.setStroke(dp(1),key?p.key:p.border);
        return bg;
    }
    private LinearLayout panel(Palette p) {
        LinearLayout layout=new LinearLayout(activity);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(dp(22),dp(18),dp(22),dp(20));
        layout.setBackground(surface(p,false));
        return layout;
    }
    private TextView note(LinearLayout parent,Palette p,String value,int size,boolean bold,int color,int above) {
        TextView label=new TextView(activity);
        label.setText(value);
        label.setTextSize(size);
        label.setTextColor(color);
        label.setTypeface(bold?android.graphics.Typeface.DEFAULT_BOLD:android.graphics.Typeface.DEFAULT);
        label.setLineSpacing(dp(2),1f);
        LinearLayout.LayoutParams space=new LinearLayout.LayoutParams(-1,-2);
        space.topMargin=dp(above);
        parent.addView(label,space);
        return label;
    }
    private Button add(LinearLayout parent,Palette p,String label,boolean primary,Runnable action) {
        Button button=new Button(activity);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextSize(15);
        button.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        button.setTextColor(primary?p.keyInk:p.ink);
        button.setBackground(surface(p,primary));
        button.setElevation(0);
        button.setMinHeight(dp(48));
        button.setGravity(android.view.Gravity.CENTER);
        button.setPadding(dp(10),dp(9),dp(10),dp(9));
        LinearLayout.LayoutParams row=new LinearLayout.LayoutParams(-1,-2);
        row.topMargin=dp(9);
        parent.addView(button,row);
        button.setOnClickListener(v->action.run());
        return button;
    }
    private AlertDialog sheet(Palette p,LinearLayout panel) {
        ScrollView scroll=new ScrollView(activity);
        scroll.setFillViewport(false);
        scroll.addView(panel);
        AlertDialog dialog=new AlertDialog.Builder(activity).setView(scroll).create();
        dialog.setOnShowListener(ignored->{
            android.view.Window window=dialog.getWindow();
            if(window!=null) {
                window.setBackgroundDrawable(surface(p,false));
                int width=activity.getResources().getDisplayMetrics().widthPixels;
                window.setLayout(Math.min(width-dp(32),dp(460)),-2);
            }
        });
        return dialog;
    }
    void show() {
        final String channel=channel();
        final ReleasePolicy.Release release=cached(channel);
        final Palette p=palette();
        final String confirmed=prefs.getString(key("confirmedLabel",channel),"Not recorded");
        final long time=prefs.getLong(key("checked",channel),0);
        final boolean pending=available();
        LinearLayout panel=panel(p);
        note(panel,p,"GEMINI SKILL · "+("stable".equals(channel)?"STABLE":"LAB"),12,true,p.accent,0);
        note(panel,p,"Skill updates",26,true,p.ink,5);
        note(panel,p,release==null?"NO PACKAGE CHECKED":pending?"UPDATE AVAILABLE":"INSTALLATION RECORDED",
             13,true,p.accent,14);
        note(panel,p,"Recorded: "+confirmed+"\nLatest checked: "+(release==null?"Not checked":release.tag),
             16,true,p.ink,6);
        note(panel,p,"Last checked: "+(time==0?"Never":DateFormat.format("MMM d, h:mm a",new Date(time))),
             13,false,p.ink,5);
        note(panel,p,pending?"After replacing the Skill in Gemini, return here and record the installation. That clears the Manual's yellow dot."
                     :"The app tracks your confirmation. It cannot read which Skill Gemini has installed.",
             14,false,p.ink,12);
        if(!status.isEmpty())note(panel,p,status,13,false,p.ink,6);
        AlertDialog dialog=sheet(p,panel);
        if(release!=null) {
            add(panel,p,"I INSTALLED THIS VERSION",true,()->confirm(release,channel,dialog));
            add(panel,p,"DOWNLOAD & INSTRUCTIONS",false,()->{dialog.dismiss();instructions(release);});
            add(panel,p,"VIEW RELEASE CHANGES",false,()->opener.open(release.page));
        }
        add(panel,p,checking?"CHECK IN PROGRESS":"CHECK FOR UPDATES",false,()->{
            if(checking)return;dialog.dismiss();check(true);
        });
        add(panel,p,"RELEASE CHANNEL · "+channel.toUpperCase(java.util.Locale.ROOT),false,
             ()->{dialog.dismiss();chooseChannel();});
        add(panel,p,"DAILY CHECKS · "+(prefs.getBoolean("skillAuto",true)?"ON":"OFF"),false,()->{
            prefs.edit().putBoolean("skillAuto",!prefs.getBoolean("skillAuto",true)).apply();
            dialog.dismiss();show();
        });
        add(panel,p,"CLOSE",false,dialog::dismiss);
        dialog.show();
    }
    private void confirm(ReleasePolicy.Release release,String channel,AlertDialog original) {
        Palette p=palette();
        LinearLayout panel=panel(p);
        note(panel,p,"CONFIRM THE INSTALL",13,true,p.accent,0);
        note(panel,p,"Already replaced the Skill in Gemini?",20,true,p.ink,8);
        note(panel,p,"Only confirm after saving "+release.tag+" in Gemini. This records your word, not an automatic installation check.",
             14,false,p.ink,10);
        AlertDialog dialog=sheet(p,panel);
        add(panel,p,"YES, RECORD "+release.tag,true,()->{
            prefs.edit().putString(key("confirmed",channel),release.identity())
                .putString(key("confirmedLabel",channel),release.tag).apply();
            changed.run();
            dialog.dismiss();original.dismiss();show();
        });
        add(panel,p,"CANCEL",false,dialog::dismiss);
        dialog.show();
    }
    private void instructions(ReleasePolicy.Release release) {
        Palette p=palette();
        LinearLayout panel=panel(p);
        note(panel,p,"UPDATE "+release.tag,13,true,p.accent,0);
        note(panel,p,"Replace the Gemini Skill",22,true,p.ink,8);
        note(panel,p,"1. Review the release, then download its ZIP.\n"
            +"2. In Gemini web, open Customize → Skills → Go, Hipster, Go! → More → Replace skill.\n"
            +"3. Choose the ZIP, save it, and verify the saved Skill in Gemini.\n"
            +"4. Return to Manual and tap I INSTALLED THIS VERSION. The yellow dot clears only then.",
             15,false,p.ink,12);
        note(panel,p,"Downloading does not record an installation. The APK and GO prompt are unchanged.",
             13,false,p.ink,12);
        AlertDialog dialog=sheet(p,panel);
        add(panel,p,"DOWNLOAD SKILL ZIP",true,()->opener.open(release.download));
        add(panel,p,"OPEN GEMINI WEB",false,()->opener.open("https://gemini.google.com/app"));
        add(panel,p,"BACK",false,()->{dialog.dismiss();show();});
        dialog.show();
    }
    private void chooseChannel() {
        Palette p=palette();
        LinearLayout panel=panel(p);
        note(panel,p,"RELEASE CHANNEL",13,true,p.accent,0);
        note(panel,p,"Which updates should Lab track?",20,true,p.ink,9);
        AlertDialog dialog=sheet(p,panel);
        for(String option:new String[]{"stable","lab"}) {
            String title="stable".equals(option)?"STABLE · APPROVED RELEASES":"LAB · INCLUDES PRERELEASES";
            add(panel,p,title,option.equals(channel()),()->{
                prefs.edit().putString("skillChannel",option).apply();
                status="";dialog.dismiss();changed.run();show();
            });
        }
        add(panel,p,"CANCEL",false,dialog::dismiss);
        dialog.show();
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
