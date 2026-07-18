import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clapperboard, FileAudio, Film, ImageIcon, Loader2, Music2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchJob, isJobFinished } from "@/features/jobs/api/jobsApi";
import { fetchProduction, produceScene } from "@/features/production/api/productionApi";
import { getErrorMessage } from "@/lib/api";
import { storageUrl } from "@/lib/storage";
import type { ProductionBundle, StoryTree } from "@/types";

interface ProductionPanelProps {
  projectId: string;
  story?: StoryTree;
  hasCharacter: boolean;
  hasWorld: boolean;
}

export function ProductionPanel({ projectId, story, hasCharacter, hasWorld }: ProductionPanelProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const firstSceneId = story?.episodes[0]?.scenes[0]?.id;
  const firstSceneTitle = story?.episodes[0]?.scenes[0]?.title;

  const { data: bundles = [] } = useQuery({
    queryKey: ["production", projectId],
    queryFn: () => fetchProduction(projectId),
    enabled: Boolean(projectId && story),
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
      queryClient.invalidateQueries({ queryKey: ["production", projectId] });
      queryClient.invalidateQueries({ queryKey: ["shots", projectId] });
      setActiveJobId(null);
    }
    if (job.status === "failed") {
      setError(job.error ?? "Production failed");
      setActiveJobId(null);
    }
  }, [job, projectId, queryClient]);

  const produceMutation = useMutation({
    mutationFn: () => produceScene(projectId, firstSceneId),
    onSuccess: (created) => {
      setActiveJobId(created.id);
      setError(null);
      queryClient.setQueryData(["job", created.id], created);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const isProducing =
    produceMutation.isPending || Boolean(job && (job.status === "queued" || job.status === "running"));

  const canProduce = Boolean(story && hasCharacter && hasWorld && firstSceneId);
  const latestBundle = bundles.find((bundle) => bundle.scene_id === firstSceneId) ?? bundles[0];

  return (
    <section className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
          <Clapperboard className="h-5 w-5 text-[var(--color-accent-cyan)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">Production</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Mock assets for scene 1 — stored in Compass as <code>assets</code>, <code>voices</code>,{" "}
            <code>music</code>
          </p>
        </div>
      </div>

      {!canProduce && (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Generate character, world, and story first. Production uses scene 1 from your outline.
        </p>
      )}

      {canProduce && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => produceMutation.mutate()} disabled={isProducing}>
            {isProducing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clapperboard className="h-4 w-4" />}
            Produce {firstSceneTitle ? `"${firstSceneTitle}"` : "scene 1"}
          </Button>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Writes placeholder PNG, clip, voice, and music to <code>storage/assets/</code>
          </span>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {latestBundle && <BundleView bundle={latestBundle} />}
    </section>
  );
}

function BundleView({ bundle }: { bundle: ProductionBundle }) {
  const image = bundle.assets.find((asset) => asset.asset_type === "image");
  const animation = bundle.assets.find((asset) => asset.asset_type === "animation");

  return (
    <div className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4">
      <p className="text-sm font-medium">Scene assets</p>

      {image && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
            <ImageIcon className="h-3.5 w-3.5" />
            Image
          </div>
          <img
            src={storageUrl(image.url)}
            alt={image.filename}
            className="max-h-40 rounded-md border border-[var(--color-border)] bg-black/40"
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {animation && <AssetRow icon={Film} label="Animation clip" asset={animation} />}
        {bundle.voice && (
          <div className="space-y-1 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <FileAudio className="h-3.5 w-3.5" />
              Voice
            </div>
            <p className="font-medium">{bundle.voice.character_name}</p>
            <p className="text-[var(--color-muted-foreground)]">&ldquo;{bundle.voice.dialogue}&rdquo;</p>
            <audio controls className="mt-2 w-full" src={storageUrl(bundle.voice.url)} />
          </div>
        )}
        {bundle.music && (
          <div className="space-y-1 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <Music2 className="h-3.5 w-3.5" />
              Music
            </div>
            <p className="font-medium">{bundle.music.title}</p>
            <p className="text-[var(--color-muted-foreground)]">{bundle.music.mood}</p>
            <audio controls className="mt-2 w-full" src={storageUrl(bundle.music.url)} />
          </div>
        )}
      </div>
    </div>
  );
}

function AssetRow({
  icon: Icon,
  label,
  asset,
}: {
  icon: typeof Film;
  label: string;
  asset: ProductionBundle["assets"][number];
}) {
  return (
    <div className="space-y-1 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-muted-foreground)]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="font-medium">{asset.filename}</p>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {(asset.size_bytes / 1024).toFixed(1)} KB · {asset.mime_type}
      </p>
      <a
        href={storageUrl(asset.url)}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-[var(--color-accent-cyan)] hover:underline"
      >
        Open file
      </a>
    </div>
  );
}
