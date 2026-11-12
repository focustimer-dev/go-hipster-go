#!/usr/bin/env python3
"""Offline tools for Go, Hipster, Go!. Python 3.10+, no dependencies."""
from __future__ import annotations
import argparse
from collections import Counter
import json
import re
import secrets
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def valid_url(value: object) -> bool:
    if not isinstance(value, str):
        return False
    p = urlparse(value)
    return p.scheme in ("https", "http") and bool(p.netloc)


def validate_playlist(data: object, strict: bool = False) -> list[str]:
    """Minimum structural/semantic contract. This does NOT verify tracks against a catalog."""
    errs: list[str] = []
    if not isinstance(data, dict):
        return ["playlist must be a JSON object"]
    allowed = {"format_version", "mode", "title", "concept", "sonic_thesis", "tracks", "publishing"}
    for k in data.keys() - allowed:
        errs.append(f"unexpected playlist property: {k}")
    if data.get("format_version") != "1.0":
        errs.append("format_version must be '1.0'")
    mode = data.get("mode")
    if mode not in ("standard", "debarge-protocol"):
        errs.append("mode must be standard or debarge-protocol")
    for key in ("title", "concept", "sonic_thesis"):
        if not isinstance(data.get(key), str) or not data[key].strip():
            errs.append(f"{key} must be a non-empty string")
    tracks = data.get("tracks")
    if not isinstance(tracks, list) or not tracks:
        errs.append("tracks must be a nonempty array")
        return errs
    for i,t in enumerate(tracks,1):
        ctx=f"tracks[{i-1}]"
        if not isinstance(t,dict):
            errs.append(f"{ctx} must be an object"); continue
        allowed_track={"position","artist","title","version","scene","rationale","verification","matches"}
        for k in t.keys()-allowed_track: errs.append(f"{ctx}: unexpected property {k}")
        if type(t.get("position")) is not int or t["position"] != i: errs.append(f"{ctx}.position must be {i}")
        for k in ("artist","title"):
            if not isinstance(t.get(k),str) or not t[k].strip(): errs.append(f"{ctx}.{k} must be a non-empty string")
        v=t.get("verification")
        if not isinstance(v,dict) or v.get("status") not in ("verified","unverified"):
            errs.append(f"{ctx}.verification.status must be verified or unverified")
        else:
            if set(v)-{"status","source_url","note"}: errs.append(f"{ctx}: unexpected verification properties")
            if "source_url" in v and not valid_url(v["source_url"]): errs.append(f"{ctx}: invalid source_url")
            if strict and (v["status"]!="verified" or not valid_url(v.get("source_url"))):
                errs.append(f"{ctx}: strict mode needs verified status and source_url")
            if v["status"]=="unverified" and not v.get("note"):
                errs.append(f"{ctx}: unverified entry needs verification.note")
        m=t.get("matches",{})
        if not isinstance(m,dict): errs.append(f"{ctx}.matches must be an object")
        else:
            if set(m)-{"spotify_uri","youtube_video_id","apple_music_id"}: errs.append(f"{ctx}: unexpected match provider")
            if "spotify_uri" in m and not re.fullmatch(r'spotify:track:[A-Za-z0-9]+',str(m["spotify_uri"])):
                errs.append(f"{ctx}.matches.spotify_uri must be a track URI")
            for k in ("youtube_video_id","apple_music_id"):
                if k in m and (not isinstance(m[k],str) or not m[k].strip()): errs.append(f"{ctx}.matches.{k} must be nonempty")
    if mode=="debarge-protocol":
        if len(tracks)!=25 or any(not isinstance(t,dict) or t.get("artist")!="DeBarge" or t.get("title")!="Rhythm of the Night" or t.get("version") for t in tracks):
            errs.append("DeBarge Protocol needs exactly 25 consecutive original DeBarge — Rhythm of the Night entries")
    pub=data.get("publishing")
    if pub is not None:
        if not isinstance(pub,dict): errs.append("publishing must be an object")
        else:
            if set(pub)-{"provider","status","playlist_url"}: errs.append("publishing contains unsupported keys")
            if pub.get("provider") not in ("youtube","spotify","apple-music"): errs.append("publishing.provider unsupported")
            if pub.get("status") not in ("not_attempted","dry_run","published","failed"): errs.append("publishing.status unsupported")
            if pub.get("status")=="published" and not valid_url(pub.get("playlist_url")):
                errs.append("published playlist must include actual playlist_url")
            if "playlist_url" in pub and not valid_url(pub["playlist_url"]): errs.append("invalid playlist_url")
    return errs



