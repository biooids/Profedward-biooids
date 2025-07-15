// src/features/document/document.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createHttpError } from "../../utils/error.factory.js";
import { documentService } from "./document.service.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";
import { parsePdfToTiptapJson } from "../../utils/document.parser.js"; // <-- 1. Import the parser
import fs from "fs"; // <-- 2. Import fs for final cleanup

class DocumentController {
  // This is the single, corrected version of the method.
  handleUploadDocument = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw createHttpError(400, "No document file was uploaded.");
    }

    const userId = req.user!.id;
    const { name, shelfId } = req.body;
    if (!name) {
      throw createHttpError(400, "Document name is required.");
    }

    try {
      // Step 1: Parse the local temp file to get editable content
      let editableContent = null;
      if (file.mimetype === "application/pdf") {
        editableContent = await parsePdfToTiptapJson(file.path);
      }

      // Step 2: Upload the local temp file to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file.path, "documents");

      // Step 3: Call the service to create the DB record with all data
      const documentRecord = await documentService.createDocument(
        {
          name,
          uploaderId: userId,
          originalFileUrl: cloudinaryResult.secure_url,
          originalFilePublicId: cloudinaryResult.public_id,
          originalFileType: file.mimetype,
          shelfId: shelfId,
          editableContent: editableContent, // Pass the parsed content
        },
        file.path // <-- 3. Pass the file path as the second argument
      );

      res.status(201).json({
        status: "success",
        message: "Document uploaded and processed successfully.",
        data: { document: documentRecord },
      });
    } catch (error) {
      console.error("Error during document upload process:", error);
      throw createHttpError(500, "Failed to process document upload.");
    } finally {
      // Step 4: Always delete the temporary file from the server
      fs.unlink(file.path, (err: NodeJS.ErrnoException | null) => {
        // <-- 4. Type the error parameter
        if (err) console.error("Error deleting temp file:", err);
        else
          console.log(`[DocumentController] Temp file ${file.path} deleted.`);
      });
    }
  });

  handleCreateEditableDocument = asyncHandler(
    async (req: Request, res: Response) => {
      const { name, shelfId, content } = req.body;
      const userId = req.user!.id;

      if (!name || !content) {
        throw createHttpError(400, "Document name and content are required.");
      }

      const newDocument = await documentService.createEditableDocument({
        name,
        uploaderId: userId,
        content,
        shelfId,
      });

      res.status(201).json({
        status: "success",
        message: "Document created successfully.",
        data: { document: newDocument },
      });
    }
  );

  handleGetDocumentById = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const userId = req.user!.id;
    const document = await documentService.findDocumentById(documentId);
    if (!document) {
      throw createHttpError(404, "Document not found.");
    }
    if (document.uploaderId !== userId) {
      throw createHttpError(
        403,
        "Forbidden: You do not have permission to view this document."
      );
    }
    res.status(200).json({
      status: "success",
      data: { document },
    });
  });

  handleUpdateDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { name } = req.body;
    const userId = req.user!.id;
    if (!name) {
      throw createHttpError(400, "Document name is required for update.");
    }
    const updatedDocument = await documentService.updateDocument(
      userId,
      documentId,
      { name }
    );
    res.status(200).json({
      status: "success",
      message: "Document updated successfully.",
      data: { document: updatedDocument },
    });
  });

  handleDeleteDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const userId = req.user!.id;
    await documentService.deleteDocument(userId, documentId);
    res.status(204).send();
  });

  handleGetDocumentsInShelf = asyncHandler(
    async (req: Request, res: Response) => {
      const { shelfId } = req.params;
      const userId = req.user!.id;
      const documents = await documentService.findDocumentsByShelfId(
        userId,
        shelfId
      );
      res.status(200).json({
        status: "success",
        results: documents.length,
        data: { documents },
      });
    }
  );

  handleExportDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const userId = req.user!.id;

    const { pdfBuffer, name } = await documentService.generatePdfForDocument(
      userId,
      documentId
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${name}.pdf"`);
    res.send(pdfBuffer);
  });
}

export const documentController = new DocumentController();
