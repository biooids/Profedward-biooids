// src/features/shelf/shelf.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createHttpError } from "../../utils/error.factory.js";
import { shelfService } from "./shelf.service.js";

class ShelfController {
  /**
   * Handles the request to create a new shelf.
   */
  handleCreateShelf = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = req.user!.id; // We know user exists from verifyToken middleware

    if (!name) {
      throw createHttpError(400, "Shelf name is required.");
    }

    const newShelf = await shelfService.createShelfForUser(userId, { name });
    res.status(201).json({
      status: "success",
      message: "Shelf created successfully.",
      data: { shelf: newShelf },
    });
  });

  /**
   * Handles the request to get all shelves for the logged-in user.
   */
  handleGetMyShelves = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const shelves = await shelfService.findShelvesByUserId(userId);
    res.status(200).json({
      status: "success",
      results: shelves.length,
      data: { shelves },
    });
  });

  /**
   * Handles the request to update a shelf's name.
   */
  handleUpdateShelf = asyncHandler(async (req: Request, res: Response) => {
    const { shelfId } = req.params;
    const { name } = req.body;
    const userId = req.user!.id;

    if (!name) {
      throw createHttpError(400, "New shelf name is required.");
    }

    const updatedShelf = await shelfService.updateShelfName(userId, shelfId, {
      name,
    });
    res.status(200).json({
      status: "success",
      message: "Shelf updated successfully.",
      data: { shelf: updatedShelf },
    });
  });

  /**
   * Handles the request to delete a shelf.
   */
  handleDeleteShelf = asyncHandler(async (req: Request, res: Response) => {
    const { shelfId } = req.params;
    const userId = req.user!.id;

    await shelfService.deleteShelf(userId, shelfId);
    res.status(204).send(); // 204 No Content is appropriate for successful deletion
  });
}

export const shelfController = new ShelfController();
