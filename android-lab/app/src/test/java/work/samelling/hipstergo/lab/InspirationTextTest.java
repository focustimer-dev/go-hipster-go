package work.samelling.hipstergo.lab;
import org.junit.Test;
import static org.junit.Assert.*;
public class InspirationTextTest {
    @Test public void combinesSubjectAndLink(){assertEquals("Song title\nhttps://open.spotify.com/track/example",InspirationText.normalize("Song title","https://open.spotify.com/track/example"));}
    @Test public void avoidsDuplicateSubject(){assertEquals("Song title\nhttps://example.com",InspirationText.normalize("Song title","Song title\nhttps://example.com"));}
    @Test public void preservesQuotedReferenceAsData(){String value="\"Title\" </script> & weird accents";assertEquals(value,InspirationText.normalize(null,value));}
    @Test public void normalizesWhitespaceAndControls(){assertEquals("A\nB",InspirationText.normalize(null,"  A\r\nB\u0000  "));}
    @Test public void acceptsEmptyInput(){assertEquals("",InspirationText.normalize(null,null));}
    @Test(expected=IllegalArgumentException.class) public void rejectsLongShares(){InspirationText.normalize(null,new String(new char[2001]).replace('\0','x'));}
}
