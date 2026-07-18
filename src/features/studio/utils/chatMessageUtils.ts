import type { ChatMessage, ChatStep } from "@/features/studio/types";

const PROGRESS_PREFIX = "On it —";

function markStepsStopped(steps: ChatStep[] | undefined): ChatStep[] | undefined {
  if (!steps) return undefined;
  return steps.map((step) =>
    step.status === "running" || step.status === "pending"
      ? { ...step, status: "error" as const }
      : step,
  );
}

/** Clear stale spinners when reloading a chat session without an active poll. */
export function sanitizeStaleRunningMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => {
    if (!message.steps?.some((step) => step.status === "running")) {
      return message;
    }
    const stoppedSteps = markStepsStopped(message.steps);
    const interrupted =
      message.content.startsWith(PROGRESS_PREFIX) || message.content.includes("Updating ");
    return {
      ...message,
      steps: stoppedSteps,
      content: interrupted ? "Generation interrupted (switched chat or refreshed)." : message.content,
    };
  });
}

export function stoppedProgressMessage(content: string, steps: ChatStep[] | undefined): Partial<ChatMessage> {
  return {
    content,
    steps: markStepsStopped(steps),
  };
}
