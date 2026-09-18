/** Thin re-exports so the test script can call publish ops cleanly. */
export {
  activateRevision,
  rollbackPublication,
} from "../lib/platform/publish";

export function resetOverlaysSafe() {
  // placeholder — tests import resetRegistryOverlays directly
}
