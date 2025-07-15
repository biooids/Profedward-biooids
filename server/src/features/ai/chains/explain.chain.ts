// src/features/ai/chains/explanation.chain.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { config } from "@/config";

// Initialize the Gemini model.
// We use a slightly higher temperature than for summarization to allow for more creative
// and helpful analogies, while still remaining factual.
const model = new ChatGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
  model: "gemini-1.5-flash-latest",
  temperature: 0.4,
});

// This prompt template instructs the AI to act as an expert teacher.
// It takes two variables: the 'context' (relevant chunks from the document)
// and the 'concept' (the user's highlighted text).
const prompt = PromptTemplate.fromTemplate(
  `You are an expert teacher and academic assistant. Your goal is to explain a specific concept to a student in simple and clear terms. Use an analogy if it helps with the explanation.

Base your explanation on the provided document context to ensure it is relevant and accurate.

---
DOCUMENT CONTEXT:
{context}
---
CONCEPT TO EXPLAIN:
{concept}
---

Please provide your helpful explanation now:`
);

// The chain pipes the prompt, model, and parser together.
// The final output will be a single, clean string containing the explanation.
export const explanationChain = prompt
  .pipe(model)
  .pipe(new StringOutputParser());
