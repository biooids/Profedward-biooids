// src/types/auth.types.ts
import { JwtPayload as OriginalJwtPayload } from "jsonwebtoken";
import { SystemRole, UserRole } from "../../prisma/generated/prisma";

// --- JWT Payloads ---
export interface DecodedAccessTokenPayload {
  id: string;
  userRole: UserRole; // <-- ADD THIS LINE

  systemRole: SystemRole;
  type: "access";
  iat: number;
  exp: number;
  username: string;
  displayName: string | null;
  profileImage?: string; // This is correct (optional string)
}
export interface DecodedRefreshTokenPayload extends OriginalJwtPayload {
  id: string;
  jti: string;
  type: "refresh";
}

// --- Service Input DTOs ---
export interface SignUpInputDto {
  // Renamed from SignInInputDto
  email: string;
  username: string;
  password: string;
  displayName: string; // Now required for signup
}

export interface LoginInputDto {
  email: string;
  password: string;
}

export interface RefreshTokenInputDto {
  incomingRefreshToken: string;
}

export interface LogoutInputDto {
  userId?: string | undefined;
  incomingRefreshToken?: string | undefined;
}

// --- Service Output DTOs ---
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

// For User Update DTO (for the new updateUser controller)
export interface UpdateUserProfileDto {
  displayName?: string;
  profileImage?: string;
  username?: string; // <-- ADD THIS LINE

  // We will not allow email/username changes here for simplicity
}

// ... (keep all your existing types)

// DTO for the development-only login endpoint
export interface DevLoginInputDto {
  userId: string;
}
