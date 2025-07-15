import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

/**
 * A utility function to combine and merge Tailwind CSS classes conditionally.
 * It resolves class conflicts intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A utility function to extract a user-friendly error message
 * from RTK Query's FetchBaseQueryError or SerializedError types.
 */
export const getApiErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "An unknown error occurred.";

  // Handle FetchBaseQueryError
  if (
    "status" in error &&
    typeof error.data === "object" &&
    error.data &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  // Handle SerializedError
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "An unexpected server error occurred. Please try again.";
};
