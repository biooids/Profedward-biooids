import { User } from "../user/userTypes";
import { Assignment } from "../assignment/assignmentTypes";

// New types for the improved dropdown-based design
export interface AcademicLevel {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

// Updated Course interface to use the new types
export interface Course {
  id: string;
  description: string | null;
  createdAt: string;
  academicLevel: AcademicLevel; // No longer a simple title
  subject: Subject; // No longer a simple courseCode
  teachers: User[];
  students: User[];
  assignments: Assignment[];
  _count: {
    students: number;
    assignments: number;
  };
}

// Updated DTO for creating a new course via the admin panel
export interface CreateCourseDto {
  academicLevelId: string;
  subjectId: string;
  teacherId: string;
  description?: string;
}

// This DTO for enrolling students remains correct
export interface EnrollStudentDto {
  studentId: string;
}

// This generic API response wrapper remains correct
export interface CourseApiResponse {
  status: string;
  message: string;
  data: Course;
}
