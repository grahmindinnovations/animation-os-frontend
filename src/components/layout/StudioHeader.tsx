import { Film, PanelLeft, PanelRight } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useLayoutStore } from "@/stores/layoutStore";

function getTitle(pathname: string, projectName?: string) {
  if (pathname === "/settings") return "Settings";
  if (pathname.startsWith("/projects/") && !pathname.endsWith("/dev")) {
    return projectName ?? "Animation";
  }
  return "Animation OS";
}

interface StudioHeaderProps {
  projectName?: string;
  isStudio?: boolean;
}

export function StudioHeader({ projectName, isStudio }: StudioHeaderProps) {
  const { pathname } = useLocation();
  const title = getTitle(pathname, projectName);
  const { leftCollapsed, rightCollapsed, toggleLeft, toggleRight } = useLayoutStore();

  return (
    <header className="shell-frame flex h-12 shrink-0 items-center justify-between bg-[var(--color-background)] px-4 sm:h-14 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Film className="h-4 w-4 shrink-0 text-[var(--color-accent-cyan)]" />
        <h1 className="truncate text-sm font-medium text-[var(--color-foreground)]">{title}</h1>
      </div>
      {isStudio && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleLeft}
            title={leftCollapsed ? "Show projects" : "Hide projects"}
            className="rounded-lg p-2 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleRight}
            title={rightCollapsed ? "Show channel videos" : "Hide channel videos"}
            className="rounded-lg p-2 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)] hover:text-white"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      )}
      {!isStudio && <div className="w-8" />}
    </header>
  );
}
