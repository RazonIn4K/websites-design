#!/usr/bin/env python3
"""Regenerate client photo kits with upgraded photoreal prompts.

Discovers every slug under content/clients/, maps verticals from gen_images.py,
and overwrites public/img/<slug>/*.jpg when --force is set.

Usage (from websites-design/site/):
  python scripts/regen_fleet.py --force --slots hero          # heroes only
  python scripts/regen_fleet.py --force --slug flamengo       # one client, all slots
  python scripts/regen_fleet.py --force --archetype craft     # craft fleet
  python scripts/regen_fleet.py --dry-run --force             # list tasks only
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import time
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SITE / "scripts"))

# Reuse vertical maps + fetch from gen_images.py without executing main
_spec = importlib.util.spec_from_file_location("gen_images", SITE / "scripts" / "gen_images.py")
_gen = importlib.util.module_from_spec(_spec)
assert _spec.loader
_spec.loader.exec_module(_gen)

STYLE: dict[str, str] = _gen.STYLE
HERO: dict[str, str] = _gen.HERO
ABOUT: dict[str, str] = _gen.ABOUT
fetch = _gen.fetch
OUT = _gen.OUT

QUALITY = (
    "photorealistic editorial commercial photography, natural true-to-life color, "
    "real Midwest American small-town business, crisp sharp focus, realistic proportions, "
    "no watermark, no text, no logos, no distorted faces or hands, no AI artifacts"
)

# Slug -> vertical overrides for anything missing from gen_images.CLIENTS.
# (The Aug 2026 trades — delts-electric / votaw-plumbing — now live in
# gen_images.py itself, so this is empty; keep it as the escape hatch.)
EXTRA_VERTICAL: dict[str, str] = {}

# Craft / authority / editorial refresh — less stock, more people + place
HERO_OVERRIDES: dict[str, str] = {
    "flamengo": (
        "cinematic photograph, a vibrant family-owned Mexican restaurant spread — sizzling fajitas, fresh salsa, "
        "lime and cilantro on a rustic table — warm golden restaurant light, inviting DeKalb storefront mood, "
        "wide composition with darker negative space on the left for headline text"
    ),
    "a1-auto": (
        "cinematic photograph, a trustworthy mechanic in a clean uniform explaining an repair to a customer "
        "beside a lifted car in a bright DeKalb auto shop, honest local garage, "
        "wide composition with darker negative space on the left for headline text"
    ),
    "the-montcler": (
        "cinematic photograph, candlelit upscale Italian dining — handmade pasta, wine, white tablecloth, "
        "intimate hotel-restaurant ambiance, editorial magazine feel, "
        "wide composition with darker negative space on the left for headline text"
    ),
    "cronauer-law": (
        "cinematic photograph, an attorney counseling a client at a warm wood desk with law books, "
        "personal trustworthy Sycamore law office, soft window light, "
        "wide composition with darker negative space on the left for headline text"
    ),
    "leza-nail-spa": (
        "cinematic photograph, a serene modern nail spa with a manicure in progress, soft blush tones, "
        "calm wellness studio in DeKalb, editorial beauty photography, "
        "wide composition with darker negative space on the left for headline text"
    ),
}

# Archetype map mirrors Razon Studio fleet.ts (for --archetype filter)
ARCHETYPE: dict[str, str] = {
    "flamengo": "default", "johnny-ks": "default", "star-34-cafe": "default", "fattys-pub": "default",
    "the-montcler": "editorial", "tapa-la-luna": "editorial", "geneva-winery": "editorial", "arcada-theater": "editorial",
    "cronauer-law": "authority", "pardridge-insurance": "authority", "white-oak-tax": "authority",
    "friedrichs-eye": "authority", "genoa-animal-hospital": "authority", "cortland-vet": "authority",
    "leza-nail-spa": "wellness", "chicago-beauty": "wellness", "pilates-plus": "wellness", "my1-hair": "wellness",
    "a1-auto": "craft", "dekalb-mechanical": "craft", "delts-electric": "craft", "votaw-plumbing": "craft",
    "hinks-bar-and-grill": "craft", "lovells-tire": "craft", "anderson-auto-body": "craft",
}

LEGACY_VERTICAL = {c["slug"]: c["vertical"] for c in _gen.CLIENTS}


def vertical_for(slug: str) -> str:
    if slug in EXTRA_VERTICAL:
        return EXTRA_VERTICAL[slug]
    if slug in LEGACY_VERTICAL:
        return LEGACY_VERTICAL[slug]
    return "restaurant"


# copy.json location per slug — the flagship (flamengo) keeps its copy at
# content/copy.json, everything else under content/clients/<slug>/copy.json.
COPY_PATH: dict[str, Path] = {c["slug"]: SITE / c["copy"] for c in _gen.CLIENTS}


def discover_slugs() -> list[str]:
    root = SITE / "content" / "clients"
    slugs = {p.name for p in root.iterdir() if p.is_dir() and (p / "copy.json").exists()}
    slugs |= {slug for slug, path in COPY_PATH.items() if path.exists()}
    return sorted(slugs)


def build_tasks(slugs: list[str], slots: set[str]) -> list[tuple]:
    tasks = []
    seed = 9000
    for slug in slugs:
        vert = vertical_for(slug)
        copy_path = COPY_PATH.get(slug, SITE / "content" / "clients" / slug / "copy.json")
        data = json.loads(copy_path.read_text(encoding="utf-8"))
        captions = data["en"]["gallery"]["captions"][:6]
        style = STYLE.get(vert, STYLE["restaurant"])
        if "hero" in slots:
            hero = HERO_OVERRIDES.get(slug, HERO.get(vert, HERO["restaurant"]))
            prompt = f"{hero}, {style}, {QUALITY}"
            tasks.append((slug, "hero", prompt, 1536, 960, seed))
            seed += 1
        if "about" in slots:
            about = ABOUT.get(vert, ABOUT["restaurant"])
            prompt = f"{about}, {style}, {QUALITY}"
            tasks.append((slug, "about", prompt, 1000, 1000, seed))
            seed += 1
        if "gallery" in slots:
            for i, cap in enumerate(captions, 1):
                prompt = f"{cap}, {style}, {QUALITY}"
                tasks.append((slug, f"g{i}", prompt, 800, 800, seed))
                seed += 1
    return tasks


def generate(task, force: bool) -> tuple[str, int, str]:
    slug, name, prompt, w, h, seed = task
    dest = OUT / slug / f"{name}.jpg"
    if not force and dest.exists() and dest.stat().st_size > 8000:
        return (f"{slug}/{name}", dest.stat().st_size, "skip")
    dest.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(6):
        try:
            data = fetch(prompt, w, h, seed + attempt * 1000)
            if len(data) > 8000 and (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n"):
                dest.write_bytes(data)
                time.sleep(6)
                return (f"{slug}/{name}", len(data), "ok")
            time.sleep(6)
        except Exception:
            time.sleep(10)
    return (f"{slug}/{name}", 0, "FAILED")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="overwrite existing jpgs")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--slug", action="append", default=[], help="limit to slug(s)")
    ap.add_argument("--skip", action="append", default=[], help="skip slug(s) (keep existing kits)")
    ap.add_argument("--archetype", choices=["default", "editorial", "authority", "wellness", "craft"])
    ap.add_argument(
        "--slots",
        default="hero,about,gallery",
        help="comma list: hero, about, gallery (gallery = g1-g6)",
    )
    args = ap.parse_args()

    slot_raw = {s.strip() for s in args.slots.split(",") if s.strip()}
    slots: set[str] = set()
    if "hero" in slot_raw:
        slots.add("hero")
    if "about" in slot_raw:
        slots.add("about")
    if "gallery" in slot_raw:
        slots.add("gallery")

    slugs = discover_slugs()
    if args.slug:
        want = set(args.slug)
        slugs = [s for s in slugs if s in want]
    if args.skip:
        skip = set(args.skip)
        slugs = [s for s in slugs if s not in skip]
    if args.archetype:
        slugs = [s for s in slugs if ARCHETYPE.get(s) == args.archetype]

    tasks = build_tasks(slugs, slots)
    print(f"[regen] {len(slugs)} clients, {len(tasks)} images, force={args.force}", file=sys.stderr)
    if args.dry_run:
        for t in tasks[:20]:
            print(f"  would gen {t[0]}/{t[1]}", file=sys.stderr)
        if len(tasks) > 20:
            print(f"  ... +{len(tasks)-20} more", file=sys.stderr)
        return

    failed = []
    for i, task in enumerate(tasks, 1):
        r = generate(task, args.force)
        print(f"  [{i}/{len(tasks)}] {r[2]:8s} {r[0]:40s} {r[1] // 1024}KB", file=sys.stderr)
        if r[2] == "FAILED":
            failed.append(r[0])

    print(f"\n[regen] done — failed: {len(failed)}", file=sys.stderr)
    if failed:
        print(failed, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
