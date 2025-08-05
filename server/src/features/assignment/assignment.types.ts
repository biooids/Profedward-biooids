//src/features/assignment/assignment.types.ts

import { Document } from "../document/document.types"; // Assuming this import path is correct

// DTO for creating a new assignment
export interface CreateAssignmentDto {
  title: string;
  instructions?: string;
  dueDate?: string;
  courseId: string;
  documentId: string;
}

// Shape of an Assignment object from the backend
export interface Assignment {
  id: string;
  title: string;
  instructions: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  courseId: string;
  authorId: string;
  document: Document;
  _count?: {
    submissions: number;
  };
  course: {
    subject: { name: string };
    academicLevel: { name: string };
    teachers: { displayName: string | null }[];
  };
  submissions: { id: string }[];
}

// API response for a single assignment
export interface AssignmentApiResponse {
  status: string;
  data: Assignment;
}
