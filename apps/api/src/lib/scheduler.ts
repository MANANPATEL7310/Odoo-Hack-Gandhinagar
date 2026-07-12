import { logger } from "../config/logger.js";

type JobHandler = () => Promise<void> | void;

interface JobConfig {
  name: string;
  intervalMs: number;
  handler: JobHandler;
}

class Scheduler {
  private jobs: JobConfig[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private runningJobs = new Set<string>();

  register(name: string, intervalMs: number, handler: JobHandler): void {
    this.jobs.push({ name, intervalMs, handler });
    logger.info({ name, intervalMs }, "Job registered with scheduler");
  }

  start(): void {
    logger.info("Starting background scheduler...");
    for (const job of this.jobs) {
      const interval = setInterval(async () => {
        if (this.runningJobs.has(job.name)) {
          logger.warn(
            { name: job.name },
            "Job run skipped: previous run is still active",
          );
          return;
        }

        this.runningJobs.add(job.name);
        logger.info({ name: job.name }, "Starting scheduled job run");
        const startTime = Date.now();

        try {
          await job.handler();
          const duration = Date.now() - startTime;
          logger.info(
            { name: job.name, durationMs: duration },
            "Scheduled job completed successfully",
          );
        } catch (error) {
          const duration = Date.now() - startTime;
          logger.error(
            { error, name: job.name, durationMs: duration },
            "Scheduled job failed",
          );
        } finally {
          this.runningJobs.delete(job.name);
        }
      }, job.intervalMs);

      this.intervals.push(interval);
    }
  }

  stop(): void {
    logger.info("Stopping background scheduler...");
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals = [];
    this.runningJobs.clear();
  }
}

export const scheduler = new Scheduler();
