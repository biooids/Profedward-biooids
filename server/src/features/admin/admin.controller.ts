import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { adminService } from "./admin.service";
import { UpdateUserRoleDto } from "./admin.types";

class AdminController {
  getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await adminService.getAllUsers();
    res.status(200).json({ status: "success", data: users });
  });

  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body as UpdateUserRoleDto;

    const updatedUser = await adminService.updateUserRole(userId, role);
    res.status(200).json({
      status: "success",
      message: "User role updated successfully.",
      data: updatedUser,
    });
  });
}

export const adminController = new AdminController();
