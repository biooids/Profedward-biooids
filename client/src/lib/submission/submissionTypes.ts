import { User } from "../user/userTypes";
import { Assignment } from "../assignment/assignmentTypes";
import { Document } from "../document/documentTypes";

export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  RESUBMITTED = "RESUBMITTED",
}

// Shape of a Submission for the teacher's dashboard (remains the same)
export interface Submission {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  student: Pick<User, "id" | "displayName" | "profileImage">;
  assignment: Pick<Assignment, "id" | "title" | "courseId">;
}

// DTO for a teacher grading a submission (remains the same)
export interface GradeSubmissionDto {
  grade?: string;
  comments?: string;
  documentId: string;
}

// --- THIS IS THE FIX ---
// Update the StudentSubmission type to be more comprehensive for all views
export interface StudentSubmission {
  id: string;
  status: SubmissionStatus;
  submittedAt: string;
  notes: string | null;
  document: Document | null;
  assignment: Assignment;
  // Add the 'student' property
  student: Pick<User, "id" | "displayName" | "profileImage">;
  correction: {
    grade: string | null;
    comments: string | null;
    correctedAt: string;
    // Add the 'document' property to the correction object
    document: Document;
  } | null;
}

// DTOs for student actions (remain the same)
export interface SubmitWorkDto {
  documentId: string;
  notes?: string;
}
export interface SaveDraftDto {
  documentId: string;
  notes?: string;
}

// Common types (remains the same)
export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
  courseId?: string;
}

export interface SaveGradingDraftDto {
  grade?: string;
  comments?: string;
  documentId: string;
}
