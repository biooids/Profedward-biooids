// src/features/shelf/shelf.service.ts

import prisma from "../../db/prisma.js";
import { createHttpError } from "../../utils/error.factory.js";
import { CreateShelfDto, UpdateShelfDto } from "./shelf.types.js";
import { Prisma } from "../../../prisma/generated/prisma/index.js";

class ShelfService {
  /**
   * Creates a new shelf for a specific user.
   */
  public async createShelfForUser(userId: string, data: CreateShelfDto) {
    const { name } = data;
    return prisma.shelf.create({
      data: {
        name,
        ownerId: userId,
      },
    });
  }

  /**
   * Finds all shelves belonging to a specific user.
   * --- THIS IS THE FIX ---
   * We now include a `_count` of the related documents in the query.
   */
  public async findShelvesByUserId(userId: string) {
    return prisma.shelf.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Updates the name of a specific shelf, ensuring ownership.
   */
  public async updateShelfName(
    userId: string,
    shelfId: string,
    data: UpdateShelfDto
  ) {
    const shelf = await prisma.shelf.findUnique({ where: { id: shelfId } });

    if (!shelf) {
      throw createHttpError(404, "Shelf not found.");
    }
    if (shelf.ownerId !== userId) {
      throw createHttpError(403, "Forbidden: You do not own this shelf.");
    }

    const updateData: Prisma.ShelfUpdateInput = {};
    if (data.name) {
      updateData.name = data.name;
    }

    return prisma.shelf.update({
      where: { id: shelfId },
      data: updateData,
    });
  }

  /**
   * Deletes a specific shelf, ensuring ownership.
   */
  public async deleteShelf(userId: string, shelfId: string): Promise<void> {
    const shelf = await prisma.shelf.findUnique({ where: { id: shelfId } });

    if (!shelf) {
      throw createHttpError(404, "Shelf not found.");
    }
    if (shelf.ownerId !== userId) {
      throw createHttpError(403, "Forbidden: You do not own this shelf.");
    }

    await prisma.shelf.delete({ where: { id: shelfId } });
  }
}

export const shelfService = new ShelfService();
