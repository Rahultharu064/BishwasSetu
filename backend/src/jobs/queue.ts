import Bull from 'bull'

export const kycQueue = new Bull('kyc-pipeline', {
  redis: process.env.REDIS_URL!,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail:     100,
  },
})

export const trustQueue = new Bull('trust-recompute', {
  redis: process.env.REDIS_URL!,
})

export const moderationQueue = new Bull('content-moderation', {
  redis: process.env.REDIS_URL!,
})