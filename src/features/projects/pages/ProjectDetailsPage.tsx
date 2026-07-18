import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteProject, fetchProject, updateProject } from "@/features/projects/api/projectsApi";
import { fetchCharacter } from "@/features/character/api/characterApi";
import { CharacterPanel } from "@/features/character/components/CharacterPanel";
import { fetchWorld } from "@/features/world/api/worldApi";
import { WorldPanel } from "@/features/world/components/WorldPanel";
import { fetchStory } from "@/features/story/api/storyApi";
import { StoryOutline } from "@/features/story/components/StoryOutline";
import { ProductionPanel } from "@/features/production/components/ProductionPanel";
import { MemoryPanel } from "@/features/memory/components/MemoryPanel";
import { SelectiveRenderPanel } from "@/features/selective-render/components/SelectiveRenderPanel";
import { fetchLatestRender } from "@/features/render/api/renderApi";
import { EpisodePreview, RenderPanel } from "@/features/render/components/RenderPanel";
import { getErrorMessage } from "@/lib/api";
import type { Project } from "@/types";

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId),
  });

  const { data: story } = useQuery({
    queryKey: ["story", projectId],
    queryFn: () => fetchStory(projectId!),
    enabled: Boolean(projectId),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const { data: character } = useQuery({
    queryKey: ["character", projectId],
    queryFn: () => fetchCharacter(projectId!),
    enabled: Boolean(projectId),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const { data: world } = useQuery({
    queryKey: ["world", projectId],
    queryFn: () => fetchWorld(projectId!),
    enabled: Boolean(projectId),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const { data: latestRender } = useQuery({
    queryKey: ["render", projectId, "latest"],
    queryFn: () => fetchLatestRender(projectId!),
    enabled: Boolean(projectId),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const [form, setForm] = useState<Pick<Project, "name" | "description" | "status"> | null>(null);
  const current = form ?? project;

  const updateMutation = useMutation({
    mutationFn: (payload: { name: string; description: string | null; status: Project["status"] }) =>
      updateProject(projectId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/projects");
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (isLoading) return <Loading fullScreen label="Loading editor..." />;
  if (isError || !project || !current) {
    return <p className="text-sm text-[var(--color-muted-foreground)]">Project not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <div className="studio-grid aspect-video bg-[#0a0a0c]">
          <EpisodePreview
            story={story}
            characterName={character?.name}
            worldName={world?.name}
            latestRender={latestRender}
          />
        </div>
      </div>

      <CharacterPanel projectId={projectId!} character={character} />

      <WorldPanel projectId={projectId!} world={world} />

      {story && <StoryOutline story={story} />}

      {story && <MemoryPanel projectId={projectId!} story={story} />}

      {character && <SelectiveRenderPanel projectId={projectId!} character={character} />}

      <ProductionPanel
        projectId={projectId!}
        story={story}
        hasCharacter={Boolean(character)}
        hasWorld={Boolean(world)}
      />

      {story && <RenderPanel projectId={projectId!} story={story} />}

      <div className="max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
        <h1 className="text-lg font-semibold">Project settings</h1>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={current.name} onChange={(e) => setForm({ ...current, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={current.description ?? ""}
            onChange={(e) => setForm({ ...current, description: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-11 w-full rounded-lg border border-[var(--color-input)] bg-[var(--color-secondary)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
            value={current.status}
            onChange={(e) => setForm({ ...current, status: e.target.value as Project["status"] })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() =>
              updateMutation.mutate({
                name: current.name,
                description: current.description,
                status: current.status,
              })
            }
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
