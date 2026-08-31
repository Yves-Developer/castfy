import type { Library, Run, Session } from './bridge';
import { bridge } from './bridge';
import { useLocalQuery } from './use-local-query';

/** The whole library. `undefined` while loading. */
export function useLibrary(): Library | undefined {
  return useLocalQuery<Library>(() => bridge.list(), []);
}

/** One recording, with steps and guide text. `null` once known missing. */
export function useRecording(id: string | undefined): Session | null | undefined {
  return useLocalQuery<Session | null>(
    () => (id ? bridge.get(id) : Promise.resolve(null)),
    [id]
  );
}

/** Runs this app launched, newest first. */
export function useRuns(): Run[] | undefined {
  return useLocalQuery<Run[]>(() => bridge.runs(), []);
}

export const STATUS_LABEL: Record<Session['status'], string> = {
  complete: 'Ready',
  recording: 'Recording',
  failed: 'Failed',
  abandoned: 'Abandoned',
};

export function formatDuration(ms: number | undefined): string {
  if (ms == null) return '--';
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function formatWhen(iso: string | undefined, fallbackMs: number): string {
  const date = iso ? new Date(iso) : new Date(fallbackMs);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}

/** Best available variant, in descending order of finish. */
export function preferredVariant(session: Session): string | undefined {
  return (
    session.videos.audioClean ?? session.videos.audio ?? session.videos.clean ?? session.videos.raw
  );
}
