//src/features/academic/academic.service.ts
import prisma from "../../db/prisma";
import { createHttpError } from "../../utils/error.factory";

export class AcademicService {
  // --- ADD THESE NEW METHODS ---
  public async createAcademicLevel(name: string) {
    // Check if it already exists to prevent duplicates
    const existing = await prisma.academicLevel.findUnique({ where: { name } });
    if (existing) {
      throw createHttpError(
        409,
        "An academic level with this name already exists."
      );
    }
    return prisma.academicLevel.create({ data: { name } });
  }

  public async createSubject(name: string) {
    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) {
      throw createHttpError(409, "A subject with this name already exists.");
    }
    return prisma.subject.create({ data: { name } });
  }

  // --- Keep existing methods ---
  public async getAcademicLevels() {
    return prisma.academicLevel.findMany({ orderBy: { name: "asc" } });
  }

  public async getSubjects() {
    return prisma.subject.findMany({ orderBy: { name: "asc" } });
  }
}

export const academicService = new AcademicService();
