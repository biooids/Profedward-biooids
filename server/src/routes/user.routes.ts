// routes/user.routs.ts
import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware.js";
import { uploadProfileImage } from "../middleware/multer.config";

const router: Router = Router();

// Apply the authentication middleware to all routes in this file.
// Any request to a /users/... endpoint will need a valid token.
router.use(verifyToken);

// --- Routes for the authenticated user ---
router.get("/me", userController.getMe);
router.patch(
  "/me",
  uploadProfileImage.single("profileImage"),
  userController.updateMyProfile
);

router.delete("/me", userController.deleteMyAccount);

// --- Admin/Maintainer Routes ---
// Note: The role-based authorization check is handled inside the controller.
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUserById);

export default router;
