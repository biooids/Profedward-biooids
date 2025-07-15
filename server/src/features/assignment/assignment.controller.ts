import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { assignmentService } from "./assignment.service";
import { CreateAssignmentDto } from "./assignment.types";

class AssignmentController {
  createAssignment = asyncHandler(async (req: Request, res: Response) => {
    const authorId = req.user!.id;
    const assignmentData = req.body as CreateAssignmentDto;
    const newAssignment = await assignmentService.createAssignment(
      authorId,
      assignmentData
    );
    res.status(201).json({ status: "success", data: newAssignment });
  });
}

export const assignmentController = new AssignmentController();
