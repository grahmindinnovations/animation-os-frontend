import { api } from "@/lib/api";
import type { Job } from "@/types";

export async function createJob(jobType: "noop" = "noop"): Promise<Job> {
  const { data } = await api.post<Job>("/jobs", { job_type: jobType });
  return data;
}

export async function fetchJob(jobId: string): Promise<Job> {
  const { data } = await api.get<Job>(`/jobs/${jobId}`);
  return data;
}

export async function cancelJob(jobId: string): Promise<Job> {
  const { data } = await api.post<Job>(`/jobs/${jobId}/cancel`);
  return data;
}

export function isJobFinished(job: Job): boolean {
  return job.status === "completed" || job.status === "failed" || job.status === "cancelled";
}
