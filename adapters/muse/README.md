# Meta Muse: personal agent versus Muse Code

**Two different Meta products:** The consumer **Muse personal AI agent** at [muse.ai](https://muse.ai/) operates through conversation, browser actions and connected apps. **Muse Code** is Meta's developer CLI with documented filesystem-based Agent Skills. Don't give a Muse mobile-app listener terminal-only Muse Code commands.

## Muse personal agent — GitHub-first, no imaginary installer

Spotify announced an **official Muse integration** on September 23, 2026: Muse can find music, play it, save songs to a library, and create/modify Spotify playlists after the listener connects their Spotify account. A listener also reports successfully creating a Spotify playlist with Go, Hipster, Go! through consumer Meta Muse (2026-10-17); item-by-item fidelity and universal availability are not independently validated. **[Spotify's announcement](https://newsroom.spotify.com/2026-09-23/spotify-meta-muse-agent/)** documents the integration. No new developer-owned Spotify OAuth app is necessary *for Muse to use its existing connector*.

Meta documents **built-in Muse skills and connected services**, but we have **not verified an official consumer Muse `SKILL.md` ZIP uploader or permanent third-party GitHub skill installer**. Do **not** claim that reading the repository means this skill is permanently installed. Muse may summarize a linked file or follow instructions in the current chat; cross-conversation persistence, full reference reading and exact playback actions require user testing.

**Try this in Muse:**

```text
Use Go, Hipster, Go! from
https://github.com/focustimer-dev/hipster-music-generator

Read the current SKILL.md and the referenced music taxonomy,
global scenes, verification, and curation examples. Do not replace
the skill with generic music suggestions.

Apply its snarky, passive-aggressive record-store-clerk voice and
four-axis music curation rules. Tell me which source files you
actually read, and whether you can retain this workflow across chats.
Do not claim to install a permanent skill unless you can verify that.

Run its setup command: ask where I listen and want playlists saved,
check if my Spotify connection can create playlists, and give me a
portable profile if preferences cannot be persisted.
```

Then authorize **Spotify in Muse's own connected-app settings** if you want playlists saved there. Say `go` or `go sad weird 24`. A Muse task may require an approval prompt for a connector's write action. Verify a real playlist URL, track count and artist/title/version matches in Spotify; don't assume the existing connector guarantees the curator's exact order.

If Muse can't load the GitHub references, provide it the `SKILL.md` content and the four linked `references/` files in the current chat through its supported file or text input. If it offers to *save a reusable workflow*, verify what actually persists in a new conversation, rather than treating the offer as an official import mechanism.

If the person already created a playlist using Muse's own Spotify tool, they don't need to install a second Spotify app or separately authorize a new developer API. **The open question is durable custom skill loading**, not Spotify's ability to create a playlist in Muse.

**Evidence:** [Meta Muse product](https://ai.meta.com/muse/) · [Spotify Muse integration](https://newsroom.spotify.com/2026-09-23/spotify-meta-muse-agent/) · [Meta Muse connectors](https://muse.ai/platform/docs). Third-party reports suggest Muse may retain user-supplied workflows when asked, but that is **not a documented or verified upload interface for Go, Hipster, Go!**.

## Muse Code — separate developer route

Meta's [Muse Code documentation](https://dev.meta.ai/docs/muse-code/extending) supports `SKILL.md` skills from personal and project directories and imports from Claude/Codex. For developers, clone the repository and run the supported commands **from the checkout**:

```bash
muse skills validate ./skills/go-hipster-go
muse skills install ./skills/go-hipster-go --scope user
muse skills list
muse skills inspect go-hipster-go
```

Muse Code also discovers compatible `~/.claude/skills`, `~/.agents/skills` and project `.claude/skills` where enabled. Unlike the consumer agent, this is a documented actual installation route. `setup` and `go` remain logical commands inside the loaded workflow.

**Don't conflate connectors:** Spotify's consumer **Muse personal agent** integration is *not proof* that the same Spotify actions appear in Muse Code. Check the developer session's actual tools before expecting playlist writes. No Muse Code runtime/Spotify test has been completed on this repository.
