//src/lib/submission/submissionTypes.ts

import { User } from "../user/userTypes";
import { Assignment } from "../assignment/assignmentTypes";
import { Document } from "../document/documentTypes";

export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  RESUBMITTED = "RESUBMITTED",
}

// --- TEACHER TYPES ---
export interface Submission {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  student: Pick<User, "id" | "displayName" | "profileImage">;
  assignment: Pick<Assignment, "id" | "title">;
}

export interface GradeSubmissionDto {
  grade?: string;
  comments?: string;
  documentId: string;
}

// --- STUDENT TYPES ---
export interface StudentSubmission {
  id: string;
  status: SubmissionStatus;
  submittedAt: string;
  notes: string | null;
  document: Document | null; // A pending submission might not have a document yet
  assignment: Assignment;
  correction: {
    grade: string | null;
    comments: string | null;
    correctedAt: string;
  } | null;
}

export interface SubmitWorkDto {
  documentId: string;
  notes?: string;
}

// --- ADD THIS NEW DTO ---
// For a student saving a draft of their work
export interface SaveDraftDto {
  documentId: string;
  notes?: string;
}

// --- COMMON TYPES ---
export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
}
