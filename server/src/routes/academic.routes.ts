import { Router } from "express";
import { academicController } from "../features/academic/academic.controller";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware";

const router: Router = Router();

// Any logged-in user can fetch lists
router.get("/levels", verifyToken, academicController.getLevels);
router.get("/subjects", verifyToken, academicController.getSubjects);

// Only admins can create new levels and subjects
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

export default router;
