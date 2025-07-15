import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { submissionService } from "./submission.service";
import { GetSubmissionsQueryDto, GradeSubmissionDto } from "./submission.types";

class SubmissionController {
  getSubmissionsForTeacher = asyncHandler(
    async (req: Request, res: Response) => {
      const teacherId = req.user!.id;
      const query = req.query as GetSubmissionsQueryDto;
      const submissions = await submissionService.getSubmissionsForTeacher(
        teacherId,
        query
      );
      res.status(200).json({ status: "success", data: submissions });
    }
  );

  gradeSubmission = asyncHandler(async (req: Request, res: Response) => {
    const correctorId = req.user!.id;
    const { submissionId } = req.params;
    const gradingData = req.body as GradeSubmissionDto;
    const result = await submissionService.gradeSubmission(
      submissionId,
      correctorId,
      gradingData
    );
    res.status(200).json({ status: "success", data: result });
  });
}

export const submissionController = new SubmissionController();
