// src/routes/document.routes.ts

import { Router } from "express";
import { documentController } from "../features/document/document.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { uploadDocument } from "../middleware/multer.config.js";

const router: Router = Router();

router.use(verifyToken);

// This is the new route for creating a document from the editor
router.post("/new", documentController.handleCreateEditableDocument);

// This route for uploading a file remains the same
router.post(
  "/upload",
  uploadDocument.single("documentFile"),
  documentController.handleUploadDocument
);

router.get("/shelf/:shelfId", documentController.handleGetDocumentsInShelf);

router
  .route("/:documentId")
  .get(documentController.handleGetDocumentById)
  .patch(documentController.handleUpdateDocument)
  .delete(documentController.handleDeleteDocument);
// Add this new route before the existing /:documentId route
router.get("/:documentId/export", documentController.handleExportDocument);
export default router;
