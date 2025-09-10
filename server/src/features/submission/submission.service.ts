import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import {
  GradeSubmissionDto,
  GetSubmissionsQueryDto,
  SubmitWorkDto,
  SaveDraftDto,
  SaveGradingDraftDto,
} from "./submission.types";
import { Prisma, SubmissionStatus } from "../../../prisma/generated/prisma";

export class SubmissionService {
  /**
   *
   * @param teacherId The ID of the teacher requesting the submissions
   * @param query The query parameters
   * @returns An array of submissions
   */

  public async getSubmissionsForTeacher(
    teacherId: string,
    query: GetSubmissionsQueryDto
  ) {
    const assignmentWhere: Prisma.AssignmentWhereInput = {
      authorId: teacherId,
    };

    if (query.courseId) {
      assignmentWhere.courseId = query.courseId;
    }

    const where: Prisma.SubmissionWhereInput = {
      assignment: assignmentWhere,
    };

    if (query.status) {
      where.status = query.status;
    }

    return prisma.submission.findMany({
      where,
      include: {
        student: {
          select: { id: true, displayName: true, profileImage: true },
        },
        assignment: { select: { id: true, title: true, courseId: true } },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
  }

  /**
   * Grades a student's submission. This is the final action in the grading workflow.
   * @param submissionId The ID of the submission to grade.
   * @param correctorId The ID of the teacher grading it.
   * @param data The grading data (grade, comments, and marked-up documentId).
   */
  public async gradeSubmission(
    submissionId: string,
    correctorId: string,
    data: GradeSubmissionDto
  ) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { course: { include: { teachers: true } } },
        },
      },
    });

    if (!submission) {
      throw createHttpError(404, "Submission not found.");
    }

    const isTeacher = submission.assignment.course.teachers.some(
      (teacher) => teacher.id === correctorId
    );
    if (!isTeacher) {
      throw createHttpError(
        403,
        "You are not authorized to grade this submission."
      );
    }

    // --- THIS IS THE FIX ---
    // Use a transaction to perform both writes safely.
    return prisma.$transaction(async (tx) => {
      // Step A: Use upsert to find and update the correction, or create it.
      const newCorrection = await tx.correction.upsert({
        where: { submissionId: submissionId },
        // If it exists, update it with the final grade and comments.
        update: {
          grade: data.grade ?? null,
          comments: data.comments ?? null,
        },
        // If it doesn't exist, create it.
        create: {
          submission: { connect: { id: submissionId } },
          corrector: { connect: { id: correctorId } },
          document: { connect: { id: data.documentId } },
          grade: data.grade ?? null,
          comments: data.comments ?? null,
        },
      });

      // Step B: Update the original Submission's status to GRADED.
      const updatedSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.GRADED },
      });

      return { newCorrection, updatedSubmission };
    });
  }
  public async getSubmissionsForStudent(
    studentId: string,
    query: GetSubmissionsQueryDto
  ) {
    // --- THIS IS THE FIX ---
    // Start with the base `where` clause
    const where: Prisma.SubmissionWhereInput = {
      studentId: studentId,
    };

    // Conditionally add the courseId filter if it exists
    if (query.courseId) {
      where.assignment = {
        courseId: query.courseId,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    return prisma.submission.findMany({
      where,
      include: {
        document: true,
        assignment: {
          include: {
            document: true,
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

  public async findOrCreateSubmissionForStudent(
    studentId: string,
    assignmentId: string
  ) {
    // First, verify the student has access to this assignment
    const assignmentCheck = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        course: { students: { some: { id: studentId } } },
      },
    });

    if (!assignmentCheck) {
      throw createHttpError(
        404,
        "Assignment not found or you are not enrolled in this course."
      );
    }

    // Use upsert to find the submission or create it if it doesn't exist
    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      // If creating, set the basic data
      create: {
        student: { connect: { id: studentId } },
        assignment: { connect: { id: assignmentId } },
        status: SubmissionStatus.PENDING,
      },
      // If updating (i.e., finding), do nothing
      update: {},

      // --- THIS IS THE FIX ---
      // Always include the necessary related data in the response
      include: {
        document: true, // The student's own document (which may be null)
        assignment: {
          include: {
            document: true, // The teacher's original document
          },
        },
      },
    });

    return submission;
  }

  public async saveSubmissionDraft(
    submissionId: string,
    studentId: string,
    data: SaveDraftDto
  ) {
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, studentId },
    });

    if (!submission) {
      throw createHttpError(404, "Submission not found or access denied.");
    }

    if (
      submission.status !== SubmissionStatus.PENDING &&
      submission.status !== SubmissionStatus.RESUBMITTED
    ) {
      throw createHttpError(
        403,
        "This assignment has already been submitted and cannot be edited."
      );
    }

    return prisma.submission.update({
      where: { id: submissionId },
      data: {
        documentId: data.documentId,
        notes: data.notes ?? null,
      },
    });
  }

  public async submitWork(
    submissionId: string,
    studentId: string,
    data: SubmitWorkDto
  ) {
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        studentId: studentId,
      },
    });

    if (!submission) {
      throw createHttpError(
        404,
        "Submission record not found or access denied."
      );
    }

    if (
      submission.status !== SubmissionStatus.PENDING &&
      submission.status !== SubmissionStatus.RESUBMITTED
    ) {
      throw createHttpError(
        400,
        "This assignment has already been submitted or graded."
      );
    }

    return prisma.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        documentId: data.documentId,
        notes: data.notes ?? null,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
  }

  public async getPendingAssignmentsByCourse(studentId: string) {
    return prisma.course.findMany({
      where: {
        students: { some: { id: studentId } },
        assignments: {
          some: {
            submissions: {
              some: {
                studentId: studentId,
                status: "PENDING",
              },
            },
          },
        },
      },
      include: {
        subject: true,
        academicLevel: true,
        teachers: {
          select: {
            displayName: true,
          },
        },
        assignments: {
          include: {
            submissions: {
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

  public async getSubmissionByIdForTeacher(
    submissionId: string,
    teacherId: string
  ) {
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        // Security check: ensure the teacher is part of the course
        assignment: {
          course: {
            teachers: { some: { id: teacherId } },
          },
        },
      },
      include: {
        student: true,
        document: true, // The student's submitted document
        assignment: {
          include: {
            document: true, // The teacher's original worksheet
          },
        },
        correction: {
          include: {
            document: true, // The teacher's marked-up feedback document
          },
        },
      },
    });

    if (!submission) {
      throw createHttpError(404, "Submission not found or access denied.");
    }
    return submission;
  }

  public async getGradedSubmissionForStudent(
    submissionId: string,
    studentId: string
  ) {
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        studentId: studentId, // Security check: ensure student owns this submission
      },
      include: {
        document: true, // The student's original submitted document
        assignment: {
          select: {
            title: true,
          },
        },
        correction: {
          include: {
            document: true, // The teacher's marked-up feedback document
          },
        },
      },
    });

    if (!submission) {
      throw createHttpError(
        404,
        "Graded submission not found or access denied."
      );
    }
    return submission;
  }

  public async saveGradingDraft(
    submissionId: string,
    correctorId: string,
    data: SaveGradingDraftDto
  ) {
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        assignment: { course: { teachers: { some: { id: correctorId } } } },
      },
    });

    if (!submission) {
      throw createHttpError(404, "Submission not found or access denied.");
    }

    return prisma.correction.upsert({
      where: { submissionId: submissionId },
      create: {
        submission: { connect: { id: submissionId } },
        corrector: { connect: { id: correctorId } },
        document: { connect: { id: data.documentId } },
        grade: data.grade ?? null,
        comments: data.comments ?? null,
      },
      update: {
        grade: data.grade ?? null,
        comments: data.comments ?? null,
      },
    });
  }
}

export const submissionService = new SubmissionService();
