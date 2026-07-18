import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, RectangleHorizontal, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { fetchJob, isJobFinished } from "@/features/jobs/api/jobsApi";
import { generateStory } from "@/features/story/api/storyApi";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface GenerationBarProps {
  className?: string;
}

export function GenerationBar({ className }: GenerationBarProps) {
  const { projectId } = useParams<{ projectId?: string }>();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

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
    if (!job || !projectId) return;
    if (job.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["story", projectId] });
      setActiveJobId(null);
      setPrompt("");
    }
    if (job.status === "failed") {
      setError(job.error ?? "Story generation failed");
      setActiveJobId(null);
    }
  }, [job, projectId, queryClient]);

  const generateMutation = useMutation({
    mutationFn: () => generateStory(projectId!, prompt.trim()),
    onSuccess: (created) => {
      setActiveJobId(created.id);
      setError(null);
      queryClient.setQueryData(["job", created.id], created);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const isGenerating =
    generateMutation.isPending ||
    Boolean(job && (job.status === "queued" || job.status === "running"));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !prompt.trim() || isGenerating) return;
    generateMutation.mutate();
  };

  return (
    <div className={cn("shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4", className)}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2.5 py-1 text-xs text-[var(--color-muted-foreground)]">
            <RectangleHorizontal className="h-3 w-3" />
            16:9
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2.5 py-1 text-xs text-[var(--color-muted-foreground)]">
            <Clock className="h-3 w-3" />
            Story outline
          </span>
          <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2.5 py-1 text-xs text-[var(--color-muted-foreground)]">
            Phase 2
          </span>
        </div>

        <div className="flex items-end gap-3">
          <div className="relative min-w-0 flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your animation story — characters, setting, mood, lesson..."
              rows={2}
              disabled={!projectId || isGenerating}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-secondary)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="shrink-0 gap-2 px-6"
            disabled={!projectId || !prompt.trim() || isGenerating}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate
          </Button>
        </div>

        {!projectId && (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Open a project to generate a story outline (Projects → select a project).
          </p>
        )}

        {projectId && isGenerating && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-accent-cyan)]">
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating story — watch <code className="text-[var(--color-foreground)]">stories</code>,{" "}
            <code className="text-[var(--color-foreground)]">episodes</code>,{" "}
            <code className="text-[var(--color-foreground)]">scenes</code> in Compass
          </p>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
          <Sparkles className="h-3 w-3 text-[var(--color-accent-cyan)]" />
          Character → World → Story (all saved in MongoDB Compass)
        </p>
      </form>
    </div>
  );
}
