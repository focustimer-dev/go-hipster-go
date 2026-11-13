# PR 5 — Ordinary GO repeatability diagnosis: second user-provided `go weird mid` crate

**Observed:** 2026-11-12. User supplied *Please Hold for the Machine — Mid-Tempo Oddball Synth from the US, Europe & Japan*, following an identical **ordinary GO** brief: `go weird mid`; exactly 12; text only; do not publish. Compare with [first ordinary GO audit](skill-pr5-rc2-ordinary-go-audit.md), *Please Remain on the Dance Floor*. Both outputs were reported from the Lab rc.2 evaluation; a generating-chat version readout, actual in-session file-read trace and timing were **not supplied**.

## Specific comparison — 12 songs

| # | Second crate song | Original/reissue identification and corroboration | Cross-crate result |
| --- | --- | --- | --- |
| 1 | The Flying Lizards — **Money** | [The Guardian interviews lead vocalist Deborah Evans-Stickland](https://www.theguardian.com/books/2003/oct/31/music); 1979 single; record-store release [Apple Music](https://music.apple.com/us/album/the-flying-lizards/714938646) | **Same artist**, different track; first had `TV` |
| 2 | The Residents — **Constantinople** | [Residents archival discography](https://www.theresidents.co.uk/discography/discaudio1.html), original *Duck Stab* EP (1978) | New exact track |
| 3 | Snakefinger — **The Model** | [Residents archival collaborator discography](https://www.theresidents.co.uk/discography/disccollab.html), original 1980 Ralph single, Kraftwerk cover | New exact track |
| 4 | Silicon Teens — **Memphis Tennessee** | [Bandcamp licensed album](https://siliconteens.bandcamp.com/album/music-for-parties), also [1979 original Mute single entry](https://lescharts.com/showitem.asp?cat=s&interpret=Silicon+Teens&titel=Memphis+Tennessee); Chuck Berry cover | New exact track |
| 5 | Haruomi Hosono — **Sports Men** | [*Philharmony* original 1982 tracklist](https://insheepsclothinghifi.com/album/haruomi-hosono-philharmony/) | New exact track; artist's **well-known** solo hit, not rare |
| 6 | Telex — **Moskow Diskow** | [*Looking for Saint-Tropez*](https://music.apple.com/us/album/moskow-diskow-remastered/1678160023?i=1678160024), original 1979 album/song; digital version remastered | New exact track |
| 7 | Yello — **Bostich** | [Official Yello discography](https://www.yello.com/discography/), 1980 *Solid Pleasure* plus distinct singles/mixes | **Exact repeat** |
| 8 | Art of Noise — **Beat Box** | [Original 1983 *Into Battle* EP](https://theartofnoiseonline.com/THEREALTEST3/Index-INTO-BATTLE-WITH-THE-ART-OF-NOISE-version-2.php); later named diversions, single edits and remixes differ | New exact track; chosen mix **unspecified** |
| 9 | Liaisons Dangereuses — **Los Niños Del Parque** | [Official artist Bandcamp album](https://liaisonsdangereuses.bandcamp.com/album/liaisons-dangereuses), 1981 LP; repeat of the earlier list | **Exact repeat** |
| 10 | DAF — **Der Mussolini** | Same original 1981 DAF selection audited in [first ordinary GO report](skill-pr5-rc2-ordinary-go-audit.md), originally on *Alles Ist Gut* | **Exact repeat** |
| 11 | Grauzone — **Eisbär** | [SwissPunk release catalog](https://swisspunk.ch/index.php/discography-f-2/) and [documented first *Swiss Wave* sampler appearance (1980) / 1981 7-inch and edit](https://www.sams-collection.ch/sams-collection-grauzone-eisbaer-vinyl.html) | New exact track; 1980 full version versus 1981 single edit **unspecified** |
| 12 | The Normal — **Warm Leatherette** | [Original 1978 Mute single listing](https://music.apple.com/us/album/warm-leatherette-single/828252954) | New exact track; a major electronic touchstone |

**Arithmetic:** exactly **12/12** recognizable distinct artist/title pairs, **3/12 identical recordings** against the earlier independent `go weird mid` run (Yello, Liaisons Dangereuses, DAF) and **4/12 lead artists repeated** (those three plus The Flying Lizards). **Both** independent outputs are constrained to original recordings first issued roughly **1978–1984**, despite **no era restriction** in the brief. The first set focused 1979–84; the second 1978–83. Two sampled outputs do not establish a general repeat rate and cannot prove that a fresh chat could see the earlier output.

**Editorial assessment:** good playful liner notes, twelve real choices and reasonable sequencing; the second list adds American oddball records, French/Belgian pop and Japanese synth, but returns to a familiar international synth/post-punk/no-wave/electro canon. The Flying Lizards' 1979 hit, Hosono's signature `Sports Men`, Yello's `Bostich`, Grauzone's `Eisbär` and The Normal's iconic single are well-established landmarks. Distinctive collections, but not convincing evidence of broad unconstrained discovery. This is a **narrow starting-route issue**, not a false-track or exact-count bug.

The following recording-level claims remain unverified without audio analysis or a chosen provider master: lyrical/vocal textures and percussion details, actual BPM, "midtempo" across all twelve, Art of Noise `Beat Box` diversion/edit, Yello's `Bostich` mix and Grauzone `Eisbär` album versus shortened single. None was published and **no duration cap was requested**.

## Minimal corrective change, no new prompt fields

After observing **two** independent ordinary-GO playlists converging on the same 1978–84 canon lane, PR #252's [`sonic-taxonomy.md` freshness step 1](../references/sonic-taxonomy.md) was tightened:

> For an unscoped ordinary GO, especially `go weird`, compare genuinely different **audible sonic mechanisms or scene families** within the existing single pass; if the provisional shortlist is full of famous tracks from one era/scene without a listener constraint, reconsider an **already available** under-explored route.

**Not added:** a fourth mandatory reference file, extra searches, GO HARD's 36–50 candidate phase, global quota, play-count threshold, exclusion of good canonical tracks, user-entered `Sounds like`, or a cross-session memory claim. No Jukebox UI changes.

**Validation:** canonical taxonomy changed, portable mirror and ChatGPT/Gemini knowledge distributions updated. A new [offline regression assertion](../tests/test_skill_discovery_exploration.py) checks the intended constraints. CI green at the resulting PR head, if evidenced by the PR workflow run. **Tests validate instruction consistency, not the model's real behavior.**

## Implementation and test packaging — 2026-11-12

- **Code:** updated only the **first Freshness procedure step** in [canonical sonic taxonomy](../references/sonic-taxonomy.md). Added one [offline regression check](../tests/test_skill_discovery_exploration.py), then synced the portable skill mirror and generated ChatGPT/Gemini knowledge. No ordinary-GO reference expansion, additional research phase, app change or extra user prompt.
- **Offline proof:** [Validate skill PR run 43280564958](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43280564958) passed on **Python 3.10, 3.12 and 3.13 with 194 unit/contract tests per job**; all four ZIP builds and release-isolation qualification also passed. The CI source archive carried the updated taxonomy and was compared against the previous Lab package. These checks establish policy consistency, not quality of a newly generated playlist.
- **Private Lab updated:** [Go, Hipster, Go! Lab](https://chatgpt.com/plugins/plugins_6af5b52ee0288191978cf11e3e9ba92f) is now **3.11.6-rc.3** (private plugin release `pluginrel_6af6069ba2d081919b32ec0fde7905c3`). Package: **60 files**, **207,712 bytes**, SHA-256 `a48f737ed0a5df6266e1593acb0cca9c4e1bfcae818cff2b0fc8796f8bb829f3`. Creator readback independently confirmed root/nested manifest version, Lab skill identity and new taxonomy rule.
- **Live follow-up:** open a **fresh** Lab-selected chat; verify that its skill says `3.11.6-rc.3` (previous chats may retain stale snapshots); rerun the identical `go weird mid` text-only prompt. No rc.3 music output has been observed or scored yet. The public `3.11.5` plugin and `release/skill-prod` remain unchanged.

## Next gate

Package the patch as a distinct **private Lab rc.3** (without touching the public skill) after CI passes. In a new chat confirm `3.11.6-rc.3`, then rerun *identical* `go weird mid` text-only twice on separate sessions (or at least once). Record counts, exact repeats, temporal concentration, unprompted scene diversity, genuine musical quality and citation/source trustworthiness. Never insist on zero overlap as a guarantee without an actually available prior-track history.

**Release status:** hold. No playlist writes, public skill/tag, app deployment or merge authorized from this observation alone.
