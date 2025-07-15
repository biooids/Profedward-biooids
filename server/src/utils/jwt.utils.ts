// src/utils/jwt.utils.ts
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../../prisma/generated/prisma"; // Ensure UserStatus is imported
import {
  DecodedAccessTokenPayload,
  DecodedRefreshTokenPayload,
} from "../types/auth.types.js";
import { createHttpError } from "./error.factory.js";
import { HttpError } from "./HttpError.js";
import prisma from "../db/prisma.js";

// --- Load Environment Variables & Validate (Your existing code is good) ---
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN_SECONDS_STR =
  process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS;
const REFRESH_TOKEN_EXPIRES_IN_DAYS_STR =
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS;

if (
  !ACCESS_TOKEN_SECRET ||
  !REFRESH_TOKEN_SECRET ||
  !ACCESS_TOKEN_EXPIRES_IN_SECONDS_STR ||
  !REFRESH_TOKEN_EXPIRES_IN_DAYS_STR
) {
  console.error(
    "[Backend JWT Utils] FATAL ERROR: JWT environment variables are not fully configured!"
  );
  throw new Error(
    "FATAL ERROR: JWT environment variables are not fully configured!"
  );
}

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = parseInt(
  ACCESS_TOKEN_EXPIRES_IN_SECONDS_STR,
  10
);
const REFRESH_TOKEN_EXPIRES_IN_DAYS = parseInt(
  REFRESH_TOKEN_EXPIRES_IN_DAYS_STR,
  10
);

if (
  isNaN(ACCESS_TOKEN_EXPIRES_IN_SECONDS) ||
  isNaN(REFRESH_TOKEN_EXPIRES_IN_DAYS)
) {
  console.error(
    "[Backend JWT Utils] FATAL ERROR: JWT expiration times must be valid numbers in .env!"
  );
  throw new Error(
    "FATAL ERROR: JWT expiration times must be valid numbers in .env!"
  );
}

// ==================================================
//          JWT Generation Functions
// ==================================================

/**
 * Generates an Access JWT token for a user.
 */
export const generateAccessToken = (user: User): string => {
  // Construct the payload that matches our DecodedAccessTokenPayload type
  const payload: Omit<DecodedAccessTokenPayload, "iat" | "exp"> = {
    id: user.id,
    systemRole: user.systemRole,
    userRole: user.userRole, // Access the property from the user object
    type: "access",
    username: user.username,
    displayName: user.displayName,
    profileImage: user.profileImage,
  };

  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  };

  const token = jwt.sign(payload, ACCESS_TOKEN_SECRET!, options);

  // Your logging code can remain the same. You might want to add user.userRole to it.
  console.log(
    `[Backend JWT Utils] Generated Access Token for UserID: ${user.id}`
  );

  return token;
};

/**
 * Generates a Refresh JWT token, stores its JTI in the DB, and returns the token.
 */
