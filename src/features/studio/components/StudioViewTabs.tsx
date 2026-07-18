import { LayoutGrid, MessageSquare, Pencil } from "lucide-react";

import type { CenterViewMode } from "@/features/studio/types";
import { cn } from "@/lib/utils";

interface StudioViewTabsProps {
  mode: CenterViewMode;
  onChange: (mode: CenterViewMode) => void;
  canEdit: boolean;
}

const tabs: { id: CenterViewMode; label: string; icon: typeof MessageSquare }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "grid", label: "Library", icon: LayoutGrid },
  { id: "edit", label: "Edit", icon: Pencil },
];

export function StudioViewTabs({ mode, onChange, canEdit }: StudioViewTabsProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl gap-2 px-4 pt-3">
      {tabs.map(({ id, label, icon: Icon }) => {
        const disabled = id === "edit" && !canEdit;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
              mode === id
                ? "border-white/20 bg-[var(--color-card)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "border-transparent text-[var(--color-muted-foreground)] hover:border-white/10 hover:bg-[var(--color-secondary)] hover:text-white",
              disabled && "cursor-not-allowed opacity-40 hover:border-transparent hover:bg-transparent",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
