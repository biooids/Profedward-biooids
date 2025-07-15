//src/lib/schemas/auth.schemas.ts

import { z } from "zod";

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username must be at most 30 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores."
      )
      .transform((val) => val.trim().toLowerCase()),
    email: z
      .string()
      .email("Invalid email address.")
      .transform((val) => val.trim().toLowerCase()),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address.")
    .transform((val) => val.trim().toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// File validation constants
const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(30, "Username can be at most 30 characters long.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores."
    )
    .transform((val) => val.trim().toLowerCase())
    .optional(),

  // ** FIX APPLIED HERE **
  displayName: z
    .string()
    .trim() // First, remove whitespace from the beginning and end
    .min(1, "Display name cannot be empty.") // Then, ensure the result is not an empty string
    .max(50, "Display name can be at most 50 characters long.")
    .optional(),

  bio: z
    .string()
    .max(200, "Bio can be at most 200 characters long.")
    .transform((val) => val.trim())
    .optional(),

  profileImageFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE_BYTES,
      `Max image size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png, .gif, .webp formats are supported."
    ),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
