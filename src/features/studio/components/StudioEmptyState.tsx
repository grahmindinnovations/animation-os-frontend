import { Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Generate a kids playing video in a sunny park",
  "Create a bunny adventure in an enchanted forest",
  "Animate a bedtime story about sharing with friends",
];

interface StudioEmptyStateProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isBusy?: boolean;
}

export function StudioEmptyState({ onSend, onStop, isBusy }: StudioEmptyStateProps) {
  const [value, setValue] = useState("");

  const submit = (text: string) => {
    if (!text.trim() || isBusy) return;
    onSend(text.trim());
    setValue("");
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="studio-gradient mb-6 flex h-16 w-16 items-center justify-center rounded-3xl shadow-[0_0_32px_rgba(6,182,212,0.25)]">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">What animation should we make?</h2>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-muted-foreground)]">
        One prompt creates the character, world, story, and video — same hero every scene, edit only what changes.
      </p>

      <form
        className="mt-8 w-full max-w-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
      >
        <div className="chat-box overflow-hidden">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe your animation — characters, setting, mood, lesson..."
            rows={4}
            disabled={isBusy}
            className="w-full resize-none bg-transparent px-5 py-4 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between border-t border-white/10 bg-[var(--color-secondary)]/50 px-4 py-3">
            <span className="text-[11px] text-[var(--color-muted-foreground)]">16:9 · Full episode</span>
            {isBusy && onStop ? (
              <Button type="button" variant="destructive" className="gap-2" onClick={onStop}>
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={isBusy || !value.trim()} className="gap-2">
                <Wand2 className="h-4 w-4" />
                Generate
              </Button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={isBusy}
            onClick={() => submit(suggestion)}
            className="rounded-full border border-white/15 bg-[var(--color-secondary)] px-3 py-1.5 text-xs text-[var(--color-muted-foreground)] transition-colors hover:border-white/30 hover:text-[var(--color-foreground)] disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
