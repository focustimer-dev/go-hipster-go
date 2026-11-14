package work.samelling.hipstergo.lab;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class ChaosWidgetSizesTest {
    @Test public void smallAndIntermediateHostsUseTheRecord() {
        for (int[] size : new int[][] {{74,79},{80,135},{138,82},{138,135},{210,82}}) {
            assertEquals("mini", ChaosWidgetSizes.select(size[0],size[1]));
        }
    }
    @Test public void cassetteNeedsRoomInBothDimensions() {
        assertEquals("mini", ChaosWidgetSizes.select(189,135));
        assertEquals("mini", ChaosWidgetSizes.select(210,111));
        assertEquals("hero", ChaosWidgetSizes.select(190,112));
        assertEquals("hero", ChaosWidgetSizes.select(210,135));
        assertEquals("hero", ChaosWidgetSizes.select(300,220));
        assertEquals("hero", ChaosWidgetSizes.select(0,0));
    }
}
