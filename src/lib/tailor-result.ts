import type { Gaps, Tailorable, TailorResult, Fit } from '../api/types';

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
  const coverage =
    typeof value.coverage === 'number' && Number.isFinite(value.coverage)
      ? Math.min(100, Math.max(0, Math.round(value.coverage)))
      : null;
  const required = isDict(value.required) ? value.required : {};
  const preferred = isDict(value.preferred) ? value.preferred : {};
  return {
    matched: [...toStrings(required.matched), ...toStrings(preferred.matched)],
    missing: [...toStrings(required.missing), ...toStrings(preferred.missing)],
    coverage,
  };
}

function toFit(value: unknown): Fit | null {
  if (!isDict(value)) return null;
  const { verdict, coverage, reason } = value;
  if (verdict !== 'apply' && verdict !== 'maybe' && verdict !== 'skip')
    return null;
  return {
    verdict,
    coverage:
      typeof coverage === 'number' && Number.isFinite(coverage)
        ? Math.round(coverage)
        : 0,
    reason: typeof reason === 'string' ? reason : '',
  };
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

  const posting = isDict(body.posting) ? body.posting : undefined;

  return {
    tailorable,
    gaps: toGaps(body.gaps ?? body.gapsReport ?? body.gapReport),
    warnings: toStrings(body.warnings),
    fit: toFit(body.fit),
    constraints: toStrings(posting?.constraints),
    suggestedFileName:
      typeof body.suggestedFileName === 'string' &&
      body.suggestedFileName.trim()
        ? body.suggestedFileName
        : 'Resume',
  };
}
