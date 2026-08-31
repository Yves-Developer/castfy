import { useEffect, useState } from 'react';
import { bridge } from './bridge';
import type { Session } from './bridge';
import type { FunctionRef } from './local-api';

/**
 * A Convex-shaped client backed by the local filesystem.
 *
 * The dashboard talks to its backend through `getConvexClient().query(...)` and
 * `useConvexQuery(...)`. Reproducing that surface — rather than rewriting every
 * component — is what let the UI port over unchanged. Underneath there is no
 * database: reads are a directory scan, writes are IPC to the main process, and
 * the "subscription" is the file watcher.
 */

type Args = Record<string, unknown>;

export interface JobRow {
  _id: string;
  createdAt: number;
  error?: string;
  finishedAt?: number;
  promptGoal: string;
  startedAt?: number;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  url?: string;
  videos?: Record<string, string>;
}

/** Session states map onto the job vocabulary the components already speak. */
const STATUS: Record<Session['status'], JobRow['status']> = {
  complete: 'completed',
  recording: 'running',
  failed: 'failed',
  abandoned: 'cancelled',
};

function toJob(session: Session): JobRow {
  return {
    _id: session.id,
    createdAt: session.startedAt ? Date.parse(session.startedAt) : session.mtime,
    error: session.error,
    finishedAt: session.completedAt ? Date.parse(session.completedAt) : undefined,
    promptGoal: session.title,
    startedAt: session.startedAt ? Date.parse(session.startedAt) : undefined,
    status: STATUS[session.status],
    url: session.startUrl,
    videos: session.videos as Record<string, string>,
  };
}

/**
 * Convex's generated client resolves a return type per function reference. There
 * is no codegen here, so these mirror its call-site looseness — the components
 * already narrow what they get back.
 */
// biome-ignore lint/suspicious/noExplicitAny: matches the generated client's shape
async function query<T = any>(ref: FunctionRef, args: Args): Promise<T> {
  switch (ref) {
    case 'jobs.list': {
      const library = await bridge.list();
      const limit = typeof args.limit === 'number' ? args.limit : library.sessions.length;
      return library.sessions.slice(0, limit).map(toJob) as T;
    }
    case 'jobs.get': {
      const session = await bridge.get(String(args.jobId));
      return (session ? toJob(session) : null) as T;
    }
    case 'projects.list':
      return (await bridge.projects()) as T;
    case 'projects.get':
      return (await bridge.project(String(args.id))) as T;
    default:
      throw new Error(`Unsupported local query: ${ref}`);
  }
}

// biome-ignore lint/suspicious/noExplicitAny: matches the generated client's shape
async function mutation<T = any>(ref: FunctionRef, args: Args): Promise<T> {
  switch (ref) {
    case 'jobs.enqueue': {
      const result = await bridge.run({
        url: String(args.url ?? ''),
        goal: String(args.promptGoal ?? ''),
        projectId: args.projectId ? String(args.projectId) : null,
        agentId: args.provider ? String(args.provider) : null,
      });
      if (!result.ok) throw new Error(result.error ?? 'Could not start the recording.');
      // The caller treats this as a job id to follow; the run id is the only
      // handle that exists before the engine creates its session folder.
      return (result.runId ?? '') as T;
    }
    case 'jobs.cancel':
      return bridge.cancel() as Promise<T>;
    case 'projects.create':
      return (await bridge.createProject(String(args.title ?? ''))) as T;
    case 'projects.rename':
      return (await bridge.renameProject(String(args.id), String(args.title ?? ''))) as T;
    case 'projects.remove':
      return (await bridge.removeProject(String(args.id))) as T;
    default:
      throw new Error(`Unsupported local mutation: ${ref}`);
  }
}

interface LocalEvent {
  seq: number;
  type: string;
  message?: string;
  data?: unknown;
}

/**
 * Rebuilds the event stream the agent sidebar expects out of the run's stdout.
 * Events accumulate and are re-delivered in full on every update, because the
 * consumer de-duplicates by `seq` and expects an append-only log.
 */
function subscribeToEvents(onChange: (events: LocalEvent[]) => void): () => void {
  const events: LocalEvent[] = [];
  let seq = 0;

  const push = (type: string, message?: string, data?: unknown) => {
    events.push({ seq: ++seq, type, message, data });
    onChange([...events]);
  };

  const offLog = bridge.onLog((chunk) => {
    for (const line of chunk.split('\n')) {
      const text = line.trim();
      if (text) push('status', text);
    }
  });

  const offDone = bridge.onDone(async ({ code, error, hint, sessionId }) => {
    if (code !== 0 || error) {
      // The agent's own words, plus context when we recognised the situation.
      push('error', [error, hint].filter(Boolean).join(' ') || `The recording failed (exit ${code}).`);
      return;
    }

    // Use the session this run actually produced rather than guessing at the
    // newest one — two runs close together would otherwise cross wires.
    const session = sessionId ? await bridge.get(sessionId).catch(() => null) : null;
    if (!session) {
      push('error', 'The run finished but its recording could not be found.');
      return;
    }

    const job = toJob(session);

    // The agent's actions only become readable when the packager writes
    // steps.json at castfy0_end, so the timeline fills in here. Without this
    // the sidebar sits on "Waiting for first action" after a successful run.
    push('completed', 'Recording complete.', {
      ...job,
      // steps.json records success as a boolean; the timeline branches on a
      // "status" string, so an unmapped step renders as neither.
      steps: (session.steps ?? []).map((step) => ({
        action: step.action,
        description: step.description,
        status: step.success === false ? 'error' : 'success',
        error: step.error,
      })),
      videoUrl: job.videos?.audioClean ?? job.videos?.clean ?? job.videos?.raw,
    });
  });

  return () => {
    offLog();
    offDone();
  };
}

function onUpdate(
  ref: FunctionRef,
  args: Args,
  callback: (value: never) => void
): () => void {
  if (ref === 'jobs.events') {
    return subscribeToEvents(callback as unknown as (e: LocalEvent[]) => void);
  }

  let active = true;
  const load = () => {
    query(ref, args)
      .then((value) => {
        if (active) callback(value as never);
      })
      .catch((error) => console.error('Local query failed:', error));
  };

  load();
  const offChange = bridge.onChange(load);

  return () => {
    active = false;
    offChange();
  };
}

const client = { query, mutation, onUpdate };

export function getConvexClient() {
  return client;
}

/**
 * Same contract as the dashboard's useConvexQuery: `undefined` until the first
 * result lands, and a re-render whenever the underlying data changes.
 */
export function useConvexQuery<T>(ref: FunctionRef, args: Args): T | undefined {
  const [data, setData] = useState<T>();
  // Re-subscribe on argument *values*, not on a fresh object literal per render.
  const argsKey = JSON.stringify(args);

  useEffect(() => {
    return onUpdate(ref, JSON.parse(argsKey) as Args, (value) => setData(value as T));
  }, [ref, argsKey]);

  return data;
}
