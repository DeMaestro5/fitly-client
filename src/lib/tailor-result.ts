import type { Gaps, Tailorable, TailorResult } from '../api/types';

type Dict = Record<string, unknown>;

const isDict = (value: unknown): value is Dict =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === 'string') return item;
    if (isDict(item))
      return String(
        item.message ?? item.name ?? item.text ?? JSON.stringify(item)
      );
    return String(item);
  });
}

function isTailorable(value: unknown): value is Tailorable {
  return (
    isDict(value) &&
    Array.isArray(value.experience) &&
    Array.isArray(value.skills)
  );
}

function toGaps(value: unknown): Gaps | null {
  if (!isDict(value)) return null;
  const matched = toStrings(value.matched ?? value.matchedTechnologies);
  const missing = toStrings(value.missing ?? value.missingTechnologies);
  const raw = value.coverage ?? value.coveragePercent ?? value.coveragePct;

  let coverage: number | null = null;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    coverage = Math.round(raw <= 1 ? raw * 100 : raw);
  } else if (matched.length + missing.length > 0) {
    coverage = Math.round(
      (matched.length / (matched.length + missing.length)) * 100
    );
  }
  return { matched, missing, coverage };
}

/**
 * The only place that knows the shape of POST /api/tailor.
 * If the API changes, fix it here and nowhere else.
 */
export function parseTailorResponse(raw: unknown): TailorResult {
  const body = isDict(raw) && isDict(raw.data) ? raw.data : raw;
  if (!isDict(body)) throw new Error('Unexpected response from /api/tailor.');

  const resume = isDict(body.resume) ? body.resume : undefined;
  const tailorable = [
    body.tailorable,
    body.tailored,
    resume?.tailorable,
    resume?.tailored,
  ].find(isTailorable);

  if (!tailorable) {
    throw new Error(
      `Unexpected response from /api/tailor. Keys received: ${
        Object.keys(body).join(', ') || 'none'
      }.`
    );
  }

  return {
    tailorable,
    gaps: toGaps(body.gaps ?? body.gapsReport ?? body.gapReport),
    warnings: toStrings(body.warnings),
  };
}
