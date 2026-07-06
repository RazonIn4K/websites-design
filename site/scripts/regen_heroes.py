#!/usr/bin/env python3
"""
One-off hero regeneration for the 2026-07 design-critique pass. The original
prompts produced empty rooms / uncanny close faces / a TV void on these eight
sites; these are critique-informed replacement shots with fresh seeds.

Run from `site/`:  python scripts/regen_heroes.py
Then:              python scripts/gen_blur.py
Restart servers only AFTER this completes (next start snapshots public/).
"""

import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

_LEFT = "wide cinematic composition with the main subject on the right and generous empty darker negative space on the left for text overlay"

# slug -> (prompt, seed)
HEROES = {
    "friedrichs-eye": (
        f"cinematic photograph, a smiling customer trying on stylish tortoiseshell eyeglasses in front of a boutique mirror, wall of designer frames softly blurred behind, warm modern optical shop, {_LEFT}, professional photography, ultra detailed, no text",
        9101,
    ),
    "pardridge-insurance": (
        f"cinematic photograph, a friendly insurance agent at a warm wooden desk reviewing a policy with a young couple, natural window light, welcoming small-town office, plants and family photos, {_LEFT}, professional photography, ultra detailed, no text",
        9102,
    ),
    "mccoy-chiropractic": (
        f"cinematic photograph, a caring chiropractor gently working on a relaxed patient's shoulders in a calm modern treatment room, plants and soft natural light, reassuring, {_LEFT}, professional photography, ultra detailed, no text",
        9103,
    ),
    "leza-nail-spa": (
        f"cinematic photograph, elegant close-up of a nail artist applying blush polish during a manicure, soft-focus modern salon background, serene spa tones, {_LEFT}, professional beauty photography, ultra detailed, no text",
        9104,
    ),
    "chicago-beauty": (
        f"cinematic macro photograph, professional lash-extension tools, silk lash palette and rose-gold tweezers arranged on a marble tray, chic beauty studio bokeh, soft pink-toned light, {_LEFT}, professional photography, ultra detailed, no text",
        9105,
    ),
    "kramer-photography": (
        f"cinematic photograph, over-the-shoulder view of a photographer capturing a joyful young family laughing in golden-hour backlight in a park, candid documentary feel, {_LEFT}, professional photography, ultra detailed, no text",
        9106,
    ),
    "beidelman-furniture": (
        f"cinematic photograph, a crafted solid-wood dining table with elegant upholstered chairs and a warm wool throw in a furniture showroom vignette, layered natural textures, warm inviting light, {_LEFT}, professional interior photography, ultra detailed, no text",
        9107,
    ),
    "dearborn-cafe": (
        f"cinematic photograph, a rustic cafe table filled edge-to-edge with a golden breakfast — buttermilk pancakes, sunny eggs, crisp bacon — and coffee being poured, warm morning window light, {_LEFT}, professional food photography, ultra detailed",
        9108,
    ),
}

OUT = Path("public/img")
TIMEOUT = 150
HEADERS = {"User-Agent": "Mozilla/5.0 LBG-image-gen"}


def fetch(prompt, w, h, seed):
    url = (
        "https://image.pollinations.ai/prompt/"
        + urllib.parse.quote(prompt)
        + f"?width={w}&height={h}&nologo=true&model=flux&seed={seed}"
    )
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read()


def main():
    for slug, (prompt, seed) in HEROES.items():
        dest = OUT / slug / "hero.jpg"
        ok = False
        for attempt in range(6):
            try:
                data = fetch(prompt, 1536, 960, seed + attempt * 1000)
                if len(data) > 8000 and data[:3] == b"\xff\xd8\xff":
                    dest.write_bytes(data)
                    print(f"ok      {slug} {len(data) // 1024}KB", file=sys.stderr)
                    ok = True
                    time.sleep(6)
                    break
                time.sleep(6)
            except urllib.error.HTTPError as e:
                time.sleep(18 + attempt * 12 if e.code == 429 else 8)
            except Exception:
                time.sleep(8)
        if not ok:
            print(f"FAILED  {slug}", file=sys.stderr)


if __name__ == "__main__":
    main()
