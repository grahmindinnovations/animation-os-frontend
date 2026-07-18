import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateCharacter } from "@/features/character/api/characterApi";
import { fetchJob, isJobFinished } from "@/features/jobs/api/jobsApi";
import { getErrorMessage } from "@/lib/api";
import type { Character } from "@/types";

interface CharacterPanelProps {
  projectId: string;
  character?: Character;
}

export function CharacterPanel({ projectId, character }: CharacterPanelProps) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState(character?.source_prompt ?? "A brave bunny with a red scarf");
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
      queryClient.invalidateQueries({ queryKey: ["character", projectId] });
      setActiveJobId(null);
    }
    if (job.status === "failed") {
      setError(job.error ?? "Character generation failed");
      setActiveJobId(null);
    }
  }, [job, projectId, queryClient]);

  const generateMutation = useMutation({
    mutationFn: () => generateCharacter(projectId, prompt.trim()),
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
          <UserRound className="h-5 w-5 text-[var(--color-accent-cyan)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Character</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Generate once, reuse in every scene — stored in Compass as <code>characters</code>
          </p>
        </div>
      </div>

      {!character && (
        <div className="space-y-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your main character..."
            disabled={isGenerating}
          />
          <Button onClick={() => generateMutation.mutate()} disabled={!prompt.trim() || isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate character
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {character && (
        <div className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-0.5 text-xs">
              {character.character_code}
            </span>
            <span className="font-medium">{character.name}</span>
            {character.role && (
              <span className="text-[var(--color-muted-foreground)]">· {character.role}</span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Detail label="Hair / fur" value={character.appearance.hair} />
            <Detail label="Eyes" value={character.appearance.eyes} />
            <Detail label="Skin" value={character.appearance.skin} />
            <Detail label="Body" value={character.appearance.body} />
            <Detail label="Clothes" value={character.appearance.clothes} />
            {character.appearance.accessories && (
              <Detail label="Accessories" value={character.appearance.accessories} />
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {character.voice && <Detail label="Voice" value={character.voice} />}
            {character.personality && <Detail label="Personality" value={character.personality} />}
            {character.animation_style && <Detail label="Animation" value={character.animation_style} />}
            {character.walking_style && <Detail label="Walk" value={character.walking_style} />}
          </div>

          <p className="text-xs text-[var(--color-muted-foreground)]">
            Regenerate story below to inject this character into every scene.
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
