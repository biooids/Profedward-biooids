import { Router } from "express";
import { adminController } from "../features/admin/admin.controller";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware";

const router: Router = Router();

// Protect all admin routes: user must be logged in AND be an admin.
router.use(verifyToken, verifyAdmin);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:userId/role", adminController.updateUserRole);

export default router;
