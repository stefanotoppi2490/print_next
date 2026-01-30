export type UserRole = "u" | "p" | "c";

export type CreateUserRequestDto = {
  firstName: string;
  lastName: string;
  email: string;
  domain: string;
  role: UserRole;
  customerId: string | null;
};

export type UserDto = {
  firstName: string;
  lastName: string;
  email: string;
  domain: string;
  role: UserRole;
  isActive: boolean;
  lastLoginDate: string | null;
  id: string;
  created: string;
  updated: string;
  delete: string | null;
};

export type UsersPaginationDto = {
  paginaCorrente: number;
  numeroTotalePagine: number;
  pageSize: number;
};

export type UsersListResponseDto = {
  pagination: UsersPaginationDto;
  users: UserDto[];
};

export type UpdateUserRequestDto = {
  userId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
};

export type DeleteUserResponseDto = {
  message: string;
};

export class UsersMapper {
  static assertUsersListResponse(data: any): UsersListResponseDto {
    if (!data || typeof data !== "object")
      throw new Error("Users list response non valida");
    if (!data.pagination || !Array.isArray(data.users))
      throw new Error("Shape risposta users non valida");
    return data as UsersListResponseDto;
  }

  static assertUserDto(data: any): UserDto {
    if (!data || typeof data !== "object")
      throw new Error("User response non valida");
    if (typeof data.id !== "string") throw new Error("User id mancante");
    return data as UserDto;
  }

  static assertDeleteResponse(data: any): DeleteUserResponseDto {
    if (!data || typeof data !== "object")
      throw new Error("Delete response non valida");
    if (typeof data.message !== "string")
      throw new Error("Delete message mancante");
    return data as DeleteUserResponseDto;
  }
}
