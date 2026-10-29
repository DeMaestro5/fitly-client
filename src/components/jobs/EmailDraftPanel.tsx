import { useEmailDraft } from '../../hooks/useEmailDraft';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { EmailDraftEditor } from './EmailDraftEditor';

export function EmailDraftPanel({
  jobId,
  onOpenedMail,
}: {
  jobId: string;
  onOpenedMail: () => void;
}) {
  const { draft, busy, error, generate } = useEmailDraft(jobId);

  return (
    <section className='rounded-2xl bg-black/[0.03] p-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-xs font-medium uppercase tracking-wide text-muted'>
            Application email
          </p>
          <p className='text-sm text-muted'>
            A short draft written from your master resume.
          </p>
        </div>
        {!draft && (
          <Button
            variant='secondary'
            busy={busy}
            onClick={() => void generate()}
          >
            {busy ? 'Drafting…' : 'Draft email'}
          </Button>
        )}
      </div>

      {error && (
        <div className='mt-3'>
          <Alert tone='error' title='Could not draft the email'>
            {error}
          </Alert>
        </div>
      )}

      {draft && (
        <div className='mt-3'>
          <EmailDraftEditor
            draft={draft}
            onRedraft={() => void generate()}
            onOpenedMail={onOpenedMail}
          />
        </div>
      )}
    </section>
  );
}
