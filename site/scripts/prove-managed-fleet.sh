#!/usr/bin/env bash
#
# prove-managed-fleet.sh — Operator prove script for LIVE managed platform
#
# Verifies managed.razonworks.com (site_pilot_craft) and mccabes.razonworks.com (site_mccabes)
# are live, serving correct content, and that rollback API behaves honestly.
#
# Usage:
#   ./scripts/prove-managed-fleet.sh           # host checks + optional 409 honesty check
#   ./scripts/prove-managed-fleet.sh --flip    # full rev toggle cycle (~16s sleep)
#   ./scripts/prove-managed-fleet.sh --lead    # POST /api/lead smoke to one host
#   ./scripts/prove-managed-fleet.sh --flip --lead  # both
#
# Env overrides:
#   PILOT_HOST=managed.razonworks.com      (default)
#   MCCABES_HOST=mccabes.razonworks.com    (default)
#   PILOT_TITLE_ASSERT="Pilot Craft"       (substring expected in title)
#   MCCABES_TITLE_ASSERT="McCabe"          (substring expected in title)
#   OPERATOR_PUBLISH_TOKEN                  (required for rollback honesty/flip checks)
#
# Exit 1 on any failure; prints clear PASS/FAIL lines.
#
set -euo pipefail

# --- Config ------------------------------------------------------------------
PILOT_HOST="${PILOT_HOST:-managed.razonworks.com}"
MCCABES_HOST="${MCCABES_HOST:-mccabes.razonworks.com}"
PILOT_TITLE_ASSERT="${PILOT_TITLE_ASSERT:-Pilot Craft}"
MCCABES_TITLE_ASSERT="${MCCABES_TITLE_ASSERT:-McCabe}"

# Flags
DO_FLIP=false
DO_LEAD=false

for arg in "$@"; do
  case "$arg" in
    --flip) DO_FLIP=true ;;
    --lead) DO_LEAD=true ;;
    -h|--help)
      echo "Usage: $0 [--flip] [--lead]"
      echo "  --flip  Full rev_001↔rev_002 cycle with ~16s sleep (destructive)"
      echo "  --lead  POST /api/lead smoke to pilot host"
      exit 0
      ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

FAILURES=0
PASSES=0

pass() {
  echo "PASS  $1"
  ((PASSES++)) || true
}

fail() {
  echo "FAIL  $1"
  ((FAILURES++)) || true
}

# --- HTTP 200 checks ---------------------------------------------------------
echo "=== Host availability checks ==="

check_host_200() {
  local host="$1"
  local label="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://${host}/")
  if [[ "$status" == "200" ]]; then
    pass "${label} (${host}) HTTP 200"
  else
    fail "${label} (${host}) expected 200, got ${status}"
  fi
}

check_host_200 "$PILOT_HOST" "Pilot Craft"
check_host_200 "$MCCABES_HOST" "McCabe's"

# --- Title substring checks --------------------------------------------------
echo ""
echo "=== Title substring checks ==="

check_title() {
  local host="$1"
  local label="$2"
  local expected="$3"
  local html
  html=$(curl -s --max-time 15 "https://${host}/")
  if echo "$html" | grep -q "<title>.*${expected}.*</title>"; then
    pass "${label} title contains '${expected}'"
  else
    fail "${label} title missing '${expected}'"
  fi
}

check_title "$PILOT_HOST" "Pilot Craft" "$PILOT_TITLE_ASSERT"
check_title "$MCCABES_HOST" "McCabe's" "$MCCABES_TITLE_ASSERT"

