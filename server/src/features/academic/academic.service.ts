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

  public async updateAcademicLevel(id: string, name: string) {
    return prisma.academicLevel.update({ where: { id }, data: { name } });
  }

  public async deleteAcademicLevel(id: string) {
    // Check if any courses are using this level
    const courseCount = await prisma.course.count({
      where: { academicLevelId: id },
    });
    if (courseCount > 0) {
      throw createHttpError(
        409,
        `Cannot delete level because it is in use by ${courseCount} course(s).`
      );
    }
    return prisma.academicLevel.delete({ where: { id } });
  }

  public async updateSubject(id: string, name: string) {
    return prisma.subject.update({ where: { id }, data: { name } });
  }

  public async deleteSubject(id: string) {
    // Check if any courses are using this subject
    const courseCount = await prisma.course.count({ where: { subjectId: id } });
    if (courseCount > 0) {
      throw createHttpError(
        409,
        `Cannot delete subject because it is in use by ${courseCount} course(s).`
      );
    }
    return prisma.subject.delete({ where: { id } });
  }
}

export const academicService = new AcademicService();
