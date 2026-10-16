export interface Tailorable {
  headline?: string;
  summary?: string;
  experience: { id: string; bullets: { id: string; text: string }[] }[];
  projects: { id: string; description: string }[];
  skills: { id: string; group: string; items: string[] }[];
}

/** Name, contact details, companies, dates: tailoring never changes these. */
export interface LockedResume {
  basics: { fullName: string; email: string; phone: string; location: string };
  links: {
    github: string;
    linkedin: string;
    portfolio: string;
    other?: { label: string; url: string }[];
  };
  education: {
    institution: string;
    area: string;
    qualification?: string;
    location?: string;
    endDate: string;
  }[];
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    tagline?: string;
    url?: string;
  }[];
  projects: {
    id: string;
    name: string;
    technologies: string[];
    url?: string;
  }[];
  hobbies?: string[];
  certifications?: {
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }[];
  languages?: { language: string; proficiency?: string }[];
  awards?: { title: string; issuer?: string; date?: string }[];
}

export interface MasterResume {
  schemaVersion: 1;
  locked: LockedResume;
  tailorable: Tailorable;
}

/** What POST /api/master-resume/import returns. The draft may be incomplete. */
export interface ImportResult {
  draft: MasterResume;
  issues: { path: string; message: string }[];
  warnings: string[];
}

export interface Template {
  id: string;
  name: string;
}

export interface RenderRequest {
  tailorable: Tailorable;
  templateId: string;
  fileName?: string;
}

export type Verdict = 'apply' | 'maybe' | 'skip';

export interface Fit {
  verdict: Verdict;
  coverage: number;
  reason: string;
}

export interface Gaps {
  matched: string[];
  missing: string[];
  /** 0-100 */
  coverage: number | null;
}

export interface TailorResult {
  tailorable: Tailorable;
  gaps: Gaps | null;
  warnings: string[];
  fit: Fit | null;
  constraints: string[];
  suggestedFileName: string;
}
