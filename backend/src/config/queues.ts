/**
 * Bull queues backed by Redis. If you already have a queues config,
 * merge these queue definitions into it instead of duplicating.
 * Env: REDIS_URL
 */
import Queue from "bull";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

export const escrowQueue = new Queue("escrow", REDIS_URL, {
  defaultJobOptions: { removeOnComplete: 500, removeOnFail: 1000 },
});

export const dispatchQueue = new Queue("emergency-dispatch", REDIS_URL, {
    defaultJobOptions: { removeOnComplete: 500, removeOnFail: 1000 },
});

export const maintenanceQueue = new Queue("maintenance", REDIS_URL, {
    defaultJobOptions: { removeOnComplete: 100, removeOnFail: 500 },
}); 