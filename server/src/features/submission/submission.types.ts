import { SubmissionStatus } from "prisma/generated/prisma";

// For filtering submissions, e.g., /submissions/teacher?status=SUBMITTED
export interface GetSubmissionsQueryDto {
  status?: SubmissionStatus;
}

// For grading a submission
export interface GradeSubmissionDto {
  grade?: string;
  comments?: string;
  documentId: string; // The ID of the corrected/marked-up document
}
