import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchJob, isJobFinished } from "@/features/jobs/api/jobsApi";
import { generateWorld } from "@/features/world/api/worldApi";
import { getErrorMessage } from "@/lib/api";
import type { World } from "@/types";

interface WorldPanelProps {
  projectId: string;
  world?: World;
}

export function WorldPanel({ projectId, world }: WorldPanelProps) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState(world?.source_prompt ?? "A magical forest with golden sunlight");
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
    if (!job) return;
    if (job.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["world", projectId] });
      setActiveJobId(null);
    }
    if (job.status === "failed") {
      setError(job.error ?? "World generation failed");
      setActiveJobId(null);
    }
  }, [job, projectId, queryClient]);

  const generateMutation = useMutation({
    mutationFn: () => generateWorld(projectId, prompt.trim()),
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

  return (
    <section className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
          <Globe2 className="h-5 w-5 text-[var(--color-accent-cyan)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">World</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Reusable environment — stored in Compass as <code>worlds</code>
          </p>
        </div>
      </div>

      {!world && (
        <div className="space-y-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the setting — forest, beach, kitchen..."
            disabled={isGenerating}
          />
          <Button onClick={() => generateMutation.mutate()} disabled={!prompt.trim() || isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate world
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {world && (
        <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-0.5 text-xs">
              {world.world_code}
            </span>
            <span className="font-medium">{world.name}</span>
            <span className="text-[var(--color-muted-foreground)]">· {world.location_type}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Detail label="Lighting" value={world.lighting} />
            <Detail label="Weather" value={world.weather} />
            <Detail label="Props" value={world.props} />
            <Detail label="Textures" value={world.textures} />
            <Detail label="Colors" value={world.colors} />
            <Detail label="Mood" value={world.mood} />
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Regenerate story below to inject this world into every scene.
          </p>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
