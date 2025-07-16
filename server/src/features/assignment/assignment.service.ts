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
  public async createAssignment(authorId: string, data: CreateAssignmentDto) {
    const { courseId, title, instructions, dueDate, documentId } = data;

    // 1. Verify the author is a teacher of the specified course.
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teachers: { some: { id: authorId } },
      },
      include: {
        students: { select: { id: true } }, // Get all student IDs for this course
      },
    });

    if (!course) {
      throw createHttpError(
        403,
        "You do not have permission to create assignments for this course."
      );
    }

    // 2. Use a transaction to ensure the assignment and all submissions are created together.
    return prisma.$transaction(async (tx) => {
      // 3. Create the main Assignment record.
      const newAssignment = await tx.assignment.create({
        data: {
          title,
          instructions: instructions ?? null,
          dueDate: dueDate ? new Date(dueDate) : null,
          course: { connect: { id: courseId } },
          author: { connect: { id: authorId } },
          document: { connect: { id: documentId } },
        },
      });

      // 4. If there are students in the course, create a PENDING submission for each one.
      if (course.students.length > 0) {
        const submissionData = course.students.map((student) => ({
          assignmentId: newAssignment.id,
          studentId: student.id,
          // Initially, the submission's document is the teacher's template.
          // A student will later create their own copy to submit.
          documentId: documentId,
        }));

        await tx.submission.createMany({
          data: submissionData,
        });
      }

      return newAssignment;
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
}

export const assignmentService = new AssignmentService();
