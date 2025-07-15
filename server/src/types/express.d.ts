// src/types/express.d.ts

import { SystemRole, UserRole } from "../../prisma/generated/prisma"; // Ensure this path is correct

export {}; // Makes this file a module, necessary for global augmentation

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userRole: UserRole; // <-- ADD THIS LINE
        systemRole: SystemRole;
        username: string; // From token, should be guaranteed non-null
        displayName: string | null; // From token, can be null
        profileImage: string; // <<<< MUST BE string (non-optional, non-nullable)
      };
    }
  }
}
