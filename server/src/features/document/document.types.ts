//src/features/document/document.types.ts

import { JsonValue } from "@prisma/client/runtime/library";

// --- THIS IS THE FIX ---
// Add the main interface for a Document object
export interface Document {
  id: string;
  name: string;
  editableContent: JsonValue | null;
  originalFileUrl: string | null;
  originalFilePublicId: string | null;
  originalFileType: string | null;
  createdAt: Date;
  updatedAt: Date;
  uploaderId: string;
  shelfId: string | null;
}

// This DTO is for creating a document from a file upload.
export interface CreateDocumentDto {
  name: string;
  uploaderId: string;
  originalFileUrl: string;
  originalFilePublicId: string;
  originalFileType: string;
  shelfId?: string;
  editableContent?: JsonValue | null;
}

// This DTO is for creating a document from the in-app editor.
export interface CreateEditableDocumentDto {
  name: string;
  uploaderId: string;
  shelfId?: string;
  content: JsonValue;
}

// DTO for updating an existing document
export interface UpdateDocumentDto {
  name?: string;
  content?: JsonValue;
}
