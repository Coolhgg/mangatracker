import { Worker, Queue, JobsOptions } from "bullmq";
import type { PrismaClient } from "@mangatracker/db";
import IORedis from "ioredis";
import PQueue from "p-queue";
import { prisma } from "@mangatracker/db";
import { fetchSeries, fetchChaptersAll } from "./mangadex";
import { randomUUID } from "crypto";
import http from "http";

const connection = new IORedis(process.env.REDIS_URL!);
const queueName = "sync-series";
const queue = new Queue(queueName, { connection });

const jobsOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 24 * 3600, count: 1000 }
};

const limiter = new PQueue({ interval: 1000, intervalCap: 5, concurrency: 2 });

async function processSeries(seriesId: string) {
  const series = await prisma.series.findUnique({ where: { id: seriesId } });
  if (!series) throw new Error(`Series not found ${seriesId}`);
  if (series.source !== "MANGADEX") throw new Error("Unsupported source");

  const md = await limiter.add(()=> fetchSeries(series.sourceId)) as Awaited<ReturnType<typeof fetchSeries>>;
  const chapters = await limiter.add(()=> fetchChaptersAll(series.sourceId)) as Awaited<ReturnType<typeof fetchChaptersAll>>;

  await prisma.$transaction(async (tx)=>{
    await tx.series.update({ where: { id: series.id }, data: { title: md.title, description: md.description, coverUrl: md.coverUrl, lastSyncedAt: new Date() } });
    for (const c of chapters) {
      await tx.chapter.upsert({
        where: { seriesId_sourceId: { seriesId: series.id, sourceId: c.id } } as any,
        create: { id: randomUUID(), seriesId: series.id, sourceId: c.id, number: c.number, title: c.title, publishedAt: c.publishedAt },
        update: { number: c.number, title: c.title, publishedAt: c.publishedAt }
      });
    }
  });
}

const worker = new Worker(queueName, async (job) => {
  const { seriesId } = job.data as { seriesId: string };
  await processSeries(seriesId);
}, { connection, concurrency: 2 });

worker.on("completed", (job)=> console.log(`Completed ${job.id}`));
worker.on("failed", (job, err)=> console.error(`Failed ${job?.id}`, err));

async function scheduleAllTracked() {
  const tracked = await prisma.userSeries.findMany({ select: { seriesId: true }, distinct: ["seriesId"] });
  const cron = process.env.SYNC_INTERVAL_CRON || "*/15 * * * *";
  for (const t of tracked) {
    await queue.add(
      "repeat",
      { seriesId: t.seriesId },
      { ...jobsOpts, repeat: { pattern: cron }, jobId: `repeat:${t.seriesId}` }
    );
  }
}

async function main() {
  await scheduleAllTracked();

  const port = Number(process.env.PORT || 3001);
  http.createServer((_req, res)=>{
    res.writeHead(200);
    res.end("ok");
  }).listen(port, ()=> console.log(`Worker healthy on :${port}`));
}

main().catch((e)=> {
  console.error(e);
  process.exit(1);
});
