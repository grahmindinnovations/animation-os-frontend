import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Loading } from "@/components/common/Loading";
import { ProjectCard } from "@/components/common/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject, fetchProjects } from "@/features/projects/api/projectsApi";
import { getErrorMessage } from "@/lib/api";

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setName("");
      setDescription("");
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate({ name, description: description || undefined });
  };

  if (isLoading) return <Loading fullScreen label="Loading projects..." />;
  if (isError) return <p className="text-sm text-[var(--color-muted-foreground)]">Failed to load projects.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Your animation library</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="studio-grid flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] py-20 text-center">
          <p className="text-sm font-medium">No projects yet</p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Create your first animation project</p>
          <Button className="mt-6" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Name your animation project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input id="projectName" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Scene description</Label>
              <Input id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional brief..." />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
