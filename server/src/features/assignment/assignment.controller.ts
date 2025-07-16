import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { assignmentService } from "./assignment.service";
import { CreateAssignmentDto } from "./assignment.types";
import { createHttpError } from "../../utils/error.factory";

class AssignmentController {
  createAssignment = asyncHandler(async (req: Request, res: Response) => {
    const authorId = req.user?.id;
    if (!authorId) {
      throw createHttpError(401, "User not authenticated.");
    }

    const assignmentData = req.body as CreateAssignmentDto;
    const newAssignment = await assignmentService.createAssignment(
      authorId,
      assignmentData
    );

    res.status(201).json({
      status: "success",
      message: "Assignment created successfully.",
      data: newAssignment,
    });
  });

  getAssignmentById = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { assignmentId } = req.params;
    const assignment = await assignmentService.getAssignmentById(
      assignmentId,
      teacherId
    );
    res.status(200).json({ status: "success", data: assignment });
  });
}

export const assignmentController = new AssignmentController();
