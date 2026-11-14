package work.samelling.hipstergo.lab;

/** Device-independent grid breakpoints; never stretch the cassette between sizes. */
final class ChaosWidgetSizes {
    private ChaosWidgetSizes() {}

    /** Approximate effective dp supplied by the launcher in AppWidgetOptions. */
    static String select(int widthDp, int heightDp) {
        if (widthDp <= 0 || heightDp <= 0) return "square";
        boolean singleColumn = widthDp < 122;
        if (singleColumn) {
            if (heightDp < 120) return "mini";
            if (heightDp < 225) return "tall2";
            return "tall3";
        }
        if (heightDp < 120) return "wide";
        if (heightDp < 225) return "square";
        return "hero";
    }
}
