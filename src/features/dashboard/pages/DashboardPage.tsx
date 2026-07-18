import { useQuery } from "@tanstack/react-query";
import { Film, FolderKanban, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Loading } from "@/components/common/Loading";
import { ProjectCard } from "@/components/common/ProjectCard";
import { Button } from "@/components/ui/button";
import { fetchDashboard } from "@/features/dashboard/api/dashboardApi";
import { PipelineTestCard } from "@/features/jobs/components/PipelineTestCard";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading) return <Loading fullScreen label="Loading studio..." />;
  if (isError || !data) {
    return <p className="text-sm text-[var(--color-muted-foreground)]">Failed to load studio.</p>;
  }

  const stats = [
    { label: "Projects", value: data.total_projects, icon: FolderKanban },
    { label: "Active", value: data.active_projects, icon: Play },
    { label: "Drafts", value: data.draft_projects, icon: Film },
    { label: "Archived", value: data.archived_projects, icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="studio-grid relative aspect-[21/9] min-h-[200px] bg-[#0a0a0c]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-secondary)]">
              <Film className="h-8 w-8 text-[var(--color-accent-cyan)]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Your <span className="studio-gradient-text">AI Animation</span> Studio
              </h1>
              <p className="mt-2 max-w-md text-sm text-[var(--color-muted-foreground)]">
                Create cinematic animations from text. Use the generation panel below to describe your first scene.
              </p>
            </div>
            <Button onClick={() => navigate("/projects")}>
              <Sparkles className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        </div>
      </section>

      <PipelineTestCard />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-secondary)]">
              <Icon className="h-4 w-4 text-[var(--color-accent-cyan)]" />
            </div>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
          </div>
        ))}
      </section>

      {data.recent_projects.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Recent work
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recent_projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
