import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeft, ChevronRight, Plus, Radio, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConsistencyVault } from "@/features/studio/components/ConsistencyVault";
import { fetchRenders } from "@/features/render/api/renderApi";
import { formatVideoLabel } from "@/features/studio/utils/videoSessionStorage";
import { cn } from "@/lib/utils";
import type { Character, RenderHistory, World } from "@/types";

interface ChannelPanelProps {
  projectId: string;
  projectName: string;
  character?: Character;
  world?: World;
  activeSessionId: string;
  draftSessionId: string;
  onSelectSession: (sessionId: string, render?: RenderHistory) => void;
  onNewVideo: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChannelPanel({
  projectId,
  projectName,
  character,
  world,
  activeSessionId,
  draftSessionId,
  onSelectSession,
  onNewVideo,
  collapsed,
  onToggleCollapse,
}: ChannelPanelProps) {
  const { data: renders = [] } = useQuery({
    queryKey: ["render", projectId, "all"],
    queryFn: () => fetchRenders(projectId),
    enabled: Boolean(projectId),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  if (collapsed) {
    return (
      <aside className="shell-frame flex h-full w-11 shrink-0 flex-col items-center bg-[var(--color-sidebar)] py-3 sm:w-12">
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Show channel panel"
          className="rounded-lg p-2 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNewVideo}
          title="New video"
          className="mt-3 rounded-lg p-2 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="mt-auto">
          <Video className="h-4 w-4 text-[var(--color-accent-cyan)]" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="shell-frame flex h-full w-[220px] shrink-0 flex-col overflow-hidden bg-[var(--color-sidebar)] sm:w-[260px]">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent-cyan)]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-muted)]">
              Channel
            </p>
          </div>
          <p className="truncate text-sm font-semibold">{projectName}</p>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Hide channel panel"
          className="shrink-0 rounded-lg p-1.5 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <Button variant="secondary" size="sm" className="w-full justify-start gap-2" onClick={onNewVideo}>
          <Plus className="h-4 w-4" />
          New video
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-muted)]">
          Videos
        </p>
        <div className="space-y-0.5 pb-2">
          <button
            type="button"
            onClick={() => onSelectSession(draftSessionId)}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
              activeSessionId === draftSessionId
                ? "bg-[var(--color-sidebar-active)] text-white"
                : "text-[var(--color-sidebar-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-foreground)]",
            )}
          >
            <span className="block truncate">Current draft</span>
            <span className="text-[10px] opacity-70">In progress</span>
          </button>

          {renders.map((render) => {
            const isActive = activeSessionId === render.id;
            return (
              <button
                key={render.id}
                type="button"
                onClick={() => onSelectSession(render.id, render)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-[var(--color-sidebar-active)] text-white"
                    : "text-[var(--color-sidebar-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-foreground)]",
                )}
              >
                <span className="block truncate">{formatVideoLabel(render.filename, render.created_at)}</span>
                <span className="text-[10px] opacity-70">
                  {render.duration_seconds.toFixed(0)}s · {render.scene_count} scene
                  {render.scene_count === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}

          {renders.length === 0 && (
            <p className="px-2 py-2 text-xs leading-relaxed text-[var(--color-sidebar-muted)]">
              No exports yet — your first video will appear here.
            </p>
          )}
        </div>
      </div>

      <ConsistencyVault character={character} world={world} />
    </aside>
  );
}
