import { SubmissionStatus } from "prisma/generated/prisma";

// For filtering submissions by status
export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
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

// --- THIS IS THE FIX ---
// Add the missing DTO for saving a draft
export interface SaveDraftDto {
  documentId: string;
  notes?: string;
}
