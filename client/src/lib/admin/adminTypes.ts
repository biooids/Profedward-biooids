//src/lib/admin/adminTypes.ts
import { User, UserRole } from "../user/userTypes";

// DTO for the request to update a user's role
export interface UpdateUserRoleDto {
  role: UserRole;
}

// API response shape for fetching all users
export interface GetAllUsersApiResponse {
  status: string;
  data: User[];
}
