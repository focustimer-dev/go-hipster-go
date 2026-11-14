package work.samelling.hipstergo.lab;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import java.util.Arrays;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import static org.junit.Assert.*;

public class ChaosRollGeneratorTest {
    private static final String[] MOODS = {
        "happy","angry","sad","weird","criminal","funky","desire","triumphant"
    };
    private JSONObject catalog() throws Exception {
        JSONObject out = new JSONObject().put("version", 1)
            .put("moods", new JSONArray(Arrays.asList(MOODS)))
            .put("routeVersion", 1);
        JSONArray regions = new JSONArray();
        for (String s : new String[]{"US East","Caribbean","Central America","Eastern Europe","Oceania"})
            regions.put(new JSONObject().put("id",s.toLowerCase().replace(' ','-')).put("label",s));
        out.put("regions", regions);
        JSONArray routes = new JSONArray();
        for (int i=1; i<=24; i++) routes.put(String.format(java.util.Locale.ROOT,"R%02d",i));
        out.put("routes",routes);
        JSONObject tension = new JSONObject();
        for (String mood : MOODS) tension.put(mood,new JSONArray().put("a " + mood + " surprise"));
        out.put("sparks",new JSONObject().put("rhythm",new JSONArray().put("moving accents"))
            .put("texture",new JSONArray().put("soft grain")).put("tension",tension));
        return out;
    }

    @Test public void seededRollIsDeterministicAndDoesNotIncludeInspiration() throws Exception {
        JSONObject config=catalog();
        String first=ChaosRollGenerator.generate(config,new Random(17),"chatgpt","spotify",true);
        assertEquals(first, ChaosRollGenerator.generate(config,new Random(17),"chatgpt","spotify",true));
        assertTrue(first.startsWith("@go-hipster-go @Spotify go "));
        assertTrue(first.contains("Recording preference: Skip rough recordings."));
        assertFalse(first.contains("Inspiration:"));
        assertFalse(first.contains("Antarctica"));
        assertTrue(first.contains("Exactly 12 real tracks, no exceptions."));
    }

    @Test public void manyRollsProduceTwelveValidCurveSlots() throws Exception {
        JSONObject config=catalog();
        Pattern slot=Pattern.compile("-?[0-2](?:[hasdwcft]{1,2}|x)?");
        for (int seed=0;seed<100;seed++) {
            String prompt=ChaosRollGenerator.generate(config,new Random(seed),"gemini","youtube",false);
            assertTrue(prompt.startsWith("@go-hipster-go @YouTube Music go "));
            String[] lines=prompt.split("\\n");
            assertTrue(lines.length>=6);
            assertTrue(lines[1].startsWith("c1:"));
            String payload=lines[1].substring(3);
            Matcher matcher=slot.matcher(payload);
            StringBuilder reconstructed=new StringBuilder();
            int count=0;
            while(matcher.find()){reconstructed.append(matcher.group());count++;}
            assertEquals("seed "+seed,12,count);
            assertEquals("seed "+seed,payload,reconstructed.toString());
            assertTrue(prompt.contains("Discovery route: v1/R"));
            assertFalse(prompt.contains("Inspiration:"));
            assertFalse(prompt.contains("Recording preference:"));
        }
    }

    @Test public void otherAiKeepsTheBriefManualAndUsesConfiguredService() throws Exception {
        JSONObject config=catalog();
        String prompt=ChaosRollGenerator.generate(config,new Random(51),"other","apple",true);
        assertTrue(prompt.startsWith("Use Go, Hipster, Go!: go "));
        assertTrue(prompt.contains("\nService: Apple Music."));
        assertTrue(prompt.contains("Recording preference: Skip rough recordings."));
        assertFalse(prompt.contains("@go-hipster-go"));
        assertFalse(prompt.contains("Inspiration:"));
    }

    @Test public void unknownCatalogFailsClosed() {
        try {
            ChaosRollGenerator.generate(new JSONObject(),new Random(1),"chatgpt","spotify",false);
            fail("Should reject missing catalog");
        } catch(IllegalArgumentException expected) { }
    }
}
