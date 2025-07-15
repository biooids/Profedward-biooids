// src/middleware/auth.middleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma.js";
import { DecodedAccessTokenPayload } from "../types/auth.types.js"; // Ensure this includes all expected token fields
import { createHttpError } from "../utils/error.factory.js";
import { asyncHandler } from "./asyncHandler.js";
import { HttpError } from "../utils/HttpError.js";
import { UserRole } from "prisma/generated/prisma";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const verifyToken = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const serverCurrentTimeSeconds = Math.floor(Date.now() / 1000);
    console.log(
      `\n--- [Backend Auth Middleware] verifyToken triggered for path: ${
        req.path
      } at ${new Date().toISOString()} (Server time: ${serverCurrentTimeSeconds}s) ---`
    );

    if (!ACCESS_TOKEN_SECRET) {
      console.error(
        "[Backend Auth Middleware] CRITICAL: ACCESS_TOKEN_SECRET is not defined."
      );
      return next(
        createHttpError(500, "Internal Server Error: Auth configuration issue.")
      );
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[Backend Auth Middleware] No Bearer token provided.");
      return next(
        createHttpError(401, "Unauthorized: No Bearer token provided.")
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn(
        "[Backend Auth Middleware] Token not found after 'Bearer '."
      );
      return next(createHttpError(401, "Unauthorized: Token not found."));
    }

    console.log(
      `[Backend Auth Middleware] Incoming token (first 15 chars): ${token.substring(
        0,
        15
      )}...`
    );

    try {
      const preVerifyDecoded = jwt.decode(
        token
      ) as DecodedAccessTokenPayload | null; // Cast for logging
      if (preVerifyDecoded && typeof preVerifyDecoded === "object") {
        console.log(
          `[Backend Auth Middleware] Token claims BEFORE verification - UserID: ${
            preVerifyDecoded.id
          }, Username: ${preVerifyDecoded.username}, DisplayName: ${
            preVerifyDecoded.displayName
          }, Role: ${preVerifyDecoded.systemRole}, Type: ${
            preVerifyDecoded.type
          }, ProfileImg: ${!!preVerifyDecoded.profileImage}, IAT: ${
            preVerifyDecoded.iat
          }, EXP: ${preVerifyDecoded.exp}`
        );
        if (preVerifyDecoded.exp) {
          console.log(
            `[Backend Auth Middleware] Token EXP (${
              preVerifyDecoded.exp
            }) vs Server Time (${serverCurrentTimeSeconds}). Diff: ${
              preVerifyDecoded.exp - serverCurrentTimeSeconds
            }s`
          );
        }
      }

      console.log("[Backend Auth Middleware] Attempting jwt.verify()...");
      const decoded = jwt.verify(
        token,
        ACCESS_TOKEN_SECRET
      ) as DecodedAccessTokenPayload;

      console.log(
        "[Backend Auth Middleware] Token verification successful. Decoded UserID:",
        decoded.id,
        "Type:",
        decoded.type
      );

      // Validate essential claims from the decoded payload
      if (
        !decoded.id ||
        !decoded.systemRole ||
        !decoded.username || // Username is now expected from the token
        decoded.type !== "access"
      ) {
        console.warn(
          "[Backend Auth Middleware] Invalid access token payload structure after verification:",
          decoded
        );
        return next(
          createHttpError(401, "Unauthorized: Invalid access token payload.")
        );
      }

      // Fetch user from DB to validate existence and get fresh critical data
      const userFromDb = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          // Select all fields defined in your express.d.ts for req.user
          id: true,
          username: true,
          displayName: true,
          profileImage: true, // This will have the Prisma default if null
          systemRole: true,
          userRole: true, // <-- 1. ADD THIS LINE to the select query
        },
      });

      if (!userFromDb) {
        console.warn(
          `[Backend Auth Middleware] User not found in DB for ID from token: ${decoded.id}`
        );
        return next(createHttpError(401, "Unauthorized: User not found."));
      }
      console.log(
        `[Backend Auth Middleware] User ${userFromDb.id} found in DB. DB Role: ${userFromDb.systemRole}, Token Role: ${decoded.systemRole}`
      );

      // Verify token role against DB role for consistency/security
      if (userFromDb.systemRole !== decoded.systemRole) {
        console.warn(
          `[Auth Middleware] User ${decoded.id} role mismatch. Token: ${decoded.systemRole}, DB: ${userFromDb.systemRole}. Using DB role as authoritative.`
        );
        // Potentially invalidate token or log suspicious activity if roles should never mismatch
      }

      req.user = {
        id: userFromDb.id,
        systemRole: userFromDb.systemRole, // Authoritative from DB
        username: userFromDb.username, // Authoritative from DB
        displayName: userFromDb.displayName, // Authoritative from DB (can be null)
        profileImage: userFromDb.profileImage, // Authoritative from DB (will be string due to default)
        userRole: userFromDb.userRole, // <-- 2. ADD THIS LINE to the user object
      };

      console.log(
        "[Backend Auth Middleware] User attached to request:",
        req.user
      );
      next();
    } catch (err) {
      console.error(
        "[Backend Auth Middleware] TOKEN VERIFICATION FAILED (in catch block)."
      );
      if (err instanceof jwt.TokenExpiredError) {
        const expiredAtSeconds = Math.floor(
          new Date(err.expiredAt).getTime() / 1000
        );
        console.error(
          `[Backend Auth Middleware] Reason: TokenExpiredError. Expired at: ${err.expiredAt.toISOString()}. Token EXP was: ${expiredAtSeconds}, Current Server Time is: ${serverCurrentTimeSeconds}, Difference: ${
            expiredAtSeconds - serverCurrentTimeSeconds
          }s`
        );
        return next(createHttpError(401, "Unauthorized: Token expired."));
      }
      if (err instanceof jwt.JsonWebTokenError) {
        console.error(
          "[Backend Auth Middleware] Reason: JsonWebTokenError.",
          err.message
        );
        return next(createHttpError(401, "Unauthorized: Invalid token."));
      }
      if (err instanceof HttpError) {
        console.error(
          "[Backend Auth Middleware] HttpError during verification:",
          err.message,
          "Status:",
          err.statusCode
        );
        return next(err);
      }
      console.error(
        "[Backend Auth Middleware] Unexpected Verification Error:",
        err
      );
      return next(
        createHttpError(500, "Internal Server Error during token verification.")
      );
    }
  }
);

export const verifyAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // verifyToken has already attached the user object
  const user = req.user;
  console.log("BACKEND - Checking Admin Role For:", user);

  if (!user || user.userRole !== UserRole.ADMIN) {
    return next(
      createHttpError(403, "Forbidden: Administrator access required.")
    );
  }

  // If the user is an admin, proceed to the next handler
  next();
};
