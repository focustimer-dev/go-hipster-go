# Gemini Android acceptance test — YouTube Music first

These are **manual runtime tests** for someone with the Gemini app and connected music accounts. Passing GitHub CI does not establish that Gemini followed the skill or published tracks.

## Prerequisites

- The skill was either uploaded through Gemini **web** or explicitly loaded from the GitHub link in chat. Record which path was used; do not assume the two are equivalent.
- In Gemini **Android**, YouTube Music is connected under **Connected Apps**, or Gemini has offered its normal connection flow.
- If trying Spotify, connect it separately. Do not expect playlist-writing through Spotify's current Gemini connected app.

## Test 0 — no executable code

Use the five-file instruction-only ZIP **or** the user-tested GitHub-link loading route. Ask `Use Hipster Music Generator: go`.
**Pass:** Gemini curates songs without refusing because it cannot execute Python, mentioning a missing runtime, or insisting on a script. The original test screenshot showed exactly that refusal; it is a packaging regression, not a reason to remove music features.

## Test A — skill activation and musical behavior

Invoke the skill using the skill selector or explicitly say:

> Use Hipster Music Generator: go. Curate six real tracks with one surprising cross-scene bridge. Show exact artist and recording titles plus honest verification status.

**Pass:** The skill produces a coherent six-track list, keeps the global taxonomy and DeBarge exception, and never invents publishing success. Mark missing recording verification honestly.

## Test B — YouTube Music capabilities

> Use Hipster Music Generator to create a six-track exploratory playlist. Try to create it in @YouTubeMusic. Before calling anything 'published', identify what exact recording matches you can establish and what the connected app is actually able to write. If exact entries cannot be preserved, show me the curated list and explain the limitation.

**Record:** Can Gemini reach the YouTube Music connection from *inside* this skill? Does it create a playlist or only a radio / general generated playlist? Are the six artist/title/version pairs preserved in order? Does it return an authentic playlist URL or a saved-library action? Were substitutions explicitly identified?

**Pass:** Only if the returned provider result shows a playlist with appropriate tracks or Gemini clearly communicates its limitations. **Fail** for fabricated exact matches or a claimed published playlist without provider confirmation.

## Test C — Spotify negative capability

> Use Hipster Music Generator and show me a six-track playlist for Spotify. Tell me whether this Gemini session can actually create it in my account, or only search/play existing music.

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
