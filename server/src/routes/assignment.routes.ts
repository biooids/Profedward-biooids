import { Router } from "express";
import { assignmentController } from "../features/assignment/assignment.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

// A user must be logged in to create an assignment.
// The service layer handles the specific role check (is the user a teacher of the course?).
router.post("/", verifyToken, assignmentController.createAssignment);

export default router;
