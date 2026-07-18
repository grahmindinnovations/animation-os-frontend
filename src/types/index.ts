export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  draft_projects: number;
  archived_projects: number;
  recent_projects: Project[];
}

export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface Job {
  id: string;
  owner_id: string;
  job_type: string;
  status: JobStatus;
  project_id: string | null;
  input: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Scene {
  id: string;
  episode_id: string;
  story_id: string;
  title: string;
  description: string;
  dialogue: string | null;
  order: number;
}

export interface Episode {
  id: string;
  story_id: string;
  title: string;
  summary: string | null;
  order: number;
  scenes: Scene[];
}

export interface Story {
  id: string;
  project_id: string;
  title: string;
  prompt: string;
  moral: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryTree {
  story: Story;
  episodes: Episode[];
}

export interface CharacterAppearance {
  hair: string;
  eyes: string;
  skin: string;
  body: string;
  clothes: string;
  accessories: string | null;
}

export interface Character {
  id: string;
  project_id: string;
  character_code: string;
  name: string;
  role: string | null;
  appearance: CharacterAppearance;
  voice: string | null;
  personality: string | null;
  animation_style: string | null;
  walking_style: string | null;
  relationships: string[];
  source_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface World {
  id: string;
  project_id: string;
  world_code: string;
  name: string;
  location_type: string;
  lighting: string;
  weather: string;
  props: string;
  textures: string;
  colors: string;
  mood: string;
  source_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionAsset {
  id: string;
  project_id: string;
  scene_id: string;
  asset_type: "image" | "animation" | "voice" | "music";
  filename: string;
  file_path: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  metadata: Record<string, unknown>;
}

export interface ProductionVoice {
  id: string;
  project_id: string;
  scene_id: string;
  asset_id: string;
  character_name: string;
  dialogue: string;
  duration_seconds: number;
  file_path: string;
  url: string;
}

export interface ProductionMusic {
  id: string;
  project_id: string;
  scene_id: string;
  asset_id: string;
  title: string;
  mood: string;
  duration_seconds: number;
  file_path: string;
  url: string;
}

export interface ProductionBundle {
  scene_id: string;
  assets: ProductionAsset[];
  voice: ProductionVoice | null;
  music: ProductionMusic | null;
}

export interface RenderHistory {
  id: string;
  project_id: string;
  story_id: string;
  episode_id: string;
  filename: string;
  file_path: string;
  url: string;
  scene_count: number;
  duration_seconds: number;
  engine: string;
  source_scene_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface EpisodeEvent {
  id: string;
  project_id: string;
  story_id: string;
  episode_id: string;
  scene_id: string;
  episode_order: number;
  scene_order: number;
  title: string;
  summary: string;
  dialogue: string | null;
  created_at: string;
}

export interface CharacterMemoryRecord {
  id: string;
  project_id: string;
  character_code: string;
  story_id: string;
  episode_id: string;
  scene_id: string;
  episode_order: number;
  scene_order: number;
  memory_type: string;
  content: string;
  created_at: string;
}

export interface ProjectMemory {
  character_memories: CharacterMemoryRecord[];
  episode_events: EpisodeEvent[];
}

export interface Shot {
  id: string;
  project_id: string;
  shot_code: string;
  story_id: string;
  episode_id: string;
  scene_id: string;
  episode_order: number;
  scene_order: number;
  character_code: string | null;
  world_code: string | null;
  dependencies: string[];
  production_status: string;
  asset_fingerprint: string | null;
  created_at: string;
  updated_at: string;
}

export interface SelectiveRegenPreview {
  changed_fields: string[];
  affected_shots: Shot[];
  unchanged_shots: Shot[];
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status_code?: number;
}
