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
