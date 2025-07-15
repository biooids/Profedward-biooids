//src/services/auth.service.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
import { User } from "../../prisma/generated/prisma";
import { createHttpError } from "../utils/error.factory.js";
import {
  generateAccessToken,
  generateAndStoreRefreshToken,
  verifyAndValidateRefreshToken,
} from "../utils/jwt.utils.js";
import {
  SignUpInputDto,
  LoginInputDto,
  RefreshTokenInputDto,
  AuthTokens,
  LogoutInputDto,
  DecodedRefreshTokenPayload,
  DevLoginInputDto,
} from "../types/auth.types.js";
import { userService } from "./user.service.js";

const sanitizeUser = (user: User): Omit<User, "passwordHash"> => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

export class AuthService {
  public async registerUser(input: SignUpInputDto): Promise<{
    user: Omit<User, "passwordHash">;
    tokens: AuthTokens;
  }> {
    const { email, username } = input;
    const existingUserByEmail = await userService.findUserByEmail(email);
    if (existingUserByEmail) {
      throw createHttpError(409, "An account with this email already exists.");
    }
    const existingUserByUsername = await userService.findUserByUsername(
      username
    );
    if (existingUserByUsername) {
      throw createHttpError(409, "This username is already taken.");
    }

    const user = await userService.createUser(input);
    const accessToken = generateAccessToken(user);
    const { token: refreshTokenString, expiresAt: refreshTokenExpiresAt } =
      await generateAndStoreRefreshToken(user.id);

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken: refreshTokenString,
        refreshTokenExpiresAt,
      },
    };
  }

  public async loginUser(input: LoginInputDto): Promise<{
    user: Omit<User, "passwordHash">;
    tokens: AuthTokens;
  }> {
    const { email, password } = input;
    const user = await userService.findUserByEmail(email);

    if (!user || !user.passwordHash) {
      throw createHttpError(401, "Invalid email or password.");
    }

    // Now it's safe to compare, because we know passwordHash is a string.
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw createHttpError(401, "Invalid email or password.");
    }

    await this.revokeAllRefreshTokensForUser(user.id);

    const accessToken = generateAccessToken(user);
    const { token: refreshTokenString, expiresAt: refreshTokenExpiresAt } =
      await generateAndStoreRefreshToken(user.id);

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken: refreshTokenString,
        refreshTokenExpiresAt,
      },
    };
  }

  public async handleRefreshTokenRotation(
    input: RefreshTokenInputDto
  ): Promise<AuthTokens> {
    const decodedOldToken = await verifyAndValidateRefreshToken(
      input.incomingRefreshToken
    );

    const user = await userService.findUserById(decodedOldToken.id);
    if (!user) {
      await prisma.refreshToken.updateMany({
        where: { jti: decodedOldToken.jti },
        data: { revoked: true },
      });
      throw createHttpError(403, "Forbidden: User account not found.");
    }

    await prisma.refreshToken.update({
      where: { jti: decodedOldToken.jti },
      data: { revoked: true },
    });

    const newAccessToken = generateAccessToken(user);
    const {
      token: newRefreshTokenString,
      expiresAt: newRefreshTokenExpiresAt,
    } = await generateAndStoreRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
      refreshTokenExpiresAt: newRefreshTokenExpiresAt,
    };
  }

  public async handleUserLogout(input: LogoutInputDto): Promise<void> {
    const { userId, incomingRefreshToken } = input;
    let userIdFromVerifiedToken: string | undefined;

    if (incomingRefreshToken) {
      try {
        const decoded = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as DecodedRefreshTokenPayload;
        if (decoded?.jti && decoded.id) {
          await prisma.refreshToken.updateMany({
            where: { jti: decoded.jti, userId: decoded.id, revoked: false },
            data: { revoked: true },
          });
          userIdFromVerifiedToken = decoded.id;
        }
      } catch (e) {
        console.warn(
          "[AuthService] Logout: Could not verify incoming RT.",
          e instanceof Error ? e.message : String(e)
        );
      }
    }

    const finalUserId = userId || userIdFromVerifiedToken;
    if (finalUserId) {
      await this.revokeAllRefreshTokensForUser(finalUserId);
    }
  }

  public async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    const { count } = await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    console.log(`[AuthService] Revoked ${count} tokens for UserID: ${userId}.`);
  }

  public async findOrCreateOAuthUser(profile: {
    email: string;
    name?: string | null;
    image?: string | null;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    // <-- UPDATED return type
    let user = await userService.findUserByEmail(profile.email);

    if (user) {
      console.log(`[AuthService] Found existing user for OAuth: ${user.email}`);
      // Optionally update their name/image from the provider if it's changed
      user = await prisma.user.update({
        where: { email: profile.email },
        data: {
          displayName: user.displayName ?? profile.name ?? "New User",
          profileImage: user.profileImage ?? profile.image ?? null,
        },
      });
    } else {
      console.log(
        `[AuthService] No user found for ${profile.email}. Creating new OAuth user.`
      );
      const username =
        profile.email.split("@")[0] + `_${Math.floor(Math.random() * 9999)}`;
      user = await prisma.user.create({
        data: {
          email: profile.email,
          displayName: profile.name ?? "New User",
          username: username,
          profileImage: profile.image ?? null,
        },
      });
    }

    // --- ADDED: Generate tokens for the OAuth user ---
    console.log(`[AuthService] Generating tokens for OAuth user ${user.id}.`);
    await this.revokeAllRefreshTokensForUser(user.id); // Log out other sessions
    const accessToken = generateAccessToken(user);
    const { token: refreshTokenString, expiresAt: refreshTokenExpiresAt } =
      await generateAndStoreRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken: refreshTokenString,
        refreshTokenExpiresAt,
      },
    };
  }

  /**
   * [DEVELOPMENT ONLY] Logs in a user by their ID without a password.
   * @param input Contains the userId of the user to log in as.
   * @returns The user object and new authentication tokens.
   */
  public async handleDevLogin(input: DevLoginInputDto): Promise<{
    user: Omit<User, "passwordHash">;
    tokens: AuthTokens;
  }> {
    const { userId } = input;
    const user = await userService.findUserById(userId);

    if (!user) {
      throw createHttpError(404, "User not found for development login.");
    }

    // Log out any other sessions for this user for a clean login
    await this.revokeAllRefreshTokensForUser(user.id);

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const { token: refreshTokenString, expiresAt: refreshTokenExpiresAt } =
      await generateAndStoreRefreshToken(user.id);

    console.warn(
      `[DEV] Performed passwordless login for user: ${user.username} (${user.userRole})`
    );

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken: refreshTokenString,
        refreshTokenExpiresAt,
      },
    };
  }
}

export const authService = new AuthService();
