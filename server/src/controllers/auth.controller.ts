// src/features/auth/auth.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { createHttpError } from "../utils/error.factory.js";
import { authService } from "../services/auth.service.js";
import {
  SignUpInputDto,
  LoginInputDto,
  DevLoginInputDto,
} from "../types/auth.types.js";

class AuthController {
  signup = asyncHandler(async (req: Request, res: Response) => {
    // Basic validation can stay here, but for complex apps, a validation library (like Zod) is better.
    const { email, username, password, displayName } = req.body;
    if (!email || !password || !username || !displayName) {
      throw createHttpError(400, "All fields are required for signup.");
    }

    const input: SignUpInputDto = { email, username, password, displayName };
    const { user, tokens } = await authService.registerUser(input);

    res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: { user, tokens },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createHttpError(400, "Email and password are required.");
    }

    const input: LoginInputDto = { email, password };
    const { user, tokens } = await authService.loginUser(input);

    // It's common practice to send tokens in the response body for SPAs.
    // Cookies are another option for web clients.
    res.status(200).json({
      status: "success",
      message: "Logged in successfully.",
      data: { user, tokens },
    });
  });

  refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createHttpError(401, "Refresh token is required.");
    }

    const tokens = await authService.handleRefreshTokenRotation({
      incomingRefreshToken: refreshToken,
    });

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully.",
      data: { tokens },
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    // The user ID from the authenticated request
    const userId = req.user?.id;

    // We pass both to the service. The service can decide what to do.
    await authService.handleUserLogout({
      userId,
      incomingRefreshToken: refreshToken,
    });

    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully." });
  });

  handleOAuth = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, image } = req.body;
    if (!email) {
      throw createHttpError(400, "Email from provider is required.");
    }

    // The service now returns both user and tokens
    const { user, tokens } = await authService.findOrCreateOAuthUser({
      email,
      name,
      image,
    });

    // Return the same data structure as the login/register endpoints
    res.status(200).json({ status: "success", data: { user, tokens } });
  });

  /**
   * [DEVELOPMENT ONLY] Handles the request for a passwordless login.
   */
  devLogin = asyncHandler(async (req: Request, res: Response) => {
    // This check is an extra layer of security
    if (process.env.NODE_ENV !== "development") {
      throw createHttpError(404, "Not Found");
    }

    const { userId } = req.body as DevLoginInputDto;
    if (!userId) {
      throw createHttpError(400, "userId is required for dev login.");
    }

    const { user, tokens } = await authService.handleDevLogin({ userId });

    res.status(200).json({
      status: "success",
      message: "Development login successful.",
      data: { user, tokens },
    });
  });
}

export const authController = new AuthController();