# --- Rollback honesty check (409 when already active) ------------------------
if [[ -n "${OPERATOR_PUBLISH_TOKEN:-}" ]]; then
  echo ""
  echo "=== Rollback honesty check (409 when rev_002 already active) ==="

  honesty_check() {
    local host="$1"
    local site_id="$2"
    local label="$3"
    local response
    local http_code
    local body

    response=$(curl -s -w "\n%{http_code}" --max-time 15 \
      -X POST "https://${host}/api/operator/rollback" \
      -H "Authorization: Bearer ${OPERATOR_PUBLISH_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"siteId\":\"${site_id}\",\"toRevisionId\":\"rev_002\"}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [[ "$http_code" == "409" ]]; then
      if echo "$body" | grep -q '"durableWriteOk":false'; then
        pass "${label} rollback to active rev returns 409 + durableWriteOk:false"
      else
        fail "${label} got 409 but durableWriteOk not false: ${body}"
      fi
    elif [[ "$http_code" == "200" ]]; then
      # Revision was not active — this is unexpected for rev_002 in steady state
      fail "${label} expected 409 (rev_002 already active), got 200 — content may have been flipped"
    else
      fail "${label} expected 409, got HTTP ${http_code}: ${body}"
    fi
  }

  honesty_check "$PILOT_HOST" "site_pilot_craft" "Pilot Craft"
  honesty_check "$MCCABES_HOST" "site_mccabes" "McCabe's"
else
  echo ""
  echo "SKIP  Rollback honesty check (OPERATOR_PUBLISH_TOKEN not set)"
fi

# --- Full flip cycle (--flip) ------------------------------------------------
if [[ "$DO_FLIP" == true ]]; then
  if [[ -z "${OPERATOR_PUBLISH_TOKEN:-}" ]]; then
    fail "--flip requires OPERATOR_PUBLISH_TOKEN"
  else
    echo ""
    echo "=== Full flip cycle (rev_002 → rev_001 → rev_002) ==="
    
    flip_and_verify() {
      local host="$1"
      local site_id="$2"
      local label="$3"
      local v1_title="$4"
      local v2_title="$5"
      local response
      local http_code
      local body

      # Step 1: Rollback to rev_001
      echo "  ${label}: rolling back to rev_001..."
      response=$(curl -s -w "\n%{http_code}" --max-time 15 \
        -X POST "https://${host}/api/operator/rollback" \
        -H "Authorization: Bearer ${OPERATOR_PUBLISH_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"siteId\":\"${site_id}\",\"toRevisionId\":\"rev_001\"}")
      
      http_code=$(echo "$response" | tail -n1)
      body=$(echo "$response" | head -n -1)

      if [[ "$http_code" != "200" ]]; then
        fail "${label} rollback to rev_001 failed: HTTP ${http_code} — ${body}"
        return
      fi

      if ! echo "$body" | grep -q '"durableWriteOk":true'; then
        fail "${label} rev_001 rollback durableWriteOk not true"
        return
      fi

      # Step 2: Wait for Edge Config propagation
      echo "  ${label}: waiting 16s for Edge Config propagation..."
      sleep 16

      # Step 3: Verify title switched to v1
      local html
      html=$(curl -s --max-time 15 "https://${host}/")
      if echo "$html" | grep -q "<title>.*${v1_title}.*</title>"; then
        pass "${label} title switched to v1 ('${v1_title}')"
      else
        fail "${label} title did not switch to v1 (expected '${v1_title}')"
      fi

      # Step 4: Restore to rev_002
      echo "  ${label}: restoring to rev_002..."
      response=$(curl -s -w "\n%{http_code}" --max-time 15 \
        -X POST "https://${host}/api/operator/rollback" \
        -H "Authorization: Bearer ${OPERATOR_PUBLISH_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"siteId\":\"${site_id}\",\"toRevisionId\":\"rev_002\"}")
      
      http_code=$(echo "$response" | tail -n1)
      body=$(echo "$response" | head -n -1)

      if [[ "$http_code" != "200" ]]; then
        fail "${label} restore to rev_002 failed: HTTP ${http_code}"
        return
      fi

      if ! echo "$body" | grep -q '"durableWriteOk":true'; then
        fail "${label} rev_002 restore durableWriteOk not true"
        return
      fi

      # Step 5: Wait and verify title is back to v2
      echo "  ${label}: waiting 16s for Edge Config propagation..."
      sleep 16

      html=$(curl -s --max-time 15 "https://${host}/")
      if echo "$html" | grep -q "<title>.*${v2_title}.*</title>"; then
        pass "${label} title restored to v2 ('${v2_title}')"
      else
        fail "${label} title did not restore to v2 (expected '${v2_title}')"
      fi
    }

    # Only flip pilot by default (safer); McCabe's can be added if needed
    flip_and_verify "$PILOT_HOST" "site_pilot_craft" "Pilot Craft" "(v1)" "Pilot Craft Auto"
  fi
fi

# --- Lead smoke test (--lead) ------------------------------------------------
if [[ "$DO_LEAD" == true ]]; then
  echo ""
  echo "=== Lead smoke test ==="

  lead_response=$(curl -s -w "\n%{http_code}" --max-time 15 \
    -X POST "https://${PILOT_HOST}/api/lead" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Prove Script Test",
      "email": "prove-test@example.invalid",
      "phone": "555-0000",
      "message": "Automated prove-managed-fleet.sh smoke test — please ignore.",
      "lang": "en",
      "business": {"name": "Pilot Craft Auto", "city": "Sycamore", "state": "IL"}
    }')

  lead_http_code=$(echo "$lead_response" | tail -n1)
  lead_body=$(echo "$lead_response" | head -n -1)

  if [[ "$lead_http_code" == "200" ]]; then
    if echo "$lead_body" | grep -q '"ok":true'; then
      pass "Lead POST returned 200 + ok:true"
      # Check delivery status
      if echo "$lead_body" | grep -q '"mode":"delivered"'; then
        pass "Lead delivery mode: delivered"
      elif echo "$lead_body" | grep -q '"mode":"queued"'; then
        pass "Lead delivery mode: queued (webhook may be down)"
      elif echo "$lead_body" | grep -q '"mode":"failed"'; then
        fail "Lead delivery mode: failed"
      else
        echo "INFO  Lead response: ${lead_body}"
      fi
    else
      fail "Lead POST returned 200 but ok:false — ${lead_body}"
    fi
  else
    fail "Lead POST failed: HTTP ${lead_http_code} — ${lead_body}"
  fi
fi

# --- Summary -----------------------------------------------------------------
echo ""
echo "========================================"
if [[ $FAILURES -eq 0 ]]; then
  echo "PROVE PASSED  (${PASSES} checks)"
  exit 0
else
  echo "PROVE FAILED  (${FAILURES} failures, ${PASSES} passes)"
  exit 1
fi
