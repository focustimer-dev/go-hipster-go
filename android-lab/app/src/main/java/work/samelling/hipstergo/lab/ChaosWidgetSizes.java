package work.samelling.hipstergo.lab;

/** Device-independent grid breakpoints; never stretch the cassette between sizes. */
final class ChaosWidgetSizes {
    private ChaosWidgetSizes() {}

    /** Approximate effective dp supplied by the launcher in AppWidgetOptions. */
    static String select(int widthDp, int heightDp) {
        if (widthDp <= 0 || heightDp <= 0) return "square";
        boolean singleColumn = widthDp < 108;
        if (singleColumn) {
            if (heightDp < 112) return "mini";
            if (heightDp < 184) return "tall2";
            return "tall2";
        }
        boolean threeColumns = widthDp >= 190;
        if (heightDp < 112) return threeColumns ? "wide3" : "wide";
        // Two rows is our maximum presentation height. Oversized hosts keep
        // the full-width cassette instead of inventing a vertical third row.
        return threeColumns ? "hero" : "square";
    }
}
