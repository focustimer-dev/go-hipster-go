# Contributor and agent instructions

This is a portable *music curation skill*, not a background listener or a streaming client.

- Treat `SKILL.md` as the behavioral entry point; detailed reference material belongs in `references/`.
- Keep regional scene descriptions accurate and sourced if expanding; don't generalize artists' origins from language, instrument, or tradition.
- Do not invent track matches, streaming IDs, music-service capability, release years or verified links.
- Never commit API secrets, access/refresh tokens, private keys, user listening histories or personal playlists.
- External writes to a music service require clear user approval, authenticated scopes, exact-track verification, and per-item result reporting.
- Keep the surprise DeBarge case testable and truly random when invoked; do not override explicit user requirements.
- When changing behavior, add/update test cases and run `python -m unittest discover -s tests -v` and `python scripts/playlist_cli.py validate examples/example-playlist.json`.
- Ship provider integrations behind explicit capability checks. Stubs/documentation must not be presented as production integrations.
