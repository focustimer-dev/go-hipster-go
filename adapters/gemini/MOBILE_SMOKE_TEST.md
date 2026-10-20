# Gemini Android acceptance test — YouTube Music first

These are **manual runtime tests** for someone with the Gemini app and connected music accounts. Passing GitHub CI does not establish that Gemini followed the skill or published tracks.

## Prerequisites

- The skill was either uploaded through Gemini **web** or explicitly loaded from the GitHub link in chat. Record which path was used; do not assume the two are equivalent.
- In Gemini **Android**, YouTube Music is connected under **Connected Apps**, or Gemini has offered its normal connection flow.
- If trying Spotify, connect it separately. Do not expect playlist-writing through Spotify's current Gemini connected app.

## Test 0 — no executable code

Use the five-file instruction-only ZIP **or** the user-tested GitHub-link loading route. Ask `Use Go, Hipster, Go!: go`.
**Pass:** Gemini curates songs without refusing because it cannot execute Python, mentioning a missing runtime, or insisting on a script. The original test screenshot showed exactly that refusal; it is a packaging regression, not a reason to remove music features.

## Test V — preserve the clerk's personality in Gemini

1. Confirm whether this is a **fresh GitHub load** or a **replaced Gemini web skill**; an old uploaded skill does not auto-sync from GitHub.
2. Ask `Use Go, Hipster, Go!: go weird, 6 tracks, text only`. Expect a dry opener, two or three distinct, track-relevant sardonic asides, and a smug sign-off. Fail if the result is a generic cheerful assistant playlist with one token joke.
3. Ask `go sad, 6 tracks, text only`. Expect nuanced melancholy, not compulsory slow tracks or jokes about genuine grief.
4. If publishing through YouTube Music, check whether the curator's **own narrative** still has character even when the provider's card uses neutral wording. Never fake publisher confirmation.
5. Ask `less snark` to confirm the persona appropriately turns down without changing track accuracy, verification or publishing rules.

These are manual listening/tone tests: text-based CI cannot establish that Gemini actually performed the behavior.

## Test E — no ChatGPT-style composer leakage

**Observed failure:** after a valid 12-track curation, Gemini offered to "select both" music plugins "in the composer". That is inappropriate Gemini routing advice.

- With no accessible writer, give the original ordered list and say **not published or saved**. Suggest at most one `@YouTubeMusic` or Connected Apps step, not ChatGPT composer selection.
- If Gemini generates a YouTube Music mix from the thesis, describe it as *provider-generated* until exact songs and order are confirmed.
- Distinguish generated playlist / playlist preview from a **Save to library** action and an actually saved library item.
- On follow-up, keep the curated 12 recordings and do not reroll the DeBarge Protocol.

These tests require a Gemini runtime. Passing static CI does not prove YouTube Music supports exact recording insertion.

## Test R — repeated songs versus provider auto-fill

1. In one Gemini conversation, create three six-track sets using the same mood; keep all intended lists visible. An ordinary repeated `go` should avoid using a recording already chosen in those visible lists without explanation, while leaving room for coherent tracks.
2. In the Jukebox, copy GO twice with the same selectors. Confirm the **Fresh-crate discovery lens** differs while mood/tempo and copy handoff remain intact.
3. Hand each curated list to `@YouTubeMusic`. If the provider supplies a different thematic selection, record the intended and actually visible songs separately; do not claim exclusion enforcement without item-level confirmation.
4. In a brand-new Gemini conversation, check that the skill does **not** claim knowledge of playlists it cannot read. If songs recur, provide earlier lists to support explicit exclusions.
5. Judge coherence and recording verification as well as novelty. Do not label static GitHub tests an end-to-end Gemini success.

## Test A0 — single-command listening

In a new Gemini conversation where the skill is loaded and YouTube Music is authorized, say only `Go, Hipster, Go!: go`. The skill should attempt to use the actual YouTube Music playlist-writing capability without requiring a separate `@YouTubeMusic` mention. If Gemini's host cannot activate the other skill, it must curate anyway and explicitly explain the limitation, without claiming a saved playlist. Check an explicit `go, text only` to confirm no write is attempted.

**This is a behavioral test, not proof that Gemini can activate another skill itself.**

## Test A — skill activation and musical behavior

Invoke the skill using the skill selector or explicitly say:

> Use Go, Hipster, Go!: go. Curate six real tracks with one surprising cross-scene bridge. Show exact artist and recording titles plus honest verification status.

**Pass:** The skill produces a coherent six-track list, keeps the global taxonomy and DeBarge exception, and never invents publishing success. Mark missing recording verification honestly.

## Test B — YouTube Music capabilities

> Use Go, Hipster, Go! to create a six-track exploratory playlist. Try to create it in @YouTubeMusic. Before calling anything 'published', identify what exact recording matches you can establish and what the connected app is actually able to write. If exact entries cannot be preserved, show me the curated list and explain the limitation.

**Record:** Can Gemini reach the YouTube Music connection from *inside* this skill? Does it create a playlist or only a radio / general generated playlist? Are the six artist/title/version pairs preserved in order? Does it return an authentic playlist URL or a saved-library action? Were substitutions explicitly identified?

**Pass:** Only if the returned provider result shows a playlist with appropriate tracks or Gemini clearly communicates its limitations. **Fail** for fabricated exact matches or a claimed published playlist without provider confirmation.

## Test C — Spotify negative capability

> Use Go, Hipster, Go! and show me a six-track playlist for Spotify. Tell me whether this Gemini session can actually create it in my account, or only search/play existing music.

**Pass:** Search/play actions may work, but the skill doesn't claim Spotify playlist creation where the connected app can't do it.

## Test D — default 12 tracks and persistence

Earlier controlled prompts requested **six tracks**, which explains the observed six-song playlist and does not establish a six-track cap.

1. In a new chat, check whether the skill remains available without re-supplying the GitHub URL.
2. Invoke the curator together with the built-in YouTube Music skill, asking: `Go. Make the default 12-track playlist and try to save the same twelve recordings in order in YouTube Music. Report the result and substitutions.`
3. Confirm the actual published playlist in YouTube Music and record whether there are 12 entries and whether title, performer, and order match.

**Pass:** A confirmed twelve-item playlist, or a truthful explanation of a platform limit. Separately record whether GitHub loading was persistent or needed repeating.

## Field observation (reported, not independently audited)

On 2026-10-16, the user reported that Gemini accepted a GitHub repository URL with an instruction to add the skill; invoking Gemini's built-in YouTube Music skill then generated a six-song playlist. The preceding test prompt had explicitly asked for six tracks. **Not yet verified:** actual saved playlist link, matching fidelity, persistent installation across chats, or a 12-track publication.

## Reporting

Capture the observed behavior in a GitHub issue, without tokens, account names, private playback history or passwords. Report environment (Android vs web), whether the skill selector worked, whether @YouTubeMusic connection was visible, playlist-write result, any missing recordings, and response quality.
