import { forwardToBackend } from "@/lib/bff/forward";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ userId: string }> },
) {
  const { userId } = await ctx.params;

  return forwardToBackend(req, {
    backendPath: `/users/api/management/users/${encodeURIComponent(userId)}`,
    requireAuth: true,
  });
}
