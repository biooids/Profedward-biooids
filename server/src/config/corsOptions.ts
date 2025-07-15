// src/config/corsOptions.ts
import { CorsOptions } from "cors";
import { createHttpError } from "../utils/error.factory"; // Assuming HttpError can be created this way

const corsOriginEnv = process.env.CORS_ORIGIN;
const defaultDevOrigin = "http://localhost:3000"; // Default for local development

let allowedOrigins: string[];

if (corsOriginEnv) {
  allowedOrigins = corsOriginEnv.split(",").map((origin) => origin.trim());
} else {
  allowedOrigins = [defaultDevOrigin];
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ WARNING: CORS_ORIGIN environment variable is not set. " +
        `Defaulting to '${defaultDevOrigin}', which is likely not suitable for production.`
    );
  }
}

// Log allowed origins for debugging during server startup
console.log("✅ Configured Allowed CORS origins:", allowedOrigins);

export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl, server-to-server)
    // You can choose to block these if your security policy requires it by:
    // if (!origin && process.env.NODE_ENV === 'production') {
    //   return callback(createHttpError(403, "Requests with no origin are not allowed in production."));
    // }
    if (!origin) {
      return callback(null, true);
    }

    // Check if the incoming origin is in our list of allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(
        `🚫 CORS: Origin '${origin}' was blocked. Allowed: ${allowedOrigins.join(
          ", "
        )}`
      );
      // Note: The error passed to the callback here will be passed to next() by the cors middleware
      callback(
        createHttpError(403, `Origin '${origin}' not allowed by CORS policy.`)
      );
    }
  },
  credentials: true, // Necessary for sending cookies or authorization headers.
};
