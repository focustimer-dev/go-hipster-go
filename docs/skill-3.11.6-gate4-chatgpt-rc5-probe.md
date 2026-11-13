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
