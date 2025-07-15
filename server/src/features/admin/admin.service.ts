import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import { User, UserRole } from "prisma/generated/prisma";

export class AdminService {
  /**
   * Fetches a paginated list of all users.
   */
  public async getAllUsers(): Promise<Omit<User, "passwordHash">[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        profileImage: true,
        systemRole: true,
        userRole: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        ttsCharacterQuota: true,
        ttsCharacterUsage: true,
        ttsQuotaResetDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  }

  /**
   * Updates a specific user's role.
   * @param userId The ID of the user to update.
   * @param newRole The new role to assign.
   */
  public async updateUserRole(
    userId: string,
    newRole: UserRole
  ): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createHttpError(404, `User with ID ${userId} not found.`);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { userRole: newRole },
    });

    return updatedUser;
  }
}

export const adminService = new AdminService();
