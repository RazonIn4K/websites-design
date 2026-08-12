#!/usr/bin/env python3
"""
Local Business Recon — DeKalb County, IL corridor.

Queries the OpenStreetMap Overpass API for storefront/local businesses across a
set of high-value verticals, audits their digital presence (website / contact),
scores each as a web-design lead, and writes a ranked JSON manifest.

stdlib only (urllib) — no pip dependencies required.
"""

import json
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

USER_AGENT = "LocalBizRecon/1.0 (market-research; contact: recon@local)"

# Search regions: (label, south, west, north, east)
# DeKalb County core + corridor towns extending east toward Chicago.
REGIONS = [
    ("DeKalb / Sycamore / Cortland (county core)", 41.85, -88.82, 42.02, -88.62),
    ("Genoa / Kingston / Kirkland (north county)", 42.02, -88.85, 42.12, -88.62),
    ("Sandwich / Somonauk / Waterman (south county)", 41.63, -88.85, 41.78, -88.55),
]

# Vertical -> Overpass tag selectors (regex on value).
VERTICALS = {
    "restaurant":   ('amenity', '^(restaurant|fast_food|cafe|bar|pub|ice_cream)$'),
    "food_retail":  ('shop',    '^(bakery|butcher|greengrocer|deli|confectionery)$'),
    "beauty":       ('shop',    '^(hairdresser|beauty|nails)$'),
    "auto":         ('shop',    '^(car_repair|tyres|car_parts|car)$'),
    "health":       ('amenity', '^(dentist|doctors|veterinary|pharmacy|clinic)$'),
    "fitness":      ('leisure', '^(fitness_centre|sports_centre)$'),
    "retail":       ('shop',    '^(florist|jewelry|hardware|clothes|gift|furniture|optician|shoes|pet)$'),
    "prof_services":('office',  '^(lawyer|accountant|insurance|estate_agent|tax_advisor)$'),
}


def build_query(south, west, north, east):
    bbox = f"({south},{west},{north},{east})"
    clauses = []
    for key, val in VERTICALS.values():
        clauses.append(f'  nwr["{key}"~"{val}"]{bbox};')
    # craft = trades (electrician, plumber, hvac, etc.)
    clauses.append(f'  nwr["craft"]{bbox};')
    body = "\n".join(clauses)
    return f"[out:json][timeout:120];\n(\n{body}\n);\nout center tags;"


def run_query(query):
    data = urllib.parse.urlencode({"data": query}).encode()
    last_err = None
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(2):
            try:
                req = urllib.request.Request(
                    endpoint, data=data,
                    headers={"User-Agent": USER_AGENT,
                             "Accept": "application/json"},
                )
                with urllib.request.urlopen(req, timeout=180) as resp:
                    return json.loads(resp.read().decode())
            except urllib.error.HTTPError as e:
                last_err = f"HTTP {e.code} from {endpoint}"
                if e.code == 429:
                    time.sleep(8)
                else:
                    time.sleep(3)
            except Exception as e:  # noqa
                last_err = f"{type(e).__name__}: {e} ({endpoint})"
                time.sleep(3)
        print(f"  ! endpoint failed ({last_err}), trying next...", file=sys.stderr)
    raise RuntimeError(f"All Overpass endpoints failed. Last: {last_err}")


def classify(tags):
    for vert, (key, _) in VERTICALS.items():
        if key in tags:
            return vert, tags.get(key, "")
    if "craft" in tags:
        return "trade", tags.get("craft", "")
    return "other", ""


def get_website(tags):
    for k in ("website", "contact:website", "url", "website:en"):
        if tags.get(k):
            return tags[k].strip()
    # facebook-only counts as "weak" presence, not a real site
    return ""


def get_social(tags):
    out = {}
    for k in ("contact:facebook", "facebook", "contact:instagram",
              "instagram", "contact:twitter"):
        if tags.get(k):
            out[k.replace("contact:", "")] = tags[k]
    return out


def get_phone(tags):
    for k in ("phone", "contact:phone", "phone:mobile", "contact:mobile"):
        if tags.get(k):
            return tags[k].strip()
    return ""


def get_email(tags):
    for k in ("email", "contact:email"):
        if tags.get(k):
            return tags[k].strip()
    return ""


def address(tags):
    parts = [
        tags.get("addr:housenumber", ""),
        tags.get("addr:street", ""),
    ]
    line1 = " ".join(p for p in parts if p).strip()
    city = tags.get("addr:city", "")
    state = tags.get("addr:state", "")
    zipc = tags.get("addr:postcode", "")
    full = ", ".join(p for p in [line1, city, f"{state} {zipc}".strip()] if p)
    return {"line1": line1, "city": city, "state": state,
            "postcode": zipc, "full": full}


def score(rec):
    """Higher = better web-design lead (independent, reachable, underserved)."""
    s = 0
    reasons = []
    if not rec["website"]:
        s += 4; reasons.append("no website")
    if rec["social"] and not rec["website"]:
        s += 1; reasons.append("social-only presence")
    if rec["phone"]:
        s += 2; reasons.append("phone reachable")
    if rec["email"]:
        s += 1; reasons.append("email reachable")
    if rec["address"]["full"]:
        s += 1; reasons.append("full address")
    if rec["is_chain"]:
        s -= 8; reasons.append("chain/brand (deprioritized)")
    if rec["name"] in ("", "?"):
        s -= 5; reasons.append("no name")
    return s, reasons


