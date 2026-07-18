import { Clock, RectangleHorizontal, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenerationBarProps {
  className?: string;
}

export function GenerationBar({ className }: GenerationBarProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Sprint 2: connect to AI video generation
  };

  return (
    <div className={cn("shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4", className)}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2.5 py-1 text-xs text-[var(--color-muted-foreground)]">
            <RectangleHorizontal className="h-3 w-3" />
            16:9
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2.5 py-1 text-xs text-[var(--color-muted-foreground)]">
            <Clock className="h-3 w-3" />
            5 sec
          </span>
          <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)] px-2.5 py-1 text-xs text-[var(--color-muted-foreground)]">
            Cinematic
          </span>
        </div>

        <div className="flex items-end gap-3">
          <div className="relative min-w-0 flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your animation scene — characters, motion, camera, mood..."
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-secondary)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            />
          </div>
          <Button type="submit" size="lg" className="shrink-0 gap-2 px-6">
            <Wand2 className="h-4 w-4" />
            Generate
          </Button>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
          <Sparkles className="h-3 w-3 text-[var(--color-accent-cyan)]" />
          AI video generation available in Sprint 2
        </p>
      </form>
    </div>
  );
}
