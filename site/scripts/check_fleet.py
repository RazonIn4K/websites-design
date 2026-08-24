#!/usr/bin/env python3
"""Fleet integrity check — registry <-> content <-> images <-> pipeline <-> docs.

Stdlib only. Run from `site/`:  python scripts/check_fleet.py  (or npm run check:fleet)

For every slug registered in lib/clients.ts it verifies:
  - content/clients/<slug>/copy.json + theme.json exist (flagship copy lives at
    content/copy.json) and EN/ES copy are structurally identical
  - content/clients/<slug>/blur.json exists with all 8 slot keys
  - public/img/<slug>/{hero,about,g1..g6}.jpg exist and meet the size floor
    (default 120KB; override with --floor-kb)
  - the slug is in scripts/gen_images.py CLIENTS and its vertical key has
    STYLE / HERO / ABOUT prompt entries
  - the slug appears in the root README.md client table and the IMAGES.md
    per-site briefing table (docs drift is how the Aug 2026 trades went missing)

Exit code 1 on any failure so it can gate builds/commits.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent
SLOTS = ["hero", "about", "g1", "g2", "g3", "g4", "g5", "g6"]
FLAGSHIP = "flamengo"


def registry_slugs() -> list[str]:
    src = (SITE / "lib" / "clients.ts").read_text(encoding="utf-8")
    return re.findall(r'^\s*slug:\s*"([^"]+)"', src, re.M)


def shape(node):
    """Structural signature: dict keys + list lengths, leaf values ignored."""
    if isinstance(node, dict):
        return {k: shape(v) for k, v in node.items()}
    if isinstance(node, list):
        return [shape(v) for v in node]
    return type(node).__name__


def load_gen_images():
    spec = importlib.util.spec_from_file_location("gen_images", SITE / "scripts" / "gen_images.py")
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--floor-kb", type=int, default=120, help="minimum JPEG size per slot (KB)")
    ap.add_argument("--no-docs", action="store_true", help="skip README/IMAGES.md coverage checks")
    args = ap.parse_args()
    floor = args.floor_kb * 1024

    fails: list[str] = []
    warns: list[str] = []
    slugs = registry_slugs()
    if len(slugs) != len(set(slugs)):
        fails.append("duplicate slugs in lib/clients.ts")

    # ---- content -------------------------------------------------------------
    for slug in slugs:
        copy_path = SITE / "content" / "copy.json" if slug == FLAGSHIP else SITE / "content" / "clients" / slug / "copy.json"
        cdir = SITE / "content" / "clients" / slug
        if not copy_path.exists():
            fails.append(f"{slug}: missing {copy_path.relative_to(SITE)}")
        else:
            try:
                data = json.loads(copy_path.read_text(encoding="utf-8"))
                en, es = data.get("en"), data.get("es")
                if en is None or es is None:
                    fails.append(f"{slug}: copy.json lacks en/es")
                elif shape(en) != shape(es):
                    fails.append(f"{slug}: EN/ES copy shapes differ")
                for lang in ("en", "es"):
                    caps = ((data.get(lang) or {}).get("gallery") or {}).get("captions") or []
                    if len(caps) < 6:
                        fails.append(f"{slug}: {lang} gallery.captions has {len(caps)} (<6)")
            except json.JSONDecodeError as e:
                fails.append(f"{slug}: copy.json invalid JSON ({e})")
        if slug != FLAGSHIP and not (cdir / "theme.json").exists():
            fails.append(f"{slug}: missing theme.json")
        blur = cdir / "blur.json"
        if not blur.exists():
            fails.append(f"{slug}: missing blur.json (run python scripts/gen_blur.py)")
        else:
            try:
                keys = set(json.loads(blur.read_text(encoding="utf-8")).keys())
                missing = [k for k in SLOTS if k not in keys]
                if missing:
                    fails.append(f"{slug}: blur.json missing {missing} (run python scripts/gen_blur.py)")
            except json.JSONDecodeError:
                fails.append(f"{slug}: blur.json invalid JSON")

    # ---- images --------------------------------------------------------------
    for slug in slugs:
        idir = SITE / "public" / "img" / slug
        for name in SLOTS:
            f = idir / f"{name}.jpg"
            if not f.exists():
                fails.append(f"{slug}/{name}.jpg missing")
            elif f.stat().st_size < floor:
                fails.append(f"{slug}/{name}.jpg is {f.stat().st_size // 1024}KB (< {args.floor_kb}KB floor)")
    orphan_dirs = sorted(p.name for p in (SITE / "public" / "img").iterdir() if p.is_dir() and p.name not in slugs)
    if orphan_dirs:
        warns.append(f"image kits with no registry entry: {orphan_dirs}")
    orphan_content = sorted(p.name for p in (SITE / "content" / "clients").iterdir() if p.is_dir() and p.name not in slugs)
    if orphan_content:
        warns.append(f"content dirs with no registry entry: {orphan_content}")

    # ---- image pipeline ------------------------------------------------------
    try:
        gen = load_gen_images()
        gen_map = {c["slug"]: c for c in gen.CLIENTS}
        for slug in slugs:
            c = gen_map.get(slug)
            if c is None:
                fails.append(f"{slug}: not in scripts/gen_images.py CLIENTS")
                continue
            if not (SITE / c["copy"]).exists():
                fails.append(f"{slug}: gen_images copy path {c['copy']} does not exist")
            v = c["vertical"]
            for dname, d in (("STYLE", gen.STYLE), ("HERO", gen.HERO), ("ABOUT", gen.ABOUT)):
                if v not in d:
                    fails.append(f"{slug}: vertical '{v}' has no {dname} prompt in gen_images.py")
        extra = sorted(set(gen_map) - set(slugs))
        if extra:
            warns.append(f"gen_images.py CLIENTS has slugs not in registry: {extra}")
    except Exception as e:  # noqa: BLE001
        fails.append(f"could not load scripts/gen_images.py: {e}")

    # ---- docs ----------------------------------------------------------------
    if not args.no_docs:
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        images_md = (ROOT / "IMAGES.md").read_text(encoding="utf-8")
        for slug in slugs:
            if slug != FLAGSHIP and f"| `{slug}` |" not in readme:
                fails.append(f"{slug}: not in README.md client table")
            if f"| `{slug}` |" not in images_md:
                fails.append(f"{slug}: not in IMAGES.md per-site briefing table")

    # ---- report --------------------------------------------------------------
    total_imgs = len(slugs) * len(SLOTS)
    print(f"[fleet] {len(slugs)} clients · {total_imgs} image slots · floor {args.floor_kb}KB")
    for w in warns:
        print(f"  warn  {w}")
    for f in fails:
        print(f"  FAIL  {f}")
    if fails:
        print(f"[fleet] {len(fails)} failure(s)")
        return 1
    print("[fleet] OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
