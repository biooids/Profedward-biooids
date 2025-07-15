interface ModelConfig {
  id: string;
  // Tokens Per Minute: Find the official TPM from Google's documentation for accuracy.
  // Let's use a hypothetical 1,000,000 TPM for Gemini 1.5 Flash as an example.
  tpm: number;
}

export const modelConfig: Record<string, ModelConfig> = {
  "gemini-1.5-flash-latest": {
    id: "gemini-1.5-flash-latest",
    tpm: 1000000,
  },
  "gemini-pro": {
    id: "gemini-pro",
    tpm: 32000, // Example value
  },
  // Add other models here as you use them
};
