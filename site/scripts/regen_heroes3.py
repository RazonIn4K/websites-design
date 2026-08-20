#!/usr/bin/env python3
"""Photo re-shoot round 3 (fleet re-critique v2): softness/uncanny-face fixes,
layout-tuned feast compositions, de-clashing grades, and the realize 'white
pill' (a fluorescent tube in the photo reading as broken UI).
Run from site/, then gen_blur.py, clear .next/cache/images, restart servers."""

import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

_LEFT = "wide cinematic composition with the main subject on the right and generous empty darker negative space on the left for text overlay"
_FEAST = "composition sitting slightly high in frame with the dish in the upper middle, simple clean dark wood surface across the lower third, top edge dark and uncluttered"

SHOTS = {
    "realize-athletics/hero": (f"cinematic photograph, an athlete mid-lift in a moody dark gym, strong rim-lit silhouette, dark uncluttered ceiling with no visible light fixtures at the top edge, {_LEFT}, professional photography, ultra detailed, no text", 9401),
    "a1-auto/hero": (f"cinematic photograph, crisp sharp shot of a mechanic's hands torquing a bolt on an engine in a clean service bay, dramatic rim lighting, deep focus, {_LEFT}, professional automotive photography, ultra detailed, no text", 9402),
    "chicago-beauty/hero": (f"cinematic photograph, a lash artist's gloved hands mid-treatment with fine tweezers over a client resting under soft studio light, faces softly out of frame, elegant rose-toned beauty studio, {_LEFT}, professional photography, ultra detailed, no text", 9403),
    "kramer-photography/hero": (f"cinematic photograph, a photographer kneeling with a camera capturing a family walking away through golden-hour prairie grass, subjects small in frame and backlit, crisp sharp focus, {_LEFT}, professional photography, ultra detailed, no text", 9404),
    "mccoy-chiropractic/hero": (f"cinematic photograph, a patient mid-stretch reaching upward with visible relief in a bright calm wellness studio, photographed from behind, plants and soft light, no faces visible, {_LEFT}, professional photography, ultra detailed, no text", 9405),
    "my1-hair/hero": (f"cinematic photograph, a stylist finishing a glossy blowout photographed from behind the client's chair, subject fully in the right half of frame, chic warm salon light, {_LEFT}, professional photography, ultra detailed, no text", 9406),
    "todd-curtis-orthodontist/hero": (f"cinematic photograph, a smiling teenager centered in a bright modern orthodontic office, natural depth of field with real equipment softly behind, crisp and friendly, {_LEFT}, professional photography, ultra detailed, no text", 9407),
    "tapa-la-luna/hero": (f"cinematic photograph, shared Spanish tapas plates and wine glasses filling the upper two-thirds of a candlelit table, warm intimate light with rich detail to the top of frame, {_LEFT}, professional food photography, ultra detailed", 9408),
    "pardridge-insurance/hero": (f"cinematic photograph, a friendly insurance agent and a young couple talking across a warm wooden desk, natural window light, hands relaxed and mostly out of frame, welcoming small-town office, {_LEFT}, professional photography, ultra detailed, no text", 9409),
    "cronauer-law/hero": (f"cinematic photograph, tight crop of an attorney's desk with law books, brass lamp glow, a pen on legal documents and a client chair opposite, warm authoritative light, no faces, {_LEFT}, professional photography, ultra detailed, no text", 9410),
    "beas-wok/hero": (f"cinematic photograph, a steaming bowl of beef pho with fresh herbs beside a crispy banh mi, {_FEAST}, vibrant appetizing color, professional food photography, ultra detailed", 9411),
    "bowlrrito/hero": (f"cinematic photograph, a fresh build-your-own burrito bowl loaded with rice, grilled chicken, guacamole and salsa, {_FEAST}, bright appetizing, professional food photography, ultra detailed", 9412),
    "johnny-ks/hero": (f"cinematic photograph, a juicy double cheeseburger with crispy fries and a thick shake, {_FEAST}, retro diner warmth, professional food photography, ultra detailed", 9413),
    "envision-dance/g4": ("cinematic photograph, a dancer mid-leap in a bright warm dance studio with golden window light, mirrors and barre softly behind, energetic graceful, warm color grade, professional photography, ultra detailed, no text", 9414),
    "elite-boba/hero": (f"cinematic photograph, colorful bubble teas with tapioca pearls in clear cups on a counter, purple and pink toned lighting grade, playful modern boba shop, {_LEFT}, professional photography, ultra detailed, no text", 9415),
    "elite-boba/g4": ("cinematic photograph, two pastel boba milk teas with fat straws on a pink-purple neon-lit counter, playful modern grade, professional photography, ultra detailed, no text", 9416),
    "elite-boba/g5": ("cinematic photograph, a violet taro boba tea with tapioca pearls in dramatic purple-pink light, modern boba shop detail shot, professional photography, ultra detailed, no text", 9417),
    "pottery-bayou/hero": (f"cinematic photograph, crisp sharp shot of a paint-your-own pottery table with brushes, glaze pots and colorful finished ceramic pieces, bright cheerful studio light, deep focus, {_LEFT}, professional photography, ultra detailed, no text", 9418),
}

HEADERS = {"User-Agent": "Mozilla/5.0 LBG-image-gen"}

def fetch(prompt, w, h, seed):
    url = ("https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt)
           + f"?width={w}&height={h}&nologo=true&model=flux&seed={seed}")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=150) as r:
        return r.read()

for rel, (prompt, seed) in SHOTS.items():
    dest = Path("public/img") / rel.replace("/", "/", 1)
    dest = Path("public/img") / (rel + ".jpg")
    w, h = (1536, 960) if rel.endswith("hero") else (800, 800)
    for attempt in range(6):
        try:
            data = fetch(prompt, w, h, seed + attempt * 1000)
            if len(data) > 8000 and data[:3] == b"\xff\xd8\xff":
                dest.write_bytes(data)
                print(f"ok      {rel} {len(data) // 1024}KB", file=sys.stderr)
                time.sleep(6)
                break
            time.sleep(6)
        except Exception:
            time.sleep(10)
    else:
        print(f"FAILED  {rel}", file=sys.stderr)
