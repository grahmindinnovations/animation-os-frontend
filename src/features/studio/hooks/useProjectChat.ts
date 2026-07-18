import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { fetchJob } from "@/features/jobs/api/jobsApi";
import { updateProject } from "@/features/projects/api/projectsApi";
import { generatePipeline, getPipelineSteps } from "@/features/studio/api/pipelineApi";
import { waitForJob } from "@/features/studio/hooks/useWaitForJob";
import type { ChatMessage, ChatStep } from "@/features/studio/types";
import {
  appearanceFieldLabel,
  deriveProjectName,
  parseChatIntent,
  shouldAutoRenameProject,
  type AppearanceField,
} from "@/features/studio/utils/chatIntents";
import { loadChatMessages, saveChatMessages } from "@/features/studio/utils/chatStorage";
import { renderEpisode } from "@/features/render/api/renderApi";
import { patchCharacterAppearanceSelective } from "@/features/selective-render/api/selectiveRenderApi";
import { fetchStory } from "@/features/story/api/storyApi";
import { getErrorMessage } from "@/lib/api";
import type { Character, StoryTree } from "@/types";

function newId(): string {
  return crypto.randomUUID();
}

function userMessage(content: string): ChatMessage {
  return { id: newId(), role: "user", content, timestamp: Date.now() };
}

function assistantMessage(content: string, steps?: ChatStep[], anchor?: ChatMessage["anchor"]): ChatMessage {
  return { id: newId(), role: "assistant", content, timestamp: Date.now(), steps, anchor };
}

function toChatSteps(steps: { label: string; status: string }[] | undefined): ChatStep[] | undefined {
  if (!steps) return undefined;
  return steps.map((step) => ({
    label: step.label,
    status: step.status as ChatStep["status"],
  }));
}

interface UseProjectChatOptions {
  projectId: string;
  projectName?: string;
  videoSessionId: string;
  story?: StoryTree;
  character?: Character;
}

