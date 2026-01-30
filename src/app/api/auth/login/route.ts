import { AuthMapper, type LoginRequestDto } from "@/lib/bff/dtos/auth";
import { setAuthCookies } from "@/lib/bff/authCookies";

export async function POST(req: Request) {
  const base = process.env.BFF_API_BASE;
  if (!base)
    return Response.json(
      { message: "Missing env BFF_API_BASE" },
      { status: 500 },
    );

  let body: LoginRequestDto;
  try {
    body = await req.json();
  } catch {
    return Response.json({ message: "Body JSON non valido" }, { status: 400 });
  }
  const subKey = process.env.APIM_SUBSCRIPTION_KEY;
  const res = await fetch(`${base}/users/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(subKey ? { "Ocp-Apim-Subscription-Key": subKey } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    // Propaga l’errore del backend (utile per mostrarlo in UI)
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const data = await res.json();

  // Valida e mappa risposta
  const mapped = AuthMapper.assertLoginResponse(data);

  // Salva token + refreshToken in cookie HttpOnly (token mai al client)
  await setAuthCookies(mapped.token, mapped.refreshToken);

  return Response.json({
    ok: true,
    userId: mapped.userId,
    message: mapped.message,
  });
}
