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

export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status_code?: number;
}
