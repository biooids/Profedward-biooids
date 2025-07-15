// src/features/ai/ai.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { createHttpError } from "../../utils/error.factory";
import { aiService } from "./ai.service";
import { AiProcessRequestDto } from "./ai.types";
import { documentService } from "../document/document.service";

class AiController {
  /**
   * Handles the main AI processing requests, including starting or continuing a conversation.
   */
  processRequest = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as AiProcessRequestDto;
    const userId = req.user!.id; // From verifyToken middleware

    if (!dto.documentId || !dto.action) {
      throw createHttpError(400, "documentId and action are required.");
    }

    // Security check: Ensure the user owns the document they are querying.
    const document = await documentService.findDocumentById(dto.documentId);
    if (!document || document.uploaderId !== userId) {
      throw createHttpError(403, "Access to this document is forbidden.");
    }

    // Pass the request DTO and the authenticated userId to the service.
    const result = await aiService.processRequest(dto, userId);

    // Return a structured response.
    res.status(200).json({
      status: "success",
      action: dto.action,
      conversationId: result.conversationId,
      data: result.data,
    });
  });

  /**
   * Fetches the list of past conversation titles for a specific document.
   */
  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const userId = req.user!.id;

    // A final check to ensure the user can access this document's history.
    const document = await documentService.findDocumentById(documentId);
    if (!document || document.uploaderId !== userId) {
      throw createHttpError(
        403,
        "Access to this document's history is forbidden."
      );
    }

    const history = await aiService.getHistoryForDocument(userId, documentId);
    res.status(200).json({ status: "success", data: history });
  });

  // --- THIS IS THE FIX ---
  /**
   * Fetches all messages for a specific conversation thread.
   */
  getConversationMessages = asyncHandler(
    async (req: Request, res: Response) => {
      const { conversationId } = req.params;
      const userId = req.user!.id;

      // The service layer will handle security to ensure the user owns this conversation.
      const messages = await aiService.getConversationMessages(
        userId,
        conversationId
      );
      res.status(200).json({ status: "success", data: messages });
    }
  );

  /**
   * Deletes a specific conversation thread.
   */
  deleteConversation = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    // The service layer will handle the security check to ensure the user owns this conversation.
    await aiService.deleteConversation(userId, conversationId);
    res.status(204).send();
  });
}

export const aiController = new AiController();
