// src/features/ai/chains/quiz.chain.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { QuizQuestion } from "../ai.types";
import { config } from "../../../config"; // <-- 1. IMPORT THE CENTRAL CONFIG

const model = new ChatGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
  model: "gemini-1.5-flash-latest",
  temperature: 0.5,
});

// The prompt template now includes specific instructions for the AI
// to format its response as JSON. This is crucial for reliable parsing.
const prompt = PromptTemplate.fromTemplate(
  `Based on the following text, create exactly 3 multiple-choice quiz questions designed to test understanding.

  IMPORTANT: Respond with ONLY a valid JSON array of objects. Do not include any introductory text, backticks, or explanations. Each object in the array must have the following keys: "question" (string), "options" (an array of 4 strings), and "answer" (a string that exactly matches one of the options).

  ---START OF TEXT---
  {inputText}
  ---END OF TEXT---
  `
);

// We use a JsonOutputParser to automatically convert the AI's string response into a JavaScript object.
export const quizChain = prompt
  .pipe(model)
  .pipe(new JsonOutputParser<QuizQuestion[]>());
