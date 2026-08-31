import type { Project, Session } from './bridge';
import type { Tdemo } from '@/types';

/** Coarse but readable — the card only ever shows a rough age. */
export function relativeTime(ms: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}

/** What the card's label says about where the project got to. */
function actionFor(project: Project): string {
  const status = project.session?.status;
  if (!project.sessionId) return 'Draft';
  if (status === 'recording') return 'Recording';
  if (status === 'failed') return 'Failed';
  if (status === 'abandoned') return 'Abandoned';
  return 'Ready';
}

/**
 * Projects rendered in the shape DemoCard already expects, so the card itself
 * did not have to change when the data stopped being a hardcoded array.
 */
export function projectsToDemos(projects: Project[]): Tdemo[] {
  return projects.map((project) => ({
    name: project.title,
    slug: project.id,
    updatedAt: relativeTime(project.updatedAt),
    action: actionFor(project),
    img: project.session?.thumb,
  }));
}

/** Best available variant — the most finished one. For showing a result. */
export function bestVideo(session: Session | null | undefined): string | undefined {
  if (!session) return undefined;
  return (
    session.videos.audioClean ?? session.videos.audio ?? session.videos.clean ?? session.videos.raw
  );
}

/**
 * What the studio loads for editing: the untrimmed recording.
 *
 * Deliberately the opposite preference to bestVideo. Cut ranges are measured
 * against the raw footage, so editing on top of an already-cut variant applies
 * them twice. Falls back to the finished variant only when no raw file exists.
 */
export function editingSource(session: Session | null | undefined): string | undefined {
  if (!session) return undefined;
  return session.videos.raw ?? bestVideo(session);
}
