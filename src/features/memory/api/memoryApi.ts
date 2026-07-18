import { api } from "@/lib/api";
import type { ProjectMemory } from "@/types";

export async function fetchMemory(projectId: string): Promise<ProjectMemory> {
  const { data } = await api.get<ProjectMemory>(`/projects/${projectId}/memory`);
  return data;
}

export async function syncMemory(projectId: string): Promise<{ event_count: number; character_memory_count: number }> {
  const { data } = await api.post<{ event_count: number; character_memory_count: number }>(
    `/projects/${projectId}/memory/sync`,
  );
  return data;
}
