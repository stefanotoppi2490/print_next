import { getAccessToken, getUserId } from "@/lib/bff/authCookies";

export async function GET() {
  const token = await getAccessToken();
  const userId = await getUserId();
  const hasToken = Boolean(token);
  return Response.json({
    hasToken,
    userId: hasToken ? userId ?? null : null,
  });
}
