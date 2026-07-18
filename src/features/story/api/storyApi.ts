import { api } from "@/lib/api";
import type { Job, StoryTree } from "@/types";

export async function generateStory(projectId: string, prompt: string): Promise<Job> {
  const { data } = await api.post<Job>(`/projects/${projectId}/story/generate`, { prompt });
  return data;
}

export async function fetchStory(projectId: string): Promise<StoryTree> {
  const { data } = await api.get<StoryTree>(`/projects/${projectId}/story`);
  return data;
}
