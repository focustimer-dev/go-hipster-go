# Gate 4 — ChatGPT + Gemini candidate acceptance

**Stage:** Active; release held. ChatGPT ordinary discovery breadth **0/2 reproduced in two independent listener-supplied rc.4 outputs**: both only 1979–84, three exact repeats and six returning artists between them, five tracks also repeated from original rc.2. Gemini observed breadth 2/2 and user-confirmed matching SHA, with specific liner-note caveats. Installed ChatGPT QA contains required routing and freshness files, but generating-chat reference reads remain unverified. Next: bounded ChatGPT reference-access diagnostic, then decide whether an isolated host-specific correction is justified. **Scope decision:** The listener explicitly limited hands-on testing to **ChatGPT and Gemini** on 2026-11-12. Claude is **out of scope (N/A by request)**, not failed or verified. The eventual public release must not claim completed Claude live-host tests.

**Frozen core-source snapshot:** `6b4dc11fd35eb6ccc0fa7016c58b1acab3e4f27a` — Gate 0–3 engineering closeout on `main`. Candidate artifacts from the Gate 4 PR were built by the **pull_request test-merge commit** `3f383f4ea1d91ba288b6d04de248e4904e76a809` recorded in their companion provenance file, which has the frozen baseline and PR head (`342dffe7fca4a5d38a17d1ac6e5ae97ba706897c`) as parents. The source skill and music references are unchanged by this test-preparation PR. Do not confuse an artifact produced by a PR with a published release.

## Offline evidence already collected

On [`main` Validate skill run 43319500132](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43319500132), the normal push CI passed **Python 3.10, 3.12, and 3.13**. Each job ran **213 unit tests**, built all four archives, checked source/distribution mirrors, validated the example, checked canonical skill references, and ran `qualify_skill_release.py --check` with **`offline_checks_passed`**. The Python 3.12 job reported locally built archive sizes (bytes): ChatGPT 210,474; Claude plugin 208,104; Claude skill 204,514; Gemini 181,547. These are CI-generated test archives, **not** downloaded or independently recomputed hashes and **not** host acceptance.

The Gate 4 PR workflow builds two **isolated, version-stamped QA ZIPs** and a `gate4-candidate-provenance.txt` containing the **tested PR merge SHA (`3f383f4…`) and SHA-256 hashes**. The seven-day `ghg-gate4-chatgpt-gemini-candidates` artifact appears on the green PR `Validate skill` workflow's Python 3.12 job. Download and unzip the **outer GitHub Actions artifact** once, then use `ghg-gate4-chatgpt-qa-rc4.zip` for a **new private ChatGPT QA plugin** and `ghg-gate4-gemini-qa-rc4.zip` for a **new Gemini web Skill**. They are different uploaders; do not interchange the ZIPs.

**Version/identity warning:** Main source manifests intentionally still say **3.11.5** until Gate 5, but the two **QA-only** archives change only their installation identity, test version and a build-source stamp: **`go-hipster-go-gate4` / `3.11.6-rc.4`**, with the exact tested PR-merge SHA in each packaged `SKILL.md`. This does **not** bump production or public 3.11.5. Confirm the extracted artifact SHA-256 against the provenance, and the loaded `SKILL.md` name, rc.4 version and source stamp. The existing ChatGPT Lab `go-hipster-go-lab` is **rc.3** and predates Gates 1–3; it remains unchanged and is a historical comparison, **not** valid acceptance for the current snapshot.

**Installation guard:** Do **not** replace the user's public 3.11.5 skill, existing ChatGPT Lab rc.3, or a saved Gemini production skill. The QA packages have a different skill name precisely to permit isolated installations; users must approve/install the QA packages in their respective hosts. On Gemini web, use **Customize → Skills → Create → Upload** for the Gemini QA ZIP, not Replace skill on production. In ChatGPT, use the private Plugin Creator workflow for the ChatGPT QA ZIP. If a host cannot install or expose an independent QA skill, mark the host loading check **N/T**, stop, and ask before overwriting anything. The public Gemini online entry still points to `release/skill-prod` and cannot substitute for the candidate ZIP.

## Minimal live protocol — both hosts, text only

Carry the same two prompts into **fresh candidate-loaded conversations** for comparable results. Do not ask the hosts to publish, save, create, overwrite, play or edit a playlist in these cases.

### A. Candidate load proof — no music yet

```text
Identify the exact installed skill name, displayed version and Gate 4 source
commit stamped in its SKILL.md. Expect go-hipster-go-gate4, 3.11.6-rc.4, and
the SHA from the QA package's provenance file. Read its verification reference
and report whether it defines all six publication outcomes, including
created_save_required and published_items_unverified. State which references
you actually accessed; do not invent tool calls or file-read traces.
Do not create a playlist, call a music writer, or generate music yet.
```

