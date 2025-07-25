// src/routes/academic.routes.ts
import { Router } from "express";
import { academicController } from "../features/academic/academic.controller";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware";

const router: Router = Router();

// --- GET (Read) ---
router.get("/levels", verifyToken, academicController.getLevels);
router.get("/subjects", verifyToken, academicController.getSubjects);

// --- POST (Create) ---
router.post(
  "/levels",
  verifyToken,
  verifyAdmin,
  academicController.createLevel
);
router.post(
  "/subjects",
  verifyToken,
  verifyAdmin,
  academicController.createSubject
);

// --- PATCH (Update) ---
router.patch(
  "/levels/:id",
  verifyToken,
  verifyAdmin,
  academicController.updateLevel
);
router.patch(
  "/subjects/:id",
  verifyToken,
  verifyAdmin,
  academicController.updateSubject
);

// --- DELETE ---
router.delete(
  "/levels/:id",
  verifyToken,
  verifyAdmin,
  academicController.deleteLevel
);
router.delete(
  "/subjects/:id",
  verifyToken,
  verifyAdmin,
  academicController.deleteSubject
);

export default router;
