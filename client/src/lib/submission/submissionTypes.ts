import { User } from "../user/userTypes";
import { Assignment } from "../assignment/assignmentTypes";

// This enum is used by both Teachers and Students
export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  RESUBMITTED = "RESUBMITTED",
}

// --- TEACHER TYPES ---

// Shape of a Submission for the teacher's grading dashboard
export interface Submission {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  student: Pick<User, "id" | "displayName" | "profileImage">;
  assignment: Pick<Assignment, "id" | "title">;
}

// DTO for a teacher grading a submission
export interface GradeSubmissionDto {
  grade?: string;
  comments?: string;
  documentId: string;
}

// --- STUDENT TYPES ---

// A more detailed Submission type for the student's dashboard view
export interface StudentSubmission {
  id: string;
  status: SubmissionStatus;
  submittedAt: string;
  notes: string | null;
  assignment: {
    id: string;
    title: string;
    dueDate: string | null;
    course: {
      id: string;
      subject: { name: string };
      academicLevel: { name: string };
    };
  };
  correction: {
    grade: string | null;
    comments: string | null;
    correctedAt: string;
  } | null;
}

// DTO for a student submitting their work
export interface SubmitWorkDto {
  documentId: string;
  notes?: string;
}

// --- COMMON TYPES ---

// For filtering submissions by status
export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
}
