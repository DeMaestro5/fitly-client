export interface Tailorable {
  headline: string;
  summary: string;
  experience: { id: string; bullets: { id?: string; text: string }[] }[];
  projects: { id: string; description: string }[];
  skills: { group: string; items: string[] }[];
}

export interface Template {
  id: string;
  name: string;
}

export interface RenderRequest {
  tailorable: Tailorable;
  templateId: string;
}

export interface Gaps {
  matched: string[];
  missing: string[];
  /** 0-100, or null when the API did not report it. */
  coverage: number | null;
}

export interface TailorResult {
  tailorable: Tailorable;
  gaps: Gaps | null;
  warnings: string[];
}
