"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CURRENT_USER_QUERY_KEY } from "@/lib/query/currentUser";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY });
        router.push("/login");
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
