package work.samelling.hipstergo.lab;

import org.junit.Test;
import static org.junit.Assert.*;

public class SystemBarThemeTest {
    @Test public void independentIconContrastsCanDiffer() {
        assertFalse(SystemBarTheme.darkIcons("#103135"));
        assertTrue(SystemBarTheme.darkIcons("#f6f2e6"));
        assertFalse(SystemBarTheme.darkIcons("#111111"));
        assertTrue(SystemBarTheme.darkIcons("#ffffff"));
    }

    @Test public void acceptsOnlyKnownOpaqueThemeColors() {
        for (String theme : new String[]{"liberi","bosque","usiku","kingston",
                "detroit","addis","polish","beirut","michoacan"})
            assertTrue("Theme missing: " + theme, SystemBarTheme.knownTheme(theme));
        for (String theme : new String[]{"", "future-theme", null})
            assertFalse(SystemBarTheme.knownTheme(theme));
        for (String bad : new String[]{"", "red", "#123", "#12345678", "var(--ink)", null})
            assertFalse(SystemBarTheme.validColor(bad));
        assertTrue(SystemBarTheme.validColor("#123aBc"));
    }

    @Test public void treatsStatusAndNavigationColorsSeparately() {
        String lightRail="#f5f0e6";
        String darkRail="#003018";
        assertNotEquals(SystemBarTheme.darkIcons(lightRail), SystemBarTheme.darkIcons(darkRail));
    }
}
