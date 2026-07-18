import { Clapperboard, FolderKanban, LayoutDashboard, LogOut, Settings, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { to: "/dashboard", label: "Studio", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string | null | undefined, email: string | undefined) {
  if (name?.trim()) {
    return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { data: user } = useCurrentUser();

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)]">
      <div className="border-b border-[var(--color-border)] px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="studio-gradient flex h-9 w-9 items-center justify-center rounded-lg shadow-[0_0_16px_rgba(6,182,212,0.3)]">
            <Clapperboard className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Animation OS</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-sidebar-muted)]">
              AI Video Studio
            </p>
          </div>
        </div>
      </div>

      <div className="p-3">
        <Button className="w-full" onClick={() => navigate("/projects")}>
          <Sparkles className="h-4 w-4" />
          New Animation
        </Button>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-[var(--color-sidebar-active)] text-white"
                  : "text-[var(--color-sidebar-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-foreground)]",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-[var(--color-border)] p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="studio-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
            {getInitials(user?.full_name, user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.full_name || "Creator"}</p>
            <p className="truncate text-xs text-[var(--color-sidebar-muted)]">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full justify-start text-[var(--color-sidebar-muted)] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
