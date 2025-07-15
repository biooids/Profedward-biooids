// src/lib/tts/voices.ts

import { Voice } from "./ttsTypes"; // Assuming ttsTypes.ts is in the same directory

// A curated list of high-quality Google Cloud TTS voices.
// The 'id' is the official voice name required by the API.
export const AVAILABLE_VOICES: Voice[] = [
  { id: "en-US-Wavenet-D", name: "David (US)", gender: "male" },
  { id: "en-US-Wavenet-F", name: "Abigail (US)", gender: "female" },
  { id: "en-US-News-M", name: "Noah (US News)", gender: "male" },
  { id: "en-US-News-K", name: "Katherine (US News)", gender: "female" },
  { id: "en-GB-Wavenet-B", name: "Charles (UK)", gender: "male" },
  { id: "en-GB-Wavenet-C", name: "Charlotte (UK)", gender: "female" },
  { id: "en-GB-News-G", name: "George (UK News)", gender: "male" },
];
