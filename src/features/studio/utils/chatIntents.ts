export type AppearanceField = "hair" | "eyes" | "skin" | "body" | "clothes" | "accessories";

export type ChatIntent =
  | { type: "generate"; prompt: string }
  | { type: "edit_appearance"; field: AppearanceField; value: string }
  | { type: "export" }
  | { type: "unsupported"; message: string }
  | { type: "unknown" };

const EXPORT_PATTERN = /\b(export|download|save)\b(?:\s+\w+){0,3}\s*(mp4|video)?\b|\b(export|download)\s*$/i;
const GENERATE_PATTERN = /\b(generate|create|make|animate|build|start|draw|produce)\b/i;
const STORY_EDIT_PATTERN =
  /\b(scene\s*\d+|make\s+scene|funnier|funny|dialogue|rewrite\s+(the\s+)?story|change\s+the\s+story|edit\s+scene)\b/i;

const FIELD_ALIASES: Record<AppearanceField, string[]> = {
  hair: ["hair", "hairstyle"],
  eyes: ["eyes", "eye color", "eye colour"],
  skin: ["skin", "skin tone"],
  body: ["body", "build", "height"],
  clothes: ["clothes", "clothing", "outfit", "shirt", "dress", "jacket", "pants", "trousers"],
  accessories: ["accessories", "accessory", "hat", "glasses"],
};

export function parseChatIntent(text: string, hasStory: boolean): ChatIntent {
  const trimmed = text.trim();
  if (!trimmed) return { type: "unknown" };

  if (EXPORT_PATTERN.test(trimmed)) {
    return { type: "export" };
  }

  if (hasStory && STORY_EDIT_PATTERN.test(trimmed)) {
    return {
      type: "unsupported",
      message:
        "Story and scene dialogue edits are coming soon. For now, try appearance edits like \"Change hair to blonde\" or \"Change shirt to red\".",
    };
  }

  const appearanceIntent = parseAppearanceEdit(trimmed, hasStory);
  if (appearanceIntent) return appearanceIntent;

  if (GENERATE_PATTERN.test(trimmed) || !hasStory) {
    return { type: "generate", prompt: stripGeneratePrefix(trimmed) };
  }

  if (hasStory && /\b(change|update|edit|make|set)\b/i.test(trimmed)) {
    return {
      type: "unsupported",
      message:
        "I couldn't tell what to change. Try \"Change hair to curly brown\" or \"Change shirt to bright red\".",
    };
  }

  return { type: "generate", prompt: trimmed };
}

function parseAppearanceEdit(text: string, hasStory: boolean): ChatIntent | null {
  if (!hasStory) return null;

  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [AppearanceField, string[]][]) {
    for (const alias of aliases) {
      const withTo = new RegExp(
        `\\b(change|update|edit|make|set)\\b(?:\\s+the)?\\s+${escapeRegex(alias)}\\s+(?:to|as|into)\\s+(.+)`,
        "i",
      );
      const matchTo = text.match(withTo);
      if (matchTo?.[2]) {
        return { type: "edit_appearance", field, value: cleanValue(matchTo[2], field) };
      }

      const bare = new RegExp(
        `\\b(change|update|edit|make|set)\\b(?:\\s+the)?\\s+${escapeRegex(alias)}\\b\\s+(.+)`,
        "i",
      );
      const matchBare = text.match(bare);
      if (matchBare?.[2] && !/^(to|as|into)\b/i.test(matchBare[2])) {
        return { type: "edit_appearance", field, value: cleanValue(matchBare[2], field) };
      }
    }
  }

  const colorClothes = text.match(/\b(bright|dark|red|blue|green|yellow|white|black|purple|pink)\b.+\b(shirt|clothes|outfit)\b/i);
  if (colorClothes) {
    return { type: "edit_appearance", field: "clothes", value: cleanValue(text, "clothes") };
  }

  return null;
}

function stripGeneratePrefix(text: string): string {
  return text.replace(/^(please\s+)?(generate|create|make|animate|build|start|draw|produce)\s+(me\s+)?(a\s+)?/i, "").trim() || text;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanValue(raw: string, field: AppearanceField): string {
  const trimmed = raw.replace(/\.$/, "").trim();
  if (field === "clothes" && /\bshirt\b/i.test(trimmed) === false && /\b(outfit|dress|jacket|pants)\b/i.test(trimmed) === false) {
    if (/\b(shirt|top)\b/i.test(raw)) return trimmed;
    if (trimmed.split(/\s+/).length <= 4) return `${trimmed} shirt`;
  }
  return trimmed;
}

export function appearanceFieldLabel(field: AppearanceField): string {
  const labels: Record<AppearanceField, string> = {
    hair: "hair",
    eyes: "eyes",
    skin: "skin",
    body: "body",
    clothes: "clothes",
    accessories: "accessories",
  };
  return labels[field];
}

export function deriveProjectName(prompt: string): string {
  const stripped = stripGeneratePrefix(prompt.trim());
  const firstLine = stripped.split(/\n/)[0]?.trim() ?? "";
  const sentence = firstLine.split(/[.!?]/)[0]?.trim() ?? firstLine;
  if (!sentence) return "New animation";

  const words = sentence.split(/\s+/).slice(0, 8).join(" ");
  if (words.length <= 50) return words.charAt(0).toUpperCase() + words.slice(1);
  return `${words.slice(0, 47).trim()}…`;
}

export function shouldAutoRenameProject(projectName: string): boolean {
  const normalized = projectName.trim().toLowerCase();
  return normalized === "new animation" || normalized === "untitled animation" || normalized.startsWith("new animation ");
}
