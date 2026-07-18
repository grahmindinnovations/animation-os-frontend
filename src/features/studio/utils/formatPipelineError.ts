import type { Job } from "@/types";

export interface PipelineErrorInfo {
  step?: string;
  step_index?: number;
  message?: string;
  hint?: string;
  technical?: string;
  exception?: string;
}

export interface PipelineFailureDisplay {
  title: string;
  body: string;
  consoleDetail: Record<string, unknown>;
}

function getErrorInfo(job: Job): PipelineErrorInfo | undefined {
  const result = job.result as { error_info?: PipelineErrorInfo } | null | undefined;
  return result?.error_info;
}

function getFailureMessage(job: Job): string {
  if (job.status === "cancelled") {
    return job.error ?? "Generation stopped.";
  }
  const info = getErrorInfo(job);
  return info?.message ?? job.error ?? "Generation failed";
}

export function formatPipelineFailure(job: Job): PipelineFailureDisplay {
  const info = getErrorInfo(job);
  const step = info?.step ?? (job.status === "cancelled" ? "Pipeline" : "Pipeline");
  const message = getFailureMessage(job);
  const hint = info?.hint;
  const technical = info?.technical ?? job.error;

  const body = hint ? `${message}\n\nHow to fix:\n${hint}` : message;

  return {
    title: `Failed at: ${step}`,
    body,
    consoleDetail: {
      step,
      stepIndex: info?.step_index,
      message,
      hint,
      technical,
      exception: info?.exception,
      jobId: job.id,
      jobError: job.error,
    },
  };
}

export function logPipelineFailure(job: Job): void {
  const { title, consoleDetail } = formatPipelineFailure(job);
  console.error(`[Animation OS] ${title}`, consoleDetail);
}

export function formatPipelineFailureMessage(job: Job): string {
  const { title, body } = formatPipelineFailure(job);
  return `${title}\n\n${body}`;
}
