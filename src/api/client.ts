import { parseTailorResponse } from '../lib/tailor-result';
import type { RenderRequest, TailorResult, Template } from './types';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const UNREACHABLE =
  "Can't reach the API. Start fitly-api on port 4000, then try again.";

export const isAbort = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

function pickMessage(body: unknown): string | null {
  if (typeof body === 'string') return body;
  if (typeof body !== 'object' || body === null) return null;
  const record = body as Record<string, unknown>;
  if (typeof record.message === 'string') return record.message;
  if (typeof record.error === 'string') return record.error;
  if (typeof record.error === 'object' && record.error !== null)
    return pickMessage(record.error);
  return null;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError(UNREACHABLE, 0);
  }
  if (response.ok) return response;

  let message: string | null = null;
  try {
    message = pickMessage(await response.json());
  } catch {
    // Not JSON (for example the dev proxy when the API is down).
  }
  if (!message && response.status >= 500) message = UNREACHABLE;
  throw new ApiError(
    message ?? `Request failed (${response.status}).`,
    response.status
  );
}

const json = (body: unknown, signal?: AbortSignal): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
  signal,
});

export async function fetchTemplates(
  signal?: AbortSignal
): Promise<Template[]> {
  const response = await send('/api/templates', { signal });
  return (await response.json()) as Template[];
}

export async function tailorResume(
  jobText: string,
  signal?: AbortSignal
): Promise<TailorResult> {
  // The API accepts the pasted page as plain text, so no field names to guess.
  const response = await send('/api/tailor', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: jobText,
    signal,
  });
  return parseTailorResponse(await response.json());
}

export async function fetchPreview(
  request: RenderRequest,
  signal?: AbortSignal
): Promise<string> {
  const response = await send('/api/render/preview', json(request, signal));
  return response.text();
}

export async function fetchPdf(
  request: RenderRequest
): Promise<{ blob: Blob; fileName: string }> {
  const response = await send('/api/render', json(request));
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const fileName =
    /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? 'Resume.pdf';
  return { blob: await response.blob(), fileName };
}
