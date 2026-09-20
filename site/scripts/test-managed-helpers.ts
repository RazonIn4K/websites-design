/** Thin re-exports so the test script can call publish ops cleanly. */
export {
  activateRevision,
  activateRevisionAsync,
  rollbackPublication,
  rollbackPublicationAsync,
} from "../lib/platform/publish";

export function resetOverlaysSafe() {
  // placeholder — tests import resetRegistryOverlays directly
}
