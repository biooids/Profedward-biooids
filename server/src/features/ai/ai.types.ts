// src/features/ai/ai.types.ts

// Defines a single message in a conversation.
export type ChatMessage = {
  role: "human" | "ai";
  content: string;
};

// Defines the specific actions the AI can perform.
export type AiAction = "summarize" | "explain" | "quiz" | "ask";

// The request DTO now includes an optional conversationId.
// The frontend will send this ID to continue a conversation.
export interface AiProcessRequestDto {
  documentId: string;
  action: AiAction;
  conversationId?: string; // Optional: for continuing existing chats
  text_selection?: string;
  chat_query?: string;
}

// Defines a generic shape for the AI's response.
export interface AiProcessResponseDto<T = any> {
  status: "success";
  action: AiAction;
  conversationId: string; // Always return the ID of the conversation
  data: T;
}

// Specific type for the structured data returned by the "quiz" action.
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}
