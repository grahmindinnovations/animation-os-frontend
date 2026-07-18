import { Outlet, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { StudioHeader } from "@/components/layout/StudioHeader";
import { fetchProject } from "@/features/projects/api/projectsApi";

function isProjectStudioRoute(pathname: string): boolean {
  return /^\/projects\/[^/]+$/.test(pathname) && !pathname.endsWith("/dev");
}

export function DashboardLayout() {
  const { pathname } = useLocation();
  const { projectId } = useParams<{ projectId?: string }>();
  const isStudio = isProjectStudioRoute(pathname);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId && isStudio),
  });

  return (
    <div className="flex h-screen gap-2 overflow-hidden bg-[var(--color-background)] p-2 sm:gap-3 sm:p-3">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <StudioHeader projectName={isStudio ? project?.name : undefined} isStudio={isStudio} />
        <div className={isStudio ? "min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1 overflow-y-auto"}>
          <div
            className={
              isStudio
                ? "h-full"
                : "mx-auto h-full w-full max-w-3xl px-2 py-4 sm:px-4 sm:py-6"
            }
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
