// src/lib/schemas/document.schemas.ts

import { z } from "zod";

// Schema for creating a new document from the editor
export const createDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Document title cannot be empty." }),
  content: z
    .string()
    .min(25, { message: "Document content is too short." }) // A simple check for non-empty Tiptap JSON
    .refine(
      (val) => {
        try {
          // A default empty Tiptap doc has one empty paragraph node.
          // We check if there's more than that.
          const jsonContent = JSON.parse(val);
          return (
            jsonContent.content?.length > 1 ||
            jsonContent.content?.[0]?.content?.length > 0
          );
        } catch {
          return false;
        }
      },
      { message: "Document cannot be empty." }
    ),
});

// --- Existing Schemas (for reference, no changes needed) ---

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const uploadDocumentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Document name must be at least 3 characters.")
    .max(100, "Document name can be at most 100 characters."),
  documentFile: z
    .any()
    .refine((files) => files?.length >= 1, "File is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE_BYTES,
      `Max file size is ${MAX_FILE_SIZE_MB}MB.`
    ),
});

export const updateDocumentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Document name must be at least 3 characters.")
    .max(100, "Document name can be at most 100 characters."),
});

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
export type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentFormValues = z.infer<typeof updateDocumentSchema>;
