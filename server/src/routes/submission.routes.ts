//src/routes/submission.routes.ts
import { Router } from "express";
import { submissionController } from "../features/submission/submission.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

router.use(verifyToken);

// --- Teacher routes ---
router.get("/teacher", submissionController.getSubmissionsForTeacher);
router.post("/:submissionId/correct", submissionController.gradeSubmission);
router.get(
  "/student/pending-by-course",
  submissionController.getPendingAssignmentsByCourse
);

// --- Student routes ---
router.get("/student", submissionController.getSubmissionsForStudent);

// Find or create a submission record for a given assignment
router.get(
  "/assignment/:assignmentId/student",
  submissionController.findOrCreateSubmission
);

// Save a draft of a submission
router.patch("/:submissionId/draft", submissionController.saveDraft);

// Submit the final work
router.patch("/:submissionId/submit", submissionController.submitWork);

export default router;