# A read-only evidence report, intentionally separate from playlist format 1.0.
# The caller must actually inspect provider or saved-library results; this code
# can reject incomplete evidence, but it cannot authenticate provider claims.
PUBLICATION_LABELS = {
    "curated_text_only": "CURATED — NOT PUBLISHED",
    "not_created": "PLAYLIST NOT CREATED",
    "created_save_required": "CREATED — SAVE REQUIRED",
    "published_items_unverified": "SAVED — ITEMS UNVERIFIED",
    "published_exact": "PUBLISHED — EXACT",
    "published_approximate": "PUBLISHED — APPROXIMATE",
}


def publication_status_report(evidence: object) -> dict:
    """Reconcile caller-observed playlist evidence without changing 1.0 exports.

    'provider_count' is the confirmed TOTAL, never a count of preview tiles.
    'positions' is position-by-position evidence, not an artist-deduplicated set.
    Reporting exact tracks requires full readback *and* a verified recording
    identity for every position. This function never performs provider writes.
    """
    if not isinstance(evidence, dict):
        raise ValueError("evidence must be an object")
    keys = {"requested_count", "curated_count", "text_only", "created",
            "saved", "provider_count", "positions"}
    extra = set(evidence) - keys
    if extra:
        raise ValueError("unsupported evidence keys: " + ", ".join(sorted(extra)))
    requested = evidence.get("requested_count")
    curated = evidence.get("curated_count")
    if type(requested) is not int or requested < 1:
        raise ValueError("requested_count must be a positive integer")
    if type(curated) is not int or not 0 <= curated <= requested:
        raise ValueError("curated_count must be an integer from 0 to requested_count")
    text_only = evidence.get("text_only", False)
    if type(text_only) is not bool:
        raise ValueError("text_only must be boolean")
    provider_count = evidence.get("provider_count")
    if provider_count is not None and (type(provider_count) is not int or provider_count < 0):
        raise ValueError("provider_count must be a nonnegative integer or null")

    def confirmation(value, field, sources):
        if value is None:
            return False
        if (not isinstance(value, dict) or set(value) != {"source", "reference"}
                or value.get("source") not in sources
                or not isinstance(value.get("reference"), str)
                or not value["reference"].strip()):
            raise ValueError(f"{field} requires a source and a nonempty evidence reference")
        return True

    created = confirmation(evidence.get("created"), "created",
                           {"provider_response", "playlist_card", "library_observation"})
    saved = confirmation(evidence.get("saved"), "saved",
                         {"provider_save", "library_readback"})
    items = evidence.get("positions", [])
    if not isinstance(items, list):
        raise ValueError("positions must be a list")
    if text_only and (created or saved or provider_count is not None or items):
        raise ValueError("text_only contradicts provider evidence; investigate an unauthorized write")
    if not created and (saved or provider_count is not None or items):
        raise ValueError("saved or item evidence requires a confirmed playlist object")

    reviewed = {}
    for item in items:
        if not isinstance(item, dict) or set(item) - {
                "position", "result", "source", "reference", "recording_verified", "note"}:
            raise ValueError("each position must be a supported evidence object")
        pos = item.get("position")
        result = item.get("result")
        if type(pos) is not int or pos < 1 or pos > requested or pos in reviewed:
            raise ValueError("positions must be unique integers within requested_count")
        if result not in {"exact", "substituted", "wrong_version", "wrong_order", "missing"}:
            raise ValueError(f"position {pos}: unknown comparison result")
        if (item.get("source") not in {"provider_readback", "listener_library_review"}
                or not isinstance(item.get("reference"), str)
                or not item["reference"].strip()):
            raise ValueError(f"position {pos}: item-level evidence source and reference required")
        if result == "exact" and item.get("recording_verified") is not True:
            raise ValueError(f"position {pos}: exact requires independently verified recording identity")
        if result != "exact" and (not isinstance(item.get("note"), str)
                                  or not item["note"].strip()):
            raise ValueError(f"position {pos}: state the observed difference")
        if "recording_verified" in item and type(item["recording_verified"]) is not bool:
            raise ValueError(f"position {pos}: recording_verified must be boolean")
        reviewed[pos] = item
    if provider_count is not None:
        observed_present = sum(i["result"] != "missing" for i in items)
        if observed_present > provider_count:
            raise ValueError("confirmed items exceed confirmed total provider_count")

    mismatch = [
        {"position": pos, "result": item["result"], "note": item["note"]}
        for pos, item in sorted(reviewed.items()) if item["result"] != "exact"
    ]
    if provider_count is not None and provider_count != requested:
        mismatch.append({"result": "count_difference",
                         "note": f"Requested {requested}; provider confirms {provider_count}"})
    if curated != requested:
        mismatch.append({"result": "curation_shortfall",
                         "note": f"Requested {requested}; curated {curated}"})

    unknown = [pos for pos in range(1, requested + 1) if pos not in reviewed]
    exact_matches = sum(i["result"] == "exact" for i in reviewed.values())
    if text_only:
        status = "curated_text_only"
    elif not created:
        status = "not_created"
    elif not saved:
        status = "created_save_required"
    elif mismatch:
        status = "published_approximate"
    elif (provider_count == requested and curated == requested
          and exact_matches == requested and not unknown):
        status = "published_exact"
    else:
        status = "published_items_unverified"

    return {
        "status": status,
        "label": PUBLICATION_LABELS[status],
        "counts": {
            "requested": requested,
            "curated": curated,
            "provider_total": provider_count,
            "reviewed_positions": len(reviewed),
            "confirmed_exact_positions": exact_matches,
        },
        "unreviewed_positions": unknown,
        "observed_differences": mismatch,
    }


