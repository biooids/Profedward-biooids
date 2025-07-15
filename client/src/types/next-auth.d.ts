import "next-auth";
import "next-auth/jwt";
// Import both role enums
import { SystemRole, UserRole } from "@/lib/user/userTypes";

// 1. Augment the JWT type to hold all necessary backend data
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    picture?: string | null; // Use 'picture' as it's the standard JWT property for image
    systemRole: SystemRole;
    userRole: UserRole;

    // Backend tokens
    backendAccessToken: string;
    backendAccessTokenExpiresAt: number;
    backendRefreshToken: string;
  }
}

// 2. Augment the Session type to reflect what the client needs
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      name: string | null;
      email: string | null;
      image: string | null;
      systemRole: SystemRole;
      userRole: UserRole;
    };

    // Expose the access token and any errors to the client
    backendAccessToken?: string;
    error?: string;
  }
}
