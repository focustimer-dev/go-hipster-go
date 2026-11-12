# PR 5 — Private Lab rc.2 discovery evaluation card

**Test build:** [Go, Hipster, Go! Lab](https://chatgpt.com/plugins/plugins_6af5b52ee0288191978cf11e3e9ba92f), version `3.11.6-rc.2`. The private plugin release was updated in place on 2026-11-12. Source: PR #252 at `5dc040eada03cfbe35107f977a173dc3399cf3e4`, candidate CI [run 43251042327](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43251042327). The public 3.11.5 skill and `release/skill-prod` branch were **not** modified.

**Packaging verified:** independently downloaded GitHub CI build output; candidate ChatGPT source ZIP 207,064 B. Isolated Lab archive 207,672 B, 60 files, SHA-256 `a215c34982c20e87e9e39e5e8855d426a53996cf1f7fc293403f4ee3eb97abb5`. Plugin Creator reported `PRIVATE` scope and `3.11.6-rc.2`; a subsequent in-app file read confirmed the Lab SKILL.md, GO HARD, taxonomy, verification and original-release instructions. The live ChatGPT curation runtime still needs to be exercised.

## Test 1 — identical Central America brief (primary A/B)

Open a **fresh chat**, explicitly select **Go, Hipster, Go! Lab**, and first ask:

`What exact Go, Hipster, Go! skill name and version is loaded? Do not create a playlist.`

Expected: `go-hipster-go-lab`, `3.11.6-rc.2`. If the response claims a different version, **stop and check selection**. This identification is a useful test, but does not reveal whether every reference file was opened.

Then paste **without adding new taste guardrails**:

```text
Use the Go, Hipster, Go! Lab skill:
go funky hard
Regional exploration: Central America.
Tempo: Mid.
Recording preference: Skip rough recordings.
Exactly 12 tracks, no exceptions.
Text only. Do not publish.
```

Comparison datasets (already supplied by the listener):
- [Public 3.11.5 *Horns on the Offbeat*](skill-pr5-central-america-funk-observed-audit.md)
- [Private 3.11.6-rc.1 *The Horns Can Wait*](skill-pr5-central-america-funk-ab-comparison.md)
- **Private rc.2 output: pending**

Evaluate:
1. All 12 artist/title/version identities trace to trustworthy artist/label/catalog sources, with correct original single/album provenance and separately named expanded/reissued editions.
2. Actual geographic connection, playable specific recording and musical fit; don't infer tempo, sonic effects or transfer quality solely from a text listing.
3. Source breadth: record which independent primary-release labels/albums/scenes appear in the final crate, and which tracks share a reissue compilation. Check if it escapes the six-recording repetition and two-compilation anchoring seen between the earlier outputs; **zero repeats is a goal, not a guaranteed rule across isolated chats**.
4. Familiar/exposed selections must have musical reasons and plausible alternatives where they exist. If play counts are unavailable, mark them unknown; do not pretend a one-million-play threshold was measured.
5. Dry clerk persona, coherent sequencing, exactly 12 distinct leads and no unauthorized write.

**Prior observed comparison:** 3.11.5 vs rc.1 shared 6/12 exact recordings; rc.1 contained 10/12 tracks from just two compilations. Only this new run can tell us whether rc.2 meaningfully improved matters.

## Test 2 — ordinary GO regression (fast path)

Open a separate fresh Lab chat and confirm `3.11.6-rc.2`. Paste:

```text
Use the Go, Hipster, Go! Lab skill:
go weird mid
Exactly 12 tracks, no exceptions.
Text only. Do not publish.
```

Check twelve real distinct selections, coherent strange-but-defensible sonic connections, dry voice, source honesty, and no extra mandatory questioning, work phases, hidden exclusion requirements or publishing. Actual host latency/reference calls can be measured only if the host exposes reliable timing/traces; do not infer them from archive size.

## Optional Test 3 — independent-run repetition

Run **Test 1 again in another clean Lab chat** with no prior playlist shown. Measure overlap with the first rc.2 result as a distribution check. A new chat cannot know songs from the previous chat. If reliable exclusion is desired across sessions, design a separate privately maintained recent-track history rather than pretending that a skill instruction is persistent storage.

## Evidence / release gate

**Record:** exact plugin version from the session, the full numbered outputs, proof of track-level sources if actually opened, independent-compilation concentration, overlaps against earlier lists, original-release/expanded-reissue correctness, and visible tool/reference traces if available. Mark inaccessible reference-read telemetry **not observed**, not "yes". Score accuracy, variety, sequencing, geography, persona, count, skip-rough evidence each **0 (fail) / 1 (conditional) / 2 (pass) / N/T**.

**Hold:** no live publishing during these tests, no changes to the public plugin, no `3.11.6` release or tag, no `release/skill-prod` promotion, no Android/PWA deployment, no forced canon/popularity/album quotas. A small improvement in source variety does not justify fabricated tracks or ignored tempo/recording-quality restrictions. The published 3.11.5 remains rollback baseline.
