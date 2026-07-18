import { Outlet } from "react-router-dom";

import { GenerationBar } from "@/components/layout/GenerationBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StudioHeader } from "@/components/layout/StudioHeader";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudioHeader />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <Outlet />
          </div>
        </div>
        <GenerationBar />
      </div>
    </div>
  );
}
