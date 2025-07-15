// src/lib/tts/ttsApiSlice.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";

// Interface for the data returned by the new quota endpoint
interface UserQuota {
  ttsCharacterUsage: number; // <-- RENAMED from elevenLabsCharacterUsage
  ttsCharacterQuota: number; // <-- RENAMED from elevenLabsCharacterQuota
}

// Interface for the request to generate speech
interface GenerateSpeechRequest {
  text: string;
  voiceId: string;
}

export const ttsApiSlice = createApi({
  reducerPath: "ttsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserQuota"],
  endpoints: (builder) => ({
    /**
     * A mutation to generate audio from Google Cloud TTS.
     * After success, it invalidates the 'UserQuota' tag to trigger a refetch.
     */
    generateSpeech: builder.mutation<Blob, GenerateSpeechRequest>({
      query: (credentials) => ({
        url: "/tts/generate",
        method: "POST",
        body: credentials,
        responseHandler: async (response) => {
          if (response.ok) {
            return response.blob();
          }
          return response.json();
        },
      }),
      invalidatesTags: ["UserQuota"],
    }),

    /**
     * A query to get the current user's character quota usage.
     */
    getUserQuota: builder.query<UserQuota, void>({
      query: () => ({
        url: "/tts/me/quota",
        method: "GET",
      }),
      providesTags: ["UserQuota"],
    }),
  }),
});

// Export the auto-generated hooks.
export const { useGenerateSpeechMutation, useGetUserQuotaQuery } = ttsApiSlice;
