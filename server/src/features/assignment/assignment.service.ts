//src/features/assignment/assignment.service.ts

import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import { CreateAssignmentDto } from "./assignment.types";

export class AssignmentService {
  /**
   * Creates an assignment for a course and generates pending submissions
   * for all currently enrolled students.
   * @param authorId The ID of the teacher creating the assignment.
   * @param data The assignment details from the request.
   */
  /**
   * Creates an assignment for a course.
   * (It no longer needs to create submissions, as that is handled on-demand).
   */
  public async createAssignment(authorId: string, data: CreateAssignmentDto) {
    const { courseId, title, instructions, dueDate, documentId } = data;

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teachers: { some: { id: authorId } },
      },
    });

    if (!course) {
      throw createHttpError(
        403,
        "You do not have permission to create assignments for this course."
      );
    }

    // Now it only needs to create the assignment itself. Much simpler!
    return prisma.assignment.create({
      data: {
        title,
        instructions: instructions ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        course: { connect: { id: courseId } },
        author: { connect: { id: authorId } },
        document: { connect: { id: documentId } },
      },
    });
  }
  /**
   * Gets a single assignment by its ID, verifying teacher access.
   */
  public async getAssignmentById(assignmentId: string, teacherId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        authorId: teacherId, // Ensures only the teacher who created it can view it
      },
      include: {
        document: true, // Include the associated document worksheet
      },
    });

    if (!assignment) {
      throw createHttpError(404, "Assignment not found or access denied.");
    }
    return assignment;
  }

  /**
   * Gets a single assignment by its ID, verifying student enrollment.
   */
  public async getAssignmentForStudent(
    assignmentId: string,
    studentId: string
  ) {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        course: {
          // Verify the student is in the assignment's course
          students: {
            some: { id: studentId },
          },
        },
      },
      include: {
        document: true, // The original assignment worksheet
      },
    });

    if (!assignment) {
      throw createHttpError(
        404,
        "Assignment not found or you do not have access."
      );
    }
    return assignment;
  }

  /**
   * [STUDENT] Gets all assignments from all of a student's courses
   * that they have not yet submitted.
   */

  public async getPendingAssignmentsForStudent(studentId: string) {
    // 1. Find every assignment...
    return prisma.assignment.findMany({
      where: {
        // 2. ...that belongs to a course the student is enrolled in...
        course: {
          students: { some: { id: studentId } },
        },
        // 3. ...AND for which the student does NOT have a submission that is
        // already SUBMITTED or GRADED. This leaves only the pending ones.
        NOT: {
          submissions: {
            some: {
              studentId: studentId,
              status: { in: ["SUBMITTED", "GRADED"] },
            },
          },
        },
      },
      // 4. Include all the necessary related data for display.
      include: {
        submissions: {
          where: { studentId: studentId, status: "PENDING" },
        },
        course: {
          include: {
            subject: true,
            academicLevel: true,
            teachers: { select: { displayName: true } },
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });
  }
}

export const assignmentService = new AssignmentService();
