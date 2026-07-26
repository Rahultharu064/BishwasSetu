/**
 * Bull queues for anti-disintermediation side effects (escrow release,
 * emergency dispatch). Uses the same Redis availability gate as config/redis.ts
 * so local dev without Redis still processes jobs inline via mock queues.
 *
 * Env: REDIS_URI or REDIS_URL
 */
import Queue from "bull";

const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL;
const isRedisEnabled = !!(
  redisUrl &&
  !redisUrl.includes("localhost") &&
  !redisUrl.includes("127.0.0.1") &&
  !redisUrl.includes("::1")
);

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
      const handler = handlers.get(jobName);
      if (!handler) {
        console.log(`ℹ️ Mock queue "${name}" ignoring unknown job "${jobName}"`);
        return { id: "mock-job" };
      }
      const run = () => {
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

function createQueue(name: string) {
  if (isRedisEnabled && redisUrl) {
    return new Queue(name, redisUrl, {
      defaultJobOptions: { removeOnComplete: 500, removeOnFail: 1000 },
    });
  }
  return createMockQueue(name) as unknown as Queue.Queue;
}

export const escrowQueue = createQueue("escrow");
export const dispatchQueue = createQueue("emergency-dispatch");
export const maintenanceQueue = createQueue("maintenance");
