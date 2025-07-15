import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  AiProcessRequestDto,
  AiProcessResponseDto,
  ChatMessage,
  ConversationHistoryItem,
  GetHistoryApiResponse,
} from "./aiTypes";

export const aiApiSlice = createApi({
  reducerPath: "aiApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ConversationHistory", "ConversationMessages"],
  endpoints: (builder) => ({
    /**
     * The main mutation for all AI processing requests.
     */
    processAiAction: builder.mutation<
      AiProcessResponseDto,
      AiProcessRequestDto
    >({
      query: (body) => ({
        url: "/ai/process",
        method: "POST",
        body,
      }),
      // When a conversation is processed, invalidate tags to trigger refetches.
      invalidatesTags: (result) =>
        result
          ? [
              { type: "ConversationHistory", id: "LIST" },
              { type: "ConversationMessages", id: result.conversationId },
            ]
          : [],
    }),

    /**
     * A query to fetch the list of all past conversations for a document.
     */
    getHistoryForDocument: builder.query<ConversationHistoryItem[], string>({
      query: (documentId) => `/ai/history/${documentId}`,
      transformResponse: (response: GetHistoryApiResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ConversationHistory" as const,
                id,
              })),
              { type: "ConversationHistory", id: "LIST" },
            ]
          : [{ type: "ConversationHistory", id: "LIST" }],
    }),

    /**
     * A query to fetch all messages for a specific conversation.
     */
    getConversationMessages: builder.query<ChatMessage[], string>({
      query: (conversationId) => `/ai/conversation/${conversationId}`,
      transformResponse: (response: { data: ChatMessage[] }) => response.data,
      providesTags: (_result, _error, conversationId) => [
        { type: "ConversationMessages", id: conversationId },
      ],
    }),

    /**
     * A mutation to delete a specific conversation thread.
     */
    deleteConversation: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/ai/conversation/${conversationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ConversationHistory", id: "LIST" }],
    }),
  }),
});

// Export the auto-generated hooks for use in our components.
export const {
  useProcessAiActionMutation,
  useGetHistoryForDocumentQuery,
  useDeleteConversationMutation,
  useGetConversationMessagesQuery,
} = aiApiSlice;
