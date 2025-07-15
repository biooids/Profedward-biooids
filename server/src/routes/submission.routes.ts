import { Router } from "express";
import { submissionController } from "../features/submission/submission.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

// Only logged-in users (teachers, verified in service) can access these
router.use(verifyToken);

router.get("/teacher", submissionController.getSubmissionsForTeacher);
router.post("/:submissionId/correct", submissionController.gradeSubmission);

export default router;
