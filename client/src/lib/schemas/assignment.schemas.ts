import { z } from "zod";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// This is for the first step of the form
export const assignmentDetailsSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  instructions: z.string().optional(),
  dueDate: z.date().optional(),
});
export type AssignmentDetailsFormValues = z.infer<
  typeof assignmentDetailsSchema
>;

// This is for the file upload step
export const assignmentDocumentUploadSchema = z.object({
  documentFile: z
    .any()
    .refine((files) => files?.length >= 1, "A file is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 50MB.`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      ".pdf, .doc, and .docx files are accepted."
    ),
});
export type AssignmentDocumentUploadValues = z.infer<
  typeof assignmentDocumentUploadSchema
>;
