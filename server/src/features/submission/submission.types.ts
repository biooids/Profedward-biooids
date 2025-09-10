//src/features/submission/submission.types.ts
import { SubmissionStatus } from "../../../prisma/generated/prisma";

// For filtering submissions by status
export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
  courseId?: string;
}

// For a teacher grading a submission
export interface GradeSubmissionDto {
  grade?: string;
  comments?: string;
  documentId: string;
}

// For a student submitting their final work
export interface SubmitWorkDto {
  documentId: string;
  notes?: string;
}

// For a student saving a draft of their work
export interface SaveDraftDto {
  documentId: string;
  notes?: string;
}

export interface SaveGradingDraftDto {
  grade?: string;
  comments?: string;
  documentId: string;
}
