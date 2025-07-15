// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes.js";
import shelfRoutes from "./shelf.routes.js";
import documentRoutes from "./document.routes.js";
import aiRoutes from "./ai.routes.js";
import ttsRoutes from "./tts.routes";
import adminRoutes from "./admin.routes"; // <-- ADD THIS
import courseRoutes from "./course.routes"; //
import assignmentRoutes from "./assignment.routes"; // <-- ADD THIS
import submissionRoutes from "./submission.routes"; // <-- ADD THIS
import academicRoutes from "./academic.routes"; // <-- ADD THIS IMPORT

const router: Router = Router();

// Health check for the API router itself
router.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "API router is healthy." });
});

// Mount the feature-specific routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/shelves", shelfRoutes);
router.use("/documents", documentRoutes);
router.use("/ai", aiRoutes);
router.use("/tts", ttsRoutes);
router.use("/admin", adminRoutes); // <-- ADD THIS
router.use("/courses", courseRoutes);
router.use("/assignments", assignmentRoutes); // <-- ADD THIS
router.use("/submissions", submissionRoutes); // <-- ADD THIS
router.use("/academic", academicRoutes); // <-- ADD THIS LINE

export default router;
