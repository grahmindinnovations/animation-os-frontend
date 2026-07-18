import { Download } from "lucide-react";

import { ChatInput } from "@/features/studio/components/ChatInput";
import { formatVideoLabel } from "@/features/studio/utils/videoSessionStorage";
import { storageUrl } from "@/lib/storage";
import type { Character, RenderHistory, StoryTree } from "@/types";

interface VideoEditViewProps {
  render: RenderHistory;
  story?: StoryTree;
  character?: Character;
  onSend: (text: string) => void;
  isBusy?: boolean;
}

export function VideoEditView({ render, story, character, onSend, isBusy }: VideoEditViewProps) {
  const progress = 100;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4">
      <div className="chat-box overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent-cyan)]">
              Micro-edit
            </p>
            <p className="text-sm font-medium">{formatVideoLabel(render.filename, render.created_at)}</p>
          </div>
          <a
            href={storageUrl(render.url)}
            download={render.filename}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[var(--color-secondary)] px-2.5 py-1.5 text-xs text-[var(--color-accent-cyan)] hover:border-white/25"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>

        <video
          className="aspect-video w-full bg-black object-contain"
          controls
          playsInline
          src={storageUrl(render.url)}
        />

        <div className="space-y-2 border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between text-[10px] text-[var(--color-muted-foreground)]">
            <span>Timeline</span>
            <span>{render.duration_seconds.toFixed(1)}s total</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-[var(--color-secondary)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-violet)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {character?.name ?? "Hero"} · {story?.story.title ?? "Same story world"} — edit one detail, only that part
            regens.
          </p>
        </div>
      </div>

      <ChatInput
        onSend={onSend}
        isBusy={isBusy}
        placeholder='e.g. "Change shirt to bright red" or "Export MP4"'
        submitLabel="Apply edit"
      />
    </div>
  );
}
