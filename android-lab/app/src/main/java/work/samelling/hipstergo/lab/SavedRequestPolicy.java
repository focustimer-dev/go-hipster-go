package work.samelling.hipstergo.lab;

/** Local saving does not require an AI launch destination. */
final class SavedRequestPolicy {
    static boolean canSave(String ai, String prompt) {
        return ("other".equals(ai) || "chatgpt".equals(ai) || "gemini".equals(ai) || "claude".equals(ai))
            && prompt != null && !prompt.isEmpty() && prompt.length() <= 24000;
    }
    static boolean isManual(String ai) { return "other".equals(ai); }
    // Existing actions: 0=launch, 1=copy, 2=share, 3=delete.
    static int action(String ai, int selected) { return isManual(ai) ? selected + 1 : selected; }
}
