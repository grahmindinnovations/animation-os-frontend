import { api } from "@/lib/api";
import type { Job } from "@/types";

export async function generatePipeline(projectId: string, prompt: string): Promise<Job> {
  const { data } = await api.post<Job>(`/projects/${projectId}/pipeline/generate`, { prompt });
  return data;
}

export interface PipelineStep {
  label: string;
  status: "pending" | "running" | "done" | "error";
}

export function getPipelineSteps(job: Job): PipelineStep[] | undefined {
  const steps = job.result?.steps;
  if (!Array.isArray(steps)) return undefined;
  return steps as PipelineStep[];
}
