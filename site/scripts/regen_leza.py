#!/usr/bin/env python3
"""Re-shoot leza-nail-spa's hero: the first regen returned a blurry extreme
face crop (re-critique: net WORSE). This one is an explicit hands/nails macro
with no faces. Run from site/, then gen_blur.py, then restart servers."""

import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

_LEFT = "wide cinematic composition with the main subject on the right and generous empty darker negative space on the left for text overlay"
PROMPT = (
    "cinematic macro photograph, a manicurist's hands painting soft blush polish onto a client's fingernails "
    "over a marble table with rose-gold tools and a white orchid, shallow depth of field, elegant serene spa tones, "
    f"hands only, {_LEFT}, professional beauty photography, ultra detailed, no text"
)
HEADERS = {"User-Agent": "Mozilla/5.0 LBG-image-gen"}

def fetch(seed):
    url = ("https://image.pollinations.ai/prompt/" + urllib.parse.quote(PROMPT)
           + f"?width=1536&height=960&nologo=true&model=flux&seed={seed}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=150) as r:
        return r.read()

dest = Path("public/img/leza-nail-spa/hero.jpg")
for attempt in range(6):
    try:
        data = fetch(9204 + attempt * 1000)
        if len(data) > 8000 and data[:3] == b"\xff\xd8\xff":
            dest.write_bytes(data)
            print(f"ok {len(data) // 1024}KB", file=sys.stderr)
            break
        time.sleep(6)
    except Exception:
        time.sleep(10)
else:
    print("FAILED", file=sys.stderr)
    sys.exit(1)
