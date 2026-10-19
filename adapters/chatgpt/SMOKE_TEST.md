# ChatGPT installation smoke test (manual)

**Precondition:** Create a ChatGPT Project following [README.md](README.md), paste the Project instructions, and upload the current `CHATGPT_KNOWLEDGE.md`. Start a **new conversation inside the Project**. Do not mark any result as passed before actually testing that Project.

## Test 1: Surprise discovery

Prompt: `Use the Go, Hipster, Go! skill: go. Make a 6-track playlist and identify the audible bridge between any distant scene choices.`

Check: response uses a four-axis thesis; six actual artist–track pairs; sonic connections rather than a world-tour list; no made-up streaming playlist URL. If a real random facility is available, the DeBarge Protocol might replace the length only when eligibility permits; here the explicit 6-track count means it must **not** trigger.

## Test 2: Specific global mashup

Prompt: `Make 6 real tracks bridging Peruvian chicha and Turkish Anatolian psych, with the sonic bridge for each. Give explicit confirmation status for any version or year you claim.`

Check: reflects chicha/Anatolian taxonomy without inventing versions; sources checked if the environment permits; provisional labels where verification is absent.

## Test 3: Exclusion + honesty

Prompt: `Give me six Can-adjacent tracks, but no Can, Neu!, or obvious krautrock classics. Strictly verified: omit anything you cannot confirm using available evidence.`

Check: exclusions honored; no fabricated catalog or streaming claims; may return fewer than six if evidence insufficient.

## Test 4: DeBarge override

Prompt: `Use the Go, Hipster, Go! skill: invoke the DeBarge Protocol explicitly. Show the text playlist.`

Check: exactly 25 identical consecutive entries, original `DeBarge — Rhythm of the Night`; no claim of uploading or playlist creation.

## Record outcome

For each test, write **pass / fail / not tested** plus one concrete observation. Successful offline CI only proves files and scripts are valid; it cannot prove that a particular ChatGPT Project loaded its references, that the tracks are good, or that any music-service adapter works. Revise the smallest relevant rule if a behavior fails.
