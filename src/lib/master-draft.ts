import type { MasterResume } from '../api/types';

/** Ids only need to be unique inside the resume. */
export const newId = (prefix: string) =>
  `${prefix}${Math.random().toString(36).slice(2, 8)}`;

export function emptyMaster(): MasterResume {
  return {
    schemaVersion: 1,
    locked: {
      basics: { fullName: '', email: '', phone: '', location: '' },
      links: { github: '', linkedin: '', portfolio: '' },
      education: [],
      experience: [],
      projects: [],
    },
    tailorable: { experience: [], projects: [], skills: [] },
  };
}

const trim = (value?: string) => (value ?? '').trim();
const optional = (value?: string) => trim(value) || undefined;
const nonEmpty = <T>(items: T[]): T[] | undefined =>
  items.length > 0 ? items : undefined;

/**
 * The version of the draft that is previewed, downloaded and saved: values are
 * trimmed, blank rows are dropped, and optional fields left empty are omitted.
 * Required fields stay as empty strings so the server can point at them.
 */
export function withoutBlanks(master: MasterResume): MasterResume {
  const { locked, tailorable } = master;

  const experience = locked.experience
    .filter((role) => trim(role.title) || trim(role.company))
    .map((role) => ({
      id: role.id,
      title: trim(role.title),
      company: trim(role.company),
      location: trim(role.location),
      startDate: trim(role.startDate),
      endDate: trim(role.endDate),
      tagline: optional(role.tagline),
      url: optional(role.url),
    }));
  const projects = locked.projects
    .filter((project) => trim(project.name))
    .map((project) => ({
      id: project.id,
      name: trim(project.name),
      technologies: project.technologies.map(trim).filter(Boolean),
      url: optional(project.url),
    }));
  const roleIds = new Set(experience.map((role) => role.id));
  const projectIds = new Set(projects.map((project) => project.id));

  return {
    schemaVersion: 1,
    locked: {
      basics: {
        fullName: trim(locked.basics.fullName),
        email: trim(locked.basics.email),
        phone: trim(locked.basics.phone),
        location: trim(locked.basics.location),
      },
      links: {
        github: trim(locked.links.github),
        linkedin: trim(locked.links.linkedin),
        portfolio: trim(locked.links.portfolio),
        other: nonEmpty(
          (locked.links.other ?? [])
            .filter((link) => trim(link.url))
            .map((link) => ({ label: trim(link.label), url: trim(link.url) }))
        ),
      },
      education: locked.education
        .filter((item) => trim(item.institution) || trim(item.area))
        .map((item) => ({
          institution: trim(item.institution),
          area: trim(item.area),
          qualification: optional(item.qualification),
          location: optional(item.location),
          endDate: trim(item.endDate),
        })),
      experience,
      projects,
      hobbies: nonEmpty((locked.hobbies ?? []).map(trim).filter(Boolean)),
      certifications: nonEmpty(
        (locked.certifications ?? [])
          .filter((item) => trim(item.name))
          .map((item) => ({
            name: trim(item.name),
            issuer: optional(item.issuer),
            date: optional(item.date),
            url: optional(item.url),
          }))
      ),
      languages: nonEmpty(
        (locked.languages ?? [])
          .filter((item) => trim(item.language))
          .map((item) => ({
            language: trim(item.language),
            proficiency: optional(item.proficiency),
          }))
      ),
      awards: nonEmpty(
        (locked.awards ?? [])
          .filter((item) => trim(item.title))
          .map((item) => ({
            title: trim(item.title),
            issuer: optional(item.issuer),
            date: optional(item.date),
          }))
      ),
    },
    tailorable: {
      headline: optional(tailorable.headline),
      summary: optional(tailorable.summary),
      experience: tailorable.experience
        .filter((entry) => roleIds.has(entry.id))
        .map((entry) => ({
          id: entry.id,
          bullets: entry.bullets
            .filter((bullet) => trim(bullet.text))
            .map((bullet) => ({ id: bullet.id, text: trim(bullet.text) })),
        }))
        .filter((entry) => entry.bullets.length > 0),
      projects: tailorable.projects
        .filter((entry) => projectIds.has(entry.id) && trim(entry.description))
        .map((entry) => ({
          id: entry.id,
          description: trim(entry.description),
        })),
      skills: tailorable.skills
        .map((group) => ({
          id: group.id,
          group: trim(group.group),
          items: group.items.map(trim).filter(Boolean),
        }))
        .filter((group) => group.group && group.items.length > 0),
    },
  };
}
