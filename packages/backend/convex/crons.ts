import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

/**
 * Runs more often than LEASE_MS (90s) so a dead worker's job returns to the
 * queue promptly rather than waiting out a long reap window.
 */
crons.interval(
  "reap expired job leases",
  { seconds: 60 },
  api.jobs.reapExpiredLeases,
  {}
);

export default crons;
