import { Film } from "lucide-react";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/dashboard": "Studio",
  "/projects": "Projects",
  "/settings": "Settings",
};

function getTitle(pathname: string) {
  if (pathname.startsWith("/projects/")) return "Editor";
  return titles[pathname] ?? "Studio";
}

export function StudioHeader() {
  const { pathname } = useLocation();
  const title = getTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-background)] px-6">
      <div className="flex items-center gap-3">
        <Film className="h-4 w-4 text-[var(--color-accent-cyan)]" />
        <h1 className="text-sm font-medium text-[var(--color-foreground)]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-secondary)] px-3 py-1 text-xs text-[var(--color-muted-foreground)]">
          AI Engine · Sprint 2
        </span>
      </div>
    </header>
  );
}
