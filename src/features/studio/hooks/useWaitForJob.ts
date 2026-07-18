import { fetchJob } from "@/features/jobs/api/jobsApi";
import type { Job } from "@/types";

export async function waitForJob(jobId: string, intervalMs = 500): Promise<Job> {
  for (;;) {
    const job = await fetchJob(jobId);
    if (job.status === "completed") return job;
    if (job.status === "failed") throw new Error(job.error ?? "Job failed");
    if (job.status === "cancelled") throw new Error(job.error ?? "Job cancelled");
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
