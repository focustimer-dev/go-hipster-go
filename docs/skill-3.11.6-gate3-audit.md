# Gate 3 — host/mobile audit and scoped correction

**Baseline:** `main` squash `0cc10d7d86861c2489170096bfacedbc3e41c649` after merged Gate 2. **Evidence type:** static repository source, test harness, and Gemini generator inspection. This is not a live mobile host experiment.

| Area | Finding | Outcome |
| --- | --- | --- |
| Gemini reference | Gate 2's developer-only Python `status-report` command leaked into the script-free Gemini verification reference and generated Gem knowledge. | **Confirmed issue: patch generator** to retain six visible status outcomes but strip CLI/schema implementation text |
| Gemini Android smoke tests | Active v3.6.2 test allowed a generic themed creation while old sections still required bare GO to remain curate-only, contradicting Gate 1 exact-first. | **Confirmed issue: update active manual test** and explicitly label old two-stage expectations historical |
| ChatGPT/Claude core | Canonical and portable instructions contain numbered track notes, honest counts/status, 12 default, DeBarge 25 exception and original-script/transliteration safeguards. | Static contract pass; actual host/mobile output **N/T** |
| Gemini host isolation | Portable/online Gemini entry requires exact-capable writer or `PLAYLIST NOT CREATED`; no automatic theme fallback or ChatGPT composer direction. | Static contract pass, contingent on final CI; live installed Gemini **N/T** |
| Count and repetition | Existing CI tests cover strict 12, no 12→6 silent truncation, position-aware 8/12 preview, DeBarge 25 repeated entries. | Static contract pass; actual provider result **N/T** |
| Mood/tempo, refresh, GO HARD, region, quality | Existing canonical references and regression tests cover rules and packaging. | Static pass subject to CI; actual curation, audio quality, research latency and transfer quality **N/T** |
| Host mobile readability | No interactive ChatGPT/Gemini/Claude Android session or current screenshots tested here. A prompt fixture does not prove rendered readability. | **N/T**: Gate 4 fresh-host acceptance |
| Catalog matching | No confirmed common cross-host exact-version API. No speculative additional preflight, alternate quota or network call added. | No new code; actual catalog availability **N/T** |

**Scope:** Generator-only Gemini reference filtering, generated knowledge synchronization, current-versus-historical Gemini manual acceptance wording, and three small offline tests. No canonical music-selection change, schema 1.1, service write, 920-lead rework, new controls, or app deployment.

- [x] Identify concrete host packaging and test-document issues.
- [x] Implement focused generator/document correction and add regression checks.
- [x] [Final-head Validate skill run 43318973233](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43318973233) green on Python 3.10, 3.12 and 3.13, including generator/ZIP parity and launcher tests.
- [x] Reviewed six-file diff and squash-merged [PR #258](https://github.com/focustimer-dev/go-hipster-go/pull/258) as `17dff2cf0e0ad33894a2afe96af9844472569882`.
- [ ] **Gate 4:** capture actual candidate host outputs from ChatGPT/Gemini/Claude with verified version, 12 slots, mobile visual layout, non-Latin credits, recording evidence, and authorized writer/readback when available. Do not claim success on any N/T item.

**Exit:** Static Gate 3 engineering closed. No actual Gemini, Claude or ChatGPT UI screenshots, catalog/audio tests or library write/readback were completed; remain N/T and independently required in Gate 4. Public skill and `release/skill-prod` stay at 3.11.5.
