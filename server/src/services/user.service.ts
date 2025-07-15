// src/services/user.service.ts

import bcrypt from "bcryptjs";
import prisma from "../db/prisma.js";
import { Prisma, User } from "../../prisma/generated/prisma";
import { SignUpInputDto } from "../types/auth.types.js"; // Can be renamed to UserCreationDto if preferred
import { createHttpError } from "../utils/error.factory.js";
interface UserProfileUpdateData {
  displayName?: string;
  username?: string;
  bio?: string;
  profileImage?: string; // We'll add this for when you handle file uploads
}

export class UserService {
  /**
   * Finds a user by their unique email.
   * @returns The user object or null if not found.
   */
  public async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Finds a user by their unique username.
   * @returns The user object or null if not found.
   */
  public async findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  /**
   * Finds a user by their unique ID.
   * @returns The user object or null if not found.
   */
  public async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Creates a new user in the database.
   * @param input - The user's details.
   * @returns The newly created user object.
   */
  public async createUser(input: SignUpInputDto): Promise<User> {
    const { email, username, password, displayName } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash: hashedPassword,
          displayName: displayName,
          // Defaults for userRole and systemRole are set by the schema
        },
      });
      return user;
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        const field = (e.meta?.target as string[])?.[0] || "details";
        console.error(
          `[UserService] Prisma unique constraint violation on ${field}.`
        );
        throw createHttpError(
          409,
          `An account with this ${field} already exists.`
        );
      }
      console.error("[UserService] Unexpected error during user creation:", e);
      throw createHttpError(500, "Could not create user account.");
    }
  }

  /**
   * Deletes a user account from the database.
   * @param userId - The ID of the user to delete.
   */
  public async deleteUserAccount(userId: string): Promise<void> {
    console.log(
      `[UserService] Initiating account deletion for UserID: ${userId}`
    );
    try {
      // Prisma's onDelete: Cascade on the RefreshToken model will handle cleanup
      await prisma.user.delete({ where: { id: userId } });
      console.log(`[UserService] User account ${userId} deleted successfully.`);
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        console.warn(
          `[UserService] Account deletion failed: User ${userId} not found.`
        );
        throw createHttpError(404, "User not found for deletion.");
      }
      console.error(
        `[UserService] Error deleting user account ${userId}:`,
        error
      );
      throw createHttpError(500, "Could not delete user account at this time.");
    }
  }

  // You can add more user-related methods here later, like:
  /**
   * Updates a user's profile information.
   * @param userId The ID of the user to update.
   * @param data The data to update.
   * @returns The updated user object.
   */
  public async updateUserProfile(
    userId: string,
    data: UserProfileUpdateData
  ): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          // Only include fields that are actually provided
          ...(data.displayName && { displayName: data.displayName }),
          ...(data.username && { username: data.username }),
          ...(data.bio && { bio: data.bio }),
          ...(data.profileImage && { profileImage: data.profileImage }),
        },
      });
      return user;
    } catch (e: any) {
      // Handle potential error if the new username is already taken
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw createHttpError(409, "This username is already taken.");
      }
      console.error("[UserService] Error updating user profile:", e);
      throw createHttpError(500, "Could not update user profile.");
    }
  }
  // public async enrollUserInCourse(...) {}
}

// Export a singleton instance of the service
export const userService = new UserService();
