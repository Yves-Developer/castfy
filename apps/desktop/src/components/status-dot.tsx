import type { SessionStatus } from '../lib/bridge';
import { STATUS_LABEL } from '../lib/library';

/**
 * State reads at a glance rather than only in the text: a run in progress
 * pulses, a failure is solid red, an abandoned folder is grey. Colour is
 * semantic here and independent of any accent.
 */
const TONE: Record<SessionStatus, string> = {
  complete: 'bg-emerald-500',
  recording: 'bg-amber-500 animate-pulse',
  failed: 'bg-red-500',
  abandoned: 'bg-muted-foreground/50',
};

export default function StatusDot({ status }: { status: SessionStatus }) {
  return (
    <span
      aria-label={STATUS_LABEL[status]}
      className={`size-1.5 flex-none rounded-full ${TONE[status]}`}
      role="img"
      title={STATUS_LABEL[status]}
    />
  );
}
