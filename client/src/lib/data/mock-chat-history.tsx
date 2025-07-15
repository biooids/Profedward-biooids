// lib/data/mock-chat-history.ts
import { Message } from "@/app/ai-assistant/page"; // We'll re-export Message from the page for now

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

export const mockChatHistory: Conversation[] = [
  {
    id: "chat-001",
    title: "Quantum Entanglement Explained",
    createdAt: new Date("2025-06-10T10:00:00Z"),
    messages: [
      {
        id: "1a",
        role: "user",
        content: "Explain the concept of quantum entanglement in simple terms.",
      },
      {
        id: "1b",
        role: "assistant",
        content:
          "Of course! Imagine you have two coins that are magically linked. If you flip one and it lands on heads, you instantly know the other one is tails, no matter how far apart they are. Quantum entanglement is like that, but for subatomic particles.",
      },
    ],
  },
  {
    id: "chat-002",
    title: "WWII Study Guide",
    createdAt: new Date("2025-06-09T14:30:00Z"),
    messages: [
      {
        id: "2a",
        role: "user",
        content: "Create a study guide for the key events of World War II.",
      },
      {
        id: "2b",
        role: "assistant",
        content:
          "Great idea. Here are the key turning points to focus on: 1. Invasion of Poland (1939), 2. Battle of Britain (1940), 3. Attack on Pearl Harbor (1941), 4. Battle of Stalingrad (1942-43), 5. D-Day (1944), and 6. The atomic bombings (1945).",
      },
    ],
  },
];
