# Manual discovery test cases

Run *the same* prompts against the prior version and this revision, with the same listening/catalog access, then compare:

1. **Real recording fidelity** — no fabricated artist/title, unverified mix, year, location or provider link.
2. **Sonic coherence** — credible and concrete musical connections, especially at larger discovery distances.
3. **Novelty without arbitrariness** — unfamiliar tracks rather than rote taxonomy reference-artist recommendations.
4. **Scene breadth** — varied regions when the prompt allows it, without a tokenized world tour or stereotypes.

## Fixed prompts

- `Give me 12 songs that bridge Soviet-periphery cosmic disco and Japanese city pop, with one surprising African or Latin American connection.`
- `Give me music with the repetition and elastic rhythm of Can, but no Can or Neu! and no obvious krautrock classics.`
- `Use the hipster-music-generator skill: go.`

## Behavioral checks

- Repeated `go` asks in one conversation should *try* not to reuse the previous pairing or artist, but a good requested track remains allowed.
- Without web/catalog access, output should label uncertain tracks provisional, not hallucinate links.
- A strictly verified/publish-ready request should exclude unresolved matches.
- Ordinary lists should not repeat artists by default; the **DeBarge Protocol** is the deliberate exception.
- No agent may claim to have published to a service without authenticated confirmations.

No results are claimed here. Listening quality requires actual human evaluation; this document is a test plan.

## Default go: publishing and host-routing acceptance checks (manual)

| Environment | Prompt | Expected result |
| --- | --- | --- |
| ChatGPT, Spotify only authorized writer | `Hipster Music Generator: go` | Attempt Spotify publication without separate mention; use actual provider confirmation |
| Gemini, YouTube Music only authorized writer | `Hipster Music Generator: go` | Attempt YouTube Music via actual host capability, or report an activation limitation |
| Two writable services, no grounded preference | `go` | Ask once which destination; don't publish both |
| Two writers, visible Spotify preference | `go` | Prefer Spotify when writable |
| Connected Spotify search/play only | `go` | Curate, don't claim playlist creation |
| No connected writer | `go` | Curate, disclose publication failure and one smallest real setup step |
| Explicit no-publish | `go, text only` | Do not attempt any external write |
| Platform requires auth/approval | `go` | Respect all authorization prompts and important-change approvals |
| Provider only confirms playlist created | `go` | Don't claim exact item count or track order without provider evidence |

These tests measure actual host behavior; a textual CI assertion does not establish that a second music skill can be invoked automatically.

## Cross-platform publication regression (manual)

The user reports working ChatGPT → Spotify and Gemini → YouTube Music workflows. These reports validate that a playlist was created in those sessions, **not yet** that every requested recording and sequence was preserved. Do not store private tokens, listening history, account IDs, or playlist URLs in public test fixtures unless explicitly authorized.

Run the *same* six-track curated list on both hosts if possible. Record: host and service; user-requested count; actual item-level count when accessible; exact matches; alternate mixes/covers; absent/unknown matches; order preserved or unverified; real playlist creation acknowledgement. Use **unknown** for fields a provider does not expose. A publish action with no read-back should not claim six exact tracks.

### Test prompts

- **ChatGPT + Spotify:** `Use Hipster Music Generator: go, six tracks. Publish to Spotify using a connected publisher if available. Tell me how many were requested and which recordings and order you can actually verify in the saved playlist. Mark anything else unknown.`
- **Gemini + YouTube Music:** `Use Hipster Music Generator and the built-in YouTube Music skill: go, six tracks. Publish if available, preserving exact versions and order. Afterward separate confirmed tracks from substitutions and unknowns.`
- **No writer:** `Use Hipster Music Generator: go. If no connected playlist-writing tool exists, curate anyway and explicitly say nothing was published.`
- **Feedback:** `More like #4 but less atmospheric, please.` Run after a visible playlist; pass when it uses #4's relevant sonic feature without blindly repeating the artist.
- **Surprise:** Run two consecutive `go` requests in one conversation; inspect whether the second selection has a distinct scene/microgenre pairing and specific musical explanations without an invented novelty score.

### One-line scorecard

`Host/service | Requested | Confirmed item count or unknown | Exact | Substituted | Missing | Unknown | Order checked? | Saved URL confirmed? | Sonic fit notes`

Pass publication reporting when every claimed number is grounded in a provider result, with explicit uncertainty otherwise. Musical quality remains human-reviewed, not a CI pass/fail claim.
