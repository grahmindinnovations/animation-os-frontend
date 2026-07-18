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

export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status_code?: number;
}
