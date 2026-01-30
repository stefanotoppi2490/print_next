export async function clientFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);

  // se BFF risponde 401 → vai al login
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }

  return res;
}
