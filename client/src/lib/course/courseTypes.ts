//src/lib/course/courseTypes.ts

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

export interface Course {
  id: string;
  description: string | null;
  createdAt: string;
  teacherMethodology: string | null;
  teacherContactInfo: string | null;
  resources: any | null;
  academicLevel: AcademicLevel;
  subject: Subject;
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

export interface CreateCourseDto {
  academicLevelId: string;
  subjectId: string;
  teacherId: string;
  description?: string;
}

export interface SetStudentEnrollmentDto {
  courseIds: string[];
}
export interface UpdateCourseDetailsDto {
  description?: string;
  teacherMethodology?: string;
  teacherContactInfo?: string;
  resources?: any;
}
