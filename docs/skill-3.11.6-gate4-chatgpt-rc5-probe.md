# ChatGPT Gate 4 rc.5 — single-checkpoint discovery routing probe

**Status:** Experimental QA build only. Does not change shared canonical SKILL.md, Gemini, Claude, public plugin, installed ChatGPT rc.4, production reference, app, playlists or release version.

## Why

Two separately supplied **ChatGPT QA rc.4** ordinary `go weird mid` lists had 12 valid lead artists each but returned to overlapping **1979–84 US/UK/NYC post-punk-funk**. The second repeated **three exact recordings and six artists** from the first and five songs from the original rc.2 audit. The [Gemini QA rc.4](skill-3.11.6-gate4-gemini-ordinary-qa.md) did not display the same narrow corridor.

The user then sent a ChatGPT reference-access diagnostic. Its response **claimed** to have read the installed `reference-index.md`, `sonic-taxonomy.md`, and `global-scenes.md` and correctly summarized their subject matter, **but omitted the three distinct sonic mechanisms/scene families that the diagnostic explicitly asked it to identify**. That is an observable **instruction-following omission**, not verified tool-level proof of file reads or of what caused the earlier lists.

The private ChatGPT QA rc.4 ZIP was independently inspected and contains the correct files and guidance. More repetitions of the same diagnostic would not answer whether ChatGPT puts source-guided route choice before its first canon-based shortlist.

## One bounded experiment

**Alternative hypothesis:** ChatGPT is anchoring on familiar artist/scene examples too early, before comparing genuinely different sonic families. This is plausible but not proven.

Build an **isolated ChatGPT-only skill** named `go-hipster-go-gate4-probe`, version **3.11.6-rc.5**, by byte-for-byte transforming the **frozen rc.4 ZIP** with known SHA-256 `a0d2088eef997cb2c68e117085e3af70d8e973122bdaa140bfe6cdf15baf9f2d`, source SHA `3f383f4ea1d91ba288b6d04de248e4904e76a809`. The only effective behavioral edit is a compact top-of-skill **early route checkpoint**: consult the existing index/taxonomy/global scene references; internally compare **three truly distinct** audible mechanisms or scene families *before* naming artists or committing to a thesis. Do not substitute three subvariants of 1979–84 US/UK punk-funk for three independent paths.

Do **not** add a second search pass, additional reference documents, forced continent/era/obscurity quotas, a printed checklist, new research budget, artist bans, service actions or cross-session memory. Preserve the default 12-track behavior, regional constraints, user-specified tempo, normal text-only output and existing verification.

CI creates a separately named rc.5 ZIP and hash-provenance artifact using `scripts/build_gate4_chatgpt_rc5_probe.py`; tests prove only deterministic source isolation and expected file content, **not musical performance**. The original rc.4 and Gemini QA packages remain byte-for-byte unchanged.

## Acceptance plan / stop conditions

1. Validate a **private rc.5 plugin with a distinct plugin ID**; never overwrite rc.4 or public 3.11.5. Verify version, full source SHA and diagnostic build identity in SKILL.md.
2. In one **fresh, unprimed** rc.5 conversation (no special instruction to read references), send precisely: `Use the go-hipster-go-gate4-probe skill. go weird mid. Exactly 12 tracks, no exceptions. Text only. Do not publish.`
3. Compare **count 12, unique leads, authentic recorded titles, eras, scene families, artist/track overlap, grounded transitions and readable no-publish output** against the two original rc.4 results and Gemini QA. Inspect actual file reads only where independently visible. Never treat a printed "I read all files" assertion as read proof.
4. If breadth improves but factual recording accuracy or flow worsens, **do not call it a pass**. If it stays narrow, do not try wider prompt rewrites in a loop; report the result and revisit whether host-specific model behavior, sampling and reference loading are observable. If improvement is strong, *then* consider a narrowly scoped production candidate modification and a second unprimed confirmation, subject to user approval.

**Release gate:** 3.11.6 remains **ON HOLD**. Even a successful rc.5 probe is not sufficient to release without the remaining regional GO HARD, mobile and provider checks. All provider writes remain unauthorized here.

## Isolated installation verification — 2026-11-12

- [PR #266](https://github.com/focustimer-dev/go-hipster-go/pull/266) passed the final-head [Validate skill run 43333798040](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43333798040) on Python 3.10, 3.12 and 3.13; merge commit `813aef4c4e8e0096bed9f2a6d12ff0682655fcb6`.
- The workflow produced a 7-day private [ChatGPT-only rc.5 artifact](https://github.com/focustimer-dev/go-hipster-go/actions/runs/43333798040/artifacts/13996975984). The original rc.4 packaged source hash was enforced by the test builder and the CI test suite.
- Independently recreated the rc.5 probe from the user-supplied original rc.4 QA ZIP (source SHA-256 `a0d2088eef997cb2c68e117085e3af70d8e973122bdaa140bfe6cdf15baf9f2d`), resulting in local QA archive SHA-256 `978f2202db403e250b18483464bdfe7bc24344cdfadd706008189d6caf258ea8` (213,152 bytes). Because CI artifact ZIP was not independently downloaded, record local and CI builds as separately corroborated by deterministic builder tests, **not as independently compared artifact hashes**.
- Created a separate **[PRIVATE ChatGPT rc.5 route-probe plugin](https://chatgpt.com/plugins/plugins_6af653f5cd0c8191b6555b15fadd4041)**, ID `plugins_6af653f5cd0c8191b6555b15fadd4041`, release `pluginrel_6af653f6e5a08191acaefc3eee02b0ef`. Plugin Creator readback verifies `go-hipster-go-gate4-probe`, `3.11.6-rc.5`, 61 files, source commit `3f383f4ea1d91ba288b6d04de248e4904e76a809`, and the early three-family checkpoint inside its installed SKILL.md.
- Existing rc.4, Gemini QA and public 3.11.5 plugin have **not** been updated. No playlist was generated, published or saved by this installation process. **A fresh, unprimed ordinary GO rc.5 behavioral result remains N/T.**
