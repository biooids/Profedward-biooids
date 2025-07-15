// routes/auth.routs.ts
import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware.js";

const router: Router = Router();

// --- Public Routes ---
router.post("/register", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshAccessToken);
// Add this new route to your auth router
router.post("/oauth", authController.handleOAuth);
if (process.env.NODE_ENV === "development") {
  router.post("/dev-login", authController.devLogin);
  console.log("✅ Development-only /dev-login route enabled.");
}
// --- Protected Route ---
// Logout should be protected to ensure only an authenticated user can trigger it.
router.post("/logout", verifyToken, authController.logout);

export default router;
