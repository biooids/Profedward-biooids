import prisma from "../../db/prisma";
import { Prisma } from "../../../prisma/generated/prisma";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { createHttpError } from "../../utils/error.factory";
import { summarizationChain } from "./chains/summarization.chain";
import { quizChain } from "./chains/quiz.chain";
import { AiProcessRequestDto, ChatMessage } from "./ai.types";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { formatDocumentsAsString } from "langchain/util/document";
import { config } from "../../config";

class AiService {
  private embeddings: GoogleGenerativeAIEmbeddings;
  private model: ChatGoogleGenerativeAI;
  private vectorStore;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: config.geminiApiKey,
      modelName: "text-embedding-004",
    });

    this.model = new ChatGoogleGenerativeAI({
      apiKey: config.geminiApiKey,
      model: "gemini-1.5-flash-latest",
      temperature: 0.2,
    });

    this.vectorStore = new PrismaVectorStore(this.embeddings, {
      db: prisma,
      prisma: Prisma,
      tableName: "DocumentChunk",
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    });
  }

  public async processRequest(dto: AiProcessRequestDto, userId: string) {
    const { action, text_selection, chat_query, documentId } = dto;
    let { conversationId } = dto;

    const question =
      action === "explain" && text_selection
        ? `Explain the concept of "${text_selection}" in simple terms.`
        : chat_query || text_selection;

    if (!question) {
      throw createHttpError(400, "A question or text to process is required.");
    }

    let chatHistory: ChatMessage[] = [];

    if (conversationId) {
      const existingConversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (!existingConversation)
        throw createHttpError(404, "Conversation not found or access denied.");
      // Note: We still parse here for logic, but will re-stringify before sending to AI
      chatHistory = existingConversation.messages.map((m) => {
        try {
          return {
            role: m.role as "human" | "ai",
            content: JSON.parse(m.content),
          };
        } catch (e) {
          return { role: m.role as "human" | "ai", content: m.content };
        }
      });
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          name: question.substring(0, 50) + (question.length > 50 ? "..." : ""),
          documentId,
          userId,
        },
      });
      conversationId = newConversation.id;
    }

    let aiResponseContent: any;
    if (action === "summarize" || action === "quiz") {
      const chain = action === "quiz" ? quizChain : summarizationChain;
      aiResponseContent = await chain.invoke({ inputText: text_selection! });
    } else {
      aiResponseContent = await this.performRag(
        question,
        chatHistory,
        documentId,
        userId
      );
    }

    const stringifiedResponse =
      typeof aiResponseContent === "string"
        ? aiResponseContent
        : JSON.stringify(aiResponseContent);

    await prisma.chatMessage.createMany({
      data: [
        { role: "human", content: question, conversationId: conversationId! },
        {
          role: "ai",
          content: stringifiedResponse,
          conversationId: conversationId!,
        },
      ],
    });

    return {
      conversationId: conversationId!,
      data: aiResponseContent,
    };
  }

  private async performRag(
    question: string,
    chatHistory: ChatMessage[],
    documentId: string,
    userId: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true },
    });
    const userName = user?.displayName || user?.username || "the user";

    const retriever = this.vectorStore.asRetriever({
      filter: {
        documentId: {
          equals: documentId,
        },
      },
    });

    const conversationalPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are Gemini, a large language model from Google, acting as a helpful academic assistant. You are speaking with a user named {userName}. Answer their questions based on the provided document context. If the context does not contain the answer, state that you cannot find the information in the document.\n\nCONTEXT:\n{context}`,
      ],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);

    // --- THIS IS THE FIX ---
    // Ensure that all message content passed to the chain is a string.
    const stringifiedChatHistory = chatHistory.map((msg) => ({
      ...msg,
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

    const ragChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: (input: {
          question: string;
          userName: string;
          chat_history: ChatMessage[];
        }) => retriever.pipe(formatDocumentsAsString).invoke(input.question),
      }),
      conversationalPrompt,
      this.model,
      new StringOutputParser(),
    ]);

    return ragChain.invoke({
      question: question,
      userName: userName,
      chat_history: stringifiedChatHistory, // Use the stringified history
    });
  }

  public async getHistoryForDocument(userId: string, documentId: string) {
    return prisma.conversation.findMany({
      where: { userId, documentId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, updatedAt: true },
    });
  }

  public async getConversationMessages(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      throw createHttpError(404, "Conversation not found or access denied.");
    }

    return conversation.messages.map((message) => {
      try {
        return { ...message, content: JSON.parse(message.content) };
      } catch (e) {
        return message;
      }
    });
  }

  public async deleteConversation(userId: string, conversationId: string) {
    await prisma.conversation.delete({
      where: { id: conversationId, userId },
    });
    return;
  }
}

export const aiService = new AiService();
