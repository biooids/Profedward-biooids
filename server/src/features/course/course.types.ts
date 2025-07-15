// DTO for creating a new course.
export interface CreateCourseDto {
  academicLevelId: string; // <-- ADD THIS
  subjectId: string; // <-- ADD THIS
  teacherId: string;
  description?: string;
}
// DTO for enrolling a student in a course.
export interface EnrollStudentDto {
  studentId: string;
}