Record: host, fresh chat, installation method, artifact provenance SHA/hash, actual reported skill version, which references really loaded, and any unknowns. A model's claim without matching package/host evidence is **provisional**, not version confirmation. Stop on a stale public/rc.3 installation or a mismatched QA SHA.

### B. Ordinary GO — ChatGPT and Gemini

```text
Use the installed Go, Hipster, Go! candidate skill.
go weird mid
Exactly 12 tracks, no exceptions.
Text only. Do not publish.
```

Check exactly **12 numbered recordings**, **12 distinct credited leads** unless separately justified by the listener, real supportable artist/title/version identities, concrete sonic bridges and Mid energy, no forced 1978–84 canon corridor, concise legible mobile layout, no write, and status **CURATED — NOT PUBLISHED**. Compare visible track/artist overlap against prior rc.2 outputs without using previous unseen history as an automatic blacklist.

### C. GO HARD + regional focus — ChatGPT and Gemini

```text
Use the installed Go, Hipster, Go! candidate skill.
go funky hard
Regional exploration: Central America.
Tempo: Mid.
Recording preference: Skip rough recordings.
Exactly 12 tracks, no exceptions.
Text only. Do not publish.
```

Check supported Central American scene provenance, independent research paths, requested pace, real original recording/edition where traceable, credible Skip rough handling (do not infer transfer audio quality from a reissue label), 12 distinct leads and purposeful sequence. Catalog and listening checks require independent source/audio evidence; no simulated audio assessment. Neither host may quietly substitute neighboring regions or shorten to six.

### D. Non-Latin/mobile spot-check — only if needed

When either preceding result contains non-Latin credits, inspect original script + trustworthy romanization + translated or explicitly **unverified** meaning on the actual mobile screen. If neither contains one, run **one** supplemental `go mid; Regional exploration: East Asia; Exactly 12 tracks; Text only; Do not publish` on one or both hosts; record which host. Do not call formatting a pass without seeing the output.

### E. Writer capability inquiry — read only

In a fresh session or after a text-only result, optionally ask:
```text
Without creating, saving, playing, editing or searching music, describe only
the music-service tools actually exposed in THIS chat. Can an authorized
writer accept an explicit ordered recording list? Can it report item-level
readback and confirm library saving? State unavailable or unknown when needed.
Do not call any tool that changes a provider account.
```

The model's unsupported assertion is not evidence of a tool. Count, order, save or exact edition **cannot** pass without a real provider response or an independently verified library readback. **No live write test is authorized by this Gate 4 plan.** If exact publishing is untestable, narrow the release claim or hold that capability for separate acceptance.

## Review rubric and stop conditions

Score **0 fail / 1 provisional / 2 verified pass / N/T not tested / N/A out of requested scope**. A 2 requires the appropriate evidence, not just self-reporting. Required acceptance fields for each host: skill identity and package source; exact count; recording reality; 12 credited leads; fit and transitions; cross-region provenance for HARD; original-version and roughness claims; readable mobile output; no unauthorized writes. Add reference-load proof where accessible. Provider matching/save/readback remain **N/T** unless separately authorized and observed. Claude remains **N/A**, never counted as a passing live test.

