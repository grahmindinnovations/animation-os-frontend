import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clapperboard, LogOut, PanelLeftClose, PanelLeftOpen, Plus, Settings } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { createProject, fetchProjects } from "@/features/projects/api/projectsApi";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useLayoutStore } from "@/stores/layoutStore";

function getInitials(name: string | null | undefined, email: string | undefined) {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

export function Sidebar() {
  const navigate = useNavigate();
  const { projectId: activeProjectId } = useParams<{ projectId?: string }>();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { leftCollapsed, toggleLeft } = useLayoutStore();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: () => createProject({ name: "New animation" }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate(`/projects/${project.id}`);
    },
  });

  if (leftCollapsed) {
    return (
      <aside className="shell-frame flex h-full w-14 shrink-0 flex-col items-center bg-[var(--color-sidebar)] py-3 sm:w-16">
        <button
          type="button"
          onClick={toggleLeft}
          title="Expand sidebar"
          className="rounded-lg p-2 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <div className="studio-gradient mt-3 flex h-9 w-9 items-center justify-center rounded-lg">
          <Clapperboard className="h-4 w-4 text-white" />
        </div>
        <button
          type="button"
          title="New animation"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="mt-3 rounded-lg p-2 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="mt-3 flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-1">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              title={project.name}
              onClick={() => navigate(`/projects/${project.id}`)}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                activeProjectId === project.id
                  ? "bg-[var(--color-accent-cyan)]"
                  : "bg-[var(--color-sidebar-muted)]/40 hover:bg-[var(--color-sidebar-muted)]",
              )}
            />
          ))}
        </div>
        <Link
          to="/settings"
          title="Settings"
          className="mb-2 rounded-lg p-2 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <button
          type="button"
          title="Sign out"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="studio-gradient flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
        >
          {getInitials(user?.full_name, user?.email)}
        </button>
      </aside>
    );
  }

  return (
    <aside className="shell-frame flex h-full w-[200px] shrink-0 flex-col overflow-hidden bg-[var(--color-sidebar)] sm:w-[240px]">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="studio-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-[0_0_16px_rgba(6,182,212,0.3)]">
            <Clapperboard className="h-4 w-4 text-white" />
          </div>
          <p className="truncate text-sm font-semibold tracking-tight">Animation OS</p>
        </div>
        <button
          type="button"
          onClick={toggleLeft}
          title="Collapse sidebar"
          className="shrink-0 rounded-lg p-1.5 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3">
        <Button
          variant="secondary"
          className="w-full justify-start gap-2"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {createMutation.isPending ? "Creating..." : "New animation"}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-3">
        {isLoading && <p className="px-3 py-2 text-xs text-[var(--color-sidebar-muted)]">Loading...</p>}
        {!isLoading && projects.length === 0 && (
          <p className="px-3 py-2 text-xs leading-relaxed text-[var(--color-sidebar-muted)]">
            No channels yet — click New animation to start.
          </p>
        )}
        <div className="space-y-0.5">
          {projects.map((project) => {
            const isActive = activeProjectId === project.id;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => navigate(`/projects/${project.id}`)}
                className={cn(
                  "w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  isActive
                    ? "bg-[var(--color-sidebar-active)] text-white"
                    : "text-[var(--color-sidebar-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-foreground)]",
                )}
              >
                {project.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 pt-0">
        <div className="flex items-center gap-2 rounded-lg px-1 py-1">
          <div className="studio-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
            {getInitials(user?.full_name, user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.full_name || "Creator"}</p>
            <p className="truncate text-xs text-[var(--color-sidebar-muted)]">{user?.email}</p>
          </div>
          <Link
            to="/settings"
            title="Settings"
            className="rounded-md p-2 text-[var(--color-sidebar-muted)] transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="mt-1 w-full justify-start text-[var(--color-sidebar-muted)] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
