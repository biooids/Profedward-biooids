// src/features/ai/chains/summarization.chain.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { config } from "../../../config"; // <-- 1. IMPORT THE CENTRAL CONFIG

// Initialize the Gemini model with your API key from .env
const model = new ChatGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
  model: "gemini-1.5-flash-latest",
  temperature: 0.3, // Lower temperature for more factual summaries
});

// Create a prompt template that expects an 'inputText' variable.
const prompt = PromptTemplate.fromTemplate(
  "Summarize the following text in a clear, concise, and easy-to-understand paragraph: \n\n---START OF TEXT---\n{inputText}\n---END OF TEXT---"
);

// Create the chain by piping the components together.
// 1. The prompt formats the input.
// 2. The model generates the completion.
// 3. The parser extracts just the string result.
export const summarizationChain = prompt
  .pipe(model)
  .pipe(new StringOutputParser());
