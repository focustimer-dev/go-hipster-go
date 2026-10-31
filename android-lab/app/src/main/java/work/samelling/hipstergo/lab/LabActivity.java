package work.samelling.hipstergo.lab;

import android.app.*;
import android.content.*;
import android.graphics.Color;
import android.net.Uri;
import android.os.*;
import android.view.*;
import android.webkit.*;
import android.widget.*;
import java.io.*;
import java.util.*;

/** Separately installed sandbox with an offline interface and native release checks. Only bundled pages can call the native bridge. */
public class LabActivity extends Activity {
    private static final String HOST = "lab.hipster.invalid";
    private static final String HOME = "https://" + HOST + "/";
    private WebView web;
    private TextView title;
    private SkillUpdates updates;
    private SavedRequests shelf;
    private SharedInspiration inspiration;
    private android.content.SharedPreferences prefs;
    private String lastPrompt = "";
    private String lastAi = "chatgpt";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        prefs = getSharedPreferences("lab", MODE_PRIVATE);
        inspiration = new SharedInspiration(this,prefs,this::refreshInspiration);
        updates = new SkillUpdates(this,prefs,this::browser,this::updateBadge);
        shelf = new SavedRequests(this,prefs,this::handoff,this::copy,text->share(text,null));
        getWindow().setStatusBarColor(Color.rgb(37,35,32));
        getWindow().setNavigationBarColor(Color.rgb(37,35,32));
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setBackgroundColor(Color.rgb(37,35,32));
        layout.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        LinearLayout bar = new LinearLayout(this);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        title = new TextView(this);
        title.setText("HIPSTER GO  /  LAB");
        title.setTextColor(Color.rgb(242,229,199));
        title.setOnClickListener(v->updates.show());
        title.setTextSize(14);
        title.setGravity(Gravity.CENTER_VERTICAL);
        title.setPadding(dp(16),0,0,0);
        bar.addView(title,new LinearLayout.LayoutParams(0,dp(48),1));
        Button settings = new Button(this);
        settings.setText("LAB SETTINGS");
        settings.setTextSize(11);
        settings.setContentDescription("Android Lab settings");
        settings.setOnClickListener(v -> settings());
        bar.addView(settings,new LinearLayout.LayoutParams(dp(132),dp(48)));
        layout.addView(bar);
        web = new WebView(this);
        layout.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        setContentView(layout);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        web.addJavascriptInterface(new Bridge(),"HipsterLab");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (trusted(u)) return false;
                if (request.isForMainFrame() && request.hasGesture() && "https".equals(u.getScheme())) browser(u.toString());
                return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (!trusted(u)) return blocked();
                String path = u.getPath();
                if (path == null || path.contains("..") || path.contains("\\")) return blocked();
                if (path.endsWith("/")) path += "index.html";
                try {
                    InputStream stream = getAssets().open("site" + path);
                    Map<String,String> headers = new HashMap<>();
                    headers.put("Content-Security-Policy", "default-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'");
                    headers.put("Cache-Control","no-store");
                    headers.put("X-Content-Type-Options","nosniff");
                    return new WebResourceResponse(mime(path),"UTF-8",200,"OK",headers,stream);
                } catch (IOException e) { return blocked(); }
            }
        });
        String start = HOME;
        Uri input = getIntent().getData();
        if (input != null && "hipsterlab".equals(input.getScheme())) {
            String mood = input.getQueryParameter("mood");
            if ("funky".equals(mood) || "weird".equals(mood)) start += "?mood="+mood;
        }
        if (state == null || web.restoreState(state) == null) web.loadUrl(start);
        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, this::back);
        updates.onLaunch();
        if(state==null)receiveSharedText(getIntent());
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);setIntent(intent);
        if(Intent.ACTION_SEND.equals(intent.getAction()))receiveSharedText(intent);
        else {
            Uri u=intent.getData();
            if(u!=null&&"hipsterlab".equals(u.getScheme())) {
                String mood=u.getQueryParameter("mood");
                if("funky".equals(mood)||"weird".equals(mood))web.loadUrl(HOME+"?mood="+mood);
            }
        }
    }
    private void receiveSharedText(Intent intent) {
        if(intent==null||!Intent.ACTION_SEND.equals(intent.getAction()))return;
        if(!"text/plain".equals(intent.getType())){toast("Share a song link or plain text to Lab.");return;}
        try {
            CharSequence raw=intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
            String text=raw==null?null:raw.toString();
            if(text==null&&intent.getClipData()!=null&&intent.getClipData().getItemCount()>0) {
                ClipData.Item item=intent.getClipData().getItemAt(0);
                if(item.getText()!=null)text=item.getText().toString();
                else if(item.getUri()!=null&&("https".equals(item.getUri().getScheme())||"http".equals(item.getUri().getScheme())))text=item.getUri().toString();
            }
            String value=InspirationText.normalize(intent.getStringExtra(Intent.EXTRA_SUBJECT),text);
            if(value.isEmpty()){toast("No text found. Share a link, song title or musical idea.");return;}
            inspiration.receive(value);
        }catch(IllegalArgumentException e){toast("Share a link or text under 2,000 characters.");}
        catch(Exception e){toast("Couldn't read that share. Try sharing its link as plain text.");}
    }
    private void refreshInspiration() {
        if(web!=null)web.evaluateJavascript("window.HipsterLabRefresh&&window.HipsterLabRefresh()",null);
    }

    private boolean trusted(Uri u) { return "https".equals(u.getScheme()) && HOST.equals(u.getHost()) && u.getPort() == -1; }
    private WebResourceResponse blocked() {
        return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));
    }
    private String mime(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".webp")) return "image/webp";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".woff")) return "font/woff";
        if (path.endsWith(".json") || path.endsWith(".webmanifest")) return "application/json";
        return "application/octet-stream";
    }
    private int dp(int n) { return Math.round(n*getResources().getDisplayMetrics().density); }
    private void toast(String s) { Toast.makeText(this,s,Toast.LENGTH_LONG).show(); }
    private boolean validText(String text) { return text != null && !text.isEmpty() && text.length() <= 24000; }
    private String url(String ai) {
        switch(ai) {
            case "chatgpt": return "https://chatgpt.com/";
            case "gemini": return "https://gemini.google.com/app";
            case "claude": return "https://claude.ai/";
            default: return null;
        }
    }
    private void copy(String text) {
        ((ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("Go, Hipster, Go! prompt",text));
    }
    private void pulse() {
        if (prefs.getBoolean("haptics",true)) web.performHapticFeedback(Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.KEYBOARD_TAP);
    }
    private void browser(String url) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        Intent selector = Intent.makeMainSelectorActivity(Intent.ACTION_MAIN, Intent.CATEGORY_APP_BROWSER);
        android.content.ComponentName b = selector.resolveActivity(getPackageManager());
        if (b != null && !"android".equals(b.getPackageName())) i.setPackage(b.getPackageName());
        try { startActivity(i); }
        catch (ActivityNotFoundException e) { toast("No browser available. Your prompt is copied."); }
    }
    private void share(String text, String target) {
        Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT,text);
        if (target != null) {
            i.setPackage(target);
            try { startActivity(i); return; }
            catch (ActivityNotFoundException e) { i.setPackage(null); toast("Choose your AI from the share menu, or paste the copied prompt."); }
        }
        try { startActivity(Intent.createChooser(i,"Share your playlist request")); }
        catch (ActivityNotFoundException e) { toast("No sharing app available. Your prompt is copied."); }
    }
    private void handoff(String ai, String text) {
        String destination = url(ai);
        if (destination == null || !validText(text)) return;
        copy(text); lastPrompt=text; lastAi=ai; pulse();
        String pkg = "chatgpt".equals(ai) ? "com.openai.chatgpt" : "gemini".equals(ai) ? "com.google.android.apps.bard" : null;
        String mode = prefs.getString("mode","open");
        if ("browser".equals(mode)) { browser(destination); return; }
        if ("share".equals(mode)) { share(text,pkg); return; }
        if (pkg != null) {
            Intent launch = getPackageManager().getLaunchIntentForPackage(pkg);
            if (launch != null) {
                try { startActivity(launch); toast("Prompt copied — paste it in your AI app."); return; }
                catch (ActivityNotFoundException ignored) { }
            }
        }
        toast("AI app unavailable. Opening its website; your prompt is copied.");
        browser(destination);
    }
    private void updateBadge() {
        if(title==null)return;
        title.setText(updates.available()?"LAB · SKILL UPDATE ↗":"HIPSTER GO  /  LAB");
        title.setContentDescription(updates.available()?"Skill package available. Tap to review.":"Hipster GO Lab. Tap for skill updates.");
    }
    private void settings() {
        String[] items={"Gemini skill updates"+(updates.available()?" · available":""),
            "Save current request", "Saved requests",
            "Handoff: "+prefs.getString("mode","open"),
            "One-tap GO: "+(prefs.getBoolean("oneTap",true)?"on":"off"),
            "Haptics: "+(prefs.getBoolean("haptics",true)?"on":"off"),
            "Share last request", "Shared inspiration"+(inspiration.value().isEmpty()?"":" · active"), "About this experiment"};
        new AlertDialog.Builder(this).setTitle("Hipster GO Lab · 0.3.0")
            .setItems(items,(d,n)->{
                if(n==0)updates.show();
                else if(n==1)shelf.save(lastAi,lastPrompt);
                else if(n==2)shelf.show();
                else if(n==3) {
                    String[] modes={"open","share","browser"};
                    int current=Arrays.asList(modes).indexOf(prefs.getString("mode","open"));
                    new AlertDialog.Builder(this).setTitle("AI handoff")
                        .setSingleChoiceItems(new String[]{"Open installed app + copy", "Share prompt to AI", "Browser + copy"},current,(dialog,which)->{
                            prefs.edit().putString("mode",modes[which]).apply();dialog.dismiss();
                        }).setNegativeButton("Cancel",null).show();
                } else if(n==4 || n==5) {
                    String key=n==4?"oneTap":"haptics";
                    prefs.edit().putBoolean(key,!prefs.getBoolean(key,true)).apply();settings();
                } else if(n==6) {
                    if(validText(lastPrompt)) share(lastPrompt,null); else toast("Press GO first to prepare a prompt.");
                } else if(n==7)inspiration.review();
                else new AlertDialog.Builder(this).setTitle("A separate crate")
                    .setMessage("Bundled offline interface. Separate app and preferences. No production writes or live website updates. Native release checks read public GitHub metadata only; downloads and installation stay your choice.\n\nSaved requests stay on this device and are saved only when you choose.\n\nLong-press the launcher icon for Funky and Weird shortcuts.")
                    .setPositiveButton("Got it",null).show();
            }).setNegativeButton("Close",null).show();
    }
    public final class Bridge {
        @JavascriptInterface public String inspiration(){return inspiration.value();}
        @JavascriptInterface public void reviewInspiration(){runOnUiThread(()->inspiration.review());}
        @JavascriptInterface public void clearInspiration(){runOnUiThread(()->inspiration.clear());}
        @JavascriptInterface public boolean copy(String text) {
            if(!validText(text)) return false;
            runOnUiThread(()->LabActivity.this.copy(text));return true;
        }
        @JavascriptInterface public void go(String ai,String text) {
            if(url(ai)==null || !validText(text)) return;
            runOnUiThread(()->{lastAi=ai;lastPrompt=text;if(prefs.getBoolean("oneTap",true)) handoff(ai,text); else {copy(text);pulse();toast("Prompt copied. Tap OPEN to launch your AI.");}});
        }
        @JavascriptInterface public void open(String ai,String text) {
            if(url(ai)!=null && validText(text))runOnUiThread(()->handoff(ai,text));
        }
        @JavascriptInterface public void share(String text) {
            if(validText(text))runOnUiThread(()->{copy(text);LabActivity.this.share(text,null);});
        }
    }
    private void back() { if(web.canGoBack())web.goBack();else finish(); }
    @Override public void onBackPressed() { back(); }
    @Override public void onSaveInstanceState(Bundle state) { web.saveState(state);super.onSaveInstanceState(state); }
    @Override public void onDestroy() { updates.close();web.removeJavascriptInterface("HipsterLab");web.destroy();super.onDestroy(); }
}
