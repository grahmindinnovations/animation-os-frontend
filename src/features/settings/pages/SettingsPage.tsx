import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Code2, ExternalLink } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { fetchProjects } from "@/features/projects/api/projectsApi";

export function SettingsPage() {
  const { data: user } = useCurrentUser();
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <div className="mx-auto w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Account & studio preferences</p>
      </div>

      <section className="chat-box overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 sm:px-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">Profile</p>
        </div>
        <ul className="divide-y divide-white/10 text-sm">
          <li className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="text-[var(--color-muted-foreground)]">Email</span>
            <span className="break-all sm:text-right">{user?.email ?? "—"}</span>
          </li>
          <li className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="text-[var(--color-muted-foreground)]">Full name</span>
            <span className="sm:text-right">{user?.full_name ?? "—"}</span>
          </li>
          <li className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="text-[var(--color-muted-foreground)]">Member since</span>
            <span className="sm:text-right">
              {user ? new Date(user.created_at).toLocaleDateString() : "—"}
            </span>
          </li>
        </ul>
      </section>

      <section className="chat-box overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 shrink-0 text-[var(--color-accent-cyan)]" />
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Developer
            </p>
          </div>
        </div>
        <div className="space-y-3 px-4 py-4 text-sm sm:px-5">
          <p className="text-[var(--color-muted-foreground)]">
            Pipeline engine panels for debugging — hidden from the main chat studio.
          </p>
          {projects.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">Create a project first to open dev panels.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    to={`/projects/${project.id}/dev`}
                    className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[var(--color-secondary)] px-3 py-2.5 text-xs text-[var(--color-foreground)] transition-colors hover:border-white/20"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent-cyan)]" />
                    <span className="min-w-0 truncate">{project.name}</span>
                    <span className="hidden shrink-0 text-[var(--color-muted-foreground)] sm:inline">· dev</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
