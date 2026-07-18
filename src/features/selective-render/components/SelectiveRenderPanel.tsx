import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Loader2, RefreshCw, Shirt } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchJob, isJobFinished } from "@/features/jobs/api/jobsApi";
import {
  fetchShots,
  patchCharacterSelective,
  previewCharacterRegen,
  syncShots,
} from "@/features/selective-render/api/selectiveRenderApi";
import { getErrorMessage } from "@/lib/api";
import type { Character, SelectiveRegenPreview } from "@/types";

interface SelectiveRenderPanelProps {
  projectId: string;
  character?: Character;
}

export function SelectiveRenderPanel({ projectId, character }: SelectiveRenderPanelProps) {
  const queryClient = useQueryClient();
  const [clothes, setClothes] = useState(character?.appearance.clothes ?? "");
  const [preview, setPreview] = useState<SelectiveRegenPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    setClothes(character?.appearance.clothes ?? "");
    setPreview(null);
  }, [character?.appearance.clothes]);

  const { data: shots = [], isLoading: shotsLoading } = useQuery({
    queryKey: ["shots", projectId],
    queryFn: () => fetchShots(projectId),
    enabled: Boolean(projectId && character),
  });

  const producedCount = shots.filter((shot) => shot.production_status === "produced").length;

  const { data: job, isError: jobPollError } = useQuery({
    queryKey: ["job", activeJobId],
    queryFn: () => fetchJob(activeJobId!),
    enabled: Boolean(activeJobId),
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current || isJobFinished(current)) return false;
      return 500;
    },
  });

  useEffect(() => {
    if (jobPollError && activeJobId) {
      setError("Job finished but status could not be loaded — refresh the page.");
      setActiveJobId(null);
    }
  }, [jobPollError, activeJobId]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!job) return;
    if (job.status === "completed") {
      const regenerated = (job.result?.regenerated_shots as string[] | undefined) ?? [];
      setSuccessMessage(
        regenerated.length > 0
          ? `Done — regenerated ${regenerated.join(", ")} only. Other shots unchanged.`
          : "Selective regen completed.",
      );
      queryClient.invalidateQueries({ queryKey: ["shots", projectId] });
      queryClient.invalidateQueries({ queryKey: ["production", projectId] });
      queryClient.invalidateQueries({ queryKey: ["character", projectId] });
      setActiveJobId(null);
      setPreview(null);
      setError(null);
    }
    if (job.status === "failed") {
      setError(job.error ?? "Selective regen failed");
      setActiveJobId(null);
    }
  }, [job, projectId, queryClient]);

  const syncShotsMutation = useMutation({
    mutationFn: () => syncShots(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shots", projectId] });
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const previewMutation = useMutation({
    mutationFn: () => previewCharacterRegen(projectId, clothes.trim()),
    onSuccess: (result) => {
      setPreview(result);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const applyMutation = useMutation({
    mutationFn: () => patchCharacterSelective(projectId, clothes.trim()),
    onSuccess: (created) => {
      setSuccessMessage(null);
      setActiveJobId(created.id);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["character", projectId] });
      void queryClient.fetchQuery({ queryKey: ["job", created.id], queryFn: () => fetchJob(created.id) });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const isRunning =
    applyMutation.isPending ||
    Boolean(
      activeJobId &&
        (!job || job.status === "queued" || job.status === "running"),
    );
  const clothesChanged = Boolean(character && clothes.trim() !== character.appearance.clothes);
  const needsShotSync = !shotsLoading && shots.length === 0;
  const needsProduction = !needsShotSync && producedCount === 0;

  return (
    <section className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
          <GitBranch className="h-5 w-5 text-[var(--color-accent-cyan)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Selective render</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Change clothes, regen only produced shots — others stay untouched
          </p>
        </div>
      </div>

      {character && (
        <ol className="space-y-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4 text-sm text-[var(--color-muted-foreground)]">
          <li className={shots.length > 0 ? "text-emerald-400" : ""}>
            1. Build shot graph {shots.length > 0 ? `(${shots.length} shots)` : "— required first"}
          </li>
          <li className={producedCount > 0 ? "text-emerald-400" : ""}>
            2. Produce scene 1 {producedCount > 0 ? "(Shot_001 ready)" : "— so something can regen"}
          </li>
          <li>3. Change clothes → Preview → Apply</li>
        </ol>
      )}

      {needsShotSync && character && (
        <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-amber-200">No shots yet</p>
          <p className="text-[var(--color-muted-foreground)]">
            Your story exists but the shot graph was never built. Click below once, then produce scene 1.
          </p>
          <Button
            variant="secondary"
            onClick={() => syncShotsMutation.mutate()}
            disabled={syncShotsMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${syncShotsMutation.isPending ? "animate-spin" : ""}`} />
            Build shot graph
          </Button>
        </div>
      )}

      {needsProduction && character && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium text-amber-200">Shots exist, but none are produced yet</p>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            Scroll to the Production panel and run <strong>Produce scene 1</strong> first.
          </p>
        </div>
      )}

      {character && !needsShotSync && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
              New clothes (replace the whole field)
            </label>
            <Input
              value={clothes}
              onChange={(e) => {
                setClothes(e.target.value);
                setPreview(null);
              }}
              placeholder="bright red shirt"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => previewMutation.mutate()}
              disabled={!clothesChanged || previewMutation.isPending || isRunning || producedCount === 0}
            >
              Preview affected shots
            </Button>
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={
                !clothesChanged ||
                !preview ||
                preview.affected_shots.length === 0 ||
                isRunning
              }
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shirt className="h-4 w-4" />}
              Apply & regen affected shots
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {successMessage && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {successMessage} Re-export MP4 in the Render panel to preview the change.
        </p>
      )}

      {preview && (
        <div className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4 text-sm">
          <p>
            Changed: <span className="font-medium">{preview.changed_fields.join(", ")}</span>
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            {preview.affected_shots.length} affected · {preview.unchanged_shots.length} unchanged
          </p>
          {preview.affected_shots.length === 0 && preview.unchanged_shots.length > 0 && (
            <p className="text-amber-300">
              No produced shots to regen — produce scene 1 in the Production panel first.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {preview.affected_shots.map((shot) => (
              <span
                key={shot.id}
                className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs"
              >
                {shot.shot_code} · regen
              </span>
            ))}
            {preview.unchanged_shots.map((shot) => (
              <span
                key={shot.id}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-0.5 text-xs text-[var(--color-muted-foreground)]"
              >
                {shot.shot_code} · keep
              </span>
            ))}
          </div>
        </div>
      )}

      {shots.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {shots.map((shot) => (
            <div
              key={shot.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{shot.shot_code}</span>
                <StatusBadge status={shot.production_status} />
              </div>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                Scene {shot.scene_order} · depends on {shot.dependencies.join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = status === "produced" ? "produced" : "pending";
  return (
    <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-0.5 text-xs">
      {label}
    </span>
  );
}
