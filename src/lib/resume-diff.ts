import type { LockedResume, Tailorable } from '../api/types';
import { diffWords, type DiffPart } from './diff';

export type Status = 'same' | 'changed' | 'added' | 'removed';

export interface TextChange {
  status: Status;
  parts: DiffPart[];
}

export interface SkillChange {
  group: string;
  status: Status;
  kept: string[];
  added: string[];
  removed: string[];
  reordered: boolean;
}

export interface Section {
  id: string;
  title: string;
  meta?: string;
  texts: TextChange[];
  skills: SkillChange[];
  /** The tailored bullets are in a different order than the master's. */
  reordered?: boolean;
  /** How many things in this section differ from the master resume. */
  changes: number;
}

export interface ResumeChanges {
  sections: Section[];
  total: number;
}

const norm = (text: string) => text.trim().replace(/\s+/g, ' ');

function textChange(before: string, after: string): TextChange {
  if (norm(before) === norm(after))
    return { status: 'same', parts: [{ kind: 'same', text: after }] };
  // A near-total rewrite reads better as old text then new text than as interleaved words.
  if (similarity(before, after) < 0.35) {
    return {
      status: 'changed',
      parts: [
        { kind: 'del', text: before },
        { kind: 'same', text: ' ' },
        { kind: 'add', text: after },
      ],
    };
  }
  return { status: 'changed', parts: diffWords(before, after) };
}

const added = (text: string): TextChange => ({
  status: 'added',
  parts: [{ kind: 'add', text }],
});
const removed = (text: string): TextChange => ({
  status: 'removed',
  parts: [{ kind: 'del', text }],
});

function similarity(a: string, b: string): number {
  const wa = new Set(norm(a).toLowerCase().split(' '));
  const wb = new Set(norm(b).toLowerCase().split(' '));
  let shared = 0;
  wa.forEach((w) => wb.has(w) && shared++);
  return shared / (wa.size + wb.size - shared || 1);
}

type Bullet = Tailorable['experience'][number]['bullets'][number];

/**
 * Pairs each tailored bullet with its master bullet: same id first, then identical
 * text, then the most similar unused one (at least half the words in common).
 * Bullets left over are shown as added or removed.
 */
function compareBullets(
  before: Bullet[],
  after: Bullet[]
): { texts: TextChange[]; reordered: boolean } {
  const used = new Set<number>();
  const pairs: (number | null)[] = after.map(() => null);

  after.forEach((bullet, i) => {
    const byId =
      bullet.id !== undefined
        ? before.findIndex((b, j) => !used.has(j) && b.id === bullet.id)
        : -1;
    const idx =
      byId >= 0
        ? byId
        : before.findIndex(
            (b, j) => !used.has(j) && norm(b.text) === norm(bullet.text)
          );
    if (idx >= 0) {
      pairs[i] = idx;
      used.add(idx);
    }
  });

  after.forEach((bullet, i) => {
    if (pairs[i] !== null) return;
    let best = -1;
    let bestScore = 0.5;
    before.forEach((b, j) => {
      if (used.has(j)) return;
      const score = similarity(b.text, bullet.text);
      if (score >= bestScore) {
        best = j;
        bestScore = score;
      }
    });
    if (best >= 0) {
      pairs[i] = best;
      used.add(best);
    }
  });

  const matched = pairs.filter((idx): idx is number => idx !== null);
  const reordered = matched.some((idx, i) => i > 0 && idx < matched[i - 1]);

  const result = after.map((bullet, i) =>
    pairs[i] === null
      ? added(bullet.text)
      : textChange(before[pairs[i] as number].text, bullet.text)
  );
  before.forEach((b, j) => {
    if (!used.has(j)) result.push(removed(b.text));
  });
  return { texts: result, reordered };
}

const lower = (items: string[]) => items.map((i) => i.toLowerCase());

