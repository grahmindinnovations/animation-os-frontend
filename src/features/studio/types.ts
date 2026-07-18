export type ChatAnchor = "video" | "story" | "character" | "export";

export type ChatStepStatus = "pending" | "running" | "done" | "error";

export interface ChatStep {
  label: string;
  status: ChatStepStatus;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  steps?: ChatStep[];
  anchor?: ChatAnchor;
  jobId?: string;
}

export type StudioSection = ChatAnchor;

export type CenterViewMode = "chat" | "grid" | "edit";
