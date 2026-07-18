import { Globe, Lock, UserRound } from "lucide-react";

import type { Character, World } from "@/types";

interface ConsistencyVaultProps {
  character?: Character;
  world?: World;
}

export function ConsistencyVault({ character, world }: ConsistencyVaultProps) {
  if (!character && !world) {
    return (
      <div className="border-t border-white/10 px-3 py-3">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-muted)]">
          Consistency vault
        </p>
        <p className="px-1 text-xs leading-relaxed text-[var(--color-sidebar-muted)]">
          Generate your first video — hero and world lock here for every export.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 px-3 py-3">
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-muted)]">
        Consistency vault
      </p>
      <div className="space-y-2">
        {character && (
          <div className="rounded-xl border border-white/10 bg-[var(--color-card)] p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
                  <UserRound className="h-4 w-4 text-[var(--color-accent-cyan)]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{character.name}</p>
                  <p className="text-[10px] text-[var(--color-sidebar-muted)]">{character.character_code}</p>
                </div>
              </div>
              <span title="Locked across videos">
                <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent-cyan)]" />
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <VaultRow label="Hair" value={character.appearance.hair} />
              <VaultRow label="Clothes" value={character.appearance.clothes} />
              <VaultRow label="Eyes" value={character.appearance.eyes} />
              <VaultRow label="Style" value={character.animation_style ?? "consistent"} />
            </dl>
          </div>
        )}

        {world && (
          <div className="rounded-xl border border-white/10 bg-[var(--color-card)] p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
                  <Globe className="h-4 w-4 text-[var(--color-accent-violet)]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{world.name}</p>
                  <p className="text-[10px] text-[var(--color-sidebar-muted)]">{world.world_code}</p>
                </div>
              </div>
              <span title="Locked across videos">
                <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent-cyan)]" />
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <VaultRow label="Mood" value={world.mood} />
              <VaultRow label="Light" value={world.lighting} />
              <VaultRow label="Weather" value={world.weather} />
              <VaultRow label="Place" value={world.location_type} />
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function VaultRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[var(--color-sidebar-muted)]">{label}</dt>
      <dd className="truncate text-[var(--color-sidebar-foreground)]">{value}</dd>
    </>
  );
}
