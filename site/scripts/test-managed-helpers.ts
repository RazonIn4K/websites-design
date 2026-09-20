/** Thin re-exports so the test script can call publish ops cleanly. */
import {
  activateRevision as _activateRevision,
  activateRevisionAsync as _activateRevisionAsync,
  rollbackPublication as _rollbackPublication,
  rollbackPublicationAsync as _rollbackPublicationAsync,
} from "../lib/platform/publish";
import type { SiteRecord } from "../lib/platform/types";

export {
  _activateRevision as activateRevision,
  _rollbackPublication as rollbackPublication,
};

export async function activateRevisionAsync(
  siteId: string,
  revisionId: string,
  actor = "operator"
): Promise<SiteRecord> {
  const result = await _activateRevisionAsync(siteId, revisionId, actor);
  return result.site;
}

export async function rollbackPublicationAsync(
  siteId: string,
  toRevisionId?: string,
  actor = "operator"
): Promise<SiteRecord> {
  const result = await _rollbackPublicationAsync(siteId, toRevisionId, actor);
  return result.site;
}

export function resetOverlaysSafe() {
  // placeholder — tests import resetRegistryOverlays directly
}
