import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import { User, UserRole } from "prisma/generated/prisma"; // Use @prisma/client

export class AdminService {
  /**
   * Fetches a paginated list of all users, including their enrolled courses.
   */
  public async getAllUsers() {
    const users = await prisma.user.findMany({
      // --- THIS IS THE FIX ---
      // We change from 'select' to 'include' to fetch related data.
      include: {
        enrolledCourses: {
          // We only need the ID of the courses for our modal
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Manually remove the passwordHash from each user object before returning
    return users.map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Updates a specific user's role.
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
