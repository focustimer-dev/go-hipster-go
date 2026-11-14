package work.samelling.hipstergo.lab;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class ChaosWidgetSizesTest {
    @Test public void supportsEveryGridSpanFromOneByOneThroughThreeByTwo() {
        assertEquals("mini", ChaosWidgetSizes.select(74, 79));     // 1×1
        assertEquals("tall2", ChaosWidgetSizes.select(80, 135));  // 1×2
        assertEquals("wide", ChaosWidgetSizes.select(138, 82));   // 2×1
        assertEquals("square", ChaosWidgetSizes.select(138, 135));// 2×2
        assertEquals("wide3", ChaosWidgetSizes.select(210, 82));  // 3×1
        assertEquals("hero", ChaosWidgetSizes.select(210, 135));  // 3×2
    }

    @Test public void borderChangesArePredictableAndOversizeHostsClampToTwoRows() {
        assertEquals("square", ChaosWidgetSizes.select(0, 0));
        assertEquals("mini", ChaosWidgetSizes.select(107, 111));
        assertEquals("wide", ChaosWidgetSizes.select(108, 111));
        assertEquals("wide3", ChaosWidgetSizes.select(190, 111));
        assertEquals("tall2", ChaosWidgetSizes.select(107, 112));
        assertEquals("square", ChaosWidgetSizes.select(108, 112));
        assertEquals("hero", ChaosWidgetSizes.select(190, 112));
        assertEquals("tall2", ChaosWidgetSizes.select(80, 197)); // no 1×3
        assertEquals("square", ChaosWidgetSizes.select(138, 197)); // no 2×3
        assertEquals("hero", ChaosWidgetSizes.select(210, 197));
    }
}
