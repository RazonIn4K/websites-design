import json
import unittest
from pathlib import Path

from recon import overpass_recon


ROOT = Path(__file__).resolve().parent.parent
FLAMINGO_OSM_ID = "way/327347626"


class CurrentStatusOverrideTests(unittest.TestCase):
    def test_flamingo_override_supersedes_stale_source_fields(self):
        override = overpass_recon.load_status_overrides(ROOT / "data")[
            FLAMINGO_OSM_ID
        ]
        self.assertNotIn("name", override)
        self.assertEqual(
            override["observed_name"], "Flamingo Restaurant & Ice Cream"
        )
        record = {
            "name": "Flamengo Restaurant and Ice Cream",
            "website": "",
            "social": {},
            "phone": "+1 815-901-0049",
            "email": "",
            "address": {"full": "1029 Pleasant Street, DeKalb, IL 60115"},
            "is_chain": False,
        }

        overpass_recon.finalize_record(record, override)

        self.assertEqual(record["name"], "Flamingo Restaurant & Ice Cream")
        self.assertEqual(
            record["website"], "https://flamingorestaurantdekalb.com/"
        )
        self.assertEqual(record["source_snapshot"]["website"], "")
        self.assertIn("not owner-confirmed", record["website_status"]["name_basis"])
        self.assertEqual(record["website_status"]["account_authority"], "unknown")
        self.assertIn("not a confirmed client", record["website_status"]["relationship"])
        self.assertEqual(record["lead_score"], 3)
        self.assertIn("not outreach authorization", record["lead_score_status"])
        self.assertEqual(
            record["audit"][:4],
            [
                "source snapshot had no website tag; dated current-status override applied",
                "live branded EatStreet-powered ordering site verified 2026-08-11",
                "live-surface name style observed; canonical style not owner-confirmed",
                "account authority and client relationship unknown",
            ],
        )
        self.assertNotIn("no website", record["audit"])

    def test_checked_in_manifest_matches_current_override_contract(self):
        manifest = json.loads((ROOT / "data" / "targets.json").read_text())
        records = manifest["targets"]
        flamingo = next(r for r in records if r["osm_id"] == FLAMINGO_OSM_ID)

        self.assertEqual(
            manifest["stats"]["without_website"],
            sum(not r["website"] for r in records),
        )
        self.assertEqual(
            manifest["stats"]["without_website_by_vertical"]["restaurant"],
            sum(r["vertical"] == "restaurant" and not r["website"] for r in records),
        )
        self.assertEqual(flamingo["lead_score"], 3)
        self.assertIn(
            "not owner-confirmed", flamingo["website_status"]["name_basis"]
        )
        self.assertEqual(flamingo["website_status"]["account_authority"], "unknown")
        self.assertTrue(flamingo["outreach_status"].startswith("hold"))
        self.assertEqual(
            [(r["lead_score"], r["name"]) for r in records],
            sorted(
                [(r["lead_score"], r["name"]) for r in records], reverse=True
            ),
        )

        prospect_report = (ROOT / "data" / "PROSPECTS.md").read_text()
        self.assertNotIn("| +7 | Flamengo Restaurant", prospect_report)
        self.assertIn("Flamingo current-status correction", prospect_report)
        self.assertIn("not owner-confirmed canonical naming", prospect_report)


if __name__ == "__main__":
    unittest.main()
