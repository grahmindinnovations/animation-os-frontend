import { useEffect, useRef } from "react";

import { ChatMessageBubble } from "@/features/studio/components/ChatMessageBubble";
import { ChatVideoCard } from "@/features/studio/components/ChatVideoCard";
import type { ChatMessage } from "@/features/studio/types";
import type { Character, RenderHistory, StoryTree, World } from "@/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  story?: StoryTree;
  character?: Character;
  world?: World;
  isBusy?: boolean;
  latestRender?: RenderHistory;
}

export function ChatThread({ messages, story, character, world, isBusy, latestRender }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, latestRender?.id]);

  return (
    <div className="space-y-6 py-6">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}

      {latestRender && (
        <ChatVideoCard
          render={latestRender}
          storyTitle={story?.story.title}
          characterName={character?.name}
        />
      )}

      {isBusy && story && !latestRender && (
        <p className="text-center text-xs text-[var(--color-muted-foreground)]">
          Building your video…
          {character ? ` · ${character.name}` : ""}
          {world ? ` · ${world.name}` : ""}
        </p>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
