import { Router } from "express";
import { assignmentController } from "../features/assignment/assignment.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

// Only logged-in users (specifically teachers, verified in the service) can create assignments
router.post("/", verifyToken, assignmentController.createAssignment);

export default router;
