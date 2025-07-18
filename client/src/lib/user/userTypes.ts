// Enums matching your Prisma Schema
export enum SystemRole {
  USER = "USER",
  DEVELOPER = "DEVELOPER",
  MAINTAINER = "MAINTAINER",
}

export enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
  GENERAL = "GENERAL",
}

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  profileImage: string | null;
  systemRole: SystemRole;
  userRole: UserRole;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  enrolledCourses?: { id: string }[];
}

/**
 * The shape of the user object as returned by the backend API.
 * This is the "source of truth" for user data in the frontend.
 */
export type SanitizedUserDto = {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  profileImage: string;
  userRole: UserRole;
  systemRole: SystemRole;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * The shape of the user object as stored in the Redux state.
 */
export type CurrentUser = SanitizedUserDto;

/**
 * The shape of the Redux state for the user slice.
 */
export interface UsersState {
  currentUser: CurrentUser | null;
}

// API Response Shapes
export interface GetMeApiResponse {
  status: string;
  data: { user: SanitizedUserDto };
}

export interface UpdateProfileApiResponse {
  status: string;
  message: string;
  data?: { user: SanitizedUserDto };
}

export interface DeleteAccountApiResponse {
  status: string;
  message: string;
}

// --- ADDED: Generic types for paginated API responses ---

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedResponseDto<T> {
  status: string;
  results: number;
  data: T[];
  pagination: PaginationInfo;
}