| Item | ChatGPT | Gemini | Notes / evidence |
| --- | --- | --- | --- |
| Candidate loaded and source-correlated | **1 provisional** | **1 provisional** | [ChatGPT private QA plugin](https://chatgpt.com/plugins/plugins_6af644226744819181185374e8cd1341) rc.4 independently packaged and user-confirmed. Gemini subsequently reported loaded SKILL.md as `go-hipster-go-gate4` / `3.11.6-rc.4` / `3f383f4ea1d91ba288b6d04de248e4904e76a809`, matching tested QA artifact; per-generation reference read traces remain N/T |
| Ordinary 12-track text-only GO | **0/2 breadth on both runs; 2/2 mechanical count and leads** | **2/2 observed breadth and identities; 1/2 editorial precision; QA SHA user-confirmed** | [ChatGPT first](skill-3.11.6-gate4-chatgpt-ordinary-qa.md) and [repeat](skill-3.11.6-gate4-chatgpt-repeat-audit.md): 12 originals in 1979–83 then 1979–84; 3 exact repeats / 6 returning artists, 5 exact tracks from prior rc.2 diagnostic. [Gemini](skill-3.11.6-gate4-gemini-ordinary-qa.md) is far more varied. Release blocked pending host-routing diagnostic |
| Regional GO HARD 12-track text-only | N/T | N/T | Record provenance and source/edition checks |
| Non-Latin credit + mobile layout | N/T | N/T | Actual mobile output; not inferred from static rules |
| No playlist write on text-only | N/T | N/T | Prefer actual tool/activity trace, not assistant claim alone |
| Read-only writer capability verified | N/T | N/T | No real save/create without separate consent |
| Exact provider saved-item readback | N/T | N/T | Explicitly **not tested** until separately authorized |
| Claude live testing | N/A | N/A | Excluded by listener scope |

**Block release** for invented recordings, silent substitutions, 12→6 truncation, unauthorized provider write, false save/exact publication or materially renewed canon concentration. Hold or narrow claims when host activation, audio quality, source/edition matching or publishing cannot be verified. A single fresh source-specific failure warrants **one focused correction**, not a new generalized optimization loop.

## Gate 4 progress log

- [x] Scope limited to ChatGPT and Gemini; Claude deliberately N/A.
- [x] Freeze core-source reference SHA above.
- [x] Existing three-Python 213-test `main` CI run and four local archive sizes reviewed; no false live-host claims.
- [x] Confirm private ChatGPT Lab rc.3 is **older than Gate 2** and cannot be treated as this candidate.
- [x] Final-head [Gate 4 PR CI run 43322495506](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43322495506) passed 215 tests per Python job and uploaded the provenance artifact. ChatGPT SHA-256 `a0d2088eef997cb2c68e117085e3af70d8e973122bdaa140bfe6cdf15baf9f2d`; Gemini SHA-256 `79997adc1dc5922c0e055f3215237786776bce332c4902eeb7675df1562af4d7`.
- [x] **ChatGPT private QA plugin object created**, `plugins_6af644226744819181185374e8cd1341` at `3.11.6-rc.4` with 61 files; user-uploaded ZIP SHA-256 matched the [CI-produced ChatGPT QA ZIP](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43322495506/artifacts/13991930529). **Not yet run or selected in fresh ChatGPT chat**.
- [ ] Confirm the new candidate is actually invoked/readable in a fresh ChatGPT chat and install/verify the Gemini QA Skill.
- [x] Record first ChatGPT ordinary GO outcome: [observed 12-track list and independent catalog audit](skill-3.11.6-gate4-chatgpt-ordinary-qa.md). **Freshness 0/2**, 12 distinct credited leads, no actual publication; Gate 4 on hold for Gemini comparison.
- [x] Collect and independently [audit Gemini ordinary GO](skill-3.11.6-gate4-gemini-ordinary-qa.md): 12 distinct traceable song pairs, 12 artists, wide observed geography/era spread; some specific studio/equipment assertions not fully grounded.
- [x] Record listener-supplied Gemini QA `SKILL.md` identity: `go-hipster-go-gate4`, version `3.11.6-rc.4`, source commit `3f383f4ea1d91ba288b6d04de248e4904e76a809`. This matches QA artifact provenance; direct reference-read/tool trace N/T.
- [x] Receive and audit second independent ChatGPT rc.4 ordinary GO: [The Bassist Has the Keys](skill-3.11.6-gate4-chatgpt-repeat-audit.md), 12/12 count and unique leads, **0/2 discovery breadth**, 3 exact repeats and 6 repeated artists from the first rc.4 run. Source-package routing and freshness files independently verified present; live file reads N/T.
- [ ] Run one *diagnostic* ChatGPT QA conversation in which the skill is explicitly instructed to read its reference index, taxonomy freshness headings and relevant global scenes **before** ordinary GO. Record whether actual file reads are observable; distinguish a primed diagnostic from normal unprimed acceptance. Only then design a narrow host fix if justified.
- [ ] Collect regional HARD samples and optional non-Latin/mobile screenshots.
- [ ] Review factual recording/edition/source evidence and actual mobile display; score evidence honestly.
- [ ] Complete a read-only live writer capability check or keep N/T. No create/save test without separate approval.
- [ ] Decide go/no-go; **do not bump 3.11.6, promote `release/skill-prod`, deploy Android/PWA or publish external playlists** at this stage.

## Post-build ChatGPT QA installation record (2026-11-12)

- User supplied `ghg-gate4-chatgpt-qa-rc4.zip`, size **212,081 bytes**, SHA-256 **`a0d2088eef997cb2c68e117085e3af70d8e973122bdaa140bfe6cdf15baf9f2d`** matching the GitHub Actions build exactly. ZIP integrity checked with no invalid members, 61 unique safe paths, and both manifests advertising `go-hipster-go-gate4` version `3.11.6-rc.4`.
- Package entry stamp is `3f383f4ea1d91ba288b6d04de248e4904e76a809`, the actual GitHub Actions PR-test merge commit (parents `6b4dc11fd35eb6ccc0fa7016c58b1acab3e4f27a` and `342dffe7fca4a5d38a17d1ac6e5ae97ba706897c`). This is **not** the final squash merge SHA `5dcc5473be992d246c61a8cff96b72a066cc421d`, but canonical skill and verification files were verified unchanged across the PR and squash merge.
- Created **[private ChatGPT QA plugin](https://chatgpt.com/plugins/plugins_6af644226744819181185374e8cd1341)** via Plugin Creator. Exact ID `plugins_6af644226744819181185374e8cd1341`, private, current release `pluginrel_6af64423195881918874abf9f9b1ee70`; readback shows 61 files and correct version. This is separate from existing `go-hipster-go-lab` rc.3 and public `go-hipster-go` 3.11.5, neither of which was updated.
- **Not yet done:** Selecting/invoking the plugin in a fresh ChatGPT conversation; candidate reference load trace; any output, mobile, audio/catalog, or provider capability test. Those remain **N/T**. Gemini QA ZIP is generated but not installed. No music service write was performed.

## Gate 4A — first actual ChatGPT candidate output

The listener supplied the complete **The Meter Is Running** crate from a previously confirmed separate ChatGPT private QA session. **Twelve distinct lead artists, correct status, compact prose, no false save claim, and historically traceable recordings**. Yet **every original song dates roughly 1979–1983**, returning to a no-wave/punk-funk/dub post-punk circuit with at least four 99 Records picks. The reference-read trace and original mobile rendering are unavailable; the pasted content includes repeated citation replacement characters and no visible numbered markers. Full [source-supported audit](skill-3.11.6-gate4-chatgpt-ordinary-qa.md).

**Decision:** Score breadth **0/2**, candidate still **not qualified**. First run the exact same no-publish brief in the genuine Gemini QA candidate. No optimization patch until we can distinguish a cross-host failure from a ChatGPT-specific routing failure; then prefer a single bounded change in the canonical freshness path, not new quotas or a generic deeper search.

## Gate 4B — Gemini comparison and host split

The listener supplied the complete Gemini response *Clockwork & Stray Voltage*. Both hosts delivered exactly 12 real artist/title recordings, 12 distinct leads, and a correct text-only/no-publish header. **The only exact song common to both** was Vivien Goldman — Launderette.

Gemini selected independently rooted music from Niger, France, Japan, Brazil, Belgium, Switzerland, Somali diaspora recordings from Saudi Arabia, Turkey, Sudan and Cameroon. Compared with ChatGPT's 1979–83 post-punk corridor, the observed breadth is materially greater. **This is an observed output difference, not a proven causal difference between installed skill versions.** Gemini's version and source SHA were subsequently supplied by the listener and match the QA artifact; the per-generation reference-read trace remains unavailable.

Gemini's recording-specific prose is mostly plausible but the Mamman Sani Orla/BOSS session association and Fellini home-recorder claim require qualification; Aksak Maboul's scissors technique refers to the Tango section of the listed suite. Detailed source checks and a scorecard are in the [Gemini audit](skill-3.11.6-gate4-gemini-ordinary-qa.md).

The additional ChatGPT repeat **did reproduce** the narrow era/scene concentration, while Gemini QA metadata matches the source-pinned artifact by listener report. The installed ChatGPT QA contains the relevant index, freshness instruction, and global-scene path; runtime file reads are not proven. Inspect this loading behavior in one primed, read-only diagnostic before proposing a bounded ChatGPT-specific correction. Do not patch shared taxonomy automatically. The main version remains 3.11.5; no music provider write was made or authorized.

## Gate 4C — second ChatGPT QA ordinary GO

The listener supplied [The Bassist Has the Keys](skill-3.11.6-gate4-chatgpt-repeat-audit.md), a second ordinary GO result. It has 12 distinct leads, no false publication claim and a coherent bass-driven written sequence, but **every historical song dates ~1979–84** and the same early US/UK mutant punk-funk route recurs. Three exact songs and six lead acts overlap the first ChatGPT rc.4 result, and five exact tracks recur from the first rc.2 run. The installed QA files are present, with correct routing text; real generation-time reads N/T. This upgrades the ChatGPT breadth problem from a single concern to a **reproduced release blocker**. Next: one explicitly reference-primed QA diagnostic to distinguish source-read/routing problems from policy ineffectiveness. This is not itself an ordinary-use pass.
