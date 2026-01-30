"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/http/clientFetch";
import {
  UsersMapper,
  type CreateUserRequestDto,
  type UpdateUserRequestDto,
  type UserDto,
  type UserRole,
} from "@/lib/bff/dtos/users";

type Mode = "create" | "edit";

export default function UserUpsertModal({
  open,
  mode,
  user,
  onClose,
  invalidateKeyPrefix,
}: {
  open: boolean;
  mode: Mode;
  user?: UserDto | null; // solo per edit
  onClose: () => void;
  invalidateKeyPrefix: unknown[]; // es: ['management-users']
}) {
  const qc = useQueryClient();

  const isEdit = mode === "edit";
  const title = isEdit ? "Modifica user" : "Aggiungi user";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("wtgprint.com");
  const [role, setRole] = useState<UserRole>("u");
  const [isActive, setIsActive] = useState(true);
  const [customerId, setCustomerId] = useState("");

  // Precompila quando apri in edit
  useEffect(() => {
    if (!open) return;

    if (isEdit && user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setDomain(user.domain ?? "wtgprint.com");
      setRole(user.role ?? "u");
      setIsActive(Boolean(user.isActive));
      setCustomerId(""); // non lo hai in response, quindi lo lasciamo vuoto
    } else {
      // create reset
      setFirstName("");
      setLastName("");
      setEmail("");
      setDomain("wtgprint.com");
      setRole("u");
      setIsActive(true);
      setCustomerId("");
    }
  }, [open, isEdit, user]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isEdit) {
        const payload: CreateUserRequestDto = {
          firstName,
          lastName,
          email,
          domain,
          role,
          customerId: customerId.trim() ? customerId.trim() : null,
        };

        const res = await clientFetch("/api/management/users", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(await res.text());
        return UsersMapper.assertUserDto(await res.json());
      }

      if (!user?.id) throw new Error("User non valida");

      const payload: UpdateUserRequestDto = {
        userId: user.id,
        firstName,
        lastName,
        role,
        isActive,
      };

      const res = await clientFetch("/api/management/users", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      return UsersMapper.assertUserDto(await res.json());
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
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ padding: 8 }}
          />
          <input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ padding: 8 }}
          />

          <input
            placeholder="Email"
            value={email}
            disabled={isEdit} // in edit l’API non lo accetta → blocco
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 8,
              gridColumn: "1 / -1",
              opacity: isEdit ? 0.7 : 1,
            }}
          />

          <input
            placeholder="Domain"
            value={domain}
            disabled={isEdit} // idem, non nel payload PUT
            onChange={(e) => setDomain(e.target.value)}
            style={{ padding: 8, opacity: isEdit ? 0.7 : 1 }}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            style={{ padding: 8 }}
          >
            <option value="u">u</option>
            <option value="p">p</option>
            <option value="c">c</option>
          </select>

          {isEdit ? (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 4,
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          ) : (
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
            {String((mutation.error as any)?.message ?? mutation.error)}
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
            disabled={
              mutation.isPending ||
              !firstName ||
              !lastName ||
              (!isEdit && (!email || !domain))
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Salvo..." : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}
