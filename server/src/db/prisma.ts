// src/db/prisma.ts
import {
  PrismaClient,
  Prisma,
  SystemRole,
} from "../../prisma/generated/prisma";
// Make SystemRole available as an export if needed elsewhere
export { SystemRole };

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"], // Log more in dev
});

const MAX_CONNECT_RETRIES = 5;
const CONNECT_RETRY_DELAY_MS = 5000;

const MAX_QUERY_RETRIES = 3;
const QUERY_RETRY_BASE_DELAY_MS = 1000;

// These codes often indicate temporary issues or connection problems
const RETRIABLE_PRISMA_ERROR_CODES: string[] = [
  "P1000", // Authentication failed
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1003", // Database does not exist
  "P1008", // Operations timed out
  "P1017", // Server has closed the connection
  "P2024", // Timeout acquiring a connection
  "P3006", // Migration engine timed out
];

export async function connectPrisma(
  retriesLeft: number = MAX_CONNECT_RETRIES
): Promise<void> {
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to the database via Prisma.");
  } catch (error: any) {
    const currentAttempt = MAX_CONNECT_RETRIES - retriesLeft + 1;
    console.error(
      `❌ Prisma Connection Error (attempt ${currentAttempt}/${MAX_CONNECT_RETRIES}): Failed to connect.`,
      error.message || error
    );

    if (retriesLeft > 0) {
      console.log(
        `Retrying connection in ${CONNECT_RETRY_DELAY_MS / 1000} seconds...`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, CONNECT_RETRY_DELAY_MS)
      );
      return connectPrisma(retriesLeft - 1);
    } else {
      console.error(
        "❌ Exhausted all retries. Failed to connect to the database. Exiting.",
        error
      );
      process.exit(1);
    }
  }
}

export default prisma;

export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected.");
  } catch (error) {
    console.error("❌ Error during Prisma disconnect:", error);
  }
}

/**
 * A utility function to wrap Prisma queries with retry logic for transient errors.
 * @param prismaQueryFunction A function that returns a Prisma Promise
 * @returns The result of the Prisma query.
 */
export async function queryWithRetry<T>(
  prismaQueryFunction: () => Promise<T>,
  maxRetries: number = MAX_QUERY_RETRIES,
  baseDelayMs: number = QUERY_RETRY_BASE_DELAY_MS
): Promise<T> {
  let attempts = 0;
  while (true) {
    try {
      return await prismaQueryFunction();
    } catch (error: any) {
      attempts++;
      let shouldRetry = false;
      let errorCode: string | undefined = undefined;

      // Check if it's a known, retriable error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        errorCode = error.code;
        if (RETRIABLE_PRISMA_ERROR_CODES.includes(error.code)) {
          shouldRetry = true;
        }
      }
      // You might add checks for other error types if needed

      if (shouldRetry && attempts <= maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempts - 1); // Exponential backoff
        console.warn(
          `Query failed (attempt ${attempts}/${maxRetries})${
            errorCode ? ` code ${errorCode}` : ""
          }. Retrying in ${delayMs / 1000}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        if (shouldRetry && attempts > maxRetries) {
          console.error(`Query failed after ${maxRetries} retries.`);
        }
        // Re-throw if not retriable or retries exhausted
        throw error;
      }
    }
  }
}
