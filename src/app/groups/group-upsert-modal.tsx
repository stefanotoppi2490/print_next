"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/http/clientFetch";
import {
  GroupsMapper,
  type CreateUserGroupRequestDto,
  type UpdateUserGroupRequestDto,
  type UserGroupDto,
} from "@/lib/bff/dtos/groups";

type Mode = "create" | "edit";

export default function GroupUpsertModal({
  open,
  mode,
  group,
  domain,
  onClose,
  invalidateKeyPrefix,
}: {
  open: boolean;
  mode: Mode;
  group?: UserGroupDto | null;
  domain: string;
  onClose: () => void;
  invalidateKeyPrefix: unknown[];
}) {
  const qc = useQueryClient();

  const isEdit = mode === "edit";
  const title = isEdit ? "Modifica gruppo" : "Aggiungi gruppo";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domainValue, setDomainValue] = useState(domain);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit && group) {
      setName(group.name ?? "");
      setDescription(group.description ?? "");
      setDomainValue(group.domain ?? domain);
      setCustomerId(group.customerId ?? "");
    } else {
      setName("");
      setDescription("");
      setDomainValue(domain);
      setCustomerId("");
    }
  }, [open, isEdit, group, domain]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isEdit) {
        const payload: CreateUserGroupRequestDto = {
          name,
          description,
          domain: domainValue,
          customerId: customerId.trim() ? customerId.trim() : null,
        };

        const res = await clientFetch("/api/usergroup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(await res.text());
        return GroupsMapper.assertUserGroupDto(await res.json());
      }

      if (!group?.id) throw new Error("Gruppo non valido");

      const payload: UpdateUserGroupRequestDto = {
        name,
        description,
      };

      const res = await clientFetch(
        `/api/usergroup/${encodeURIComponent(group.id)}`,
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error(await res.text());
      return GroupsMapper.assertUserGroupDto(await res.json());
    },
    onSuccess: () => {
      onClose();
      qc.invalidateQueries({ queryKey: invalidateKeyPrefix });
    },
  });

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
      onClick={() => !mutation.isPending && onClose()}
    >
      <div
        style={{ background: "white", padding: 16, width: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <input
            placeholder="Nome gruppo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: 8, gridColumn: "1 / -1" }}
          />

          <textarea
            placeholder="Descrizione"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              padding: 8,
              gridColumn: "1 / -1",
              resize: "vertical",
            }}
          />

          <input
            placeholder="Domain"
            value={domainValue}
            disabled={isEdit}
            onChange={(e) => setDomainValue(e.target.value)}
            style={{ padding: 8, opacity: isEdit ? 0.7 : 1 }}
          />

          {!isEdit && (
            <input
              placeholder="CustomerId (optional)"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={{ padding: 8 }}
            />
          )}
        </div>

        {mutation.error && (
          <pre
            style={{ whiteSpace: "pre-wrap", color: "crimson", marginTop: 10 }}
          >
            {String((mutation.error as Error)?.message ?? mutation.error)}
          </pre>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <button disabled={mutation.isPending} onClick={onClose}>
            Annulla
          </button>
          <button
            disabled={mutation.isPending || !name.trim()}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Salvo..." : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}
