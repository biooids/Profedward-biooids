//src/features/course/course.types.ts
import { Prisma } from "../../../prisma/generated/prisma";
export interface CreateCourseDto {
  academicLevelId: string;
  subjectId: string;
  teacherId: string;
  description?: string;
}

export interface EnrollStudentDto {
  studentId: string;
}

export interface SetStudentEnrollmentDto {
  courseIds: string[];
}
export interface UpdateCourseDetailsDto {
  description?: string;
  teacherMethodology?: string;
  teacherContactInfo?: string;
  resources?: Prisma.JsonValue;
}
