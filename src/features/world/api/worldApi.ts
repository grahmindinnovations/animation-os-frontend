import { api, getOptional } from "@/lib/api";
import type { Job, World } from "@/types";

export async function generateWorld(projectId: string, prompt: string): Promise<Job> {
  const { data } = await api.post<Job>(`/projects/${projectId}/world/generate`, { prompt });
  return data;
}

export async function fetchWorld(projectId: string): Promise<World> {
  const { data } = await api.get<World>(`/projects/${projectId}/world`);
  return data;
}

export async function fetchWorldOptional(projectId: string): Promise<World | null> {
  return getOptional<World>(`/projects/${projectId}/world`);
}
