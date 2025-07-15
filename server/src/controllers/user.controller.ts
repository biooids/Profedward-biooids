// src/features/user/user.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createHttpError } from "../utils/error.factory.js";
import { userService } from "../services/user.service.js"; // <-- USE THE USER SERVICE
import { SystemRole, User } from "../../prisma/generated/prisma";
import { uploadToCloudinary } from "@/config/cloudinary.js";

// --- ADD THIS HELPER FUNCTION AT THE TOP ---
/**
 * Removes sensitive fields like passwordHash from the user object
 * before sending it in an API response.
 * @param user The full user object from the database.
 * @returns A user object without the passwordHash.
 */
const sanitizeUserForResponse = (user: User): Omit<User, "passwordHash"> => {
  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
};

class UserController {
  // Get the currently authenticated user's profile
  getMe = asyncHandler(async (req: Request, res: Response) => {
    // req.user is attached by the auth middleware
    if (!req.user?.id) {
      throw createHttpError(401, "Not authenticated.");
    }

    // Delegate finding the user to the service layer
    const user = await userService.findUserById(req.user.id);

    if (!user) {
      throw createHttpError(404, "Authenticated user profile not found.");
    }

    // The service layer can handle sanitizing the user object if needed
    res.status(200).json({ status: "success", data: { user } });
  });

  // Get any user's profile by their ID
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id: targetUserId } = req.params;

    const user = await userService.findUserById(targetUserId);

    if (!user) {
      throw createHttpError(404, `User with ID ${targetUserId} not found.`);
    }

    res.status(200).json({ status: "success", data: { user } });
  });

  // Delete the currently authenticated user's own account
  deleteMyAccount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw createHttpError(401, "Not authenticated.");
    }
    const userId = req.user.id;

    // Delegate deletion to the UserService
    await userService.deleteUserAccount(userId);

    res.status(204).send(); // 204 No Content is appropriate for a successful deletion
  });

  // Admin/Maintainer deletes any user's account
  deleteUserById = asyncHandler(async (req: Request, res: Response) => {
    // Authorization check
    if (req.user?.systemRole !== SystemRole.MAINTAINER) {
      throw createHttpError(403, "Forbidden: You do not have permission.");
    }

    const { id: targetUserId } = req.params;
    if (req.user.id === targetUserId) {
      throw createHttpError(
        400,
        "Cannot delete your own account via this admin route."
      );
    }

    // Delegate deletion to the UserService
    await userService.deleteUserAccount(targetUserId);

    res.status(204).send(); // 204 No Content
  });

  // I've left getAllUsers out as it's a more complex query often tied
  // to an Admin service, but it would follow the same pattern of delegation.
  /**
   * Handles updating the authenticated user's profile.
   * This controller can handle both JSON data and FormData for file uploads.
   */
  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id; // We know user exists from the auth middleware
    const { displayName, username, bio } = req.body;

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (username) updateData.username = username;
    if (bio) updateData.bio = bio;

    // Handle profile picture upload if a file is present
    if (req.file) {
      console.log(
        `[UserController] New profile image received for user ${userId}. Uploading to Cloudinary...`
      );
      try {
        const result = await uploadToCloudinary(
          req.file.path,
          "profile_images"
        );
        updateData.profileImage = result.secure_url;
      } catch (error) {
        throw createHttpError(500, "Failed to upload profile image.");
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw createHttpError(400, "No update data provided.");
    }

    const updatedUser = await userService.updateUserProfile(userId, updateData);

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
      data: { user: sanitizeUserForResponse(updatedUser) },
    });
  });
}

export const userController = new UserController();
