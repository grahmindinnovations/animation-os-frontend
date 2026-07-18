import { api } from "@/lib/api";
import type { Project } from "@/types";

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: Project["status"];
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string | null;
  status?: Project["status"];
}

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>("/projects");
  return data;
}

export async function fetchProject(projectId: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${projectId}`);
  return data;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await api.post<Project>("/projects", payload);
  return data;
}

export async function updateProject(projectId: string, payload: UpdateProjectPayload): Promise<Project> {
  const { data } = await api.patch<Project>(`/projects/${projectId}`, payload);
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}
