package work.samelling.hipstergo.lab;

/** Two artwork treatments. Launcher intermediate sizes retain uncropped artwork. */
final class ChaosWidgetSizes {
    private ChaosWidgetSizes() {}

    static String select(int widthDp, int heightDp) {
        if (widthDp <= 0 || heightDp <= 0) return "hero";
        // Keep the record until there is room for both cassette labels and reels.
        return widthDp >= 190 && heightDp >= 112 ? "hero" : "mini";
    }
}
