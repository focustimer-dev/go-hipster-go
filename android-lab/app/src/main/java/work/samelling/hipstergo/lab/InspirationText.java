package work.samelling.hipstergo.lab;

/** Shared text remains plain reference material. Never resolves URLs or reads file URIs. */
public final class InspirationText {
    public static final int LIMIT=2000;
    public static String normalize(String subject,String body) {
        String title=clean(subject),text=clean(body);
        String combined=text.isEmpty()?title:(!title.isEmpty()&&!text.contains(title)?title+"\n"+text:text);
        if(combined.length()>LIMIT)throw new IllegalArgumentException("Share a link or text under 2,000 characters.");
        return combined;
    }
    private static String clean(String value) {
        if(value==null)return "";
        return value.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]","").replace("\r\n","\n").replace('\r','\n').trim();
    }
    private InspirationText(){}
}
