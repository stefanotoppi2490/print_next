"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { clientFetch } from "@/lib/http/clientFetch";
import {
  UsersMapper,
  type UsersListResponseDto,
  type UserDto,
} from "@/lib/bff/dtos/users";
import UserUpsertModal from "@/app/users/user-upsert-modal";

export default function UsersClient({
  q,
  pageSize,
  currentPage,
}: {
  q: string;
  pageSize: number;
  currentPage: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();

  // search UI (debounced) — la tua API non ha query param di ricerca,
  // quindi per ora filtriamo client-side sulla pagina corrente.
  const [search, setSearch] = useState(q);

  // Modal state (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);

  const isFirstRun = useRef(true);

  useEffect(() => {
    // evita push al mount/refresh (se no ti resetta pagina)
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());

      if (search) params.set("q", search);
      else params.delete("q");

      // reset pagina SOLO quando la search cambia
      params.set("currentPage", "1");
      params.set("pageSize", String(pageSize));

      router.push(`/users?${params.toString()}`);
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const queryKey = useMemo(
    () => ["management-users", { pageSize, currentPage }],
    [pageSize, currentPage],
  );

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("pageSize", String(pageSize));
      qs.set("currentPage", String(currentPage));

      const res = await clientFetch(`/api/management/users?${qs.toString()}`);
      if (!res.ok) throw new Error(await res.text());

      const json = (await res.json()) as UsersListResponseDto;
      return UsersMapper.assertUsersListResponse(json);
    },
    placeholderData: keepPreviousData,
  });

  const users: UserDto[] = (data as UsersListResponseDto)?.users ?? [];

  // filtro client-side (finché non hai endpoint search server-side)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(needle),
    );
  }, [users, q]);

  function setPage(next: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("currentPage", String(next));
    params.set("pageSize", String(pageSize));
    router.push(`/users?${params.toString()}`);
  }

  const totalPages =
    (data as UsersListResponseDto)?.pagination?.numeroTotalePagine ?? 1;

  // DELETE mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await clientFetch(
        `/api/management/users/${encodeURIComponent(userId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      return UsersMapper.assertDeleteResponse(json);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["management-users"] });
    },
  });

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca (client-side)..."
          style={{ padding: 8, width: 320 }}
        />

        <button
          onClick={() => {
            setModalMode("create");
            setEditingUser(null);
            setModalOpen(true);
          }}
        >
          + Add user
        </button>

        {isFetching && <span style={{ fontSize: 12 }}>aggiornamento...</span>}
      </div>

      {/* Unico modal per Create/Edit */}
      <UserUpsertModal
        open={modalOpen}
        mode={modalMode}
        user={editingUser}
        onClose={() => setModalOpen(false)}
        invalidateKeyPrefix={["management-users"]}
      />

      {isLoading && <div>Caricamento...</div>}

      {error && (
        <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>
          {String((error as any)?.message ?? error)}
        </pre>
      )}

      {!isLoading && !error && (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Nome
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Ruolo
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Domain
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Active
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Last login
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Azioni
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {u.firstName} {u.lastName}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {u.email}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {u.role}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {u.domain}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {u.isActive ? "✅" : "❌"}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {u.lastLoginDate ?? "-"}
                  </td>

                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <button
                        title="Modifica"
                        onClick={() => {
                          setModalMode("edit");
                          setEditingUser(u);
                          setModalOpen(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        ✏️
                      </button>

                      <button
                        title="Elimina"
                        onClick={() => {
                          if (deleteUser.isPending) return;
                          const ok = window.confirm(
                            `Eliminare l'utente "${u.email}"?`,
                          );
                          if (!ok) return;
                          deleteUser.mutate(u.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {deleteUser.error && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                color: "crimson",
                marginTop: 10,
              }}
            >
              {String((deleteUser.error as any)?.message ?? deleteUser.error)}
            </pre>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Prev
            </button>

            <span>
              Pagina {currentPage} / {totalPages} • pageSize {pageSize}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </div>

          {q && (
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              Filtro: <b>{q}</b> (client-side su questa pagina)
            </div>
          )}
        </>
      )}
    </div>
  );
}
