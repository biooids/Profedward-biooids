// src/types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";
import { SystemRole, UserRole } from "@/lib/user/userTypes";

declare module "next-auth" {
  /**
   * This is the shape of the object returned by the `authorize` callback.
   * It must include all the custom properties you are returning from your backend.
   */
  interface User {
    id: string;
    username: string;
    systemRole: SystemRole;
    userRole: UserRole;
    backendAccessToken: string;
    backendAccessTokenExpiresAt: number;
    backendRefreshToken: string;
  }

  /**
   * This is the session object that the client-side `useSession` hook receives.
   * It should only contain the properties you want to expose to the frontend.
   */
  interface Session {
    user: {
      id: string;
      username: string;
      systemRole: SystemRole;
      userRole: UserRole;
    } & DefaultSession["user"]; // Merges with default fields like `name`, `email`, `image`

    backendAccessToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * The JWT token holds all the data that is passed between the `jwt` and `session` callbacks.
   * It should mirror the `User` interface and can contain additional properties.
   */
  interface JWT {
    id: string;
    username: string;
    systemRole: SystemRole;
    userRole: UserRole;
    backendAccessToken: string;
    backendAccessTokenExpiresAt: number;
    backendRefreshToken: string;
    picture?: string | null; // Standard property for image URL from OAuth
  }
}
