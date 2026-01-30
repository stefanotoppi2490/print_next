export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  token: string;
  refreshToken: string;
  userId: string;
  message: string;
};

// Piccola “classe mapper” (in TS la usiamo come helper)
export class AuthMapper {
  static assertLoginResponse(data: any): LoginResponseDto {
    if (!data || typeof data !== "object")
      throw new Error("Login response non valida");

    const token = data.token;
    const refreshToken = data.refreshToken;
    const userId = data.userId;
    const message = data.message;

    if (typeof token !== "string" || !token) throw new Error("token mancante");
    if (typeof refreshToken !== "string" || !refreshToken)
      throw new Error("refreshToken mancante");
    if (typeof userId !== "string" || !userId)
      throw new Error("userId mancante");
    if (typeof message !== "string") throw new Error("message non valida");

    return { token, refreshToken, userId, message };
  }
}