def artist_spacing_issues(data: object) -> list[str]:
    """Editorial preflight warnings for ordinary playlists; not catalog verification.

    Deliberate artist-led sets may override these warnings with user intent.
    The exceptional DeBarge Protocol is deliberately exempt.
    """
    if not isinstance(data, dict) or data.get("mode") != "standard":
        return []
    tracks = data.get("tracks")
    if not isinstance(tracks, list):
        return []
    names = []
    for track in tracks:
        raw = track.get("artist") if isinstance(track, dict) else None
        names.append(" ".join(raw.split()).casefold() if isinstance(raw, str) else "")
    counts = Counter(name for name in names if name)
    return [f"lead artist '{name}' appears {count} times"
            for name, count in counts.items() if count > 1]


def check_skill(root:Path=ROOT)->list[str]:
    errs=[]; f=root/'SKILL.md'
    if not f.exists(): return ['SKILL.md missing']
    text=f.read_text(encoding='utf-8-sig')
    m=re.match(r'\A---\n(.*?)\n---\n',text,re.S)
    if m is None: return ['SKILL.md must begin with YAML frontmatter --- delimiters']
    head=m.group(1)
    attrs=dict(re.findall(r'^([a-z][a-z-]*):[ \t]*(.+)$',head,re.M))
    name=attrs.get('name','').strip()
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',name) or len(name)>64:
        errs.append('invalid Agent Skills name')
    if name != root.name:
        # Repository roots may temporarily retain an older GitHub slug while their
        # canonical Agent Skill lives under skills/<name>/SKILL.md. Require an
        # exact matching packaged copy; arbitrary name/folder drift still fails.
        installed = root / "skills" / name / "SKILL.md"
        if not installed.is_file() or installed.read_text(encoding="utf-8-sig") != text:
            errs.append(f'name {name!r} must match folder {root.name!r} or its packaged skill')
    description=attrs.get('description','')
    if not description or len(description)>1024: errs.append('description missing or over 1024 characters')
    for path in re.findall(r'(?<!!)\[[^]\n]+\]\(([^)]+)\)',text):
        if not re.match(r'^[a-z][a-z0-9+.-]*://',path):
            candidate=(root/path.split('#',1)[0]).resolve()
            if not candidate.is_file() or not candidate.is_relative_to(root.resolve()):
                errs.append(f'broken local reference: {path}')
    return errs


