// src/features/tts/tts.controller.ts

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { createHttpError } from "../../utils/error.factory";
import { googleTtsService } from "./google.tts.service"; // <-- IMPORT THE NEW SERVICE
import { GenerateSpeechDto } from "./tts.types";
import prisma from "../../db/prisma"; // Corrected path assumption

class TtsController {
  generateSpeech = asyncHandler(async (req: Request, res: Response) => {
    const { text, voiceId } = req.body as GenerateSpeechDto;
    const userId = req.user!.id;

    if (!text) {
      throw createHttpError(400, "The 'text' field is required.");
    }

    // NOTE: Update your frontend to send valid Google Voice IDs!
    // e.g., "en-US-Wavenet-D", "en-GB-News-G", etc.
    const selectedVoiceId = voiceId || "en-US-Wavenet-D";

    const audioStream = await googleTtsService.generateSpeechStream(
      // <-- USE THE NEW SERVICE
      text,
      selectedVoiceId,
      userId
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");

    audioStream.pipe(res);
  });

  getUserQuota = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ttsCharacterUsage: true, // <-- Use new field name
        ttsCharacterQuota: true, // <-- Use new field name
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  });
}

export const ttsController = new TtsController();
