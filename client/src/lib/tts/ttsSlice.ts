// src/lib/tts/ttsSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// A helper type for the state shape
interface TtsState {
  isOpen: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isError: boolean;
  textToPlay: string;
  audioUrl: string | null;
  duration: number;
  currentTime: number;
  selectedVoiceId: string;
}

// --- UPDATED FOR GOOGLE TTS ---
// Changed the default voice to a standard, high-quality Google Wavenet voice.
const DEFAULT_VOICE_ID = "en-US-Wavenet-D"; // Was an ElevenLabs ID

const initialState: TtsState = {
  isOpen: false,
  isLoading: false,
  isPlaying: false,
  isError: false,
  textToPlay: "",
  audioUrl: null,
  duration: 0,
  currentTime: 0,
  selectedVoiceId: DEFAULT_VOICE_ID,
};

const ttsSlice = createSlice({
  name: "tts",
  initialState,
  reducers: {
    // No changes needed to the reducer logic itself. It is already perfect.
    openPlayer: (state, action: PayloadAction<string>) => {
      if (state.textToPlay !== action.payload || !state.isOpen) {
        state.isOpen = true;
        state.textToPlay = action.payload;
        state.audioUrl = null;
        state.isPlaying = false;
        state.currentTime = 0;
        state.duration = 0;
        state.isLoading = true;
        state.isError = false;
      } else {
        state.isOpen = true;
        if (state.audioUrl) {
          state.isPlaying = true;
        }
      }
    },
    closePlayer: (state) => {
      state.isOpen = false;
      state.isPlaying = false;
      state.textToPlay = "";
      state.audioUrl = null;
      state.currentTime = 0;
      state.duration = 0;
      state.isLoading = false;
      state.isError = false;
    },
    setAudioStream: (state, action: PayloadAction<string>) => {
      state.audioUrl = action.payload;
      state.isLoading = false;
      state.isPlaying = true;
    },
    play: (state) => {
      if (state.audioUrl) {
        state.isPlaying = true;
      }
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    updateTime: (
      state,
      action: PayloadAction<{ currentTime: number; duration: number }>
    ) => {
      state.currentTime = action.payload.currentTime;
      if (!isNaN(action.payload.duration)) {
        state.duration = action.payload.duration;
      }
    },
    audioEnded: (state) => {
      state.isPlaying = false;
    },
    handleError: (state) => {
      state.isLoading = false;
      state.isError = true;
      state.audioUrl = null;
      state.textToPlay = "";
    },
    changeVoice: (state, action: PayloadAction<string>) => {
      if (state.selectedVoiceId !== action.payload) {
        state.selectedVoiceId = action.payload;
        state.audioUrl = null;
        state.isPlaying = false;
        state.currentTime = 0;
        state.duration = 0;
        state.isLoading = true;
        state.isError = false;
      }
    },
  },
});

export const {
  openPlayer,
  closePlayer,
  setAudioStream,
  play,
  pause,
  updateTime,
  audioEnded,
  handleError,
  changeVoice,
} = ttsSlice.actions;

export default ttsSlice.reducer;
