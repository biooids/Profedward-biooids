import { User } from "../user/userTypes";
import { Assignment } from "../assignment/assignmentTypes";

// Recreate the enum on the frontend for type safety
export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  RESUBMITTED = "RESUBMITTED",
}

// Shape of a Submission object for the teacher's grading dashboard
export interface Submission {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  student: Pick<User, "id" | "displayName" | "profileImage">; // Only need partial student info
  assignment: Pick<Assignment, "id" | "title">; // Only need partial assignment info
}

// DTO for getting submissions with an optional status filter
export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
}

// DTO for grading a submission
export interface GradeSubmissionDto {
  grade?: string;
  comments?: string;
  documentId: string;
}
