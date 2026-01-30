import { clearAuthCookies } from "@/lib/bff/authCookies";

export async function POST() {
  await clearAuthCookies();
  return Response.json({ ok: true });
}
