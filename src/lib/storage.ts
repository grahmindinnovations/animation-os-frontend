export function storageBaseUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
  return apiBase.replace(/\/api\/v1\/?$/, "");
}

export function storageUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${storageBaseUrl()}${normalized}`;
}
