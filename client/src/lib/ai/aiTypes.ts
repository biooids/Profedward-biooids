// src/lib/ai/ai.types.ts

// Represents a single message in a chat history.
// The content can be a string or a more complex object (like a quiz).
export type ChatMessage = {
  role: "human" | "ai";
  content: any;
};

// Represents a single conversation in the history list.
export interface ConversationHistoryItem {
  id: string;
  name: string;
  updatedAt: string;
}

// Defines the specific actions the AI can perform.
export type AiAction = "summarize" | "explain" | "quiz" | "ask";

// Defines the shape of the request payload sent TO the backend.
export interface AiProcessRequestDto {
  documentId: string;
  action: AiAction;
  conversationId?: string;
  text_selection?: string;
  chat_query?: string;
  // --- THIS IS THE FIX ---
  // Add the chat_history property to match the API call.
  chat_history?: ChatMessage[];
}

// Defines the shape of the data returned from the main AI processing endpoint.
export interface AiProcessResponseDto<T = any> {
  status: "success";
  action: AiAction;
  conversationId: string;
  data: T;
}

// Defines the shape for the list of past conversations.
export interface GetHistoryApiResponse {
  status: "success";
  data: ConversationHistoryItem[];
}

// A specific type for the structured quiz data.
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}
