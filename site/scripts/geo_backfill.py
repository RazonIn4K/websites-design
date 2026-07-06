#!/usr/bin/env python3
"""Backfill real OpenStreetMap coordinates into client copy.json files.

Phase 1 (default):  query the Overpass API for each business, apply strict
name-match rules, and write decisions to a results JSON (no file edits).
Phase 2 (--apply):  insert "lat"/"lon" (and "cuisine" when OSM has it) into
the business object of each confidently matched file, preserving the file's
existing indent and newline style.

Coordinates come ONLY from matched OSM elements — never from third-party
geocoders. Businesses that cannot be confidently matched are left untouched.
"""

import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

CLIENTS = Path(__file__).resolve().parents[1] / "content" / "clients"
# Public Overpass API instances, tried in order; rotate on connection failure.
# (overpass-api.de and the kumi/private.coffee mirrors were unreachable at run
# time; maps.mail.ru is a standard planet-wide Overpass instance.)
ENDPOINTS = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
USER_AGENT = "LBG-geo-backfill/1.0 (contact: jack.gerber@caird-capital.com)"

SLUGS = [
    "all-chocolate-kitchen", "andersons-toyshop", "arcada-theater",
    "astro-fun-world", "beidelman-furniture", "celidan-florist",
    "costello-jewelry", "elite-boba", "envision-dance", "flavor-spice",
    "geneva-winery", "growing-place", "kiss-the-sky", "kramer-photography",
    "lindsays-cobbler", "lisle-lanes", "mad-batter-bakery",
    "naperville-running", "nona-jos", "noon-whistle-brewing",
    "pottery-bayou", "prairie-path-cycles", "riddlebox-escape",
    "sapphire-tattoo", "schmaltz-deli", "suburban-music", "victory-mma",
    "yellow-bird-books",
]

# Illinois plausibility bounding box (per task spec).
IL_BBOX = (36.9, -91.6, 42.6, -87.0)  # minlat, minlon, maxlat, maxlon

# Approximate city centers, used ONLY as a search window / sanity radius for
# candidate filtering — output coordinates always come from the OSM element.
CITY_CENTERS = {
    "Naperville": (41.750, -88.153),
    "Geneva": (41.887, -88.305),
    "St. Charles": (41.914, -88.309),
    "Aurora": (41.757, -88.314),
    "Batavia": (41.850, -88.313),
    "Lisle": (41.801, -88.075),
    "Wheaton": (41.866, -88.107),
}
SANITY_RADIUS_KM = 30.0

# ---------------------------------------------------------------- matching

NAME_SYNONYMS = [
    (r"\btheatre\b", "theater"),
    (r"\bphotographers?\b", "photography"),
    (r"\bcompany\b", "co"),
    (r"\bincorporated\b", "inc"),
    (r"\bmixed martial arts\b", "mma"),
    (r"\bdelicatessen\b", "deli"),
    (r"\bsaint\b", "st"),
]

STOPWORDS = {"the", "and", "of", "a", "at", "in", "co", "inc", "llc", "company"}

STREET_SYNONYMS = {
    "street": "st", "avenue": "ave", "road": "rd", "boulevard": "blvd",
    "drive": "dr", "lane": "ln", "court": "ct", "place": "pl",
    "north": "n", "south": "s", "east": "e", "west": "w",
    "route": "rte", "illinois": "il", "saint": "st", "highway": "hwy",
}


def norm_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = s.replace("’", "'").lower()
    s = s.replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    for pat, rep in NAME_SYNONYMS:
        s = re.sub(pat, rep, s)
    s = re.sub(r"^the\s+", "", s)
    return re.sub(r"\s+", " ", s).strip()


def names_match(biz: str, osm: str) -> bool:
    a, b = norm_name(biz), norm_name(osm)
    if not a or not b:
        return False
    return a in b or b in a


