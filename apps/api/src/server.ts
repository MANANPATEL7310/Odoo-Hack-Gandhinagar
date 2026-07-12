import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { scheduler } from "./lib/scheduler.js";

// Register background jobs (stubs to be filled by respective feature modules)
scheduler.register("booking-status-transitions", 60 * 1000, async () => {
  logger.debug("Running job: booking-status-transitions (Stub)");
});

scheduler.register("overdue-detection", 60 * 60 * 1000, async () => {
  logger.debug("Running job: overdue-detection (Stub)");
});

// Start background scheduler
scheduler.start();

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

// Graceful shutdown handler
const shutdown = () => {
  logger.info("Shutdown signal received. Cleaning up...");
  scheduler.stop();
  server.close(() => {
    logger.info("API server closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
