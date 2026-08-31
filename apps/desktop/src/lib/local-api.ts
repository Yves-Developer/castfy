/**
 * Stand-in for @castfy/backend/api.
 *
 * The ported components address the backend as `api.jobs.list` and hand that
 * reference to a client. Keeping that shape — with plain string ids instead of
 * Convex function references — lets the local client dispatch on a name while
 * every call site stays exactly as the dashboard wrote it.
 */
export const api = {
  jobs: {
    list: 'jobs.list',
    get: 'jobs.get',
    cancel: 'jobs.cancel',
    enqueue: 'jobs.enqueue',
    events: 'jobs.events',
  },
  projects: {
    list: 'projects.list',
    get: 'projects.get',
    create: 'projects.create',
    rename: 'projects.rename',
    remove: 'projects.remove',
  },
} as const;

export type FunctionRef = string;
