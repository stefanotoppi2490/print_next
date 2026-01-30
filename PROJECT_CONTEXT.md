PROJECT_CONTEXT.md

Project Overview

This project is a Next.js App Router SaaS application built with a Backend-for-Frontend (BFF) architecture.

The backend is developed by a separate team in C# and is exposed through Azure API Management (APIM).
The frontend must never communicate directly with the backend: all traffic goes through the BFF layer.

⸻

Core Architectural Principles

Backend-for-Frontend (BFF)
• All backend calls go through /app/api/\*\*
• Client components never call the external backend directly
• The BFF is responsible for:
• Attaching Authorization: Bearer <token>
• Attaching Ocp-Apim-Subscription-Key
• Preserving query parameters
• Forwarding status codes and response bodies transparently
• Forwarding logic lives in src/lib/bff/forward.ts

⸻

Authentication & Security
• Login endpoint: /users/api/auth/login
• The backend returns:
• token
• refreshToken
• Tokens are stored in HttpOnly cookies
• Tokens are never exposed to the client
• No localStorage
• No sessionStorage
• No token returned in API responses
• Client authentication check:
• /api/auth/me → { hasToken: boolean }

If the backend responds with 401 Unauthorized:
• BFF clears authentication cookies
• Client is redirected to /login

⸻

Next.js Conventions
• App Router only
• Server components used for shells and routing
• Client components only for interactivity
• searchParams in pages may be asynchronous and must be awaited
• middleware.ts is deprecated
Use src/proxy.ts with:
• export function proxy(req)
• export const config = { matcher: [...] }

⸻

Environment Variables

Defined in .env.local:
• BFF_API_BASE
• APIM_SUBSCRIPTION_KEY

Secrets must never be hardcoded.

⸻

DTOs & Data Mapping
• DTOs and runtime validation live in src/lib/bff/dtos
• Explicit DTOs are required for:
• Requests
• Responses
• Lightweight runtime validation only
• No schema libraries (e.g. Zod) unless explicitly requested

⸻

TanStack Query v5 Usage

TanStack Query is used only for server data (JSON).
UI state is handled with React state.

Query Key Convention (STRICT)

All query keys must follow this structure:

[‘mgmt’, ‘’, params]

Examples:
• [‘mgmt’, ‘users’, { pageSize, currentPage }]
• [‘mgmt’, ‘roles’, { pageSize, currentPage }]
• [‘mgmt’, ‘customers’, { pageSize, currentPage }]

Invalidation Rules

Queries must be invalidated by resource prefix only:

invalidateQueries({ queryKey: [‘mgmt’, ‘’] })

This invalidates all pages and filters for that resource and nothing else.

Forbidden query keys:
• [‘management’]
• [‘mgmt’]
• [‘users’]
• [‘management-users’]
• Any hardcoded or generic key

⸻

Pagination & Search
• Pagination is server-side using:
• pageSize
• currentPage
• Search is client-side only (backend does not support search yet)
• Use:
• placeholderData: keepPreviousData
• isLoading for first load
• isFetching for background refresh

⸻

CRUD UX Rules
• CRUD operations are modal-based
• Create and Edit share the same modal component
• Edit modal is pre-filled with existing data
• Delete always requires explicit user confirmation
• After create, edit, or delete:
• Invalidate the related resource queries

⸻

Users Feature (Reference Implementation)

Backend Endpoints
• GET /users/api/management/users
• POST /users/api/management/users
• PUT /users/api/management/users
• DELETE /users/api/management/users/{userId}

Frontend Behavior
• Paginated list
• Client-side search on the current page
• Actions column:
• Edit → opens modal
• Delete → confirmation dialog

This feature is the reference template for similar features.

⸻

Creating New Features

When creating a new feature that behaves like Users (e.g. Roles, Permissions, Customers): 1. Copy the Users feature structure 2. Replace <resource> consistently 3. Use query keys scoped to the new resource 4. Invalidate queries using the resource prefix 5. Never reuse Users query keys or routes

⸻

Coding Standards
• Strict TypeScript
• Explicit typing
• Small, readable components
• No side effects outside hooks
• No silent failures
• Errors should propagate to the UI when useful

⸻

Project Priorities
• Security (tokens server-side only)
• Predictability (strict conventions)
• Scalability (resource-scoped patterns)
• Clear separation of concerns (UI vs BFF)

All generated code must follow this document.

⸻
