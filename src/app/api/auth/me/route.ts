import { getAccessToken } from "@/lib/bff/authCookies";

export async function GET() {
  const token = await getAccessToken();
  return Response.json({ hasToken: Boolean(token) });
}
