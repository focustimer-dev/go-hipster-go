package work.samelling.hipstergo.lab;
import org.junit.Test;
import java.util.Random;
import static org.junit.Assert.*;
public class SurpriseRollTest {
    @Test public void endpointsAndSingleDraw() {
        for (int value : new int[]{0,999}) {
            final int fixed=value;
            int[] calls={0};
            int result=SurpriseRoll.draw(new Random(){
                @Override public int nextInt(int bound){assertEquals(1000,bound);calls[0]++;return fixed;}
            });
            assertEquals(value+1,result);assertEquals(1,calls[0]);
            assertEquals("Protocol: "+result,SurpriseRoll.line(result));
        }
    }
    @Test(expected=IllegalArgumentException.class) public void rejectsInvalidRoll(){SurpriseRoll.line(0);}
}
