import { Router } from "express";
import { submissionController } from "../features/submission/submission.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

router.use(verifyToken);

// Teacher routes
router.get("/teacher", submissionController.getSubmissionsForTeacher);
router.post("/:submissionId/correct", submissionController.gradeSubmission);
router.get(
  "/student/pending-by-course",
  submissionController.getPendingAssignmentsByCourse
);

// --- ADD STUDENT ROUTES ---
router.get("/student", submissionController.getSubmissionsForStudent);
router.patch("/:submissionId/submit", submissionController.submitWork);

export default router;
