import type { ChatMessage } from "@/features/studio/types";

const PREFIX = "aos-chat:";

function storageKey(projectId: string, sessionId: string): string {
  return `${PREFIX}${projectId}:${sessionId}`;
}

export function loadChatMessages(projectId: string, sessionId = "draft"): ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId, sessionId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChatMessages(projectId: string, messages: ChatMessage[], sessionId = "draft"): void {
  localStorage.setItem(storageKey(projectId, sessionId), JSON.stringify(messages));
}
