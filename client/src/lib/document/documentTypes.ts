// src/lib/document/documentTypes.ts

/**
 * Represents the structure of a single Document object
 * as returned by the backend API.
 */
export interface Document {
  id: string;
  name: string;
  uploaderId: string;
  shelfId: string | null;
  editableContent: any | null; // Prisma's Json type maps to 'any'
  originalFileUrl: string | null;
  originalFilePublicId: string | null;
  originalFileType: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * The shape of the API response when fetching multiple documents.
 */
export interface GetDocumentsApiResponse {
  status: string;
  results: number;
  data: {
    documents: Document[];
  };
}

/**
 * The shape of the API response when uploading a single document.
 */
export interface UploadDocumentApiResponse {
  status: string;
  message: string;
  data: {
    document: Document;
  };
}