export const generateAndStoreRefreshToken = async (
  userId: string
): Promise<{ token: string; jti: string; expiresAt: Date }> => {
  const jti = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

  const payloadForSign = {
    id: userId,
    type: "refresh" as const,
  };

  console.log(
    `[Backend JWT Utils] Generating Refresh Token for UserID: ${userId}, JTI: ${jti}. DB Expiry: ${expiresAt.toISOString()}`
  );

  try {
    await prisma.refreshToken.create({
      data: {
        jti: jti,
        userId,
        expiresAt,
      },
    });
    console.log(`[Backend JWT Utils] Refresh token JTI ${jti} stored in DB.`);
  } catch (dbError) {
    console.error(
      "[Backend JWT Utils] Failed to store refresh token in DB:",
      dbError
    );
    throw createHttpError(500, "Could not save session information.");
  }

  const token = jwt.sign(payloadForSign, REFRESH_TOKEN_SECRET!, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN_DAYS}d`,
    jwtid: jti,
  });

  // Log refresh token details (your existing logging code is good)
  try {
    const decodedForLog = jwt.decode(
      token
    ) as DecodedRefreshTokenPayload | null;
    if (decodedForLog && typeof decodedForLog === "object") {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const iatDate = decodedForLog.iat
        ? new Date(decodedForLog.iat * 1000).toISOString()
        : "N/A";
      const expDate = decodedForLog.exp
        ? new Date(decodedForLog.exp * 1000).toISOString()
        : "N/A";
      const expiresInSeconds = decodedForLog.exp
        ? decodedForLog.exp - nowInSeconds
        : "N/A";

      console.log(
        `[Backend JWT Utils] Generated Refresh Token Details: UserID: ${userId}, ` +
          `JTI: ${decodedForLog.jti}, ` +
          `IAT_timestamp: ${decodedForLog.iat} (${iatDate}), ` +
          `EXP_timestamp: ${decodedForLog.exp} (${expDate}), ` +
          `Type: ${decodedForLog.type}, ` +
          `Current Server Time (s): ${nowInSeconds}, ` +
          `Expires in (approx): ${expiresInSeconds}s`
      );
    }
  } catch (e) {
    console.error(
      "[Backend JWT Utils] Error decoding generated refresh token for logging:",
      e
    );
  }

  return { token, jti, expiresAt };
};

// ==================================================
// JWT Verification Functions
// ==================================================
export const verifyAndValidateRefreshToken = async (
  token: string
): Promise<DecodedRefreshTokenPayload> => {
  // ... (Your existing implementation of this function is good and remains unchanged) ...
  console.log(
    `[Backend JWT Utils] Verifying and validating refresh token (first 15 chars): ${token.substring(
      0,
      15
    )}...`
  );
  try {
    const decoded = jwt.verify(
      token,
      REFRESH_TOKEN_SECRET!
    ) as DecodedRefreshTokenPayload;

    console.log(
      "[Backend JWT Utils] Refresh token JWT signature and expiry OK. Decoded claims:",
      {
        id: decoded.id,
        type: decoded.type,
        jti: decoded.jti,
        iat: decoded.iat,
        exp: decoded.exp,
      }
    );

    if (!decoded.jti || !decoded.id || decoded.type !== "refresh") {
      console.warn(
        "[Backend JWT Utils] Invalid refresh token payload structure after verification:",
        decoded
      );
      throw createHttpError(401, "Invalid refresh token payload structure.");
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { jti: decoded.jti },
    });

    if (!storedToken) {
      console.warn(
        `[Backend JWT Utils] Refresh token JTI ${decoded.jti} not found in DB store.`
      );
      throw createHttpError(
        403,
        "Refresh token not found in store (possibly revoked or never existed)."
      );
    }
    if (storedToken.revoked) {
      console.warn(
        `[Backend JWT Utils] Refresh token JTI ${decoded.jti} is REVOKED in DB.`
      );
      throw createHttpError(403, "Refresh token has been revoked.");
    }
    if (new Date() > storedToken.expiresAt) {
      console.warn(
        `[Backend JWT Utils] Refresh token JTI ${
          decoded.jti
        } has expired as per DB record (DB expiry: ${storedToken.expiresAt.toISOString()}, Now: ${new Date().toISOString()}).`
      );
      throw createHttpError(
        403,
        "Refresh token has expired (as per database record)."
      );
    }
    if (storedToken.userId !== decoded.id) {
      console.error(
        `[Backend JWT Utils] CRITICAL: Refresh token JTI ${decoded.jti} has mismatched userId. DB: ${storedToken.userId}, Token: ${decoded.id}. Potential tampering or severe bug!`
      );
      await prisma.refreshToken.update({
        where: { jti: decoded.jti },
        data: { revoked: true },
      });
      throw createHttpError(
        403,
        "Refresh token user mismatch; token invalidated."
      );
    }

    console.log(
      `[Backend JWT Utils] Refresh token JTI ${decoded.jti} is valid and found in DB.`
    );
    return decoded;
  } catch (error: unknown) {
    console.error(
      "[Backend JWT Utils] Error during verifyAndValidateRefreshToken:"
    );
    if (error instanceof jwt.TokenExpiredError) {
      console.error(
        `[Backend JWT Utils] Reason: Refresh TokenExpiredError. Expired at: ${
          error.expiredAt instanceof Date
            ? error.expiredAt.toISOString()
            : error.expiredAt // Handle if expiredAt is not Date
        } (Server time: ${new Date().toISOString()})`
      );
      throw createHttpError(403, "Refresh token expired (JWT verification).");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.error(
        "[Backend JWT Utils] Reason: Refresh JsonWebTokenError.",
        error.message
      );
      throw createHttpError(403, `Invalid refresh token: ${error.message}`);
    }

    if (error instanceof HttpError) {
      console.error(
        "[Backend JWT Utils] Re-throwing HttpError:",
        error.message
      );
      throw error;
    }

    console.error(
      "[Backend JWT Utils] Unexpected error during refresh token verification:",
      error
    );
    throw createHttpError(
      500,
      "Could not verify refresh token due to a server issue."
    );
  }
};
