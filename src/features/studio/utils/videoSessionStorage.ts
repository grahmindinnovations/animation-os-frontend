const ACTIVE_PREFIX = "aos-active-video:";

export function loadActiveVideoSession(projectId: string): string {
  return sessionStorage.getItem(`${ACTIVE_PREFIX}${projectId}`) ?? "draft";
}

export function saveActiveVideoSession(projectId: string, sessionId: string): void {
  sessionStorage.setItem(`${ACTIVE_PREFIX}${projectId}`, sessionId);
}

export function createVideoSessionId(): string {
  return crypto.randomUUID();
}

export function formatVideoLabel(filename: string, createdAt: string): string {
  const base = filename.replace(/\.mp4$/i, "").replace(/_/g, " ");
  if (base && base !== "episode 01") return base;
  return new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