function compareSkills(
  before: Tailorable['skills'],
  after: Tailorable['skills']
): { rows: SkillChange[]; groupsReordered: boolean } {
  const find = (list: Tailorable['skills'], name: string) =>
    list.find((g) => g.group.toLowerCase() === name.toLowerCase());

  const rows: SkillChange[] = after.map((group) => {
    const old = find(before, group.group);
    if (!old) {
      return {
        group: group.group,
        status: 'added',
        kept: [],
        added: group.items,
        removed: [],
        reordered: false,
      };
    }
    const oldLower = lower(old.items);
    const newLower = lower(group.items);
    const addedItems = group.items.filter(
      (i) => !oldLower.includes(i.toLowerCase())
    );
    const removedItems = old.items.filter(
      (i) => !newLower.includes(i.toLowerCase())
    );
    const kept = group.items.filter((i) => oldLower.includes(i.toLowerCase()));
    const keptInOld = old.items.filter((i) =>
      newLower.includes(i.toLowerCase())
    );
    const reordered = kept.some(
      (item, i) => item.toLowerCase() !== keptInOld[i].toLowerCase()
    );
    const same =
      addedItems.length === 0 && removedItems.length === 0 && !reordered;
    return {
      group: group.group,
      status: same ? 'same' : 'changed',
      kept,
      added: addedItems,
      removed: removedItems,
      reordered,
    };
  });

  before.forEach((old) => {
    if (!find(after, old.group)) {
      rows.push({
        group: old.group,
        status: 'removed',
        kept: [],
        added: [],
        removed: old.items,
        reordered: false,
      });
    }
  });

  const common = after
    .filter((g) => find(before, g.group))
    .map((g) => g.group.toLowerCase());
  const commonOld = before
    .filter((g) => find(after, g.group))
    .map((g) => g.group.toLowerCase());
  const groupsReordered = common.some((name, i) => name !== commonOld[i]);
  return { rows, groupsReordered };
}

const countText = (texts: TextChange[]) =>
  texts.filter((t) => t.status !== 'same').length;
const countSkills = (skills: SkillChange[]) =>
  skills.filter((s) => s.status !== 'same').length;

export function compareResumes(
  before: Tailorable,
  after: Tailorable,
  locked: LockedResume
): ResumeChanges {
  const sections: Section[] = [];

  const headline = [textChange(before.headline ?? '', after.headline ?? '')];
  sections.push({
    id: 'headline',
    title: 'Headline',
    texts: headline,
    skills: [],
    changes: countText(headline),
  });

  const summary = [textChange(before.summary ?? '', after.summary ?? '')];
  sections.push({
    id: 'summary',
    title: 'Summary',
    texts: summary,
    skills: [],
    changes: countText(summary),
  });

  const roleIds = [
    ...after.experience.map((r) => r.id),
    ...before.experience
      .map((r) => r.id)
      .filter((id) => !after.experience.some((r) => r.id === id)),
  ];
  roleIds.forEach((id) => {
    const old = before.experience.find((r) => r.id === id);
    const now = after.experience.find((r) => r.id === id);
    const { texts, reordered } = compareBullets(
      old?.bullets ?? [],
      now?.bullets ?? []
    );
    const role = locked.experience.find((r) => r.id === id);
    sections.push({
      id: `role-${id}`,
      title: role ? role.title : id,
      meta: role?.company,
      texts,
      skills: [],
      reordered,
      changes: countText(texts) + (reordered ? 1 : 0),
    });
  });

  const projectIds = [
    ...after.projects.map((p) => p.id),
    ...before.projects
      .map((p) => p.id)
      .filter((id) => !after.projects.some((p) => p.id === id)),
  ];
  projectIds.forEach((id) => {
    const old = before.projects.find((p) => p.id === id);
    const now = after.projects.find((p) => p.id === id);
    const text =
      old && now
        ? textChange(old.description, now.description)
        : now
        ? added(now.description)
        : removed(old?.description ?? '');
    const project = locked.projects.find((p) => p.id === id);
    sections.push({
      id: `project-${id}`,
      title: project?.name ?? id,
      meta: 'Project',
      texts: [text],
      skills: [],
      changes: countText([text]),
    });
  });

  const { rows, groupsReordered } = compareSkills(before.skills, after.skills);
  sections.push({
    id: 'skills',
    title: 'Skills',
    meta: groupsReordered ? 'Groups reordered' : undefined,
    texts: [],
    skills: rows,
    changes: countSkills(rows) + (groupsReordered ? 1 : 0),
  });

  return { sections, total: sections.reduce((sum, s) => sum + s.changes, 0) };
}
