import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import { GradeSubmissionDto, GetSubmissionsQueryDto } from "./submission.types";
import { Prisma, SubmissionStatus } from "prisma/generated/prisma";

export class SubmissionService {
  /**
   * Gets submissions for all assignments created by a teacher.
   * @param teacherId The ID of the teacher.
   * @param query Query parameters for filtering.
   */
  public async getSubmissionsForTeacher(
    teacherId: string,
    query: GetSubmissionsQueryDto
  ) {
    // FIX 1: Build the 'where' clause conditionally.
    const where: Prisma.SubmissionWhereInput = {
      assignment: {
        authorId: teacherId,
      },
    };

    if (query.status) {
      where.status = query.status;
    }

    return prisma.submission.findMany({
      where, // Use the conditionally built where clause
      include: {
        student: {
          select: { id: true, displayName: true, profileImage: true },
        },
        assignment: { select: { id: true, title: true } },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
  }

  /**
   * Grades a student's submission.
   * @param submissionId The ID of the submission to grade.
   * @param correctorId The ID of the teacher grading it.
   * @param data The grading data.
   */
  public async gradeSubmission(
    submissionId: string,
    correctorId: string,
    data: GradeSubmissionDto
  ) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      // FIX 2: Explicitly include the 'teachers' from the course.
      include: {
        assignment: {
          include: {
            course: {
              include: {
                teachers: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw createHttpError(404, "Submission not found.");
    }

    // This check now works because 'teachers' is included in the query result.
    const isTeacher = submission.assignment.course.teachers.some(
      (teacher) => teacher.id === correctorId
    );
    if (!isTeacher) {
      throw createHttpError(
        403,
        "You are not authorized to grade this submission."
      );
    }

    return prisma.$transaction(async (tx) => {
      const newCorrection = await tx.correction.create({
        data: {
          // FIX 3: Handle potential 'undefined' values.
          grade: data.grade ?? null,
          comments: data.comments ?? null,
          submission: { connect: { id: submissionId } },
          corrector: { connect: { id: correctorId } },
          document: { connect: { id: data.documentId } },
        },
      });

      const updatedSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.GRADED },
      });

      return { newCorrection, updatedSubmission };
    });
  }
}

export const submissionService = new SubmissionService();
