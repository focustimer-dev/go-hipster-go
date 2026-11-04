package work.samelling.hipstergo.lab;
import org.junit.Test;
import static org.junit.Assert.*;

public class SavedRequestPolicyTest {
    @Test public void manualAIRequestsCanBeSavedWithoutLaunchDestination() {
        assertTrue(SavedRequestPolicy.canSave("other", "Exact reviewed request"));
        assertTrue(SavedRequestPolicy.isManual("other"));
        assertEquals(1, SavedRequestPolicy.action("other", 0));
        assertEquals(2, SavedRequestPolicy.action("other", 1));
        assertEquals(3, SavedRequestPolicy.action("other", 2));
    }
    @Test public void knownAIsKeepTheirLaunchAndSavedActions() {
        for (String ai : new String[]{"chatgpt", "gemini", "claude"}) {
            assertTrue(SavedRequestPolicy.canSave(ai, "Request"));
            assertFalse(SavedRequestPolicy.isManual(ai));
            for (int i=0; i<4; i++) assertEquals(i, SavedRequestPolicy.action(ai, i));
        }
    }
    @Test public void unknownAIAndInvalidRequestsAreRejected() {
        assertFalse(SavedRequestPolicy.canSave("unknown", "Request"));
        assertFalse(SavedRequestPolicy.canSave(null, "Request"));
        assertFalse(SavedRequestPolicy.canSave("other", null));
        assertFalse(SavedRequestPolicy.canSave("other", ""));
        assertTrue(SavedRequestPolicy.canSave("other", new String(new char[24000])));
        assertFalse(SavedRequestPolicy.canSave("other", new String(new char[24001])));
    }
}
