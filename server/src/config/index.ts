// src/config/index.ts

/**
 * Helper to get and validate environment variables.
 * Throws an error and exits if a required variable is missing.
 */
const getEnvVariable = (key: string, required: boolean = true): string => {
  const value = process.env[key];
  if (!value && required) {
    console.error(
      `❌ Fatal Error: Missing required environment variable ${key}. Check your .env file or platform settings.`
    );
    process.exit(1); // Exit immediately on critical config error
  }
  return value || ""; // Return empty string if not required and not found
};

/**
 * Helper to get and validate environment variables as integers.
 */
const getEnvVariableAsInt = (
  key: string,
  required: boolean = true,
  defaultValue?: number
): number => {
  const valueStr = process.env[key];

  if (!valueStr) {
    if (required && defaultValue === undefined) {
      console.error(
        `❌ Fatal Error: Missing required environment variable ${key}.`
      );
      process.exit(1);
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return NaN; // Should be handled by isNaN check below if required
  }

  const intValue = parseInt(valueStr, 10);

  if (isNaN(intValue)) {
    console.error(
      `❌ Fatal Error: Invalid integer format for environment variable ${key}. Value: "${valueStr}"`
    );
    process.exit(1);
  }
  return intValue;
};

// Define the structure of your configuration
interface Config {
  nodeEnv: "development" | "production" | "test";
  port: number;
  databaseUrl: string;
  corsOrigin: string;
  jwt: {
    accessSecret: string;
    accessExpiresInSeconds: number;
    refreshSecret: string;
    refreshExpiresInDays: number;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  cookies: {
    refreshTokenName: string;
  };
  geminiApiKey: string;
}

// Build the config object
export const config: Config = {
  nodeEnv: getEnvVariable("NODE_ENV", true) as
    | "development"
    | "production"
    | "test",
  port: getEnvVariableAsInt("PORT", true),
  databaseUrl: getEnvVariable("DATABASE_URL", true),
  corsOrigin: getEnvVariable("CORS_ORIGIN", true),

  jwt: {
    accessSecret: getEnvVariable("ACCESS_TOKEN_SECRET", true),
    accessExpiresInSeconds: getEnvVariableAsInt(
      "ACCESS_TOKEN_EXPIRES_IN_SECONDS",
      true
    ),
    refreshSecret: getEnvVariable("REFRESH_TOKEN_SECRET", true),
    refreshExpiresInDays: getEnvVariableAsInt(
      "REFRESH_TOKEN_EXPIRES_IN_DAYS",
      true
    ),
  },

  cloudinary: {
    cloudName: getEnvVariable("CLOUDINARY_CLOUD_NAME", true),
    apiKey: getEnvVariable("CLOUDINARY_API_KEY", true),
    apiSecret: getEnvVariable("CLOUDINARY_API_SECRET", true),
  },

  cookies: {
    refreshTokenName: "jid", // Often good to keep constants like this here too
  },
  geminiApiKey: getEnvVariable("GEMINI_API_KEY", true),
};

console.log(`✅ Configuration loaded for [${config.nodeEnv}] environment.`);
