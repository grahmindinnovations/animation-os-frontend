import { BookOpen, Clapperboard } from "lucide-react";

import type { StoryTree } from "@/types";

interface StoryOutlineProps {
  story: StoryTree;
}

export function StoryOutline({ story }: StoryOutlineProps) {
  return (
    <section className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
          <BookOpen className="h-5 w-5 text-[var(--color-accent-cyan)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{story.story.title}</h2>
          {story.story.moral && (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Moral: {story.story.moral}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {story.episodes.map((episode) => (
          <div key={episode.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clapperboard className="h-4 w-4 text-[var(--color-accent-cyan)]" />
              <h3 className="font-medium">{episode.title}</h3>
            </div>
            {episode.summary && (
              <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">{episode.summary}</p>
            )}
            <ol className="space-y-3">
              {episode.scenes.map((scene) => (
                <li key={scene.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3">
                  <p className="text-sm font-medium">
                    Scene {scene.order}: {scene.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{scene.description}</p>
                  {scene.dialogue && (
                    <p className="mt-2 text-sm italic text-[var(--color-foreground)]/80">&ldquo;{scene.dialogue}&rdquo;</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
