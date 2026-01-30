import { forwardToBackend } from "@/lib/bff/forward";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ groupId: string; userId: string }> },
) {
  const { groupId, userId } = await ctx.params;

  return forwardToBackend(req, {
    backendPath: `/users/api/UserGroup/${encodeURIComponent(groupId)}/members/${encodeURIComponent(userId)}`,
    requireAuth: true,
  });
}
