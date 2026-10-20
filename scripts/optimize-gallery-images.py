#!/usr/bin/env python3
"""Create/check the curated gallery's same-dimension static WebP assets.

Requires the existing Pillow installation with WebP support. Never modifies site/.
--write first verifies every gallery JPEG against its preserved site/ original,
then writes WebP derivatives and removes only the proven redundant gallery JPEGs.
--check validates the committed manifest, retained originals and all 48 outputs.
"""

import argparse
import hashlib
import io
import json
from pathlib import Path

import PIL
from PIL import Image, features

ROOT = Path(__file__).resolve().parent.parent
GALLERY = ROOT / "gallery"
MANIFEST = GALLERY / "image-optimization.json"
SLUGS = (
    "a1-auto",
    "andersons-toyshop",
    "arcada-theater",
    "flamengo",
    "growing-place",
    "leza-nail-spa",
)
NAMES = ("about", "g1", "g2", "g3", "g4", "g5", "g6", "hero")
QUALITY = 82
METHOD = 6


def digest(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def write_assets():
    require(features.check("webp"), "The existing Pillow lacks WebP support.")
    previous = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else None
    old_rows = {row["webpPath"]: row for row in previous["assets"]} if previous else {}
    plans = []

    # Complete all provenance/encoding checks before changing any gallery file.
    for slug in SLUGS:
        for name in NAMES:
            original = ROOT / "site/public/img" / slug / f"{name}.jpg"
            jpeg = GALLERY / "public/img" / slug / f"{name}.jpg"
            webp = jpeg.with_suffix(".webp")
            require(original.is_file() and not original.is_symlink(), f"Missing original: {original}")
            source = original.read_bytes()
            source_sha = digest(source)
            if jpeg.exists():
                require(not jpeg.is_symlink(), f"Refusing symlink: {jpeg}")
                require(
                    digest(jpeg.read_bytes()) == source_sha,
                    f"Gallery JPEG differs from site/; originals left untouched: {jpeg}",
                )
            else:
                old = old_rows.get(webp.relative_to(ROOT).as_posix())
                require(
                    old is not None and old["originalSha256"] == source_sha,
                    f"No verified prior gallery JPEG provenance: {jpeg}",
                )
            with Image.open(io.BytesIO(source)) as image:
                require(image.format == "JPEG" and image.mode == "RGB", f"Unexpected source: {original}")
                width, height = image.size
                target = io.BytesIO()
                image.save(target, format="WEBP", quality=QUALITY, method=METHOD)
            encoded = target.getvalue()
            with Image.open(io.BytesIO(encoded)) as check:
                require(check.format == "WEBP" and check.size == (width, height), f"Invalid WebP: {webp}")
                check.load()
            require(len(encoded) < len(source), f"No byte saving; no files changed: {original}")
            row = {
                "slug": slug,
                "name": name,
                "retainedOriginalPath": original.relative_to(ROOT).as_posix(),
                "formerGalleryJpegPath": jpeg.relative_to(ROOT).as_posix(),
                "webpPath": webp.relative_to(ROOT).as_posix(),
                "width": width,
                "height": height,
                "originalBytes": len(source),
                "originalSha256": source_sha,
                "webpBytes": len(encoded),
                "webpSha256": digest(encoded),
                "savedBytes": len(source) - len(encoded),
                "galleryJpegMatchedRetainedOriginal": True,
            }
            plans.append((jpeg, webp, encoded, row))

    require(len(plans) == 48, "Expected exactly 48 curated assets.")
    for _jpeg, webp, encoded, _row in plans:
        require(not webp.is_symlink(), f"Refusing symlink: {webp}")
        webp.write_bytes(encoded)
    for jpeg, _webp, _encoded, _row in plans:
        if jpeg.exists():
            jpeg.unlink()
    rows = [row for _jpeg, _webp, _encoded, row in plans]
    manifest = {
        "schemaVersion": 1,
        "purpose": "Same-dimension static gallery WebP derivatives; not measured page-speed or CWV evidence.",
        "encoder": {"Pillow": PIL.__version__, "libwebp": features.version("webp"), "quality": QUALITY, "method": METHOD},
        "dimensionsChanged": False,
        "originalsPreservedUnder": "site/public/img/",
        "assets": rows,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")


def check_assets(export_dir=None):
    manifest = json.loads(MANIFEST.read_text())
    rows = manifest["assets"]
    expected = {(slug, name) for slug in SLUGS for name in NAMES}
    require(len(rows) == 48 and {(row["slug"], row["name"]) for row in rows} == expected, "Manifest asset set differs.")
    for row in rows:
        original = ROOT / row["retainedOriginalPath"]
        webp = ROOT / row["webpPath"]
        jpeg = ROOT / row["formerGalleryJpegPath"]
        require(not original.is_symlink() and not webp.is_symlink(), "Refusing symlinked image.")
        source = original.read_bytes()
        encoded = webp.read_bytes()
        require(digest(source) == row["originalSha256"] and len(source) == row["originalBytes"], f"Original changed: {original}")
        require(digest(encoded) == row["webpSha256"] and len(encoded) == row["webpBytes"], f"WebP changed: {webp}")
        require(not jpeg.exists(), f"Redundant gallery JPEG still present: {jpeg}")
        with Image.open(io.BytesIO(encoded)) as image:
            require(image.format == "WEBP" and image.size == (row["width"], row["height"]), f"Invalid dimensions/format: {webp}")
            image.load()
        if export_dir is not None:
            exported = export_dir / "img" / row["slug"] / f"{row['name']}.webp"
            require(exported.is_file() and digest(exported.read_bytes()) == row["webpSha256"], f"Export missing/different: {exported}")

    before = sum(row["originalBytes"] for row in rows)
    after = sum(row["webpBytes"] for row in rows)
    return {
        "status": "PASS",
        "images": len(rows),
        "allOriginalsPreserved": True,
        "allDimensionsPreserved": True,
        "originalBytes": before,
        "webpBytes": after,
        "savedBytes": before - after,
        "savedPercent": round(100 * (1 - after / before), 1),
        "exportVerified": str(export_dir) if export_dir is not None else None,
        "perRoute": {
            slug: {
                "originalBytes": sum(row["originalBytes"] for row in rows if row["slug"] == slug),
                "webpBytes": sum(row["webpBytes"] for row in rows if row["slug"] == slug),
                "savedBytes": sum(row["savedBytes"] for row in rows if row["slug"] == slug),
            }
            for slug in SLUGS
        },
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument("--write", action="store_true", help="Create derivatives after checking original provenance.")
    modes.add_argument("--check", action="store_true", help="Read-only image/manifest/provenance validation.")
    parser.add_argument("--export-dir", type=Path, help="Also validate a completed static export, without rebuilding.")
    args = parser.parse_args()
    if args.write:
        write_assets()
    print(json.dumps(check_assets(args.export_dir), indent=2))
