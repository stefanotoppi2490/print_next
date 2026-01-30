import { getAccessToken, clearAuthCookies } from "./authCookies";

type ForwardOptions = {
  backendPath: string; // es: '/users/api/auth/login' oppure '/users/api/users'
  requireAuth?: boolean; // default true per le API protette
};

export async function forwardToBackend(req: Request, opts: ForwardOptions) {
  const base = process.env.BFF_API_BASE;
  if (!base) {
    return Response.json(
      { message: "Missing env BFF_API_BASE" },
      { status: 500 },
    );
  }

  const requireAuth = opts.requireAuth ?? true;
  const token = await getAccessToken();

  if (requireAuth && !token) {
    return Response.json(
      { message: "Unauthorized (missing token)" },
      { status: 401 },
    );
  }

  // Mantieni querystring dell’utente (?q=...&page=...)
  const incomingUrl = new URL(req.url);
  const targetUrl = `${base}${opts.backendPath}${incomingUrl.search}`;

  // Headers: passa content-type se presente e imposta Authorization server-side
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const subKey = process.env.APIM_SUBSCRIPTION_KEY;
  if (subKey) headers.set("Ocp-Apim-Subscription-Key", subKey);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", req.headers.get("accept") ?? "application/json");

  if (token) headers.set("authorization", `Bearer ${token}`);

  const method = req.method.toUpperCase();
  // DELETE senza body: alcuni backend/APIM danno 500 se invii body vuoto
  const hasBody =
    !["GET", "HEAD", "DELETE"].includes(method);

  const res = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });

  if (res.status === 401) {
    await clearAuthCookies();
    return Response.json(
      { message: "Unauthorized (missing token)" },
      { status: 401 },
    );
  }

  // 204 No Content: non leggere il body (stream vuoto può dare errore) e ritorna senza body
  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  // Ritorna esattamente status + body (senza perdere content-type)
  const resContentType = res.headers.get("content-type") ?? "application/json";
  return new Response(await res.text(), {
    status: res.status,
    headers: { "content-type": resContentType },
  });
}
