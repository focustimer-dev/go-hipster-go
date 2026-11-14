package work.samelling.hipstergo.lab;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class ChaosWidgetSizesTest {
    @Test public void supportsEveryGridSpanFromOneByOneThroughTwoByThree() {
        assertEquals("mini",ChaosWidgetSizes.select(74,79));
        assertEquals("tall2",ChaosWidgetSizes.select(80,161));
        assertEquals("tall3",ChaosWidgetSizes.select(80,258));
        assertEquals("wide",ChaosWidgetSizes.select(179,82));
        assertEquals("square",ChaosWidgetSizes.select(179,161));
        assertEquals("hero",ChaosWidgetSizes.select(179,258));
    }
    @Test public void borderChangesArePredictableAndInvalidOptionsAreSafe() {
        assertEquals("square",ChaosWidgetSizes.select(0,0));
        assertEquals("mini",ChaosWidgetSizes.select(121,119));
        assertEquals("wide",ChaosWidgetSizes.select(122,119));
        assertEquals("tall2",ChaosWidgetSizes.select(121,120));
        assertEquals("tall3",ChaosWidgetSizes.select(121,225));
        assertEquals("hero",ChaosWidgetSizes.select(122,225));
    }
}
