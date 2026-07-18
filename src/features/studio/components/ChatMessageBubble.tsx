import { Check, Loader2 } from "lucide-react";

import type { ChatMessage, ChatStepStatus } from "@/features/studio/types";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "w-full max-w-full px-5 py-4 text-sm leading-relaxed sm:max-w-[92%]",
          isUser ? "chat-box-user sm:max-w-[min(92%,420px)]" : "chat-box",
          !isUser && "sm:max-w-full",
        )}
      >
        {!isUser && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent-cyan)]">
            Animation OS
          </p>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.steps && message.steps.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {message.steps.map((step) => (
              <li key={step.label} className="flex items-center gap-2.5 text-xs text-[var(--color-muted-foreground)]">
                <StepIcon status={step.status} />
                <span className={step.status === "done" ? "text-emerald-400" : undefined}>{step.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: ChatStepStatus }) {
  if (status === "done") return <Check className="h-3.5 w-3.5 text-emerald-400" />;
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent-cyan)]" />;
  if (status === "error") return <span className="text-red-400">✕</span>;
  return <span className="h-3.5 w-3.5 rounded-full border border-white/20" />;
}
