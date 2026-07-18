import { api } from "@/lib/api";
import type { CharacterAppearance, Job, SelectiveRegenPreview, Shot } from "@/types";

export async function fetchShots(projectId: string): Promise<Shot[]> {
  const { data } = await api.get<Shot[]>(`/projects/${projectId}/shots`);
  return data;
}

export async function syncShots(projectId: string): Promise<Shot[]> {
  const { data } = await api.post<Shot[]>(`/projects/${projectId}/shots/sync`);
  return data;
}

export async function previewCharacterRegen(
  projectId: string,
  clothes: string,
): Promise<SelectiveRegenPreview> {
  const { data } = await api.post<SelectiveRegenPreview>(
    `/projects/${projectId}/character/preview-regen`,
    { appearance: { clothes }, selective_regen: false },
  );
  return data;
}

export async function patchCharacterSelective(
  projectId: string,
  clothes: string,
): Promise<Job> {
  return patchCharacterAppearanceSelective(projectId, { clothes });
}

export async function patchCharacterAppearanceSelective(
  projectId: string,
  appearance: Partial<CharacterAppearance>,
): Promise<Job> {
  const { data } = await api.patch<Job>(`/projects/${projectId}/character`, {
    appearance,
    selective_regen: true,
  });
  return data;
}
