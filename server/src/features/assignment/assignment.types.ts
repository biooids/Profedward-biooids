export interface CreateAssignmentDto {
  title: string;
  instructions?: string;
  dueDate?: Date;
  courseId: string;
  documentId: string; // The ID of the worksheet/document for the assignment
}
