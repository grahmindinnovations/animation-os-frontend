import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, PlayCircle, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createJob, fetchJob, isJobFinished } from "@/features/jobs/api/jobsApi";
import { getErrorMessage } from "@/lib/api";
import type { Job } from "@/types";

const statusLabel: Record<Job["status"], string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

const statusIcon = {
  queued: Loader2,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
} as const;

export function PipelineTestCard() {
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: job } = useQuery({
    queryKey: ["job", activeJobId],
    queryFn: () => fetchJob(activeJobId!),
    enabled: Boolean(activeJobId),
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current || isJobFinished(current)) return false;
      return 1000;
    },
  });

  const runTest = useMutation({
    mutationFn: () => createJob("noop"),
    onSuccess: (created) => {
      setActiveJobId(created.id);
      setError(null);
      queryClient.setQueryData(["job", created.id], created);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const Icon = job ? statusIcon[job.status] : PlayCircle;
  const spinning = job?.status === "queued" || job?.status === "running";

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Pipeline test
          </h2>
          <p className="mt-1 max-w-lg text-sm text-[var(--color-muted-foreground)]">
            Sends a background job through Redis → Celery worker → MongoDB. Watch the{" "}
            <code className="text-xs text-[var(--color-foreground)]">jobs</code> collection in Compass.
          </p>
        </div>
        <Button onClick={() => runTest.mutate()} disabled={runTest.isPending || spinning}>
          {runTest.isPending || spinning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          Run test job
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {job && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4">
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${spinning ? "animate-spin text-[var(--color-accent-cyan)]" : job.status === "completed" ? "text-green-400" : job.status === "failed" ? "text-red-400" : "text-[var(--color-muted-foreground)]"}`} />
          <div className="min-w-0 space-y-1 text-sm">
            <p>
              Status: <span className="font-medium text-[var(--color-foreground)]">{statusLabel[job.status]}</span>
            </p>
            <p className="truncate text-xs text-[var(--color-muted-foreground)]">Job ID: {job.id}</p>
            {job.status === "completed" && job.result?.message && (
              <p className="text-[var(--color-muted-foreground)]">{String(job.result.message)}</p>
            )}
            {job.status === "failed" && job.error && <p className="text-red-400">{job.error}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