export function useProjectChat({ projectId, projectName, videoSessionId, story, character }: UseProjectChatOptions) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages(projectId, videoSessionId));
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setMessages(loadChatMessages(projectId, videoSessionId));
  }, [projectId, videoSessionId]);

  useEffect(() => {
    saveChatMessages(projectId, messages, videoSessionId);
  }, [projectId, videoSessionId, messages]);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...patch } : msg)));
  }, []);

  const pollPipelineJob = useCallback(
    async (jobId: string, progressMessageId: string) => {
      for (;;) {
        const job = await fetchJob(jobId);
        const steps = toChatSteps(getPipelineSteps(job));
        if (steps) {
          updateMessage(progressMessageId, { steps });
        }
        if (job.status === "completed" || job.status === "failed") {
          return job;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    },
    [updateMessage],
  );

  const invalidateProjectData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["character", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["world", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["story", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["memory", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["shots", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["production", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["render", projectId] }),
    ]);
  }, [projectId, queryClient]);

  const maybeRenameProject = useCallback(
    async (prompt: string) => {
      if (!projectName || !shouldAutoRenameProject(projectName)) return;
      const name = deriveProjectName(prompt);
      await updateProject(projectId, { name });
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    [projectId, projectName, queryClient],
  );

  const runPipeline = useCallback(
    async (prompt: string) => {
      await maybeRenameProject(prompt);

      const progress = assistantMessage(
        "On it — one prompt builds character, world, story, and video.",
        [
          { label: "Creating character", status: "pending" },
          { label: "Building world", status: "pending" },
          { label: "Writing story", status: "pending" },
          { label: "Producing animation", status: "pending" },
          { label: "Rendering video", status: "pending" },
        ],
        "video",
      );
      appendMessage(progress);
      setIsBusy(true);

      try {
        const created = await generatePipeline(projectId, prompt);
        const job = await pollPipelineJob(created.id, progress.id);
        await invalidateProjectData();

        if (job.status === "failed") {
          updateMessage(progress.id, {
            content: `Something went wrong: ${job.error ?? "Pipeline failed"}`,
          });
          return;
        }

        appendMessage(
          assistantMessage(
            "Your video is ready. Same character and world across the full story — edit anything and only that part changes.",
            undefined,
            "export",
          ),
        );
      } catch (err) {
        updateMessage(progress.id, {
          content: `Something went wrong: ${getErrorMessage(err)}`,
        });
      } finally {
        setIsBusy(false);
      }
    },
    [appendMessage, invalidateProjectData, maybeRenameProject, pollPipelineJob, projectId, updateMessage],
  );

  const runAppearanceEdit = useCallback(
    async (field: AppearanceField, value: string) => {
      if (!character) {
        appendMessage(assistantMessage("Generate a video first, then you can edit the character."));
        return;
      }

      const label = appearanceFieldLabel(field);
      const msg = assistantMessage(`Updating ${label} to "${value}" — only affected shots will regen.`, [
        { label: "Patching character", status: "running" },
        { label: "Selective regen", status: "pending" },
        { label: "Re-rendering video", status: "pending" },
      ]);
      appendMessage(msg);
      setIsBusy(true);

      const updateStep = (index: number, status: ChatStep["status"]) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== msg.id || !m.steps) return m;
            return {
              ...m,
              steps: m.steps.map((step, i) => (i === index ? { ...step, status } : step)),
            };
          }),
        );
      };

      try {
        const patchJob = await patchCharacterAppearanceSelective(projectId, { [field]: value });
        await waitForJob(patchJob.id);
        updateStep(0, "done");
        updateStep(1, "done");
        await queryClient.invalidateQueries({ queryKey: ["character", projectId] });
        await queryClient.invalidateQueries({ queryKey: ["production", projectId] });
        await queryClient.invalidateQueries({ queryKey: ["shots", projectId] });

        updateStep(2, "running");
        const freshStory = story ?? (await fetchStory(projectId));
        const renderJob = await renderEpisode(projectId, freshStory.episodes[0]?.id);
        await waitForJob(renderJob.id);
        await queryClient.invalidateQueries({ queryKey: ["render", projectId] });
        updateStep(2, "done");

        appendMessage(
          assistantMessage(
            "Done — only the changed parts were updated. Your preview shows the new video.",
            undefined,
            "video",
          ),
        );
      } catch (err) {
        updateMessage(msg.id, {
          content: `Could not apply edit: ${getErrorMessage(err)}`,
          steps: msg.steps?.map((s) => ({ ...s, status: "error" as const })),
        });
      } finally {
        setIsBusy(false);
      }
    },
    [appendMessage, character, projectId, queryClient, story, updateMessage],
  );

  const runExport = useCallback(async () => {
    if (!story) {
      appendMessage(assistantMessage("Nothing to export yet — describe your animation first."));
      return;
    }

    const msg = assistantMessage("Exporting your video...", [{ label: "Rendering MP4", status: "running" }], "export");
    appendMessage(msg);
    setIsBusy(true);

    try {
      const renderJob = await renderEpisode(projectId, story.episodes[0]?.id);
      await waitForJob(renderJob.id);
      await queryClient.invalidateQueries({ queryKey: ["render", projectId] });
      updateMessage(msg.id, {
        content: "Export ready — download below the preview or scroll to Export.",
        steps: [{ label: "Rendering MP4", status: "done" }],
      });
    } catch (err) {
      updateMessage(msg.id, {
        content: `Export failed: ${getErrorMessage(err)}`,
        steps: [{ label: "Rendering MP4", status: "error" }],
      });
    } finally {
      setIsBusy(false);
    }
  }, [appendMessage, projectId, queryClient, story, updateMessage]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      appendMessage(userMessage(text));
      const intent = parseChatIntent(text, Boolean(story));

      if (intent.type === "export") {
        await runExport();
        return;
      }
      if (intent.type === "edit_appearance") {
        await runAppearanceEdit(intent.field, intent.value);
        return;
      }
      if (intent.type === "unsupported") {
        appendMessage(assistantMessage(intent.message));
        return;
      }
      if (intent.type === "generate") {
        await runPipeline(intent.prompt);
        return;
      }
      appendMessage(
        assistantMessage(
          'Try: "Generate a kids playing video" · "Change hair to blonde" · "Change shirt to red" · "Export"',
        ),
      );
    },
  });

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isBusy || sendMutation.isPending) return;
      sendMutation.mutate(text.trim());
    },
    [isBusy, sendMutation],
  );

  return {
    messages,
    sendMessage,
    isBusy: isBusy || sendMutation.isPending,
  };
}
