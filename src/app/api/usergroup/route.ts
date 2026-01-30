import { forwardToBackend } from "@/lib/bff/forward";

export async function GET(req: Request) {
  return forwardToBackend(req, {
    backendPath: "/users/api/UserGroup",
    requireAuth: true,
  });
}

export async function POST(req: Request) {
  return forwardToBackend(req, {
    backendPath: "/users/api/UserGroup",
    requireAuth: true,
  });
}
