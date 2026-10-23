import type { JobStatus } from '../../api/jobs';
import { Badge, type BadgeTone } from '../ui/Badge';

const MAP: Record<JobStatus, { tone: BadgeTone; label: string }> = {
  new: { tone: 'marker', label: 'New' },
  saved: { tone: 'sky', label: 'Saved' },
  applied: { tone: 'emerald', label: 'Applied' },
  skipped: { tone: 'neutral', label: 'Skipped' },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const { tone, label } = MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}
