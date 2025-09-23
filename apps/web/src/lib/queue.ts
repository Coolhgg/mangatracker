import { Queue } from "bullmq";
import IORedis from "ioredis";

let queue: Queue | null = null;

export function getSyncQueue() {
  if (!queue) {
    const connection = new IORedis(process.env.REDIS_URL!);
    queue = new Queue("sync-series", { connection });
  }
  return queue;
}
