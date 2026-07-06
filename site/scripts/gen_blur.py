"""Generate per-client LQIP blur placeholders.

For every public/img/<slug>/<name>.jpg this writes a tiny (16px-wide, blurred,
base64 JPEG) data URL into content/clients/<slug>/blur.json, keyed by image
name (hero, about, g1..g6). lib/blur.ts imports these server-side and only the
rendered client's map is serialized into its page, so the shared bundle stays
small while photos fade up from a blur instead of popping in.

Run after scripts/gen_images.py:  python scripts/gen_blur.py
"""

import base64
import io
import json
from pathlib import Path

from PIL import Image, ImageFilter

NAMES = ["hero", "about", "g1", "g2", "g3", "g4", "g5", "g6"]
ROOT = Path("public/img")


def main() -> None:
    total = 0
    clients = 0
    for d in sorted(ROOT.iterdir()):
        if not d.is_dir():
            continue
        out = {}
        for name in NAMES:
            p = d / f"{name}.jpg"
            if not p.exists():
                continue
            im = Image.open(p).convert("RGB")
            w, h = im.size
            tw = 16
            th = max(1, round(h * tw / w))
            im = im.resize((tw, th), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
            buf = io.BytesIO()
            im.save(buf, format="JPEG", quality=40)
            out[name] = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
            total += 1
        dst = Path(f"content/clients/{d.name}")
        dst.mkdir(parents=True, exist_ok=True)
        (dst / "blur.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
        clients += 1
    print(f"[blur] wrote blur.json for {clients} clients, {total} images")


if __name__ == "__main__":
    main()
