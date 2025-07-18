import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { submissionService } from "./submission.service";
import {
  GetSubmissionsQueryDto,
  GradeSubmissionDto,
  SubmitWorkDto,
} from "./submission.types";

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

  getSubmissionsForStudent = asyncHandler(
    async (req: Request, res: Response) => {
      const studentId = req.user!.id;
      const query = req.query as GetSubmissionsQueryDto;
      const submissions = await submissionService.getSubmissionsForStudent(
        studentId,
        query
      );
      res.status(200).json({ status: "success", data: submissions });
    }
  );

  submitWork = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const { submissionId } = req.params;
    const data = req.body as SubmitWorkDto;
    const updatedSubmission = await submissionService.submitWork(
      submissionId,
      studentId,
      data
    );
    res.status(200).json({ status: "success", data: updatedSubmission });
  });

  getPendingAssignmentsByCourse = asyncHandler(
    async (req: Request, res: Response) => {
      const studentId = req.user!.id;
      const courses = await submissionService.getPendingAssignmentsByCourse(
        studentId
      );
      res.status(200).json({ status: "success", data: courses });
    }
  );
}

export const submissionController = new SubmissionController();
