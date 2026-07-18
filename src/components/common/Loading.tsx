import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loading({ label = "Loading...", className, fullScreen = false }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-[var(--color-muted-foreground)]",
        fullScreen && "min-h-[40vh]",
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent-cyan)]" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
