// ─── UserGroup (single) ─────────────────────────────────────────────────────
export type UserGroupDto = {
  id: string;
  name: string;
  description: string;
  domain: string;
  customerId: string | null;
  createdBy: string;
  created: string;
  updated: string;
  isDomainUsersGroup: boolean;
};

export type CreateUserGroupRequestDto = {
  name: string;
  description: string;
  domain: string;
  customerId: string | null;
};

export type UpdateUserGroupRequestDto = {
  name: string;
  description: string;
};

// ─── List: GET /users/api/UserGroup?domain= → array ──────────────────────────
export type UserGroupListDto = UserGroupDto[];

// ─── Members ─────────────────────────────────────────────────────────────────
export type GroupMemberUserDto = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type GroupMemberDto = {
  id: string;
  userGroupId: string;
  printUserId: string;
  user: GroupMemberUserDto;
  created: string;
};

export type AddMemberRequestDto = { userId: string };

export type AddMemberResponseDto = { message: string };

// ─── Mappers (lightweight runtime validation) ────────────────────────────────
export class GroupsMapper {
  static assertUserGroupDto(data: unknown): UserGroupDto {
    if (!data || typeof data !== "object")
      throw new Error("UserGroup response non valida");
    const o = data as Record<string, unknown>;
    if (typeof o.id !== "string") throw new Error("UserGroup id mancante");
    return data as UserGroupDto;
  }

  static assertUserGroupList(data: unknown): UserGroupListDto {
    if (!Array.isArray(data)) throw new Error("UserGroup list non valida");
    return data as UserGroupListDto;
  }

  static assertGroupMemberDto(data: unknown): GroupMemberDto {
    if (!data || typeof data !== "object")
      throw new Error("GroupMember response non valida");
    const o = data as Record<string, unknown>;
    if (typeof o.id !== "string") throw new Error("GroupMember id mancante");
    if (!o.user || typeof o.user !== "object")
      throw new Error("GroupMember user mancante");
    return data as GroupMemberDto;
  }

  static assertGroupMemberList(data: unknown): GroupMemberDto[] {
    if (!Array.isArray(data)) throw new Error("GroupMember list non valida");
    return data as GroupMemberDto[];
  }

  static assertAddMemberResponse(data: unknown): AddMemberResponseDto {
    if (!data || typeof data !== "object")
      throw new Error("AddMember response non valida");
    const o = data as Record<string, unknown>;
    if (typeof o.message !== "string")
      throw new Error("AddMember message mancante");
    return data as AddMemberResponseDto;
  }
}
