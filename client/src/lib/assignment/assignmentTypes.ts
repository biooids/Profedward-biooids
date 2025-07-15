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
  documentId: string;
}

// DTO for creating a new assignment
export interface CreateAssignmentDto {
  title: string;
  instructions?: string;
  dueDate?: string;
  courseId: string;
  documentId: string;
}

// API response for a single assignment
export interface AssignmentApiResponse {
  status: string;
  data: Assignment;
}
