import { Download, Film } from "lucide-react";

import { storageUrl } from "@/lib/storage";
import type { RenderHistory } from "@/types";

interface ChatVideoCardProps {
  render: RenderHistory;
  storyTitle?: string;
  characterName?: string;
}

export function ChatVideoCard({ render, storyTitle, characterName }: ChatVideoCardProps) {
  return (
    <div className="chat-box overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <Film className="h-4 w-4 text-[var(--color-accent-cyan)]" />
        <span className="text-sm font-medium">Your animation</span>
      </div>
      <div className="border-b border-white/10 bg-black">
        <video
          className="aspect-video w-full object-contain"
          controls
          playsInline
          src={storageUrl(render.url)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0 text-xs text-[var(--color-muted-foreground)]">
          {storyTitle && <p className="truncate font-medium text-[var(--color-foreground)]">{storyTitle}</p>}
          <p>
            {render.duration_seconds.toFixed(1)}s · {render.scene_count} scene{render.scene_count === 1 ? "" : "s"}
            {characterName ? ` · ${characterName}` : ""}
          </p>
        </div>
        <a
          href={storageUrl(render.url)}
          download={render.filename}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-[var(--color-secondary)] px-3 py-2 text-xs text-[var(--color-accent-cyan)] transition-colors hover:border-white/25 hover:bg-[var(--color-secondary)]/80"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>
    </div>
  );
}
