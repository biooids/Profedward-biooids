// src/features/tts/google.tts.service.ts

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { Readable } from "stream";
import { createHttpError } from "../../utils/error.factory";
import prisma from "../../db/prisma";

const GOOGLE_PER_REQUEST_LIMIT = 5000;

class GoogleTtsService {
  private googleTtsClient: TextToSpeechClient;

  constructor() {
    this.googleTtsClient = new TextToSpeechClient();
  }

  public async generateSpeechStream(
    text: string,
    voiceId: string, // e.g., "en-US-Wavenet-D"
    userId: string
  ): Promise<Readable> {
    if (text.length > GOOGLE_PER_REQUEST_LIMIT) {
      throw createHttpError(
        413,
        `Text is too long (${text.length} characters). The limit per request is ${GOOGLE_PER_REQUEST_LIMIT}.`
      );
    }

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createHttpError(404, "User not found.");
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (user.ttsQuotaResetDate < oneMonthAgo) {
      user = await prisma.user.update({
        where: { id: userId },
        data: { ttsCharacterUsage: 0, ttsQuotaResetDate: new Date() },
      });
    }

    if (user.ttsCharacterUsage + text.length > user.ttsCharacterQuota) {
      const remaining = user.ttsCharacterQuota - user.ttsCharacterUsage;
      throw createHttpError(
        429,
        `Monthly character quota exceeded. You have ${remaining} characters remaining.`
      );
    }

    try {
      const [response] = await this.googleTtsClient.synthesizeSpeech({
        input: { text: text },
        voice: { languageCode: voiceId.substring(0, 5), name: voiceId },
        audioConfig: { audioEncoding: "MP3" },
      });

      if (!response.audioContent) {
        throw new Error("Google API did not return audio content.");
      }

      await prisma.user.update({
        where: { id: userId },
        data: { ttsCharacterUsage: { increment: text.length } },
      });

      // Convert the audio buffer from Google into a Readable stream for Express
      const buffer = Buffer.from(response.audioContent);
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null); // Signal end of stream

      return stream;
    } catch (error: any) {
      console.error("Google Cloud TTS API Error:", error.message);
      throw createHttpError(502, `Failed to generate speech: ${error.message}`);
    }
  }
}

export const googleTtsService = new GoogleTtsService();
