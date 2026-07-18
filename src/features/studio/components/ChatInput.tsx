import { Loader2, Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isBusy?: boolean;
  placeholder?: string;
  submitLabel?: string;
}

export function ChatInput({
  onSend,
  disabled,
  isBusy,
  placeholder = 'Try "Change hair to blonde", "Change shirt to red", or "Export MP4"',
  submitLabel = "Generate",
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="shrink-0 px-4 pb-4 pt-2">
      <div className="chat-box p-3">
        <div className="flex items-end gap-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={2}
            disabled={disabled || isBusy}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-white/10 bg-[var(--color-secondary)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:opacity-50"
          />
          <Button type="submit" size="lg" className="shrink-0 gap-2 px-5" disabled={disabled || isBusy || !value.trim()}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
