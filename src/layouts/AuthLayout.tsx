import { Clapperboard, Sparkles } from "lucide-react";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div className="studio-grid absolute inset-0 bg-[#09090b]" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-600/10" />
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="studio-gradient flex h-10 w-10 items-center justify-center rounded-xl">
              <Clapperboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Animation OS</p>
              <p className="text-xs uppercase tracking-widest text-zinc-500">AI Video Studio</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 p-10">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Generate professional animations with{" "}
            <span className="studio-gradient-text">AI precision</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm text-zinc-400">
            The operating system for AI-powered video creation. Built for creators, studios, and teams.
          </p>
        </div>
        <div className="relative z-10 flex gap-6 p-10 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            Text-to-video
          </span>
          <span>Scene editing</span>
          <span>Project pipeline</span>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-[var(--color-background)] px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="studio-gradient flex h-9 w-9 items-center justify-center rounded-lg">
              <Clapperboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Animation OS</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
