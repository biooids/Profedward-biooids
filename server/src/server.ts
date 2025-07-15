// src/server.ts
import http from "http";
import app from "./app.js";
import { config } from "./config/index.js";
import { disconnectPrisma, connectPrisma } from "./db/prisma.js";

const PORT = config.port;
const server = http.createServer(app);

// <-- ADD THIS LINE to initialize the new gateway

let isShuttingDown = false;

async function startServer() {
  try {
    await connectPrisma();
    console.log("✅ Prisma connection verified on startup.");

    server.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "❌ Failed to connect to database during startup. Server not started.",
      error
    );
    process.exit(1);
  }
}

const performGracefulShutdown = async (signalSource: string) => {
  if (isShuttingDown) {
    console.log(
      `[Shutdown] Already in progress (triggered by ${signalSource})...`
    );
    return;
  }
  isShuttingDown = true;
  console.log(`\n👋 Received ${signalSource}, shutting down gracefully...`);

  const shutdownTimeout = setTimeout(() => {
    console.error("⚠️ Graceful shutdown timed out (10s), forcing exit.");
    process.exit(1);
  }, 10000);

  try {
    console.log("🔌 Attempting to close HTTP server...");
    await new Promise<void>((resolve) => {
      server.close((err?: Error & { code?: string }) => {
        if (err) {
          if (err.code === "ERR_SERVER_NOT_RUNNING") {
            console.warn("⚠️ HTTP server was already not running or closed.");
          } else {
            console.error("❌ Error closing HTTP server:", err.message);
          }
        } else {
          console.log("✅ HTTP server closed.");
        }
        resolve();
      });
    });

    await disconnectPrisma(); // disconnectPrisma logs its own status

    clearTimeout(shutdownTimeout);
    console.log("🚪 All services closed successfully. Exiting process...");
    process.exit(0);
  } catch (error: any) {
    clearTimeout(shutdownTimeout);
    console.error(
      "❌ Error during graceful shutdown sequence:",
      error.message || error
    );
    process.exit(1);
  }
};

const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, () => performGracefulShutdown(signal));
});

const criticalErrorHandler = (
  errorType: string,
  error: Error | any,
  _promise?: Promise<any> // <-- FIXED: Prefixed 'promise' with underscore as it's not used
) => {
  console.error(`💥 ${errorType}! Attempting graceful shutdown...`);
  console.error(
    errorType === "UNHANDLED REJECTION" ? "Reason:" : "Error:",
    error?.stack || error
  );

  if (!isShuttingDown) {
    performGracefulShutdown(errorType).catch(() => {
      console.error(
        "Force exiting after critical error and failed graceful shutdown."
      );
      process.exit(1);
    });
    setTimeout(() => {
      console.error(`Force exiting after ${errorType} (7s timeout).`);
      process.exit(1);
    }, 7000);
  } else {
    console.log(
      "Shutdown already initiated, critical error occurred during shutdown."
    );
  }
};

process.on(
  "unhandledRejection",
  (
    reason,
    promise // Keep promise here for the event signature
  ) => criticalErrorHandler("UNHANDLED REJECTION", reason, promise) // Pass it along
);
process.on(
  "uncaughtException",
  (err) => criticalErrorHandler("UNCAUGHT EXCEPTION", err) // No promise argument for uncaughtException
);

startServer();
