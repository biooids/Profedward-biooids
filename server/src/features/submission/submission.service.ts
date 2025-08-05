import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";
import {
  GradeSubmissionDto,
  GetSubmissionsQueryDto,
  SubmitWorkDto,
  SaveDraftDto,
} from "./submission.types";
import { Prisma, SubmissionStatus } from "prisma/generated/prisma";

export class SubmissionService {
  /**
   * Gets submissions for all assignments created by a teacher.
   */
  public async getSubmissionsForTeacher(
    teacherId: string,
    query: GetSubmissionsQueryDto
  ) {
    const where: Prisma.SubmissionWhereInput = {
      assignment: {
        authorId: teacherId,
      },
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
        assignment: { select: { id: true, title: true } },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
  }

  /**
   * Grades a student's submission.
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

  /**
   * [STUDENT] Finds a student's submission for a specific assignment.
   * If one doesn't exist, it creates a new 'PENDING' submission record.
   */
  public async findOrCreateSubmissionForStudent(
    studentId: string,
    assignmentId: string
  ) {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        course: { students: { some: { id: studentId } } },
      },
    });

    if (!assignment) {
      throw createHttpError(
        404,
        "Assignment not found or you are not enrolled in this course."
      );
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: { assignmentId, studentId },
    });

    if (existingSubmission) {
      return existingSubmission;
    }

    return prisma.submission.create({
      data: {
        student: { connect: { id: studentId } },
        assignment: { connect: { id: assignmentId } },
        status: SubmissionStatus.PENDING,
      },
    });
  }

  /**
   * [STUDENT] Saves a draft of a student's work without submitting it.
   */
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

  /**
   * Allows a student to submit their final work for an assignment.
   */
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

  /**
   * [STUDENT] Gets all courses that have pending submissions for a student.
   */
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
}

export const submissionService = new SubmissionService();
