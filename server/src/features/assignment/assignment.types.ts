import { SubmissionStatus } from "prisma/generated/prisma";

export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
}

export interface GradeSubmissionDto {
  grade?: string;
  comments?: string;
  documentId: string;
}

export interface SubmitWorkDto {
  documentId: string;
  notes?: string;
}

// DTO for saving a draft of a student's work
export interface SaveDraftDto {
  documentId: string;
  notes?: string;
}
