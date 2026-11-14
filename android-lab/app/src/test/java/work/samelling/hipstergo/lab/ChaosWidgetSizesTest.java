package work.samelling.hipstergo.lab;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class ChaosWidgetSizesTest {
    @Test public void supportsEveryGridSpanFromOneByOneThroughTwoByThree() {
        assertEquals("mini",ChaosWidgetSizes.select(74,79));
        assertEquals("tall2",ChaosWidgetSizes.select(80,135));
        assertEquals("tall3",ChaosWidgetSizes.select(80,197));
        assertEquals("wide",ChaosWidgetSizes.select(138,82));
        assertEquals("square",ChaosWidgetSizes.select(138,135));
        assertEquals("hero",ChaosWidgetSizes.select(138,197));
    }
    @Test public void borderChangesArePredictableAndInvalidOptionsAreSafe() {
        assertEquals("square",ChaosWidgetSizes.select(0,0));
        assertEquals("mini",ChaosWidgetSizes.select(107,111));
        assertEquals("wide",ChaosWidgetSizes.select(108,111));
        assertEquals("tall2",ChaosWidgetSizes.select(107,112));
        assertEquals("tall3",ChaosWidgetSizes.select(107,184));
        assertEquals("hero",ChaosWidgetSizes.select(108,184));
    }
}
