import { api } from "@/lib/api";
import type { Character, Job } from "@/types";

export async function generateCharacter(projectId: string, prompt: string): Promise<Job> {
  const { data } = await api.post<Job>(`/projects/${projectId}/character/generate`, { prompt });
  return data;
}

export async function fetchCharacter(projectId: string): Promise<Character> {
  const { data } = await api.get<Character>(`/projects/${projectId}/character`);
  return data;
}
