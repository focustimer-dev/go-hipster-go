package work.samelling.hipstergo.lab;

import android.app.*;
import android.content.*;
import android.graphics.Color;
import android.graphics.Canvas;
import android.graphics.Paint;
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
    // Source classes stay in the shared namespace; installed variants own their shortcut URI.
    private boolean isOwnShortcut(Uri value) {
        String scheme = getPackageName().endsWith(".lab") ? "hipsterlab" : "hipstergo";
        return value != null && scheme.equals(value.getScheme());
    }
    private static final String HOME = "https://" + HOST + "/";
    private WebView web;
    private PaletteInsetLayout layout;
    private static final String STATUS_PREF = "systemStatusColor";
    private static final String NAV_PREF = "systemNavigationColor";
    private static final String THEME_PREF = "systemTheme";

    /** Draw one native-owned protective surface in each system inset. */
    private static final class PaletteInsetLayout extends LinearLayout {
        private final Paint paint = new Paint();
        private int status = Color.rgb(16,49,53);
        private int navigation = Color.rgb(16,49,53);

        PaletteInsetLayout(android.content.Context context) {
            super(context);
            setWillNotDraw(false);
        }
        void setSurfaceColors(int top, int bottom) {
            status = top;
            navigation = bottom;
            setBackgroundColor(bottom);
            invalidate();
        }
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            paint.setColor(status);
            canvas.drawRect(0, 0, getWidth(), getPaddingTop(), paint);
            paint.setColor(navigation);
            canvas.drawRect(0, getHeight()-getPaddingBottom(), getWidth(), getHeight(), paint);
        }
    }
    private SkillUpdates updates;
    private SavedRequests shelf;
    private SharedInspiration inspiration;
    private NativeDialogPalette dialogs;
    private android.content.SharedPreferences prefs;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        prefs = getSharedPreferences("lab", MODE_PRIVATE);
        dialogs = new NativeDialogPalette(this);
        inspiration = new SharedInspiration(this,prefs,this::refreshInspiration,dialogs);
        updates = new SkillUpdates(this,prefs,this::browser,this::updateBadge,dialogs);
        shelf = new SavedRequests(this,prefs,this::handoff,this::copy,text->share(text,null),this::refreshWorkspace,dialogs);
        layout = new PaletteInsetLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setOnApplyWindowInsetsListener((v, insets) -> {
            // One native insets owner. Keep the WebView clear of bars and display cutouts.
            int left = insets.getSystemWindowInsetLeft();
            int top = insets.getSystemWindowInsetTop();
            int right = insets.getSystemWindowInsetRight();
            int bottom = insets.getSystemWindowInsetBottom();
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                left = Math.max(left, safe.left);
                top = Math.max(top, safe.top);
                right = Math.max(right, safe.right);
                bottom = Math.max(bottom, safe.bottom);
            } else if (Build.VERSION.SDK_INT >= 28 && insets.getDisplayCutout() != null) {
                DisplayCutout cutout = insets.getDisplayCutout();
                left = Math.max(left, cutout.getSafeInsetLeft());
                top = Math.max(top, cutout.getSafeInsetTop());
                right = Math.max(right, cutout.getSafeInsetRight());
                bottom = Math.max(bottom, cutout.getSafeInsetBottom());
            }
            v.setPadding(left, top, right, bottom);
            return insets.consumeSystemWindowInsets();
        });
        web = new WebView(this);
        layout.addView(web,new LinearLayout.LayoutParams(-1,0,1));
        setContentView(layout);
        applySystemPalette(prefs.getString(STATUS_PREF, SystemBarTheme.DEFAULT_COLOR),
            prefs.getString(NAV_PREF, SystemBarTheme.DEFAULT_COLOR));
        // Controller attachment can follow onCreate. Restore icon appearance once attached.
        layout.post(() -> applySystemPalette(prefs.getString(STATUS_PREF, SystemBarTheme.DEFAULT_COLOR),
            prefs.getString(NAV_PREF, SystemBarTheme.DEFAULT_COLOR)));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        // The native shell stays at page scale 1; the atlas handles its own camera gestures.
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        web.addJavascriptInterface(new Bridge(),"HipsterLab");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) { refreshWorkspace(); }
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
                    if ("/atlas-lab.html".equals(path) || "/index.html".equals(path)) headers.put("Content-Security-Policy", "default-src 'self' data:; script-src 'self' 'unsafe-inline'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'");
                    return new WebResourceResponse(mime(path),"UTF-8",200,"OK",headers,stream);
                } catch (IOException e) { return blocked(); }
            }
        });
        String start = HOME;
        Uri input = getIntent().getData();
        if (isOwnShortcut(input)) {
            String mood = input.getQueryParameter("mood");
            if ("funky".equals(mood) || "weird".equals(mood)) start += "?mood="+mood;
        }
        if (state == null || web.restoreState(state) == null) web.loadUrl(start);
        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, this::back);
        updates.onLaunch();
        if(state==null)receiveSharedText(getIntent());
    }

    @Override protected void onResume() {
        super.onResume();
        if (layout != null) layout.post(() -> applySystemPalette(
            prefs.getString(STATUS_PREF, SystemBarTheme.DEFAULT_COLOR),
            prefs.getString(NAV_PREF, SystemBarTheme.DEFAULT_COLOR)));
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);setIntent(intent);
        if(Intent.ACTION_SEND.equals(intent.getAction()))receiveSharedText(intent);
        else {
            Uri u=intent.getData();
            if(isOwnShortcut(u)) {
                String mood=u.getQueryParameter("mood");
                if("funky".equals(mood)||"weird".equals(mood))web.loadUrl(HOME+"?mood="+mood);
            }
        }
    }
    private void receiveSharedText(Intent intent) {
        if(intent==null||!Intent.ACTION_SEND.equals(intent.getAction()))return;
        if(!"text/plain".equals(intent.getType())){toast("Share a song link or plain text to Go, Hipster, Go!.");return;}
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
    // Only explicit secure public links may leave the offline Manual.
    // Never allow a page to invoke arbitrary schemes or internal Lab URLs.
    private boolean externalHttps(String raw) {
        if(raw==null || raw.length()>2048) return false;
        try {
            Uri u=Uri.parse(raw);
            return "https".equals(u.getScheme()) && u.getHost()!=null &&
                !u.getHost().isEmpty() && !HOST.equals(u.getHost()) &&
                u.getUserInfo()==null && u.getPort()==-1;
        }catch(Exception ignored){ return false; }
    }
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
        if(ai==null)return null;
        switch(ai) {
            case "chatgpt": return "https://chatgpt.com/";
            case "gemini": return "https://gemini.google.com/app";
            case "claude": return "https://claude.ai/";
            default: return null;
        }
    }
    private boolean copy(String text) {
        try {
            ((ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("Go, Hipster, Go! prompt",text));
            return true;
        } catch (RuntimeException failure) { return false; }
    }
    private void applySystemPalette(String statusHex, String navigationHex) {
        if (!SystemBarTheme.validColor(statusHex) || !SystemBarTheme.validColor(navigationHex)) {
            statusHex = SystemBarTheme.DEFAULT_COLOR;
            navigationHex = SystemBarTheme.DEFAULT_COLOR;
        }
        int statusColor = Color.parseColor(statusHex);
        int navigationColor = Color.parseColor(navigationHex);
        layout.setSurfaceColors(statusColor, navigationColor);
        // The native inset surface supplies a precise theme color, so no OS scrim is needed.
        // This also covers Android 15+ where the three-button bar is translucent by default.
        if (Build.VERSION.SDK_INT >= 29) getWindow().setNavigationBarContrastEnforced(false);
        if (Build.VERSION.SDK_INT < 35) {
            getWindow().setStatusBarColor(statusColor);
            getWindow().setNavigationBarColor(navigationColor);
        }
        int statusFlags = SystemBarTheme.darkIcons(statusHex)
            ? View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR : 0;
        int navigationFlags = Build.VERSION.SDK_INT >= 26 && SystemBarTheme.darkIcons(navigationHex)
            ? View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR : 0;
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getDecorView().getWindowInsetsController();
            if (controller != null) {
                int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                    | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                int appearance = (SystemBarTheme.darkIcons(statusHex)
                    ? WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS : 0)
                    | (SystemBarTheme.darkIcons(navigationHex)
                    ? WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS : 0);
                controller.setSystemBarsAppearance(appearance, mask);
            }
        } else {
            View decor = getWindow().getDecorView();
            int mask = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= 26) mask |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            decor.setSystemUiVisibility((decor.getSystemUiVisibility() & ~mask) | statusFlags | navigationFlags);
        }
    }

    private void pulse() {
        if (prefs.getBoolean("haptics",true)) web.performHapticFeedback(Build.VERSION.SDK_INT >= 30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.KEYBOARD_TAP);
    }
    private void browser(String url) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        // Prefer a real browser, not an installed AI app's URL interception.
        // Some managed devices restrict package visibility or individual launches.
        // Retry the ordinary HTTPS VIEW route before telling the user to paste.
        try {
            Intent selector = Intent.makeMainSelectorActivity(Intent.ACTION_MAIN, Intent.CATEGORY_APP_BROWSER);
            android.content.ComponentName b = selector.resolveActivity(getPackageManager());
            if (b != null && !"android".equals(b.getPackageName())) i.setPackage(b.getPackageName());
        } catch (SecurityException ignored) {
            // A normal ACTION_VIEW can still succeed with a different browser.
        }
        try { startActivity(i); return; }
        catch (ActivityNotFoundException | SecurityException unavailable) {
            if (i.getPackage() != null) {
                i.setPackage(null);
                try { startActivity(i); return; }
                catch (ActivityNotFoundException | SecurityException ignored) { }
            }
            toast("No browser available to open this link. Your request remains copied.");
        }
    }
    private void share(String text, String target) {
        Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT,text);
        if (target != null) {
            i.setPackage(target);
            try { startActivity(i); return; }
            catch (ActivityNotFoundException | SecurityException e) { i.setPackage(null); toast("Choose your AI from the share menu, or paste the copied prompt."); }
        }
        try { startActivity(Intent.createChooser(i,"Share your playlist request")); }
        catch (ActivityNotFoundException | SecurityException e) { toast("No sharing app available. Your request remains copied; paste it manually."); }
    }
    private String aiPackage(String ai) {
        return "chatgpt".equals(ai)?"com.openai.chatgpt":"gemini".equals(ai)?"com.google.android.apps.bard":"claude".equals(ai)?"com.anthropic.claude":null;
    }
    private void offerSetupShare(String ai, String text) {
        if(url(ai)==null || !validText(text))return;
        String label="chatgpt".equals(ai)?"ChatGPT":"gemini".equals(ai)?"Gemini":"Claude";
        dialogs.show(new AlertDialog.Builder(this).setTitle("Share to "+label+"?")
            .setMessage("Your setup request is copied. Share it to "+label+" to review and send. If it cannot accept the share, paste the copied request.")
            .setPositiveButton("Yes, share",(d,n)->{copy(text);share(text,aiPackage(ai));})
            .setNegativeButton("No, keep copied",null));
    }
    private void handoff(String ai, String text) { handoff(ai,text,false); }
    private void handoff(String ai, String text, boolean alreadyCopied) {
        String destination = url(ai);
        if (destination == null || !validText(text)) return;
        if(!alreadyCopied&&!copy(text)){toast("Clipboard unavailable. Copy the request manually before opening your AI.");return;} pulse();
        String pkg = aiPackage(ai);
        String mode = prefs.getString("mode","open");
        if ("browser".equals(mode)) { browser(destination); return; }
        if ("share".equals(mode)) { share(text,pkg); return; }
        if (pkg != null) {
            Intent launch = null;
            try { launch = getPackageManager().getLaunchIntentForPackage(pkg); }
            catch (SecurityException ignored) { /* Browser fallback remains available. */ }
            if (launch != null) {
                try { startActivity(launch); toast("Prompt copied — paste it in your AI app."); return; }
                catch (ActivityNotFoundException | SecurityException ignored) { }
            }
        }
        toast("AI app unavailable. Opening its website; your prompt is copied.");
        browser(destination);
    }
    private void refreshWorkspace() {
        if(web!=null)web.evaluateJavascript("window.HipsterLabStateChanged&&window.HipsterLabStateChanged()",null);
    }
    private void updateBadge() { refreshWorkspace(); }
    private String workspaceState() {
        try {
            return new org.json.JSONObject().put("saved",shelf.entries())
                .put("activeInspiration",inspiration.value()).put("recentInspirations",inspiration.recent()).put("inspirationPreview",inspiration.preview())
                .put("mode",prefs.getString("mode","open")).put("oneTap",prefs.getBoolean("oneTap",true))
                .put("haptics",prefs.getBoolean("haptics",true)).put("updateAvailable",updates.available())
                .put("updateSummary",updates.summary()).put("updateDetail",updates.detail())
                .put("updateLatest",updates.latestVersion()).put("updateConfirmed",updates.recordedVersion()).toString();
        }catch(org.json.JSONException e){return "{}";}
    }
    public final class Bridge {
        @JavascriptInterface public String state(){return workspaceState();}
        /** Semantic palette values are validated again on the Android UI thread. */
        @JavascriptInterface public void setDialogPalette(String theme,String surface,String ink,
            String accent,String field,String fieldInk,String rule){
            runOnUiThread(()->dialogs.update(theme,surface,ink,accent,field,fieldInk,rule));
        }
        @JavascriptInterface public void syncSystemPalette(String theme, String status, String navigation) {
            if (!SystemBarTheme.knownTheme(theme)
                || !SystemBarTheme.validColor(status) || !SystemBarTheme.validColor(navigation)) return;
            runOnUiThread(() -> {
                prefs.edit().putString(THEME_PREF, theme)
                    .putString(STATUS_PREF, status).putString(NAV_PREF, navigation).apply();
                applySystemPalette(status, navigation);
            });
        }
        @JavascriptInterface public void haptic(String kind) {
            if (!"tick".equals(kind) && !"click".equals(kind)) return;
            runOnUiThread(() -> {
                if (!prefs.getBoolean("haptics", true)) return;
                web.performHapticFeedback("tick".equals(kind)
                    ? HapticFeedbackConstants.CLOCK_TICK : HapticFeedbackConstants.CONTEXT_CLICK);
            });
        }
        /** Mirror only supported widget inputs; the WebView remains the settings owner. */
        @JavascriptInterface public void setChaosPrefs(String ai, String service, boolean skipRough) {
            if (!Arrays.asList("chatgpt", "gemini", "claude", "other").contains(ai)) return;
            if (!Arrays.asList("spotify", "youtube", "apple").contains(service)) return;
            runOnUiThread(() -> {
                if (ai.equals(prefs.getString("chaosAi", ""))
                    && service.equals(prefs.getString("chaosService", ""))
                    && skipRough == prefs.getBoolean("chaosSkipRough", false)) return;
                prefs.edit().putString("chaosAi", ai)
                    .putString("chaosService", service)
                    .putBoolean("chaosSkipRough", skipRough).apply();
            });
        }
        @JavascriptInterface public void offerSetupShare(String ai,String text){if(url(ai)!=null&&validText(text))runOnUiThread(()->LabActivity.this.offerSetupShare(ai,text));}
        @JavascriptInterface public void showUpdates(){runOnUiThread(()->updates.show());}
        @JavascriptInterface public void saveRequest(String ai,String text){if(SavedRequestPolicy.canSave(ai,text))runOnUiThread(()->shelf.save(ai,text));}
        @JavascriptInterface public void savedRequest(String id){if(id!=null&&id.length()<=64)runOnUiThread(()->shelf.showEntry(id));}
        @JavascriptInterface public void setPreference(String key,String value){
            runOnUiThread(()->{
                if("mode".equals(key)&&Arrays.asList("open","share","browser").contains(value))prefs.edit().putString(key,value).apply();
                else if(("oneTap".equals(key)||"haptics".equals(key))&&Arrays.asList("true","false").contains(value))prefs.edit().putBoolean(key,Boolean.parseBoolean(value)).apply();
                else return;
                refreshWorkspace();
            });
        }
        @JavascriptInterface public String inspiration(){return inspiration.value();}
        @JavascriptInterface public void applyInspiration(String text){if(text!=null&&text.length()<=InspirationText.LIMIT)runOnUiThread(()->inspiration.apply(text));}
        @JavascriptInterface public void reviewInspiration(){runOnUiThread(()->inspiration.review());}
        @JavascriptInterface public void useRecentInspiration(String id){if(id!=null&&id.length()<=64)runOnUiThread(()->inspiration.reuse(id));}
        @JavascriptInterface public void clearInspiration(){runOnUiThread(()->inspiration.clear());}
        @JavascriptInterface public boolean copy(String text) {
            if(!validText(text)) return false;
            // ClipboardManager is a synchronous binder API; no UI-thread post or optimistic acknowledgement.
            return LabActivity.this.copy(text);
        }
        @JavascriptInterface public void go(String ai,String text) {
            if(!validText(text)) return;
            if("other".equals(ai)){runOnUiThread(()->toast("Request copied. Open your AI manually, paste and send."));return;}
            if(url(ai)==null) return;
            runOnUiThread(()->{if(prefs.getBoolean("oneTap",true)) handoff(ai,text,true); else {pulse();toast("Prompt copied. Tap OPEN to launch your AI.");}});
        }
        @JavascriptInterface public void openExternal(String destination) {
            if(externalHttps(destination))runOnUiThread(()->browser(destination));
        }
        @JavascriptInterface public void open(String ai,String text) {
            if(url(ai)!=null && validText(text))runOnUiThread(()->handoff(ai,text));
        }
        @JavascriptInterface public void share(String text) {
            if(validText(text))runOnUiThread(()->{copy(text);LabActivity.this.share(text,null);});
        }
    }
    private void back() {
        web.evaluateJavascript("Boolean(window.HipsterLabBack&&window.HipsterLabBack())",handled->{
            if(!"true".equals(handled)){if(web.canGoBack())web.goBack();else finish();}
        });
    }
    @Override public void onBackPressed() { back(); }
    @Override public void onSaveInstanceState(Bundle state) { web.saveState(state);super.onSaveInstanceState(state); }
    @Override public void onDestroy() { updates.close();inspiration.close();web.removeJavascriptInterface("HipsterLab");web.destroy();super.onDestroy(); }
}
