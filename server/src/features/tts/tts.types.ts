// src/features/tts/tts.types.ts

/**
 * Data Transfer Object (DTO) for the POST /tts/generate request body.
 */
export interface GenerateSpeechDto {
  text: string;
  voiceId?: string; // Optional, as the controller provides a default Google Voice ID.
}
