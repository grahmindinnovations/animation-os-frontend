import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Loading } from "@/components/common/Loading";
import { createProject, fetchProjects } from "@/features/projects/api/projectsApi";

export function StudioHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const startedRef = useRef(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: () => createProject({ name: "New animation" }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate(`/projects/${project.id}`, { replace: true });
    },
  });

  useEffect(() => {
    if (isLoading || !projects || startedRef.current) return;

    if (projects.length > 0) {
      startedRef.current = true;
      navigate(`/projects/${projects[0].id}`, { replace: true });
      return;
    }

    startedRef.current = true;
    createMutation.mutate();
  }, [isLoading, projects, navigate, createMutation]);

  return <Loading fullScreen label="Opening studio..." />;
}
