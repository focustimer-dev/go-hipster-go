package work.samelling.hipstergo.lab;

import java.math.BigInteger;
import java.net.URI;
import java.util.List;
import java.util.regex.Pattern;

/** Pure release-selection policy shared by the UI and host-side tests. */
public final class ReleasePolicy {
    public static final String REPO = "focustimer-dev/go-hipster-go";
    public static final String ASSET = "go-hipster-go-gemini-app-skill.zip";
    private static final String PREFIX = "gemini-skill-v";
    private static final Pattern TAG = Pattern.compile("gemini-skill-v[0-9]+\\.[0-9]+\\.[0-9]+(?:-[A-Za-z0-9.-]+)?(?:\\+[A-Za-z0-9.-]+)?");
    public static final class Release {
        public final String tag, notes, page, download, updated, digest;
        public final long assetId;
        public final boolean draft, prerelease;
        public Release(String tag, String notes, String page, String download, long assetId,
                       String updated, String digest, boolean draft, boolean prerelease) {
            this.tag=tag;this.notes=notes;this.page=page;this.download=download;
            this.assetId=assetId;this.updated=updated;this.digest=digest;
            this.draft=draft;this.prerelease=prerelease;
        }
        public String identity() { return tag+":"+assetId+":"+updated+":"+digest; }
        public String version() { return tag.substring(PREFIX.length()); }
    }
    public static boolean allowed(Release r, String channel) {
        if(r==null || !TAG.matcher(r.tag).matches() || r.draft || r.assetId<=0 || r.updated.isEmpty()) return false;
        if(!"stable".equals(channel) && !"lab".equals(channel)) return false;
        if("stable".equals(channel) && (r.prerelease || r.version().split("\\+",2)[0].contains("-"))) return false;
        return trustedUrl(r.page,"/"+REPO+"/releases/tag/"+r.tag)
            && trustedUrl(r.download,"/"+REPO+"/releases/download/"+r.tag+"/"+ASSET);
    }
    private static boolean trustedUrl(String value,String expected) {
        try {
            URI u=new URI(value);
            return "https".equals(u.getScheme()) && "github.com".equals(u.getHost())
                && u.getPort()==-1 && u.getUserInfo()==null && expected.equals(u.getPath())
                && u.getQuery()==null && u.getFragment()==null;
        }catch(Exception e){return false;}
    }
    public static Release select(List<Release> releases,String channel) {
        Release best=null;
        for(Release r:releases) {
            if(!allowed(r,channel))continue;
            int cmp=best==null?1:compareVersions(r.version(),best.version());
            if(cmp>0 || (cmp==0 && r.updated.compareTo(best.updated)>0))best=r;
        }
        return best;
    }
    public static int compareVersions(String a,String b) {
        String[] av=a.split("\\+",2)[0].split("-",2), bv=b.split("\\+",2)[0].split("-",2);
        String[] an=av[0].split("\\."),bn=bv[0].split("\\.");
        for(int i=0;i<3;i++) {
            int n=new BigInteger(an[i]).compareTo(new BigInteger(bn[i]));if(n!=0)return n;
        }
        if(av.length==1 || bv.length==1)return Integer.compare(bv.length,av.length);
        String[] ap=av[1].split("\\."),bp=bv[1].split("\\.");
        for(int i=0;i<Math.min(ap.length,bp.length);i++) {
            boolean na=ap[i].matches("[0-9]+"),nb=bp[i].matches("[0-9]+");
            int n=na&&nb?new BigInteger(ap[i]).compareTo(new BigInteger(bp[i])):
                na!=nb?(na?-1:1):ap[i].compareTo(bp[i]);
            if(n!=0)return n;
        }
        return Integer.compare(ap.length,bp.length);
    }
    private ReleasePolicy(){}
}
