//src/features/submission/submission.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { submissionService } from "./submission.service";
import {
  GetSubmissionsQueryDto,
  GradeSubmissionDto,
  SubmitWorkDto,
  SaveDraftDto,
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

  findOrCreateSubmission = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const { assignmentId } = req.params;
    const submission = await submissionService.findOrCreateSubmissionForStudent(
      studentId,
      assignmentId
    );
    res.status(200).json({ status: "success", data: submission });
  });

  saveDraft = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const { submissionId } = req.params;
    const data = req.body as SaveDraftDto;
    const updatedSubmission = await submissionService.saveSubmissionDraft(
      submissionId,
      studentId,
      data
    );
    res.status(200).json({ status: "success", data: updatedSubmission });
  });

  getSubmissionForGrading = asyncHandler(
    async (req: Request, res: Response) => {
      const teacherId = req.user!.id;
      const { submissionId } = req.params;
      const submission = await submissionService.getSubmissionByIdForTeacher(
        submissionId,
        teacherId
      );
      res.status(200).json({ status: "success", data: submission });
    }
  );

  getGradedSubmissionForStudent = asyncHandler(
    async (req: Request, res: Response) => {
      const studentId = req.user!.id;
      const { submissionId } = req.params;
      const submission = await submissionService.getGradedSubmissionForStudent(
        submissionId,
        studentId
      );
      res.status(200).json({ status: "success", data: submission });
    }
  );
}

export const submissionController = new SubmissionController();
