import type { ImportResult, MasterResume } from '../api/types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isMaster = (raw: unknown): raw is MasterResume =>
  isObject(raw) &&
  isObject(raw.locked) &&
  isObject(raw.tailorable) &&
  Array.isArray(raw.tailorable.experience) &&
  Array.isArray(raw.tailorable.projects) &&
  Array.isArray(raw.tailorable.skills) &&
  isObject(raw.locked.basics) &&
  isObject(raw.locked.links) &&
  Array.isArray(raw.locked.experience) &&
  Array.isArray(raw.locked.projects) &&
  Array.isArray(raw.locked.education);

function describe(raw: unknown): string {
  return isObject(raw) ? Object.keys(raw).join(', ') || 'none' : typeof raw;
}

/** The contract for GET /api/master-resume: { schemaVersion, locked, tailorable }. */
export function parseMasterResponse(raw: unknown): MasterResume {
  if (!isMaster(raw))
    throw new Error(
      `Unexpected response from /api/master-resume. Expected "locked" and "tailorable". Received: ${describe(
        raw
      )}.`
    );
  return raw;
}

/** The contract for POST /api/master-resume/import: { draft, issues, warnings }. */
export function parseImportResponse(raw: unknown): ImportResult {
  if (!isObject(raw) || !isMaster(raw.draft))
    throw new Error(
      `Unexpected response from /api/master-resume/import. Expected "draft". Received: ${describe(
        raw
      )}.`
    );
  return {
    draft: raw.draft,
    issues: Array.isArray(raw.issues)
      ? (raw.issues as ImportResult['issues'])
      : [],
    warnings: Array.isArray(raw.warnings) ? (raw.warnings as string[]) : [],
  };
}
