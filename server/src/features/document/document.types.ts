// src/features/document/document.types.ts

import { JsonValue } from "@prisma/client/runtime/library";

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

// --- NEW: DTO for updating an existing document ---
export interface UpdateDocumentDto {
  name?: string;
  content?: JsonValue;
}
