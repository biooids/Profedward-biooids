import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import { CreateAssignmentDto } from "./assignment.types";

export class AssignmentService {
  /**
   * Creates an assignment for a course and generates pending submissions for all enrolled students.
   * @param authorId The ID of the teacher creating the assignment.
   * @param data The assignment details.
   */
  public async createAssignment(authorId: string, data: CreateAssignmentDto) {
    const { courseId, title, instructions, dueDate, documentId } = data;

    // 1. Verify the author is a teacher of this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teachers: { some: { id: authorId } },
      },
      include: {
        students: { select: { id: true } }, // Get all student IDs
      },
    });

    if (!course) {
      throw createHttpError(
        403,
        "You do not have permission to create assignments for this course."
      );
    }

    // Use a transaction to ensure both assignment and submissions are created
    return prisma.$transaction(async (tx) => {
      // 2. Create the Assignment
      const newAssignment = await tx.assignment.create({
        data: {
          title,
          instructions: instructions ?? null, // <-- FIX
          dueDate: dueDate ?? null, // <-- FIX
          course: { connect: { id: courseId } },
          author: { connect: { id: authorId } },
          document: { connect: { id: documentId } },
        },
      });

      // 3. Create a PENDING submission for each student in the course
      if (course.students.length > 0) {
        const submissionData = course.students.map((student) => ({
          assignmentId: newAssignment.id,
          studentId: student.id,
          documentId: documentId, // Initially link to the teacher's template document
        }));
        await tx.submission.createMany({
          data: submissionData,
        });
      }

      return newAssignment;
    });
  }
}

export const assignmentService = new AssignmentService();
