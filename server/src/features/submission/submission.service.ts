import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import {
  GradeSubmissionDto,
  GetSubmissionsQueryDto,
  SubmitWorkDto,
} from "./submission.types";
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

  /**
   * Gets all submissions for a specific student.
   * @param studentId The ID of the logged-in student.
   * @param query Query parameters for filtering by status.
   */
  /**
   * [STUDENT] Gets all submissions for a student.
   * This now includes a "find or create" logic to handle late enrollments.
   */
  /**
   * [STUDENT] Gets all submissions for a student.
   * This now includes a "find or create" logic to handle late enrollments.
   */
  public async getSubmissionsForStudent(
    studentId: string,
    query: GetSubmissionsQueryDto
  ) {
    const where: Prisma.SubmissionWhereInput = {
      studentId: studentId,
    };
    if (query.status) {
      where.status = query.status;
    }

    return prisma.submission.findMany({
      where,
      include: {
        document: true, // <-- ADD THIS LINE to include the student's document
        assignment: {
          include: {
            document: true, // This is the teacher's original document
            course: {
              include: {
                subject: true,
                academicLevel: true,
                teachers: {
                  select: {
                    displayName: true,
                  },
                },
              },
            },
          },
        },
        correction: true,
      },
      orderBy: {
        assignment: {
          dueDate: "asc",
        },
      },
    });
  }

  /**
   * Allows a student to submit their work for an assignment.
   * @param submissionId The ID of their pending submission record.
   * @param studentId The ID of the student submitting.
   * @param data The submission data, including the document ID.
   */
  public async submitWork(
    submissionId: string,
    studentId: string,
    data: SubmitWorkDto
  ) {
    // 1. Find the original submission record
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        studentId: studentId, // Ensure the student owns this submission
      },
    });

    if (!submission) {
      throw createHttpError(
        404,
        "Submission record not found or access denied."
      );
    }

    if (
      submission.status !== "PENDING" &&
      submission.status !== "RESUBMITTED"
    ) {
      throw createHttpError(
        400,
        "This assignment has already been submitted or graded."
      );
    }

    // 2. Update the submission with the new document and status
    return prisma.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        documentId: data.documentId,
        notes: data.notes ?? null,
        status: "SUBMITTED",
        submittedAt: new Date(), // Update the submission timestamp
      },
    });
  }

  /**
   * [STUDENT] Gets all courses that have pending submissions for a student,
   * with the pending submissions included.
   */ /**
   * [STUDENT] Gets all courses that have pending submissions for a student,
   * with the pending submissions included.
   */
  public async getPendingAssignmentsByCourse(studentId: string) {
    return prisma.course.findMany({
      // Find courses where...
      where: {
        // 1. The student is enrolled
        students: { some: { id: studentId } },
        // 2. And the course has at least one assignment...
        assignments: {
          some: {
            // ...that has a PENDING submission for this student.
            submissions: {
              some: {
                studentId: studentId,
                status: "PENDING",
              },
            },
          },
        },
      },
      // Include all the details we need for the UI
      include: {
        subject: true,
        academicLevel: true,
        teachers: {
          select: {
            displayName: true,
          },
        },
        // The relation on Course is 'assignments', not 'submissions'
        assignments: {
          // For each assignment, include its submissions...
          include: {
            submissions: {
              // ...but only the pending ones for this specific student.
              where: {
                studentId: studentId,
                status: "PENDING",
              },
            },
          },
        },
      },
    });
  }
}

export const submissionService = new SubmissionService();
