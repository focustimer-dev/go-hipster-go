# Gate 4 — ChatGPT + Gemini candidate acceptance

**Stage:** Active, not yet qualified. **Scope decision:** The listener explicitly limited hands-on testing to **ChatGPT and Gemini** on 2026-11-12. Claude is **out of scope (N/A by request)**, not failed or verified. The eventual public release must not claim completed Claude live-host tests.

**Frozen core-source snapshot:** `6b4dc11fd35eb6ccc0fa7016c58b1acab3e4f27a` — Gate 0–3 engineering closeout on `main`. Candidate artifacts in the Gate 4 PR use the **PR head** recorded in their companion provenance file; source skill and music references are unchanged by this test-preparation PR. Do not confuse an artifact produced by a PR with a published release.

## Offline evidence already collected

On [`main` Validate skill run 43319500132](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43319500132), the normal push CI passed **Python 3.10, 3.12, and 3.13**. Each job ran **213 unit tests**, built all four archives, checked source/distribution mirrors, validated the example, checked canonical skill references, and ran `qualify_skill_release.py --check` with **`offline_checks_passed`**. The Python 3.12 job reported locally built archive sizes (bytes): ChatGPT 210,474; Claude plugin 208,104; Claude skill 204,514; Gemini 181,547. These are CI-generated test archives, **not** downloaded or independently recomputed hashes and **not** host acceptance.

The Gate 4 PR workflow now records its own source SHA and SHA-256 digests, and uploads the **ChatGPT and Gemini candidate ZIPs** with `gate4-candidate-provenance.txt` as one seven-day `ghg-gate4-chatgpt-gemini-candidates` artifact (Python 3.12, PR only). Download it from that PR's green `Validate skill` run; unzip **the Actions artifact** first, then use the provider-specific ZIP.

**Version/identity warning:** The source manifests intentionally still say **3.11.5** until Gate 5. A test ZIP with metadata 3.11.5 is **not** evidence that the current public 3.11.5 copy was loaded; corroborate the artifact's SHA-256, extraction/installation route and the six-outcome verification reference. The existing private ChatGPT `go-hipster-go-lab` is confirmed **3.11.6-rc.3** and its bundled verification/CLI files **predate Gate 2**: its results are historical comparisons only, **not** live acceptance of this frozen Gate 4 snapshot.

**Installation guard:** Do **not** replace the user's 3.11.5 public or private Lab plugin/skill automatically. Use a separate disposable test installation or a fresh chat explicitly loading the pinned candidate; if the host cannot distinguish that package from the existing installed skill, mark version verification **N/T** and stop rather than manufacture a pass. Gemini's published online entry reads `release/skill-prod` and therefore does **not** independently load this candidate. Use the **portable candidate ZIP** or verified commit-specific source with actual references. Changes to an installed host or its account remain under the user's control.

## Minimal live protocol — both hosts, text only

Carry the same two prompts into **fresh candidate-loaded conversations** for comparable results. Do not ask the hosts to publish, save, create, overwrite, play or edit a playlist in these cases.

### A. Candidate load proof — no music yet

```text
Identify the exact Go, Hipster, Go! skill name and displayed version you have
actually loaded in this conversation. Read its verification reference and
report whether it defines all six publication outcomes, including
created_save_required and published_items_unverified. State which references
you could actually access; do not invent a Git SHA or file-read trace.
Do not create a playlist, call a music writer, or generate music yet.
```

Record: host, fresh chat, installation method, artifact provenance SHA/hash, actual reported skill version, which references really loaded, and any unknowns. A model's claim without matching package/host evidence is **provisional**, not version confirmation. Stop on a stale public/rc.3 installation.

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
| Candidate loaded and source-correlated | N/T | N/T | Existing ChatGPT Lab rc.3 is stale; Gemini candidate not installed |
| Ordinary 12-track text-only GO | N/T | N/T | Record title, exact list and unique-lead count |
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
- [ ] Record successful Gate 4 PR head CI and both candidate ZIP SHA-256 values from uploaded provenance.
- [ ] Confirm the **new** candidate was installed/readable in fresh ChatGPT and Gemini chats.
- [ ] Collect both ordinary text-only 12-track outputs, plus regional HARD samples and optional non-Latin output.
- [ ] Review factual recording/edition/source evidence and actual mobile display; score evidence honestly.
- [ ] Complete a read-only live writer capability check or keep N/T. No create/save test without separate approval.
- [ ] Decide go/no-go; **do not bump 3.11.6, promote `release/skill-prod`, deploy Android/PWA or publish external playlists** at this stage.
