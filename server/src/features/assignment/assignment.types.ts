/**
 * Data Transfer Object (DTO) for the request body when a teacher
 * creates a new assignment.
 */
export interface CreateAssignmentDto {
  title: string;
  courseId: string;
  documentId: string; // The ID of the pre-existing document/worksheet
  instructions?: string;
  dueDate?: string; // Use string for robust JSON transport, convert to Date on backend
}
