"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { clientFetch } from "@/lib/http/clientFetch";
import { UsersMapper, type UserDto } from "@/lib/bff/dtos/users";

/** Query key per l'utente loggato (user account context). Lettura globale, invalidare al logout. */
export const CURRENT_USER_QUERY_KEY = ["mgmt", "current-user"] as const;

type AuthMeResponse = { hasToken: boolean; userId: string | null };

async function fetchCurrentUser(): Promise<UserDto | null> {
  const meRes = await clientFetch("/api/auth/me");
  const me = (await meRes.json()) as AuthMeResponse;
  if (!me.hasToken || !me.userId) return null;

  const userRes = await clientFetch(
    `/api/management/users/${encodeURIComponent(me.userId)}`,
  );
  if (!userRes.ok) throw new Error(await userRes.text());
  return UsersMapper.assertUserDto(await userRes.json());
}

/**
 * Hook per leggere l'utente loggato (user account context).
 * Dominio, role, email, ecc. sono SOLO in lettura; non modificabili dalla UI.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/**
 * Bootstrap: monta la query current-user così è disponibile per tutta l'app.
 * Da usare nel layout principale (dentro Providers).
 */
export function UserAccountBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  useCurrentUser();
  return React.createElement(React.Fragment, null, children);
}
