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

// --- ADD THIS NEW DTO ---
// For a student submitting their work
export interface SubmitWorkDto {
  documentId: string; // The ID of the student's completed document
  notes?: string; // Optional notes for the teacher
}
