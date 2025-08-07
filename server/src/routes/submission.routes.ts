//src/features/routes/submission.routes.ts
import { Router } from "express";
import { submissionController } from "../features/submission/submission.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

router.use(verifyToken);

// --- Teacher routes ---
router.get("/teacher", submissionController.getSubmissionsForTeacher);
router.post("/:submissionId/correct", submissionController.gradeSubmission);
router.get(
  "/:submissionId/teacher",
  submissionController.getSubmissionForGrading
);

// --- Student routes ---
router.get("/student", submissionController.getSubmissionsForStudent);
router.get(
  "/assignment/:assignmentId/student",
  submissionController.findOrCreateSubmission
);
router.patch("/:submissionId/draft", submissionController.saveDraft);
router.patch("/:submissionId/submit", submissionController.submitWork);

// --- NEW ROUTE ---
// Endpoint for a student to fetch their own graded submission
router.get(
  "/:submissionId/graded-student-view",
  submissionController.getGradedSubmissionForStudent
);

export default router;
