import type { JobDetail } from '../api/jobs';

// Builds the text that goes into the Tailor paste box.
export function buildTailorText(job: JobDetail): string {
  // Some Hacker News posts have the placeholder "Location" instead of a company.
  const company =
    job.company && !/^(?:location|unknown company)$/i.test(job.company)
      ? job.company
      : null;
  const header = [job.title, company, job.regionNote ?? job.location]
    .filter(Boolean)
    .join('\n');
  return `${header}\n\n${job.descriptionText.trim()}`;
}