def debarge_playlist()->dict:
    return {"format_version":"1.0","mode":"debarge-protocol", "title":"Rhythm of the Night (A Study in Persistence)",
      "concept":"Exactly twenty-five instances of the same DeBarge recording.",
      "sonic_thesis":"The DeBarge Protocol has spoken.",
      "tracks":[{"position":i,"artist":"DeBarge","title":"Rhythm of the Night",
                 "verification":{"status":"unverified","note":"Confirm the original recording and provider match before publishing."}}
                for i in range(1,26)]}


def one_in_a_hundred()->dict:
    n=secrets.randbelow(100)+1
    return {"roll":n,"triggered": n==1}


def main(argv=None)->int:
    p=argparse.ArgumentParser(description=__doc__)
    sub=p.add_subparsers(dest='command',required=True)
    v=sub.add_parser('validate',help='Validate structural playlist JSON; NOT catalog truth')
    v.add_argument('path',type=Path); v.add_argument('--strict',action='store_true')
    q=sub.add_parser('lint-sequence',help='Editorial lead-artist uniqueness check; exceptional artist-led sets may override')
    q.add_argument('path',type=Path)
    sub.add_parser('roll',help='Uniform 1:100 roll; call only once per eligible playlist')
    d=sub.add_parser('debarge',help='Create explicit 25-track joke payload')
    d.add_argument('--output',type=Path,required=True)
    sub.add_parser('check-skill',help='Check skill metadata and local references')
    r=sub.add_parser('status-report',help='Read-only publishing evidence reconciliation; does not modify playlist 1.0')
    r.add_argument('path',type=Path)
    a=p.parse_args(argv)
    if a.command=='roll':
        print(json.dumps(one_in_a_hundred()));return 0
    if a.command=='debarge':
        data=debarge_playlist(); a.output.parent.mkdir(parents=True,exist_ok=True)
        a.output.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        print(f'Wrote {a.output} (25 DeBarge tracks; NOT published).');return 0
    if a.command=='check-skill':
        errs=check_skill()
    else:
        try: data=json.loads(a.path.read_text(encoding='utf-8-sig'))
        except (OSError,ValueError) as ex:
            print(f'ERROR: cannot read JSON: {ex}',file=sys.stderr);return 2
        if a.command == 'status-report':
            try:
                report = publication_status_report(data)
            except ValueError as ex:
                print(f'FAIL: {ex}', file=sys.stderr)
                return 1
            print(json.dumps(report, ensure_ascii=False, indent=2))
            return 0
        errs=artist_spacing_issues(data) if a.command=='lint-sequence' else validate_playlist(data,strict=a.strict)
    if errs:
        for e in errs: print('FAIL:',e,file=sys.stderr)
        return 1
    print('PASS: '+('skill metadata and links' if a.command=='check-skill' else 'lead-artist uniqueness' if a.command=='lint-sequence' else 'playlist structure')+' (not evidence of online verification).')
    return 0


if __name__=='__main__':
    sys.exit(main())
