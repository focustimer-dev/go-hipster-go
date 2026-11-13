package work.samelling.hipstergo.lab;

import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/** Pure, deterministic under an injected Random. Never reads or writes saved Inspiration. */
final class ChaosRollGenerator {
    private ChaosRollGenerator() { }
    private static final String[] MOOD_IDS = {
        "happy", "angry", "sad", "weird", "criminal", "funky", "desire", "triumphant"
    };
    private static final char[] CODES = {'h','a','s','w','c','f','d','t'};

    static String generate(JSONObject catalog, Random random, String ai, String service,
                           boolean skipRough) {
        if (catalog == null || catalog.optInt("version") != 1)
            throw new IllegalArgumentException("Unknown Chaos Roll catalog");
        List<String> moods = readStrings(catalog.optJSONArray("moods"));
        List<String> regions = new ArrayList<>();
        JSONArray regionRows = catalog.optJSONArray("regions");
        if (regionRows != null) {
            for (int i = 0; i < regionRows.length(); i++) {
                JSONObject row = regionRows.optJSONObject(i);
                if (row != null && !"antarctica".equals(row.optString("id"))
                    && !row.optString("label").isEmpty()) regions.add(row.optString("label"));
            }
        }
        List<String> routes = readStrings(catalog.optJSONArray("routes"));
        JSONObject sparks = catalog.optJSONObject("sparks");
        if (moods.size() != 8 || regions.isEmpty() || routes.size() != 24 || sparks == null)
            throw new IllegalArgumentException("Incomplete Chaos Roll catalog");

        // Fisher-Yates with the injected random is independently testable.
        Collections.shuffle(moods, random);
        Collections.shuffle(regions, random);
        int moodCount = 1 + random.nextInt(2);
        int regionCount = 1 + random.nextInt(3);
        regionCount = Math.min(regionCount, regions.size());
        List<String> selectedMoods = moods.subList(0, moodCount);
        List<String> selectedRegions = regions.subList(0, regionCount);
        String moodLabel = join(selectedMoods, " ");
        boolean hard = random.nextBoolean();

        StringBuilder result = new StringBuilder();
        String command = "go " + moodLabel + (hard ? " hard" : "");
        if ("other".equals(ai)) result.append("Use Go, Hipster, Go!: ").append(command);
        else result.append("@go-hipster-go @").append(musicName(service, ai))
                   .append(" ").append(command);
        result.append("\n").append(curve(selectedMoods, random))
              .append("\nRegional exploration: ").append(join(selectedRegions, ", ")).append(".")
              .append("\nDiscovery route: v").append(catalog.optInt("routeVersion", 1))
              .append("/").append(routes.get(random.nextInt(routes.size()))).append(".")
              .append("\nSeed: ")
              .append(pick(readStrings(sparks.optJSONArray("rhythm")), random)).append(" / ")
              .append(pick(readStrings(sparks.optJSONArray("texture")), random)).append(" / ");
        JSONObject tensions = sparks.optJSONObject("tension");
        List<String> tension = tensions == null ? Collections.<String>emptyList()
                                              : readStrings(tensions.optJSONArray(selectedMoods.get(0)));
        result.append(pick(tension, random)).append(".");
        if (skipRough) result.append("\nRecording preference: Skip rough recordings.");
        if ("other".equals(ai)) result.append("\nService: ").append(musicName(service, ai)).append(".");
        result.append("\nExactly 12 real tracks, no exceptions.");
        return result.toString();
    }

    private static String curve(List<String> moods, Random random) {
        char first = moodCode(moods.get(0));
        char second = moods.size() == 2 ? moodCode(moods.get(1)) : first;
        int switchAt = 4 + random.nextInt(5);
        int tempo = random.nextInt(5) - 2;
        StringBuilder encoded = new StringBuilder("c1:");
        List<String> audit = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            if (i != 0) tempo = Math.max(-2, Math.min(2, tempo + random.nextInt(3) - 1));
            String token = Integer.toString(tempo);
            if (i == 0) token += first;
            else if (moods.size() == 2 && i == switchAt) token += second;
            encoded.append(token);
            audit.add(String.format(java.util.Locale.ROOT, "%02d=%s", i + 1, token));
        }
        encoded.append("\nCurve slots (12 in order; repeated numbers are separate tracks): ")
               .append(join(audit, " | "));
        return encoded.toString();
    }

    private static char moodCode(String mood) {
        for (int i = 0; i < MOOD_IDS.length; i++)
            if (MOOD_IDS[i].equals(mood)) return CODES[i];
        throw new IllegalArgumentException("Unknown mood: " + mood);
    }
    private static String musicName(String service, String ai) {
        if ("youtube".equals(service)) return "YouTube Music";
        if ("apple".equals(service)) return "Apple Music";
        if ("spotify".equals(service)) return "Spotify";
        return "gemini".equals(ai) ? "YouTube Music" : "Spotify";
    }
    private static String pick(List<String> values, Random random) {
        if (values.isEmpty()) throw new IllegalArgumentException("Empty Chaos Roll spark bank");
        return values.get(random.nextInt(values.size()));
    }
    private static List<String> readStrings(JSONArray arr) {
        List<String> out = new ArrayList<>();
        if (arr == null) return out;
        for (int i = 0; i < arr.length(); i++) {
            String value = arr.optString(i, "").trim();
            if (!value.isEmpty()) out.add(value);
        }
        return out;
    }
    private static String join(List<String> values, String separator) {
        StringBuilder out = new StringBuilder();
        for (String value : values) {
            if (out.length() > 0) out.append(separator);
            out.append(value);
        }
        return out.toString();
    }
}
