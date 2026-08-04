/**
 * Bull queues for anti-disintermediation side effects (escrow release,
 * emergency dispatch). Uses the same Redis availability gate as config/redis.ts
 * so local dev without Redis still processes jobs inline via mock queues.
 *
 * Env: REDIS_URI or REDIS_URL
 */
import Queue from "bull";

const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL;
const isRedisEnabled = !!redisUrl;

type JobHandler = (job: { data: unknown }) => Promise<void> | void;

function createMockQueue(name: string) {
  const handlers = new Map<string, JobHandler>();
  console.log(`ℹ️ Mock queue "${name}" initialized (Redis not available)`);
  return {
    add: async (
      jobName: string,
      data: unknown,
      opts?: { delay?: number; attempts?: number; backoff?: unknown }
    ) => {
      const run = () => {
        const handler = handlers.get(jobName);
        if (!handler) {
          console.log(`ℹ️ Mock queue "${name}" ignoring unknown job "${jobName}"`);
          return;
        }
        void Promise.resolve(handler({ data })).catch((err) => {
          console.error(`Mock queue "${name}" job "${jobName}" failed:`, err);
        });
      };
      if (opts?.delay) setTimeout(run, opts.delay);
      else setImmediate(run);
      return { id: "mock-job" };
    },
    process: (jobName: string, handler: JobHandler) => {
      handlers.set(jobName, handler);
    },
    close: () => Promise.resolve(),
    on: () => {},
  };
}

// Parse the URL once and build a shared options object so every queue's
// internal connections (client/subscriber/bclient) get the same keepAlive +
// retry + TLS tuning — passing a bare URL string as Bull's 2nd arg leaves
// those internal ioredis instances on defaults, which Upstash's aggressive
// idle-connection resets don't tolerate (source of the ECONNRESET/EPIPE loop).
function buildRedisOptions(url: string) {
  const parsed = new URL(url);
  return {
    port: Number(parsed.port) || 6379,
    host: parsed.hostname,
    password: parsed.password || undefined,
    username: parsed.username || undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    keepAlive: 30000,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 20) return null;
      return Math.min(times * 200, 5000);
    },
  };
}

function createQueue(name: string) {
  if (isRedisEnabled && redisUrl) {
    const queue = new Queue(name, {
      redis: buildRedisOptions(redisUrl),
      defaultJobOptions: { removeOnComplete: 500, removeOnFail: 1000 },
    });
    queue.on("error", (err) => console.error(`❌ Queue "${name}" error:`, err.message));
    return queue;
  }
  return createMockQueue(name) as unknown as Queue.Queue;
}

export const escrowQueue = createQueue("escrow");
export const dispatchQueue = createQueue("emergency-dispatch");
export const maintenanceQueue = createQueue("maintenance");