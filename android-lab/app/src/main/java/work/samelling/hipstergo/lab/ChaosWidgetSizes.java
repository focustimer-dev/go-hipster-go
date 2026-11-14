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
            return "tall3";
        }
        if (heightDp < 112) return "wide";
        if (heightDp < 184) return "square";
        return "hero";
    }
}
