package work.samelling.hipstergo.lab;

/** Local saving does not require an AI launch destination. */
final class SavedRequestPolicy {
    static boolean canSave(String ai, String prompt) {
        return ("other".equals(ai) || "chatgpt".equals(ai) || "gemini".equals(ai) || "claude".equals(ai))
            && prompt != null && !prompt.isEmpty() && prompt.length() <= 24000;
    }
    static boolean isManual(String ai) { return "other".equals(ai); }
}
