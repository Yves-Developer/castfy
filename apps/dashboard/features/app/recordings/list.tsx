"use client";

import { api } from "@castfy/backend/api";
import { Badge } from "@castfy/ui/components/badge";
import { Button } from "@castfy/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@castfy/ui/components/empty";
import { Spinner } from "@castfy/ui/components/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@castfy/ui/components/table";
import { PlayIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { getConvexClient } from "@/lib/convex";

type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

interface Job {
  _id: string;
  createdAt: number;
  error?: string;
  finishedAt?: number;
  promptGoal: string;
  startedAt?: number;
  status: JobStatus;
  url: string;
  videos?: Record<string, string>;
}

const STATUS_VARIANT: Record<
  JobStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  cancelled: "outline",
  completed: "default",
  failed: "destructive",
  queued: "secondary",
  running: "secondary",
};

/** Only work that hasn't finished can be called off. */
function isCancellable(status: JobStatus): boolean {
  return status === "queued" || status === "running";
}

function firstVideo(videos: Record<string, string> | undefined): string | null {
  if (!videos) {
    return null;
  }
  return (
    videos.audioClean ?? videos.audio ?? videos.clean ?? videos.raw ?? null
  );
}

function formatElapsed(job: Job): string {
  const end = job.finishedAt ?? Date.now();
  const start = job.startedAt ?? job.createdAt;
  const seconds = Math.max(0, Math.round((end - start) / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function StatusCell({ job }: { job: Job }) {
  return (
    <div className="flex items-center gap-2">
      {job.status === "running" && <Spinner className="size-3" />}
      <Badge variant={STATUS_VARIANT[job.status]}>{job.status}</Badge>
      {job.error && (
        <span
          className="max-w-60 truncate text-muted-foreground text-xs"
          title={job.error}
        >
          {job.error}
        </span>
      )}
    </div>
  );
}

export function RecordingsList() {
  const jobs = useConvexQuery<Job[]>(api.jobs.list, { limit: 50 });
  const [cancelling, setCancelling] = useState<Set<string>>(new Set());

  const cancel = (jobId: string) => {
    setCancelling((prev) => new Set(prev).add(jobId));
    getConvexClient()
      .mutation(api.jobs.cancel, { jobId: jobId as never })
      .catch((error: unknown) => {
        console.error("Failed to cancel job:", error);
      })
      .finally(() => {
        setCancelling((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      });
  };

  if (jobs === undefined) {
    return (
      <div className="flex items-center gap-2 py-10 text-muted-foreground text-sm">
        <Spinner className="size-4" />
        Loading recordings…
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No recordings yet</EmptyTitle>
          <EmptyDescription>
            Start one from the playground and it will appear here while it runs.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Target</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const video = firstVideo(job.videos);
          return (
            <TableRow key={job._id}>
              <TableCell className="max-w-80">
                <div className="truncate font-medium text-sm" title={job.url}>
                  {job.url}
                </div>
                <div
                  className="truncate text-muted-foreground text-xs"
                  title={job.promptGoal}
                >
                  {job.promptGoal}
                </div>
              </TableCell>
              <TableCell>
                <StatusCell job={job} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm tabular-nums">
                {formatElapsed(job)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {video && (
                    <Button asChild size="sm" variant="secondary">
                      <a href={video} rel="noreferrer" target="_blank">
                        <PlayIcon className="size-3" />
                        Watch
                      </a>
                    </Button>
                  )}
                  {isCancellable(job.status) && (
                    <Button
                      disabled={cancelling.has(job._id)}
                      onClick={() => cancel(job._id)}
                      size="sm"
                      variant="ghost"
                    >
                      {cancelling.has(job._id) ? (
                        <Spinner className="size-3" />
                      ) : (
                        <XIcon className="size-3" />
                      )}
                      Cancel
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
