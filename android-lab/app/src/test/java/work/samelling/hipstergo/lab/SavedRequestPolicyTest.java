package work.samelling.hipstergo.lab;
import org.junit.Test;
import static org.junit.Assert.*;

public class SavedRequestPolicyTest {
    @Test public void manualAIRequestsCanBeSavedWithoutLaunchDestination() {
        assertTrue(SavedRequestPolicy.canSave("other", "Exact reviewed request"));
        assertTrue(SavedRequestPolicy.isManual("other"));
    }
    @Test public void knownAIsCanSaveWithALaunchDestination() {
        for (String ai : new String[]{"chatgpt", "gemini", "claude"}) {
            assertTrue(SavedRequestPolicy.canSave(ai, "Request"));
            assertFalse(SavedRequestPolicy.isManual(ai));
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