def load_status_overrides(out_dir):
    """Load dated corrections that supersede stale discovery-source fields."""
    path = out_dir / "current-status-overrides.json"
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    records = payload.get("records", {})
    if not isinstance(records, dict):
        raise ValueError(f"{path}: records must be an object keyed by OSM id")
    return records


def apply_status_override(rec, override):
    """Merge a dated correction while retaining the discovery-source fields."""
    source_snapshot = {
        "name": rec["name"],
        "website": rec["website"],
    }
    rec["name"] = override["observed_name"]
    rec["website"] = override["website"]
    rec["source_snapshot"] = source_snapshot
    rec["website_status"] = {
        "checked_on": override["checked_on"],
        "status": "verified live",
        "surface": override["surface"],
        "name_basis": override["name_basis"],
        "account_authority": override["account_authority"],
        "relationship": override["relationship"],
    }
    rec["outreach_status"] = override["outreach_status"]


def finalize_record(rec, override=None):
    """Apply any durable correction, then score and annotate the record."""
    if override:
        apply_status_override(rec, override)
    lead_score, reasons = score(rec)
    rec["lead_score"] = lead_score
    if override:
        rec["lead_score_status"] = (
            "recomputed after the dated website correction; "
            "not outreach authorization"
        )
        override_reasons = []
        if not rec["source_snapshot"]["website"] and rec["website"]:
            override_reasons.append(
                "source snapshot had no website tag; "
                "dated current-status override applied"
            )
        override_reasons.extend(
            [
                f"live {rec['website_status']['surface']} verified "
                f"{rec['website_status']['checked_on']}",
                "live-surface name style observed; canonical style not owner-confirmed",
                "account authority and client relationship unknown",
            ]
        )
        reasons = override_reasons + reasons
    rec["audit"] = reasons
    return rec


def main():
    out_dir = Path(__file__).resolve().parent.parent / "data"
    out_dir.mkdir(exist_ok=True)
    status_overrides = load_status_overrides(out_dir)

    seen = {}
    for label, s, w, n, e in REGIONS:
        print(f"[recon] querying region: {label} ...", file=sys.stderr)
        q = build_query(s, w, n, e)
        result = run_query(q)
        elements = result.get("elements", [])
        print(f"[recon]   -> {len(elements)} raw elements", file=sys.stderr)
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name") or tags.get("operator") or ""
            if not name:
                continue
            vert, subtype = classify(tags)
            lat = el.get("lat") or el.get("center", {}).get("lat")
            lon = el.get("lon") or el.get("center", {}).get("lon")
            key = (name.lower().strip(), round(lat or 0, 4), round(lon or 0, 4))
            if key in seen:
                continue
            website = get_website(tags)
            osm_id = f"{el['type']}/{el['id']}"
            rec = {
                "osm_id": osm_id,
                "name": name,
                "vertical": vert,
                "subtype": subtype,
                "lat": lat,
                "lon": lon,
                "website": website,
                "social": get_social(tags),
                "phone": get_phone(tags),
                "email": get_email(tags),
                "opening_hours": tags.get("opening_hours", ""),
                "cuisine": tags.get("cuisine", ""),
                "address": address(tags),
                "is_chain": bool(tags.get("brand") or tags.get("brand:wikidata")),
                "region": label,
            }
            override = status_overrides.get(osm_id)
            seen[key] = finalize_record(rec, override)
        time.sleep(2)  # be polite to Overpass between regions

    records = sorted(seen.values(),
                     key=lambda r: (r["lead_score"], r["name"]), reverse=True)

    # Summary stats
    total = len(records)
    no_site = sum(1 for r in records if not r["website"])
    by_vert = {}
    by_vert_nosite = {}
    for r in records:
        by_vert[r["vertical"]] = by_vert.get(r["vertical"], 0) + 1
        if not r["website"]:
            by_vert_nosite[r["vertical"]] = by_vert_nosite.get(r["vertical"], 0) + 1

    manifest = {
        "generated_for": "DeKalb County, IL + corridor toward Chicago",
        "record_basis": (
            "OpenStreetMap discovery snapshot with dated manual status "
            "corrections; aggregate stats reflect the checked-in manifest "
            "after known corrections, not a complete live re-audit"
        ),
        "regions": [r[0] for r in REGIONS],
        "stats": {
            "total_businesses": total,
            "without_website": no_site,
            "without_website_pct": round(100 * no_site / total, 1) if total else 0,
            "by_vertical": by_vert,
            "without_website_by_vertical": by_vert_nosite,
        },
        "targets": records,
    }

    out_path = out_dir / "targets.json"
    out_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"\n[recon] DONE. {total} businesses, {no_site} without a website "
          f"({manifest['stats']['without_website_pct']}%).", file=sys.stderr)
    print(f"[recon] manifest -> {out_path}", file=sys.stderr)
    print("\n[recon] No-website prospects by vertical:", file=sys.stderr)
    for v, c in sorted(by_vert_nosite.items(), key=lambda x: -x[1]):
        print(f"   {v:14s} {c:3d}  (of {by_vert.get(v,0)} total)", file=sys.stderr)
    print("\n[recon] Top 12 leads:", file=sys.stderr)
    for r in records[:12]:
        print(f"   [{r['lead_score']:+d}] {r['name']}  "
              f"({r['vertical']}/{r['subtype']})  "
              f"{'NO SITE' if not r['website'] else r['website'][:40]}  "
              f"{r['phone']}", file=sys.stderr)


if __name__ == "__main__":
    import urllib.parse  # noqa  (used in run_query)
    main()
