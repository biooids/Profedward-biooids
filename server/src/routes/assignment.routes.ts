import { Router } from "express";
import { assignmentController } from "../features/assignment/assignment.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

// A user must be logged in to access these routes.
router.use(verifyToken);

// Teacher creates an assignment
router.post("/", assignmentController.createAssignment);

// Teacher and Student can both get an assignment's details
router.get("/:assignmentId/teacher", assignmentController.getAssignmentById);
router.get(
  "/:assignmentId/student",
  assignmentController.getAssignmentForStudent
);

export default router;
