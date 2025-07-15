import { UserRole } from "prisma/generated/prisma";

// DTO for the request body when updating a user's role
export interface UpdateUserRoleDto {
  role: UserRole;
}
