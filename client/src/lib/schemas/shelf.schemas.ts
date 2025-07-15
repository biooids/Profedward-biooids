// src/lib/schemas/shelf.schemas.ts

import { z } from "zod";

export const shelfFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Shelf name must be at least 3 characters long." })
    .max(50, { message: "Shelf name can be at most 50 characters long." }),
  // You could add description or subject fields here if needed in the future
});

export type ShelfFormValues = z.infer<typeof shelfFormSchema>;
