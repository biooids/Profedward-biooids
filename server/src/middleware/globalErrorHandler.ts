import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { HttpError } from "../utils/HttpError.js";
import { Prisma } from "../../prisma/generated/prisma";

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("💥 Global Error Handler Caught:", err);

  let statusCode = 500;
  let message = "An internal server error occurred.";
  let status = "error";

  // --- Handle Our Custom HttpErrors ---
  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  }
  // --- Handle Prisma Known Errors ---
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint failed
        statusCode = 409; // Conflict
        message = `A record with this value already exists.`;
        status = "fail";
        break;
      case "P2025": // Record to update/delete does not exist
        statusCode = 404; // Not Found
        message = `The requested resource was not found.`;
        status = "fail";
        break;
      default:
        statusCode = 500;
        message = "A database error occurred.";
        break;
    }
  }
  // --- Handle Generic Errors (Keep last) ---
  else if (err instanceof Error) {
    message =
      process.env.NODE_ENV === "development"
        ? err.message
        : "An internal server error occurred.";
  }

  // --- THIS IS THE NEW BLOCK TO HANDLE THE AI RATE LIMIT ---
  // It runs after the statusCode has been determined from the error.
  if (statusCode === 429) {
    const secondsUntilNextMinute = 60 - new Date().getSeconds();
    res.status(429).json({
      status: "rate_limit_exceeded",
      message: `The AI is busy at the moment. The limit may reset in the next minute. Please try again shortly.`,
      data: {
        retryAfterSeconds: secondsUntilNextMinute,
      },
    });
    return; // Stop further execution and send the response
  }
  // --- END OF NEW BLOCK ---

  // --- Existing Final Response Logic ---
  const responseMessage =
    process.env.NODE_ENV === "development" && !(err instanceof HttpError)
      ? err instanceof Error
        ? err.message
        : String(err)
      : message;

  res.status(statusCode).json({
    status: status,
    message: responseMessage,
    stack:
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.stack
        : undefined,
  });
};
