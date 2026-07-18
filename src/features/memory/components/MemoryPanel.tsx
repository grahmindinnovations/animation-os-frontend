import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchMemory, syncMemory } from "@/features/memory/api/memoryApi";
import { getErrorMessage } from "@/lib/api";
import type { EpisodeEvent, StoryTree } from "@/types";

interface MemoryPanelProps {
  projectId: string;
  story?: StoryTree;
}

export function MemoryPanel({ projectId, story }: MemoryPanelProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: memory } = useQuery({
    queryKey: ["memory", projectId],
    queryFn: () => fetchMemory(projectId),
    enabled: Boolean(projectId && story),
  });

  const syncMutation = useMutation({
    mutationFn: () => syncMemory(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory", projectId] });
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const events = memory?.episode_events ?? [];

  return (
    <section className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
          <Brain className="h-5 w-5 text-[var(--color-accent-cyan)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Memory</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Scene continuity stored in Compass as <code>episode_events</code> and{" "}
            <code>character_memory</code>
          </p>
        </div>
      </div>

      {!story && (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Generate a story first — memory syncs automatically after each story job.
        </p>
      )}

      {story && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            Re-sync memory
          </Button>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Scene 2+ dialogue references the previous scene event
          </span>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {events.length > 0 && (
        <div className="space-y-2">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}

      {story && events.length === 0 && (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No memory yet — regenerate the story or click Re-sync memory.
        </p>
      )}
    </section>
  );
}

function EventRow({ event }: { event: EpisodeEvent }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-0.5 text-xs">
          Scene {event.scene_order}
        </span>
        <span className="font-medium">{event.title}</span>
      </div>
      <p className="mt-2 text-[var(--color-muted-foreground)]">{event.summary}</p>
      {event.dialogue && <p className="mt-1 italic">&ldquo;{event.dialogue}&rdquo;</p>}
    </div>
  );
}
