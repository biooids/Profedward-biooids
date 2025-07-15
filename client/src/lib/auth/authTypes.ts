import { User } from "../user/userTypes";

// This is the response shape for both regular and dev login
export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      refreshTokenExpiresAt: string;
    };
  };
}

// DTO for the development-only login request
export interface DevLoginDto {
  userId: string;
}
