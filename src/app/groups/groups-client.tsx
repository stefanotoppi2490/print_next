"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/http/clientFetch";
import {
  GroupsMapper,
  type UserGroupDto,
  type UserGroupListDto,
} from "@/lib/bff/dtos/groups";
import GroupUpsertModal from "@/app/groups/group-upsert-modal";
import GroupMembersModal from "@/app/groups/group-members-modal";

export default function GroupsClient({ domain }: { domain: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();

  const [domainInput, setDomainInput] = useState(domain);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingGroup, setEditingGroup] = useState<UserGroupDto | null>(null);
  const [membersModalGroup, setMembersModalGroup] =
    useState<UserGroupDto | null>(null);

  const queryKey = useMemo(() => ["mgmt", "groups", { domain }], [domain]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("domain", domain);

      const res = await clientFetch(`/api/usergroup?${qs.toString()}`);
      if (!res.ok) throw new Error(await res.text());

      const json = (await res.json()) as UserGroupListDto;
      return GroupsMapper.assertUserGroupList(json);
    },
  });

  const groups: UserGroupDto[] = Array.isArray(data) ? data : [];

  function applyDomain() {
    const params = new URLSearchParams(sp.toString());
    if (domainInput.trim()) {
      params.set("domain", domainInput.trim());
    } else {
      params.delete("domain");
    }
    router.push(`/groups?${params.toString()}`);
  }

  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const res = await clientFetch(
        `/api/usergroup/${encodeURIComponent(groupId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Eliminazione fallita");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mgmt", "groups"] });
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
          flexWrap: "wrap",
        }}
      >
        <input
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          placeholder="Domain (es. wtgprint.com)"
          style={{ padding: 8, width: 240 }}
        />
        <button onClick={applyDomain}>Applica domain</button>

        <button
          onClick={() => {
            setModalMode("create");
            setEditingGroup(null);
            setModalOpen(true);
          }}
        >
          + Aggiungi gruppo
        </button>

        {isFetching && (
          <span style={{ fontSize: 12 }}>aggiornamento...</span>
        )}
      </div>

      <GroupUpsertModal
        open={modalOpen}
        mode={modalMode}
        group={editingGroup}
        domain={domain}
        onClose={() => setModalOpen(false)}
        invalidateKeyPrefix={["mgmt", "groups"]}
      />

      {membersModalGroup && (
        <GroupMembersModal
          open={!!membersModalGroup}
          group={membersModalGroup}
          onClose={() => setMembersModalGroup(null)}
          invalidateKeyPrefix={["mgmt", "groups"]}
        />
      )}

      {isLoading && <div>Caricamento...</div>}

      {error && (
        <pre style={{ whiteSpace: "pre-wrap", color: "crimson" }}>
          {String((error as Error)?.message ?? error)}
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
                  Descrizione
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
                  Tipo
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
              {groups.map((g) => (
                <tr key={g.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {g.name}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {g.description || "—"}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {g.domain}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {g.isDomainUsersGroup ? "Domain Users" : "Custom"}
                  </td>

                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <button
                        title="Membri"
                        onClick={() => setMembersModalGroup(g)}
                        style={{ cursor: "pointer" }}
                      >
                        👥 Members
                      </button>

                      {!g.isDomainUsersGroup && (
                        <>
                          <button
                            title="Modifica"
                            onClick={() => {
                              setModalMode("edit");
                              setEditingGroup(g);
                              setModalOpen(true);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            ✏️
                          </button>

                          <button
                            title="Elimina"
                            onClick={() => {
                              if (deleteGroup.isPending) return;
                              const ok = window.confirm(
                                `Eliminare il gruppo "${g.name}"?`,
                              );
                              if (!ok) return;
                              deleteGroup.mutate(g.id);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {deleteGroup.error && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                color: "crimson",
                marginTop: 10,
              }}
            >
              {String(
                (deleteGroup.error as Error)?.message ?? deleteGroup.error,
              )}
            </pre>
          )}

          {groups.length === 0 && (
            <p style={{ marginTop: 16, color: "#666" }}>
              Nessun gruppo per il domain selezionato. Cambia domain o aggiungi
              un gruppo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
