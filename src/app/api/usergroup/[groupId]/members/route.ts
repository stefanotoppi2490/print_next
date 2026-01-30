import { forwardToBackend } from "@/lib/bff/forward";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await ctx.params;

  return forwardToBackend(req, {
    backendPath: `/users/api/UserGroup/${encodeURIComponent(groupId)}/members`,
    requireAuth: true,
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await ctx.params;

  return forwardToBackend(req, {
    backendPath: `/users/api/UserGroup/${encodeURIComponent(groupId)}/members`,
    requireAuth: true,
  });
}
