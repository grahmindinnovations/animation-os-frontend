import { api } from "@/lib/api";
import type { Job, RenderHistory } from "@/types";

export async function renderEpisode(projectId: string, episodeId?: string): Promise<Job> {
  const { data } = await api.post<Job>(`/projects/${projectId}/render`, {
    episode_id: episodeId ?? null,
  });
  return data;
}

export async function fetchLatestRender(projectId: string): Promise<RenderHistory> {
  const { data } = await api.get<RenderHistory>(`/projects/${projectId}/render/latest`);
  return data;
}

export async function fetchRenders(projectId: string): Promise<RenderHistory[]> {
  const { data } = await api.get<RenderHistory[]>(`/projects/${projectId}/render`);
  return data;
}
