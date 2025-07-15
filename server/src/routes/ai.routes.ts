// src/features/ai/ai.routes.ts

import { Router } from "express";
// FIX: Correcting the import path to be relative to the current directory.
import { aiController } from "../features/ai/ai.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router: Router = Router();

// Protect all AI routes with authentication.
router.use(verifyToken);

// This is the main route for processing AI actions and conversations.
router.post("/process", aiController.processRequest);

// --- HISTORY ROUTES ---

// Get a list of all conversation histories for a specific document.
router.get("/history/:documentId", aiController.getHistory);

// --- THIS IS THE FIX ---
// Add the GET route to fetch all messages for a specific conversation.
router.get(
  "/conversation/:conversationId",
  aiController.getConversationMessages
);

// Delete a specific conversation history.
router.delete("/conversation/:conversationId", aiController.deleteConversation);

export default router;
