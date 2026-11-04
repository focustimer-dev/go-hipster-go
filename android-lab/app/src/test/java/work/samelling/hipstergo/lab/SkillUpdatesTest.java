package work.samelling.hipstergo.lab;

import org.junit.Test;
import org.json.*;
import static org.junit.Assert.*;

public class SkillUpdatesTest {
    private JSONObject release(String version,long id,boolean draft,boolean pre)throws Exception {
        String tag="gemini-skill-v"+version;
        JSONObject asset=new JSONObject().put("name",ReleasePolicy.ASSET).put("state","uploaded").put("size",170000)
            .put("id",id).put("updated_at","2026-10-31T05:20:28Z").put("digest","sha256:fixture"+id)
            .put("browser_download_url","https://github.com/"+ReleasePolicy.REPO+"/releases/download/"+tag+"/"+ReleasePolicy.ASSET);
        return new JSONObject().put("tag_name",tag).put("draft",draft).put("prerelease",pre)
            .put("html_url","https://github.com/"+ReleasePolicy.REPO+"/releases/tag/"+tag)
            .put("body","Release notes").put("assets",new JSONArray().put(asset));
    }
    @Test public void parsesPublishedReleaseFixture()throws Exception {
        try(java.io.InputStream in=getClass().getResourceAsStream("/published-releases.json")) {
            assertNotNull(in);
            String json=new String(in.readAllBytes(),java.nio.charset.StandardCharsets.UTF_8);
            ReleasePolicy.Release found=SkillUpdates.selectJson(json,"stable");
            assertEquals("3.8.1",found.version());
            assertEquals(694452011L,found.assetId);
            assertTrue(found.download.endsWith("/"+ReleasePolicy.ASSET));
        }
    }
    @Test public void picksHighestVersionNotApiOrdering()throws Exception {
        JSONArray all=new JSONArray().put(release("3.9.0",1,false,false)).put(release("3.10.0",2,false,false)).put(release("3.8.1",3,false,false));
        assertEquals("3.10.0",SkillUpdates.selectJson(all.toString(),"stable").version());
    }
    @Test public void stableRejectsDraftAndPrerelease()throws Exception {
        JSONArray all=new JSONArray().put(release("4.0.0",1,true,false)).put(release("3.9.0-lab.1",2,false,true)).put(release("3.8.1",3,false,false));
        assertEquals("3.8.1",SkillUpdates.selectJson(all.toString(),"stable").version());
        assertEquals("3.9.0-lab.1",SkillUpdates.selectJson(all.toString(),"lab").version());
    }
    @Test public void mislabelledPrereleaseStillExcludedFromStable()throws Exception {
        String all=new JSONArray().put(release("4.0.0-rc.1",1,false,false)).toString();
        assertNull(SkillUpdates.selectJson(all,"stable"));
    }
    @Test public void semverPrereleaseOrdering() {
        assertTrue(ReleasePolicy.compareVersions("3.8.1","3.8.1-rc.9")>0);
        assertTrue(ReleasePolicy.compareVersions("3.8.1-lab.10","3.8.1-lab.2")>0);
        assertEquals(0,ReleasePolicy.compareVersions("3.8.1+build.2","3.8.1+build.1"));
    }
    @Test public void replacedAssetChangesIdentityAtSameVersion()throws Exception {
        ReleasePolicy.Release old=SkillUpdates.selectJson(new JSONArray().put(release("3.8.1",1,false,false)).toString(),"stable");
        ReleasePolicy.Release changed=SkillUpdates.selectJson(new JSONArray().put(release("3.8.1",2,false,false)).toString(),"stable");
        assertEquals(old.version(),changed.version());assertNotEquals(old.identity(),changed.identity());
    }
    @Test public void rejectsWrongAssetAndUnfinishedUploads()throws Exception {
        JSONObject r=release("3.8.1",1,false,false);JSONObject asset=r.getJSONArray("assets").getJSONObject(0);
        asset.put("name","go-hipster-go-chatgpt-plugin.zip");
        assertNull(SkillUpdates.selectJson(new JSONArray().put(r).toString(),"stable"));
        asset.put("name",ReleasePolicy.ASSET).put("state","new");
        assertNull(SkillUpdates.selectJson(new JSONArray().put(r).toString(),"stable"));
    }
    @Test public void rejectsUntrustedDownloadAndReleaseUrls()throws Exception {
        JSONObject r=release("3.8.1",1,false,false);JSONObject asset=r.getJSONArray("assets").getJSONObject(0);
        asset.put("browser_download_url","https://github.com.evil.example/file.zip");
        assertNull(SkillUpdates.selectJson(new JSONArray().put(r).toString(),"stable"));
        r=release("3.8.1",1,false,false);r.put("html_url","https://github.com/other/repo/releases/tag/gemini-skill-v3.8.1");
        assertNull(SkillUpdates.selectJson(new JSONArray().put(r).toString(),"stable"));
    }
    @Test public void ignoresMalformedEntriesAndNoPackages()throws Exception {
        assertNull(SkillUpdates.selectJson("[null,{},12]","stable"));
        assertNull(SkillUpdates.selectJson(new JSONArray().put(release("3.8.1",1,false,false)).toString(),"unknown"));
    }
}
