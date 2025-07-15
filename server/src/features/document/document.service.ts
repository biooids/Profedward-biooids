// src/features/document/document.service.ts

import prisma from "../../db/prisma.js";
import { createHttpError } from "../../utils/error.factory.js";
import {
  CreateDocumentDto,
  CreateEditableDocumentDto,
  UpdateDocumentDto,
} from "./document.types.js";
import { Prisma } from "../../../prisma/generated/prisma/index.js";
import { generatePdfFromTiptapJson } from "../../utils/pdf.generator.js";
import { parsePdfToTiptapJson } from "../../utils/document.parser.js";

class DocumentService {
  /**
   * This is the primary method for creating a document from an uploaded file.
   * It handles saving the file info and parsing it for editable content.
   * @param data The metadata for the document.
   * @param tempFilePath The path to the temporary uploaded file for parsing.
   */
  public async createDocument(data: CreateDocumentDto, tempFilePath: string) {
    const {
      name,
      uploaderId,
      originalFileUrl,
      originalFilePublicId,
      originalFileType,
      shelfId,
    } = data;

    // Security check for shelf ownership
    if (shelfId) {
      const shelf = await prisma.shelf.findUnique({ where: { id: shelfId } });
      if (!shelf) {
        throw createHttpError(404, `Shelf with ID ${shelfId} not found.`);
      }
      if (shelf.ownerId !== uploaderId) {
        throw createHttpError(
          403,
          "Forbidden: You do not have permission to add documents to this shelf."
        );
      }
    }

    let editableContent: Prisma.InputJsonValue | null = null;

    // This method now correctly calls the parser.
    if (originalFileType === "application/pdf" && tempFilePath) {
      console.log(`[DocumentService] Parsing PDF: ${tempFilePath}`);
      editableContent = await parsePdfToTiptapJson(tempFilePath);
      if (editableContent) {
        console.log("[DocumentService] PDF parsing successful.");
      } else {
        console.error("[DocumentService] PDF parsing failed.");
      }
    }

    const documentData: Prisma.DocumentCreateInput = {
      name,
      uploader: { connect: { id: uploaderId } },
      originalFileUrl,
      originalFilePublicId,
      originalFileType,
      // --- THIS IS THE FIX ---
      // We conditionally add the editableContent property only if it's not null.
      ...(editableContent && {
        editableContent: editableContent as Prisma.InputJsonValue,
      }),
      ...(shelfId && { shelf: { connect: { id: shelfId } } }),
    };

    return prisma.document.create({
      data: documentData,
    });
  }

  /**
   * This method is for creating a new document from scratch using the Tiptap editor.
   */
  public async createEditableDocument(data: CreateEditableDocumentDto) {
    const { name, uploaderId, content, shelfId } = data;

    if (shelfId) {
      const shelf = await prisma.shelf.findUnique({ where: { id: shelfId } });
      if (!shelf) {
        throw createHttpError(404, `Shelf with ID ${shelfId} not found.`);
      }
      if (shelf.ownerId !== uploaderId) {
        throw createHttpError(
          403,
          "Forbidden: You do not have permission to add documents to this shelf."
        );
      }
    }

    const documentData: Prisma.DocumentCreateInput = {
      name,
      uploader: { connect: { id: uploaderId } },
      editableContent: content as Prisma.InputJsonValue,
      ...(shelfId && { shelf: { connect: { id: shelfId } } }),
    };

    return prisma.document.create({
      data: documentData,
    });
  }

  public async findDocumentById(documentId: string) {
    return prisma.document.findUnique({ where: { id: documentId } });
  }

  public async updateDocument(
    userId: string,
    documentId: string,
    data: UpdateDocumentDto
  ) {
    const document = await this.findDocumentById(documentId);
    if (!document) {
      throw createHttpError(404, "Document not found.");
    }
    if (document.uploaderId !== userId) {
      throw createHttpError(403, "Forbidden: You do not own this document.");
    }

    // Build the update object conditionally
    const updateData: Prisma.DocumentUpdateInput = {};
    if (data.name) {
      updateData.name = data.name;
    }
    if (data.content) {
      updateData.editableContent = data.content as Prisma.InputJsonValue;
    }

    return prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });
  }

  public async deleteDocument(
    userId: string,
    documentId: string
  ): Promise<void> {
    const document = await this.findDocumentById(documentId);
    if (!document) {
      throw createHttpError(404, "Document not found.");
    }
    if (document.uploaderId !== userId) {
      throw createHttpError(403, "Forbidden: You do not own this document.");
    }
    await prisma.document.delete({ where: { id: documentId } });
  }

  public async findDocumentsByShelfId(userId: string, shelfId: string) {
    const shelf = await prisma.shelf.findFirst({
      where: { id: shelfId, ownerId: userId },
    });
    if (!shelf) {
      throw createHttpError(
        404,
        "Shelf not found or you do not have permission to view it."
      );
    }
    return prisma.document.findMany({
      where: { shelfId: shelfId },
      orderBy: { createdAt: "desc" },
    });
  }

  public async generatePdfForDocument(userId: string, documentId: string) {
    const document = await this.findDocumentById(documentId);

    if (!document) {
      throw createHttpError(404, "Document not found.");
    }
    if (document.uploaderId !== userId) {
      throw createHttpError(403, "Forbidden: You do not own this document.");
    }
    if (!document.editableContent) {
      throw createHttpError(
        400,
        "This document has no editable content to convert."
      );
    }

    const pdfBuffer = await generatePdfFromTiptapJson(document.editableContent);

    return { pdfBuffer, name: document.name };
  }

  private extractTextFromTiptapJson(content: any): string {
    if (!content || !content.content || !Array.isArray(content.content)) {
      return "";
    }

    let text = "";

    function recurse(node: any) {
      if (node.type === "text" && node.text) {
        text += node.text + " ";
      }

      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(recurse);
      }
    }

    content.content.forEach(recurse);
    return text.trim();
  }

  /**
   * Public method to get the full text content of a document.
   * @param documentId The ID of the document.
   */
  public async getDocumentTextContent(documentId: string): Promise<string> {
    const document = await this.findDocumentById(documentId);
    if (!document || !document.editableContent) {
      return "";
    }
    return this.extractTextFromTiptapJson(document.editableContent);
  }
}

export const documentService = new DocumentService();
