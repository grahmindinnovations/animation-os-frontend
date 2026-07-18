import { api } from "@/lib/api";
import type { Job, ProductionBundle } from "@/types";

export async function produceScene(projectId: string, sceneId?: string): Promise<Job> {
  const { data } = await api.post<Job>(`/projects/${projectId}/produce`, {
    scene_id: sceneId ?? null,
  });
  return data;
}

export async function fetchProduction(projectId: string, sceneId?: string): Promise<ProductionBundle[]> {
  const params = sceneId ? { scene_id: sceneId } : undefined;
  const { data } = await api.get<ProductionBundle[]>(`/projects/${projectId}/production`, { params });
  return data;
}
