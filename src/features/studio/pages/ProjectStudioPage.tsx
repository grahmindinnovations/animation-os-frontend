import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { Loading } from "@/components/common/Loading";
import { fetchCharacterOptional } from "@/features/character/api/characterApi";
import { fetchProject } from "@/features/projects/api/projectsApi";
import { fetchLatestRenderOptional, fetchRenders } from "@/features/render/api/renderApi";
import { ChannelPanel } from "@/features/studio/components/ChannelPanel";
import { ChatInput } from "@/features/studio/components/ChatInput";
import { ChatThread } from "@/features/studio/components/ChatThread";
import { StudioEmptyState } from "@/features/studio/components/StudioEmptyState";
import { StudioViewTabs } from "@/features/studio/components/StudioViewTabs";
import { VideoEditView } from "@/features/studio/components/VideoEditView";
import { VideoLibraryGrid } from "@/features/studio/components/VideoLibraryGrid";
import { useProjectChat } from "@/features/studio/hooks/useProjectChat";
import type { CenterViewMode } from "@/features/studio/types";
import {
  createVideoSessionId,
  loadActiveVideoSession,
  saveActiveVideoSession,
} from "@/features/studio/utils/videoSessionStorage";
import { fetchStoryOptional } from "@/features/story/api/storyApi";
import { fetchWorldOptional } from "@/features/world/api/worldApi";
import { useLayoutStore } from "@/stores/layoutStore";
import type { RenderHistory } from "@/types";

export function ProjectStudioPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { rightCollapsed, toggleRight } = useLayoutStore();

  const [videoSessionId, setVideoSessionId] = useState(() =>
    projectId ? loadActiveVideoSession(projectId) : "draft",
  );
  const [draftSessionId, setDraftSessionId] = useState(() =>
    projectId ? loadActiveVideoSession(projectId) : "draft",
  );
  const [pinnedRender, setPinnedRender] = useState<RenderHistory | undefined>();
  const [centerMode, setCenterMode] = useState<CenterViewMode>("chat");

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId),
  });

  const { data: storyData } = useQuery({
    queryKey: ["story", projectId],
    queryFn: () => fetchStoryOptional(projectId!),
    enabled: Boolean(projectId),
  });

  const { data: characterData } = useQuery({
    queryKey: ["character", projectId],
    queryFn: () => fetchCharacterOptional(projectId!),
    enabled: Boolean(projectId),
  });

  const { data: worldData } = useQuery({
    queryKey: ["world", projectId],
    queryFn: () => fetchWorldOptional(projectId!),
    enabled: Boolean(projectId),
  });

  const story = storyData ?? undefined;
  const character = characterData ?? undefined;
  const world = worldData ?? undefined;

  const { messages, sendMessage, stopGeneration, isBusy } = useProjectChat({
    projectId: projectId!,
    projectName: project?.name,
    videoSessionId,
    story,
    character,
  });

  const { data: latestRenderData } = useQuery({
    queryKey: ["render", projectId, "latest"],
    queryFn: () => fetchLatestRenderOptional(projectId!),
    enabled: Boolean(projectId) && !isBusy,
  });

  const latestRender = latestRenderData ?? undefined;

  const { data: allRenders = [] } = useQuery({
    queryKey: ["render", projectId, "all"],
    queryFn: () => fetchRenders(projectId!),
    enabled: Boolean(projectId),
  });

  const displayRender = useMemo(() => {
    if (pinnedRender) return pinnedRender;
    return allRenders.find((render) => render.id === videoSessionId) ?? latestRender;
  }, [allRenders, latestRender, pinnedRender, videoSessionId]);

  const isDraftSession = !allRenders.some((render) => render.id === videoSessionId);
  const isEmptyStudio = messages.length === 0 && !story && !displayRender && isDraftSession;
  const canEdit = Boolean(displayRender && !isDraftSession);

  const openRender = useCallback(
    (render: RenderHistory) => {
      if (!projectId) return;
      saveActiveVideoSession(projectId, render.id);
      setVideoSessionId(render.id);
      setPinnedRender(render);
      setCenterMode("edit");
    },
    [projectId],
  );

  const handleNewVideo = useCallback(() => {
    if (!projectId) return;
    const sessionId = createVideoSessionId();
    saveActiveVideoSession(projectId, sessionId);
    setDraftSessionId(sessionId);
    setVideoSessionId(sessionId);
    setPinnedRender(undefined);
    setCenterMode("chat");
  }, [projectId]);

  const handleSelectSession = useCallback(
    (sessionId: string, render?: RenderHistory) => {
      if (!projectId) return;
      saveActiveVideoSession(projectId, sessionId);
      setVideoSessionId(sessionId);
      setPinnedRender(render);
      setCenterMode(render ? "edit" : "chat");
    },
    [projectId],
  );

  if (isLoading) return <Loading fullScreen label="Loading studio..." />;
  if (isError || !project) {
    return <p className="p-6 text-sm text-[var(--color-muted-foreground)]">Project not found.</p>;
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        {!isEmptyStudio && (
          <StudioViewTabs
            mode={centerMode}
            onChange={setCenterMode}
            canEdit={canEdit}
          />
        )}

        <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto">
          {isEmptyStudio && <StudioEmptyState onSend={sendMessage} onStop={stopGeneration} isBusy={isBusy} />}

          {!isEmptyStudio && centerMode === "chat" && (
            <div className="mx-auto w-full max-w-3xl px-4">
              <ChatThread
                messages={messages}
                story={story}
                character={character}
                world={world}
                isBusy={isBusy}
                latestRender={isDraftSession ? displayRender : undefined}
              />
            </div>
          )}

          {!isEmptyStudio && centerMode === "grid" && (
            <VideoLibraryGrid
              renders={allRenders}
              activeRenderId={displayRender?.id}
              onSelect={openRender}
            />
          )}

          {!isEmptyStudio && centerMode === "edit" && displayRender && !isDraftSession && (
            <VideoEditView
              render={displayRender}
              story={story}
              character={character}
              onSend={sendMessage}
              isBusy={isBusy}
            />
          )}

          {!isEmptyStudio && centerMode === "edit" && (!displayRender || isDraftSession) && (
            <div className="chat-box mx-auto max-w-md p-6 text-center text-sm text-[var(--color-muted-foreground)]">
              Select an exported video from the library or right panel to micro-edit.
            </div>
          )}
        </div>

        {!isEmptyStudio && centerMode === "chat" && (
          <div className="mx-auto w-full max-w-3xl shrink-0">
            <ChatInput onSend={sendMessage} onStop={stopGeneration} isBusy={isBusy} />
          </div>
        )}
      </div>

      <ChannelPanel
        projectId={projectId!}
        projectName={project.name}
        character={character}
        world={world}
        activeSessionId={videoSessionId}
        draftSessionId={draftSessionId}
        onSelectSession={handleSelectSession}
        onNewVideo={handleNewVideo}
        collapsed={rightCollapsed}
        onToggleCollapse={toggleRight}
      />
    </div>
  );
}
