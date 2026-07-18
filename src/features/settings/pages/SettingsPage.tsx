import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export function SettingsPage() {
  const { data: user } = useCurrentUser();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Account & studio preferences</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="border-b border-[var(--color-border)] px-5 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">Profile</p>
        </div>
        <ul className="divide-y divide-[var(--color-border)] text-sm">
          <li className="flex items-center justify-between px-5 py-4">
            <span className="text-[var(--color-muted-foreground)]">Email</span>
            <span>{user?.email ?? "—"}</span>
          </li>
          <li className="flex items-center justify-between px-5 py-4">
            <span className="text-[var(--color-muted-foreground)]">Full name</span>
            <span>{user?.full_name ?? "—"}</span>
          </li>
          <li className="flex items-center justify-between px-5 py-4">
            <span className="text-[var(--color-muted-foreground)]">Member since</span>
            <span>{user ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
