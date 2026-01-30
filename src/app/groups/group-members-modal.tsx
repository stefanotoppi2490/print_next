"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/http/clientFetch";
import {
  GroupsMapper,
  type UserGroupDto,
  type GroupMemberDto,
  type AddMemberResponseDto,
} from "@/lib/bff/dtos/groups";
import {
  UsersMapper,
  type UsersListResponseDto,
  type UserDto,
} from "@/lib/bff/dtos/users";

const USERS_PAGE_SIZE = 200;

export default function GroupMembersModal({
  open,
  group,
  onClose,
  invalidateKeyPrefix,
}: {
  open: boolean;
  group: UserGroupDto;
  onClose: () => void;
  invalidateKeyPrefix: unknown[];
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const membersQueryKey = useMemo(
    () => ["mgmt", "groups", group.id, "members"],
    [group.id],
  );

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: membersQueryKey,
    queryFn: async () => {
      const res = await clientFetch(
        `/api/usergroup/${encodeURIComponent(group.id)}/members`,
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return GroupsMapper.assertGroupMemberList(json);
    },
    enabled: open && !!group.id,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["mgmt", "users-for-group-members", { pageSize: USERS_PAGE_SIZE, currentPage: 1 }],
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("pageSize", String(USERS_PAGE_SIZE));
      qs.set("currentPage", "1");
      const res = await clientFetch(`/api/management/users?${qs.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as UsersListResponseDto;
      return UsersMapper.assertUsersListResponse(json);
    },
    enabled: open,
  });

  const addMember = useMutation({
    mutationFn: async (userId: string) => {
      const res = await clientFetch(
        `/api/usergroup/${encodeURIComponent(group.id)}/members`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return GroupsMapper.assertAddMemberResponse(json) as AddMemberResponseDto;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: membersQueryKey });
      qc.invalidateQueries({ queryKey: invalidateKeyPrefix });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const res = await clientFetch(
        `/api/usergroup/${encodeURIComponent(group.id)}/members/${encodeURIComponent(userId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: membersQueryKey });
      qc.invalidateQueries({ queryKey: invalidateKeyPrefix });
    },
  });

  const members: GroupMemberDto[] = Array.isArray(membersData) ? membersData : [];
  const memberUserIds = useMemo(
    () => new Set(members.map((m) => m.user.userId)),
    [members],
  );

  const usersList = (usersData as UsersListResponseDto)?.users ?? [];
  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return usersList;
    return usersList.filter(
      (u) =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(needle),
    );
  }, [usersList, search]);

  const isLoading = membersLoading || usersLoading;

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={() => onClose()}
    >
      <div
        style={{
          background: "white",
          padding: 16,
          width: 560,
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>
          Membri: {group.name}
        </h3>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca utenti (nome, email)..."
          style={{ padding: 8, marginBottom: 12, width: "100%", boxSizing: "border-box" }}
        />

        {isLoading && <div>Caricamento...</div>}

        {!isLoading && (
          <div
            style={{
              overflow: "auto",
              flex: 1,
              minHeight: 200,
              border: "1px solid #eee",
              borderRadius: 4,
              padding: 8,
            }}
          >
            {filteredUsers.length === 0 ? (
              <p style={{ color: "#666" }}>Nessun utente trovato.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #ddd" }}>
                      Nome
                    </th>
                    <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #ddd" }}>
                      Email
                    </th>
                    <th style={{ textAlign: "right", padding: 6, borderBottom: "1px solid #ddd" }}>
                      Azione
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u: UserDto) => {
                    const isMember = memberUserIds.has(u.id);
                    const addPending = addMember.isPending && addMember.variables === u.id;
                    const removePending = removeMember.isPending && removeMember.variables === u.id;
                    const pending = addPending || removePending;

                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 6 }}>
                          {u.firstName} {u.lastName}
                        </td>
                        <td style={{ padding: 6 }}>{u.email}</td>
                        <td style={{ padding: 6, textAlign: "right" }}>
                          {isMember ? (
                            <button
                              disabled={pending}
                              onClick={() => removeMember.mutate(u.id)}
                              style={{
                                cursor: pending ? "not-allowed" : "pointer",
                                color: "#c00",
                              }}
                            >
                              {removePending ? "..." : "Rimuovi"}
                            </button>
                          ) : (
                            <button
                              disabled={pending}
                              onClick={() => addMember.mutate(u.id)}
                              style={{
                                cursor: pending ? "not-allowed" : "pointer",
                              }}
                            >
                              {addPending ? "..." : "Aggiungi"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {(addMember.error || removeMember.error) && (() => {
          const err = addMember.error || removeMember.error;
          return (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                color: "crimson",
                marginTop: 8,
                fontSize: 12,
              }}
            >
              {String(err instanceof Error ? err.message : err)}
            </pre>
          );
        })()}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <button onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}
