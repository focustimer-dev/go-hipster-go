package work.samelling.hipstergo.lab;

import java.util.Random;

/** Versioned transport: cosmetic hit does not override playlist constraints. */
final class SurpriseRoll {
    static int draw(Random random) { return 1 + random.nextInt(1000); }
    static String line(int value) {
        if (value < 1 || value > 1000) throw new IllegalArgumentException("Invalid roll");
        return "App surprise: v1/" + value + "/1000.";
    }
    private SurpriseRoll() { }
}
