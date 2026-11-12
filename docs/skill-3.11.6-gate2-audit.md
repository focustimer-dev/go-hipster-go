# Gate 2 — publication outcomes and schema compatibility audit

**Scope:** A read-only report command and status vocabulary alongside the existing playlist format 1.0. No schema migration, new persistent fields, provider calls, or host behavior changes.

## Preserved contract

- `schemas/playlist.schema.json` remains exactly format 1.0 with the four existing statuses.
- `scripts/playlist_cli.py validate` continues rejecting unknown publishing statuses and fields. Old JSON fixtures round-trip unchanged.
- `skills/go-hipster-go/scripts/playlist_cli.py` must match canonical script byte-for-byte; `build_agent_packages.py --check` audits it.
- DeBarge's original 25 repeated track entries are still valid and positionally distinct; strict requested count 12 is separately tested.
- New labels are emitted only by the independent, **read-only** `status-report <evidence.json>` command, not written into 1.0 JSON.

## Evidence semantics

- Requested versus curated versus confirmed whole-provider count are independent. A visible subset of eight playlist cards is **not** a confirmed provider total of eight.
- Confirmed object/card and confirmed library save are different; a link or preview cannot imply persistence.
- Exact publication demands saved confirmation, whole-provider count equal to requested, and independently checked matching recording/position evidence for every slot.
- Observed mismatches become approximate; unverified remaining entries stay unknown. No inferred substitutions, omissions, or version equality.
- Position-level checks preserve repeated tracks, unlike any artist dedupe or set comparison.
- Evidence references/source labels are supplied by the caller; the offline reconciler rejects malformed/contradictory claims but **cannot authenticate the tool, media ID, or recording itself**.

## Checks and decisions

- [x] Prefer a separate status-report helper over schema 1.1: no proven need to persist richer state.
- [x] Implement all six evidence-gated outcomes and a read-only CLI entry point.
- [x] Add negative controls for text-only + provider activity, absent save, bogus verified item, contradictory totals, and partial provider previews.
- [x] Add strict 12 and 25-position DeBarge cases and legacy 1.0 contract tests.
- [ ] Final-head Python 3.10/3.12/3.13 CI green and packaged-mirror byte parity.
- [ ] Review the PR diff and merge once verified.

**Live provider/host outcomes:** N/T. Static CI does not demonstrate YouTube Music or Spotify write/readback features. The dedicated Gate 4 host acceptance retains that requirement.
