package work.samelling.hipstergo.lab;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** Pure validation and contrast logic; no Android dependencies or theme pigments. */
final class SystemBarTheme {
    static final String DEFAULT_COLOR = "#103135";
    private static final Set<String> THEMES = new HashSet<>(Arrays.asList(
        "liberi", "bosque", "usiku", "kingston", "detroit",
        "addis", "polish", "beirut", "michoacan"));

    private SystemBarTheme() { }

    static boolean knownTheme(String theme) {
        return theme != null && THEMES.contains(theme);
    }

    static boolean validColor(String color) {
        return color != null && color.matches("#[0-9a-fA-F]{6}");
    }

    /** WCAG linear RGB luminance; 0.179 is the black/white 4.5:1 crossover. */
    static boolean darkIcons(String background) {
        if (!validColor(background)) throw new IllegalArgumentException("Bad system bar color");
        double luminance = 0.2126 * channel(background.substring(1, 3))
                         + 0.7152 * channel(background.substring(3, 5))
                         + 0.0722 * channel(background.substring(5, 7));
        return luminance > 0.179;
    }

    private static double channel(String hex) {
        double srgb = Integer.parseInt(hex, 16) / 255.0;
        return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    }
}
