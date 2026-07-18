import { Play } from "lucide-react";

import { formatVideoLabel } from "@/features/studio/utils/videoSessionStorage";
import { storageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { RenderHistory } from "@/types";

interface VideoLibraryGridProps {
  renders: RenderHistory[];
  activeRenderId?: string;
  onSelect: (render: RenderHistory) => void;
}

export function VideoLibraryGrid({ renders, activeRenderId, onSelect }: VideoLibraryGridProps) {
  if (renders.length === 0) {
    return (
      <div className="chat-box mx-auto max-w-3xl p-8 text-center">
        <p className="text-sm font-medium">No videos in your library yet</p>
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Use Chat to generate your first export — it will show up here as a thumbnail.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
      {renders.map((render) => (
        <button
          key={render.id}
          type="button"
          onClick={() => onSelect(render)}
          className={cn(
            "chat-box group overflow-hidden text-left transition-transform hover:scale-[1.01]",
            activeRenderId === render.id && "ring-1 ring-[var(--color-accent-cyan)]/50",
          )}
        >
          <div className="relative aspect-video bg-black">
            <video
              className="h-full w-full object-cover opacity-80"
              muted
              playsInline
              preload="metadata"
              src={storageUrl(render.url)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/50">
                <Play className="h-4 w-4 fill-white text-white" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 rounded-md border border-white/15 bg-black/60 px-2 py-0.5 text-[10px] text-white">
              {render.duration_seconds.toFixed(1)}s
            </span>
          </div>
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-medium">{formatVideoLabel(render.filename, render.created_at)}</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)]">
              {render.scene_count} scene{render.scene_count === 1 ? "" : "s"} · click to edit
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
