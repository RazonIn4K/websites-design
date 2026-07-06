#!/usr/bin/env python3
"""Second hero-photo backlog batch (critique follow-ups):
- dekalb-mechanical: original visibly soft/low-res
- arcada-theater: stage-light beams read AI-synthetic; shoot the ornate room
- cronauer-law: anonymous law-library stock; add people
- white-oak-tax: paperwork pile; add an advisor-client moment
Run from site/, then gen_blur.py; restart servers only after completion."""

import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

_LEFT = "wide cinematic composition with the main subject on the right and generous empty darker negative space on the left for text overlay"

HEROES = {
    "dekalb-mechanical": (
        f"cinematic photograph, a friendly professional HVAC technician in a clean uniform tuning a modern high-efficiency furnace with precision tools, crisp sharp focus, bright trustworthy workshop light, {_LEFT}, professional photography, ultra detailed, no text",
        9301,
    ),
    "arcada-theater": (
        f"cinematic photograph, the ornate gilded balcony and ceiling of a restored 1920s movie palace glowing warm over red velvet seats, grand chandelier, dramatic warm light, {_LEFT}, professional architectural photography, ultra detailed, no text",
        9302,
    ),
    "cronauer-law": (
        f"cinematic photograph, an attorney at a warm wooden desk attentively counseling a client, law books and soft brass lamplight behind, reassuring and personal, {_LEFT}, professional photography, ultra detailed, no text",
        9303,
    ),
    "white-oak-tax": (
        f"cinematic photograph, a friendly tax advisor walking a relaxed client through documents at a tidy oak desk, warm window light, small-town credibility, {_LEFT}, professional photography, ultra detailed, no text",
        9304,
    ),
}

HEADERS = {"User-Agent": "Mozilla/5.0 LBG-image-gen"}

def fetch(prompt, seed):
    url = ("https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt)
           + f"?width=1536&height=960&nologo=true&model=flux&seed={seed}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=150) as r:
        return r.read()

for slug, (prompt, seed) in HEROES.items():
    dest = Path(f"public/img/{slug}/hero.jpg")
    for attempt in range(6):
        try:
            data = fetch(prompt, seed + attempt * 1000)
            if len(data) > 8000 and data[:3] == b"\xff\xd8\xff":
                dest.write_bytes(data)
                print(f"ok      {slug} {len(data) // 1024}KB", file=sys.stderr)
                time.sleep(6)
                break
            time.sleep(6)
        except Exception:
            time.sleep(10)
    else:
        print(f"FAILED  {slug}", file=sys.stderr)
