import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const USER_ID_COOKIE = "user_id";

export async function setAuthCookies(
  token: string,
  refreshToken?: string,
  userId?: string,
) {
  const jar = await cookies();

  jar.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  if (refreshToken) {
    jar.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  if (userId) {
    jar.set(USER_ID_COOKIE, userId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  jar.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  jar.set(USER_ID_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

async function getUserIdImpl(): Promise<string | undefined> {
  return (await cookies()).get(USER_ID_COOKIE)?.value;
}

export { getUserIdImpl as getUserId };
