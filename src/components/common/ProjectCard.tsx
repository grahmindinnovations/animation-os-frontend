import { Link } from "react-router-dom";
import { Clock, Play } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

const statusStyles: Record<Project["status"], string> = {
  draft: "bg-zinc-800 text-zinc-400",
  active: "studio-gradient text-white",
  archived: "bg-zinc-800/80 text-zinc-500",
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`} className="group block">
      <Card className="overflow-hidden transition-colors hover:border-[var(--color-accent-cyan)]/40">
        <div className="studio-grid relative aspect-video bg-[#0a0a0c]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[project.status]}`}>
              {project.status}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-zinc-300 backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              0:00
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="truncate text-sm font-semibold">{project.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--color-muted-foreground)]">
            {project.description || "No scene description yet"}
          </p>
          <p className="mt-2 text-[10px] text-[var(--color-muted-foreground)]">
            Edited {new Date(project.updated_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
