"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFetch } from "@/lib/http/clientFetch";
import {
  UsersMapper,
  type CreateUserRequestDto,
  type UserRole,
} from "@/lib/bff/dtos/users";

export default function AddUserModal({
  invalidateKeyPrefix,
}: {
  invalidateKeyPrefix: unknown[]; // es: ['management-users']
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("wtgprint.com");
  const [role, setRole] = useState<UserRole>("u");
  const [customerId, setCustomerId] = useState<string>("");

  const createUser = useMutation({
    mutationFn: async () => {
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

      const json = await res.json();
      return UsersMapper.assertUserDto(json);
    },
    onSuccess: () => {
      setOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("u");
      setCustomerId("");

      // Riallinea tutte le pagine/queries users
      qc.invalidateQueries({ queryKey: invalidateKeyPrefix });
    },
  });

  return (
    <>
      <button onClick={() => setOpen(true)}>+ Add user</button>

      {open && (
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
          onClick={() => !createUser.isPending && setOpen(false)}
        >
          <div
            style={{ background: "white", padding: 16, width: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Aggiungi user</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
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
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: 8, gridColumn: "1 / -1" }}
              />
              <input
                placeholder="Domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{ padding: 8 }}
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

              <input
                placeholder="CustomerId (optional)"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ padding: 8, gridColumn: "1 / -1" }}
              />
            </div>

            {createUser.error && (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  color: "crimson",
                  marginTop: 10,
                }}
              >
                {String((createUser.error as any)?.message ?? createUser.error)}
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
              <button
                disabled={createUser.isPending}
                onClick={() => setOpen(false)}
              >
                Annulla
              </button>
              <button
                disabled={
                  createUser.isPending ||
                  !firstName ||
                  !lastName ||
                  !email ||
                  !domain
                }
                onClick={() => createUser.mutate()}
              >
                {createUser.isPending ? "Salvo..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
