import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Film, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchJob, isJobFinished } from "@/features/jobs/api/jobsApi";
import { fetchProduction } from "@/features/production/api/productionApi";
import { fetchLatestRenderOptional, renderEpisode } from "@/features/render/api/renderApi";
import { getErrorMessage } from "@/lib/api";
import { storageUrl } from "@/lib/storage";
import type { RenderHistory, StoryTree } from "@/types";

interface RenderPanelProps {
  projectId: string;
  story?: StoryTree;
}

export function RenderPanel({ projectId, story }: RenderPanelProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const { data: production = [] } = useQuery({
    queryKey: ["production", projectId],
    queryFn: () => fetchProduction(projectId),
    enabled: Boolean(projectId && story),
  });

  const { data: latestRender } = useQuery({
    queryKey: ["render", projectId, "latest"],
    queryFn: () => fetchLatestRenderOptional(projectId),
    enabled: Boolean(projectId),
  });

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

  useEffect(() => {
    if (!job) return;
    if (job.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["render", projectId] });
      setActiveJobId(null);
    }
    if (job.status === "failed") {
      setError(job.error ?? "Render failed");
      setActiveJobId(null);
    }
  }, [job, projectId, queryClient]);

  const renderMutation = useMutation({
    mutationFn: () => renderEpisode(projectId, story?.episodes[0]?.id),
    onSuccess: (created) => {
      setActiveJobId(created.id);
      setError(null);
      queryClient.setQueryData(["job", created.id], created);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const isRendering =
    renderMutation.isPending || Boolean(job && (job.status === "queued" || job.status === "running"));
  const canRender = Boolean(story && production.length > 0);

  return (
    <section className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
          <Film className="h-5 w-5 text-[var(--color-accent-cyan)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Render</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            FFmpeg merges produced scenes into one MP4 — stored in Compass as <code>render_history</code>
          </p>
        </div>
      </div>

      {!canRender && (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Produce scene assets first, then export episode 1 to MP4.
        </p>
      )}

      {canRender && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => renderMutation.mutate()} disabled={isRendering}>
            {isRendering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Export episode MP4
          </Button>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Uses produced scenes in order · requires FFmpeg on the backend Mac
          </span>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {latestRender && <RenderSummary render={latestRender} />}
    </section>
  );
}

function RenderSummary({ render }: { render: RenderHistory }) {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{render.filename}</span>
        <span className="text-[var(--color-muted-foreground)]">
          · {render.scene_count} scene{render.scene_count === 1 ? "" : "s"} · {render.duration_seconds.toFixed(1)}s
        </span>
        <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-0.5 text-xs">
          {render.engine}
        </span>
      </div>
      <a
        href={storageUrl(render.url)}
        download={render.filename}
        className="inline-flex items-center gap-2 text-xs text-[var(--color-accent-cyan)] hover:underline"
      >
        <Download className="h-3.5 w-3.5" />
        Download MP4
      </a>
    </div>
  );
}

export function EpisodePreview({
  story,
  characterName,
  worldName,
  latestRender,
}: {
  story?: StoryTree;
  characterName?: string;
  worldName?: string;
  latestRender?: RenderHistory;
}) {
  if (latestRender) {
    return (
      <div className="flex h-full flex-col">
        <video
          className="h-full w-full bg-black object-contain"
          controls
          playsInline
          src={storageUrl(latestRender.url)}
        />
        <div className="border-t border-[var(--color-border)] bg-[#0a0a0c] px-4 py-2 text-center text-xs text-[var(--color-muted-foreground)]">
          Latest render · {latestRender.filename} · {latestRender.duration_seconds.toFixed(1)}s
        </div>
      </div>
    );
  }

  if (story) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">Episode preview</p>
        <p className="text-lg font-semibold">{story.story.title}</p>
        <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
          {story.episodes[0]?.scenes.length ?? 0} scenes · Episode 1
          {characterName ? ` · ${characterName}` : ""}
          {worldName ? ` · ${worldName}` : ""}
        </p>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Produce scenes, then Export episode MP4 to preview here
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Describe your animation in the chat below to get started
      </p>
    </div>
  );
}
