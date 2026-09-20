/**
 * Durable-state unit tests (no Next server required, no real Edge Config).
 * Run from site/: `npx tsx scripts/test-durable-state.ts`
 *
 * Tests:
 * - Per-site key write/read via mock
 * - Legacy map fallback read
 * - activateRevisionAsync failure when durable configured and write fails
 */

import assert from "node:assert/strict";
import {
  setMockActiveRevisions,
  setMockWriteShouldFail,
  getDurableActiveRevisionWithMock,
  setDurableActiveRevisionWithMock,
  getMockActiveRevisions,
} from "../lib/platform/durable-state";
import {
  activateRevisionAsync,
  PublishError,
} from "../lib/platform/publish";

async function main() {
  const { resetRegistryOverlays } = await import("../lib/platform/registry");

  console.log("1. Per-site key write updates mock correctly");
  setMockActiveRevisions({});
  setMockWriteShouldFail(null);

  const writeOk = await setDurableActiveRevisionWithMock("site_pilot_craft", "rev_003");
  assert.equal(writeOk, true, "write should succeed");
  const mock = getMockActiveRevisions();
  assert.ok(mock);
  assert.equal(mock["site_pilot_craft"], "rev_003", "mock should have updated value");

  console.log("2. Per-site key read returns correct value");
  const readValue = await getDurableActiveRevisionWithMock("site_pilot_craft");
  assert.equal(readValue, "rev_003", "read should return written value");

  console.log("3. Per-site key isolation: different sites have different values");
  await setDurableActiveRevisionWithMock("site_mccabes", "rev_001");
  assert.equal(await getDurableActiveRevisionWithMock("site_pilot_craft"), "rev_003");
  assert.equal(await getDurableActiveRevisionWithMock("site_mccabes"), "rev_001");

  console.log("4. Missing key returns null");
  assert.equal(await getDurableActiveRevisionWithMock("site_nonexistent"), null);

  console.log("5. Legacy map fallback: reads from map when per-site key missing");
  setMockActiveRevisions({
    site_legacy_only: "rev_legacy",
  });
  const legacyRead = await getDurableActiveRevisionWithMock("site_legacy_only");
  assert.equal(legacyRead, "rev_legacy", "should read from legacy map");

  console.log("6. Mock write failure: setDurableActiveRevisionWithMock returns false");
  setMockWriteShouldFail(true);
  const failedWrite = await setDurableActiveRevisionWithMock("site_pilot_craft", "rev_999");
  assert.equal(failedWrite, false, "write should fail when mockWriteShouldFail=true");
  const afterFailedWrite = getMockActiveRevisions();
  assert.ok(afterFailedWrite);
  assert.notEqual(afterFailedWrite["site_pilot_craft"], "rev_999", "value should not change on failed write");
  setMockWriteShouldFail(null);

  console.log("7. activateRevisionAsync throws PublishError when durable write fails");
  resetRegistryOverlays();
  setMockActiveRevisions({ site_pilot_craft: "rev_002" });
  setMockWriteShouldFail(true);

  let threwDurableError = false;
  let errorCode: string | undefined;
  try {
    await activateRevisionAsync("site_pilot_craft", "rev_001", "test");
  } catch (err) {
    if (err instanceof PublishError) {
      threwDurableError = true;
      errorCode = err.code;
    }
  }
  assert.equal(threwDurableError, true, "should throw PublishError on durable write failure");
  assert.equal(errorCode, "durable_write_failed", "error code should be durable_write_failed");

  setMockWriteShouldFail(null);
  setMockActiveRevisions(null);
  resetRegistryOverlays();

  console.log("8. activateRevisionAsync succeeds when durable write succeeds");
  resetRegistryOverlays();
  setMockActiveRevisions({ site_pilot_craft: "rev_002" });
  setMockWriteShouldFail(null);

  const result = await activateRevisionAsync("site_pilot_craft", "rev_001", "test");
  assert.equal(result.site.activePublishedRevisionId, "rev_001");
  assert.equal(result.durableWriteOk, true);

  const updatedMock = getMockActiveRevisions();
  assert.ok(updatedMock);
  assert.equal(updatedMock["site_pilot_craft"], "rev_001", "mock should reflect activated revision");

  setMockActiveRevisions(null);
  resetRegistryOverlays();

  console.log("9. Concurrent site updates don't clobber each other (per-site key isolation)");
  setMockActiveRevisions({});
  setMockWriteShouldFail(null);

  await Promise.all([
    setDurableActiveRevisionWithMock("site_a", "rev_a1"),
    setDurableActiveRevisionWithMock("site_b", "rev_b1"),
    setDurableActiveRevisionWithMock("site_c", "rev_c1"),
  ]);

  const finalMock = getMockActiveRevisions();
  assert.ok(finalMock);
  assert.equal(finalMock["site_a"], "rev_a1");
  assert.equal(finalMock["site_b"], "rev_b1");
  assert.equal(finalMock["site_c"], "rev_c1");

  setMockActiveRevisions(null);

  console.log("\nAll durable-state tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
