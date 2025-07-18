import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import { UserRole } from "prisma/generated/prisma";
import {
  CreateCourseDto,
  EnrollStudentDto,
  SetStudentEnrollmentDto,
} from "./course.types";

export class CourseService {
  /**
   * [ADMIN] Fetches all courses in the system.
   */
  public async getAllCourses() {
    return prisma.course.findMany({
      include: {
        academicLevel: true, // Include related academic level
        subject: true, // Include related subject
        teachers: { select: { id: true, displayName: true } },
        _count: {
          select: { students: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * [ADMIN] Creates a new course from an academic level, subject, and teacher.
   */
  public async createCourse(data: CreateCourseDto) {
    const { academicLevelId, subjectId, description, teacherId } = data;

    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.userRole !== UserRole.TEACHER) {
      throw createHttpError(400, "Invalid user ID for teacher role.");
    }

    return prisma.course.create({
      data: {
        description: description ?? null,
        academicLevel: { connect: { id: academicLevelId } },
        subject: { connect: { id: subjectId } },
        teachers: { connect: { id: teacherId } },
      },
    });
  }

  /**
   * [ADMIN] Enrolls a student into an existing course.
   */
  public async enrollStudent(courseId: string, data: EnrollStudentDto) {
    const { studentId } = data;

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.userRole !== UserRole.STUDENT) {
      throw createHttpError(400, "Invalid user ID for student role.");
    }

    return prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
      include: { students: true },
    });
  }

  /**
   * Fetches all courses a specific teacher is assigned to.
   */
  public async getCoursesForTeacher(teacherId: string) {
    return prisma.course.findMany({
      where: {
        teachers: {
          some: {
            id: teacherId,
          },
        },
      },
      include: {
        academicLevel: true,
        subject: true,
        _count: {
          select: { students: true, assignments: true },
        },
      },
      orderBy: [
        { academicLevel: { name: "asc" } },
        { subject: { name: "asc" } },
      ],
    });
  }

  /**
   * Gets details for a single course, verifying teacher access.
   */
  public async getCourseDetailsForTeacher(courseId: string, teacherId: string) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teachers: {
          some: { id: teacherId },
        },
      },
      include: {
        academicLevel: true,
        subject: true,
        students: {
          select: {
            id: true,
            displayName: true,
            email: true,
            profileImage: true,
          },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course) {
      throw createHttpError(404, "Course not found or access denied.");
    }
    return course;
  }

  /**
   * Fetches all courses a specific student is enrolled in.
   */
  public async getCoursesForStudent(studentId: string) {
    return prisma.course.findMany({
      where: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
      include: {
        academicLevel: true,
        subject: true,
        _count: {
          select: { students: true, assignments: true },
        },
      },
      orderBy: [
        { academicLevel: { name: "asc" } },
        { subject: { name: "asc" } },
      ],
    });
  }

  /**
   * Gets details for a single course, verifying student enrollment.
   * @param courseId The ID of the course.
   * @param studentId The ID of the student requesting access.
   */
  public async getCourseDetailsForStudent(courseId: string, studentId: string) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        students: {
          // Verify the student is in this course
          some: { id: studentId },
        },
      },
      include: {
        academicLevel: true,
        subject: true,
        teachers: {
          select: { id: true, displayName: true, profileImage: true },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course) {
      throw createHttpError(404, "Course not found or you are not enrolled.");
    }
    return course;
  }

  /**
   * [ADMIN] Sets the complete list of courses a student is enrolled in.
   * This will overwrite any previous enrollments for the student.
   * @param studentId The ID of the student to enroll.
   * @param data The DTO containing an array of course IDs.
   */
  public async setStudentEnrollments(
    studentId: string,
    data: SetStudentEnrollmentDto
  ) {
    const { courseIds } = data;

    // 1. Verify the user is actually a student
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.userRole !== UserRole.STUDENT) {
      throw createHttpError(404, "Student not found or user is not a student.");
    }

    // 2. Use a transaction to first disconnect all existing courses and then connect the new ones.
    // This is the safest way to handle updates, additions, and removals in one operation.
    return prisma.user.update({
      where: { id: studentId },
      data: {
        enrolledCourses: {
          // The 'set' operation disconnects all previous relations
          // and connects only the ones provided in the array.
          set: courseIds.map((id) => ({ id })),
        },
      },
      include: {
        enrolledCourses: true, // Return the new list of courses for confirmation
      },
    });
  }
}

export const courseService = new CourseService();
