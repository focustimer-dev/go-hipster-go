package work.samelling.hipstergo.lab;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

/** Widget-tap trampoline: generate and copy before attempting a native handoff. */
public final class ChaosRollActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        SharedPreferences prefs = getSharedPreferences("lab", MODE_PRIVATE);
        String ai = prefs.getString("chaosAi", "chatgpt");
        String service = prefs.getString("chaosService", "spotify");
        boolean skipRough = prefs.getBoolean("chaosSkipRough", false);
        try {
            JSONObject config = new JSONObject(asset("chaos-roll-config.json"));
            String brief = ChaosRollGenerator.generate(config, new SecureRandom(), ai, service, skipRough);
            ((ClipboardManager) getSystemService(CLIPBOARD_SERVICE))
                .setPrimaryClip(ClipData.newPlainText("Go, Hipster, Go! Chaos Roll", brief));
            // Opening a host is not equivalent to submitting a request.
            if ("other".equals(ai)) {
                notifyUser("Chaos Roll copied. Open your AI and paste it.");
            } else {
                handoff(ai, brief, prefs.getString("mode", "open"));
            }
        } catch (Exception failure) {
            notifyUser("Chaos Roll could not copy a request. Open Hipster GO to retry.");
        } finally {
            finish();
        }
    }

    private String asset(String path) throws Exception {
        try (InputStream in = getAssets().open(path);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int count;
            while ((count = in.read(buffer)) != -1) out.write(buffer, 0, count);
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        }
    }
    private String url(String ai) {
        if ("gemini".equals(ai)) return "https://gemini.google.com/app";
        if ("claude".equals(ai)) return "https://claude.ai/";
        return "https://chatgpt.com/";
    }
    private String target(String ai) {
        if ("gemini".equals(ai)) return "com.google.android.apps.bard";
        if ("claude".equals(ai)) return "com.anthropic.claude";
        return "com.openai.chatgpt";
    }
    private void handoff(String ai, String brief, String mode) {
        String pkg = target(ai);
        if ("share".equals(mode)) {
            Intent share = new Intent(Intent.ACTION_SEND).setType("text/plain")
                .putExtra(Intent.EXTRA_TEXT, brief).setPackage(pkg);
            try {
                startActivity(share);
                notifyUser("Chaos Roll copied. Review the shared request in your AI.");
                return;
            } catch (ActivityNotFoundException | SecurityException unavailable) {
                // Fall through to an installed AI app first, then its web address.
                // Do not announce a destination until one actually opens.
            }
        }
        if (!"browser".equals(mode)) {
            Intent launch = null;
            try { launch = getPackageManager().getLaunchIntentForPackage(pkg); }
            catch (SecurityException ignored) { /* Keep the browser fallback. */ }
            if (launch != null) {
                try {
                    startActivity(launch);
                    notifyUser("Chaos Roll copied. Paste and send in your AI.");
                    return;
                } catch (ActivityNotFoundException | SecurityException ignored) { }
            }
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url(ai))));
            notifyUser("Chaos Roll copied. Paste and send in your AI.");
        } catch (ActivityNotFoundException | SecurityException unavailable) {
            notifyUser("Chaos Roll copied. No AI browser available; paste it manually.");
        }
    }
    private void notifyUser(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
}
