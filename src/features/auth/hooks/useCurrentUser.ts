import { useQuery } from "@tanstack/react-query";

import { fetchCurrentUser } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/stores/authStore";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  });
}