def norm_street(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", " ", s.lower())
    words = [STREET_SYNONYMS.get(w, w) for w in s.split()]
    return " ".join(words)


def street_of_address(address: str) -> str:
    """Drop the leading house number (incl. grid styles like 25w471, 4S100)."""
    parts = address.split()
    if parts and re.match(r"^\d+[a-zA-Z]?\d*$", parts[0]):
        parts = parts[1:]
    return norm_street(" ".join(parts))


def streets_match(file_street: str, osm_street: str) -> bool:
    a, b = file_street, norm_street(osm_street)
    if not a or not b:
        return False
    return a == b or a in b or b in a


def ovp_escape_token(tok: str) -> str:
    low = tok.lower()
    if low in ("and", "&"):
        return "(and|&)"
    if low in ("theater", "theatre"):
        return "theat(er|re)"
    return re.escape(tok)


def ovp_name_regex(name: str) -> str:
    """Flexible Overpass regex for the full business name."""
    tokens = re.findall(r"[A-Za-z0-9]+", name.replace("&", " and "))
    return "[^a-zA-Z0-9]{0,3}".join(ovp_escape_token(t) for t in tokens)


def distinctive_token(name: str, city: str) -> str | None:
    city_words = {w.lower().rstrip(".") for w in city.split()}
    toks = [
        t for t in re.findall(r"[A-Za-z0-9]+", name)
        if t.lower() not in STOPWORDS and t.lower() not in city_words
        and len(t) >= 4
    ]
    if not toks:
        return None
    return max(toks, key=len)  # ties -> first occurrence


# ---------------------------------------------------------------- overpass

_endpoint_idx = 0


def overpass(query: str) -> list[dict]:
    global _endpoint_idx
    data = urllib.parse.urlencode({"data": query}).encode()
    for attempt in range(8):
        url = ENDPOINTS[_endpoint_idx % len(ENDPOINTS)]
        req = urllib.request.Request(
            url, data=data,
            headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
        try:
            with urllib.request.urlopen(req, timeout=150) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            time.sleep(3.2)  # be polite between successful queries
            return payload.get("elements", [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("    429 rate-limited; backing off 30s", flush=True)
                time.sleep(30)
            elif e.code in (502, 504):
                print(f"    {e.code} from Overpass; retrying in 15s",
                      flush=True)
                time.sleep(15)
            else:
                print(f"    HTTP {e.code} from {url}; rotating endpoint",
                      flush=True)
                _endpoint_idx += 1
                time.sleep(5)
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            print(f"    network error on {url} ({e}); rotating endpoint",
                  flush=True)
            _endpoint_idx += 1
            time.sleep(5)
    raise RuntimeError("Overpass gave up after 8 attempts")


_area_cache: dict[str, list[int]] = {}


def city_area_ids(city: str) -> list[int]:
    """Resolve the city's administrative-boundary relation(s) inside the
    Illinois bbox once, and derive Overpass area ids (3600000000 + rel id).
    Scoping by relation bbox avoids scanning same-named cities worldwide."""
    if city in _area_cache:
        return _area_cache[city]
    minlat, minlon, maxlat, maxlon = IL_BBOX
    q = (
        '[out:json][timeout:60];'
        f'relation["name"="{city}"]["boundary"="administrative"]'
        f'["admin_level"~"8|9"]({minlat},{minlon},{maxlat},{maxlon});'
        'out tags 10;'
    )
    ids = []
    center = CITY_CENTERS.get(city)
    for el in overpass(q):
        if el.get("type") != "relation":
            continue
        tags = el.get("tags") or {}
        state_ok = tags.get("addr:state") in (None, "IL")
        if state_ok:
            ids.append(3600000000 + el["id"])
    print(f"  area ids for {city}: {ids}", flush=True)
    _area_cache[city] = ids
    return ids


def q_area(city: str, regex: str) -> str | None:
    ids = city_area_ids(city)
    if not ids:
        return None
    id_list = ",".join(str(i) for i in ids)
    return (
        '[out:json][timeout:90];'
        f'area(id:{id_list})->.a;'
        f'nwr["name"~"{regex}",i](area.a);'
        'out center 40;'
    )


def q_around(city: str, regex: str) -> str | None:
    center = CITY_CENTERS.get(city)
    if not center:
        return None
    lat, lon = center
    return (
        '[out:json][timeout:60];'
        f'nwr["name"~"{regex}",i](around:25000,{lat},{lon});'
        'out center 40;'
    )


# ---------------------------------------------------------------- pipeline

def element_center(el: dict):
    if el.get("type") == "node":
        return el.get("lat"), el.get("lon")
    c = el.get("center") or {}
    return c.get("lat"), c.get("lon")


def km_between(lat1, lon1, lat2, lon2) -> float:
    # small-angle approximation is plenty for a 30 km sanity radius
    dy = (lat1 - lat2) * 111.32
    dx = (lon1 - lon2) * 111.32 * 0.744  # cos(~41.9 deg)
    return (dx * dx + dy * dy) ** 0.5


def collect_candidates(elements: list[dict], biz_name: str, city: str):
    minlat, minlon, maxlat, maxlon = IL_BBOX
    center = CITY_CENTERS.get(city)
    out = []
    for el in elements:
        tags = el.get("tags") or {}
        osm_name = tags.get("name")
        if not osm_name or not names_match(biz_name, osm_name):
            continue
        lat, lon = element_center(el)
        if lat is None or lon is None:
            continue
        if not (minlat <= lat <= maxlat and minlon <= lon <= maxlon):
            continue
        if center and km_between(lat, lon, *center) > SANITY_RADIUS_KM:
            continue
        out.append({
            "osm": f'{el["type"]}/{el["id"]}',
            "name": osm_name,
            "lat": lat,
            "lon": lon,
            "street": tags.get("addr:street", ""),
            "city": tags.get("addr:city", ""),
            "cuisine": tags.get("cuisine", ""),
            "ntags": len(tags),
        })
    return out


def cluster(cands: list[dict]) -> list[list[dict]]:
    clusters: list[list[dict]] = []
    for c in cands:
        for cl in clusters:
            if km_between(c["lat"], c["lon"], cl[0]["lat"], cl[0]["lon"]) < 0.4:
                cl.append(c)
                break
        else:
            clusters.append([c])
    return clusters


def pick_from_cluster(cl: list[dict]) -> dict:
    # prefer the element carrying address tags, then the richest one
    return sorted(cl, key=lambda c: (bool(c["street"]), c["ntags"]), reverse=True)[0]


def resolve(slug: str, biz: dict) -> dict:
    name, city = biz["name"], biz["city"]
    file_street = street_of_address(biz["address"])
    full_rx = ovp_name_regex(name)
    tok = distinctive_token(name, city)
    attempts = [("area+full", q_area(city, full_rx))]
    if tok and tok.lower() != norm_name(name):
        attempts.append(("area+token", q_area(city, re.escape(tok))))
    attempts.append(("around+full", q_around(city, full_rx)))
    if tok:
        attempts.append(("around+token", q_around(city, re.escape(tok))))

    seen_queries = set()
    for label, query in attempts:
        if query is None or query in seen_queries:
            continue
        seen_queries.add(query)
        print(f"  [{label}] querying...", flush=True)
        elements = overpass(query)
        cands = collect_candidates(elements, name, city)
        if not cands:
            continue
        clusters = cluster(cands)
        if len(clusters) == 1:
            chosen = pick_from_cluster(clusters[0])
            return {"status": "matched", "via": label, "chosen": chosen,
                    "clusters": len(clusters)}
        street_cl = [cl for cl in clusters
                     if any(streets_match(file_street, c["street"]) for c in cl)]
        if len(street_cl) == 1:
            keep = [c for c in street_cl[0]
                    if streets_match(file_street, c["street"])] or street_cl[0]
            chosen = pick_from_cluster(keep)
            return {"status": "matched", "via": label + "+street",
                    "chosen": chosen, "clusters": len(clusters)}
        return {"status": "skipped",
                "reason": f"ambiguous: {len(clusters)} distinct locations, "
                          f"street tiebreak failed",
                "candidates": [pick_from_cluster(cl) for cl in clusters]}
    return {"status": "skipped", "reason": "no OSM name match found"}


# ---------------------------------------------------------------- apply

def cuisine_display(raw: str) -> str:
    first = raw.split(";")[0].strip()
    return first.replace("_", " ").title()


def apply_result(slug: str, chosen: dict) -> dict:
    path = CLIENTS / slug / "copy.json"
    raw = path.read_bytes()
    text = raw.decode("utf-8")
    nl = "\r\n" if "\r\n" in text else "\n"

    data = json.loads(text)
    if "lat" in data["business"] and "lon" in data["business"]:
        return {"slug": slug, "written": False, "note": "already has lat/lon"}

    m = list(re.finditer(r'("mapsQuery": ".*?")(\r?\n)(  \})', text))
    if len(m) != 1:
        raise RuntimeError(f"{slug}: expected 1 mapsQuery anchor, found {len(m)}")
    m = m[0]

    insert = f',{nl}    "lat": {chosen["lat"]},{nl}    "lon": {chosen["lon"]}'
    added_cuisine = None
    if chosen.get("cuisine") and "cuisine" not in data["business"]:
        added_cuisine = cuisine_display(chosen["cuisine"])
        insert += f',{nl}    "cuisine": "{added_cuisine}"'

    new_text = text[:m.end(1)] + insert + text[m.end(1):]
    path.write_bytes(new_text.encode("utf-8"))

    # validate
    reparsed = json.loads(path.read_text(encoding="utf-8"))
    b = reparsed["business"]
    assert b["lat"] == chosen["lat"] and b["lon"] == chosen["lon"]
    return {"slug": slug, "written": True, "cuisine": added_cuisine}


# ---------------------------------------------------------------- main

def main():
    results_path = Path(sys.argv[sys.argv.index("--results") + 1]) \
        if "--results" in sys.argv else Path("geo_results.json")

    if "--apply" in sys.argv:
        results = json.loads(results_path.read_text(encoding="utf-8"))
        written = 0
        for slug, res in results.items():
            if res["status"] != "matched":
                print(f"{slug}: SKIPPED ({res.get('reason','')})")
                continue
            out = apply_result(slug, res["chosen"])
            if out["written"]:
                written += 1
            c = f' cuisine={out.get("cuisine")}' if out.get("cuisine") else ""
            print(f'{slug}: wrote {res["chosen"]["lat"]},{res["chosen"]["lon"]}'
                  f'{c} ({out.get("note","ok")})')
        print(f"\n{written} files modified")
        return

    slugs = SLUGS
    if "--slugs" in sys.argv:
        slugs = sys.argv[sys.argv.index("--slugs") + 1].split(",")

    results = {}
    if results_path.exists():
        results = json.loads(results_path.read_text(encoding="utf-8"))
    for slug in slugs:
        if results.get(slug, {}).get("status") == "matched":
            print(f"{slug}: already resolved, skipping", flush=True)
            continue
        biz = json.loads((CLIENTS / slug / "copy.json")
                         .read_text(encoding="utf-8"))["business"]
        print(f"{slug}: {biz['name']} ({biz['city']}, {biz['state']})",
              flush=True)
        try:
            res = resolve(slug, biz)
        except Exception as e:  # keep going; report as skipped
            res = {"status": "skipped", "reason": f"error: {e}"}
        results[slug] = res
        if res["status"] == "matched":
            ch = res["chosen"]
            print(f'  -> MATCH [{res["via"]}] "{ch["name"]}" {ch["osm"]} '
                  f'({ch["lat"]}, {ch["lon"]}) cuisine={ch["cuisine"] or "-"}',
                  flush=True)
        else:
            print(f'  -> SKIP: {res["reason"]}', flush=True)
        results_path.write_text(
            json.dumps(results, indent=2, ensure_ascii=False),
            encoding="utf-8")
    print(f"\nresults written to {results_path}")


if __name__ == "__main__":
    main()
