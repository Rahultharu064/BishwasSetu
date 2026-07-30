import { moderationQueue }      from './queue'
import { processReviewScreening } from '../services/reviewService'
import type { Job } from 'bull'

moderationQueue.process('screen-review', 5, async (job: Job) => {
  const data = job.data as {
    reviewId:           string
    text:               string
    customerId:         string
    providerId:         string
    bookingId:          string
    submittedAt:        string
    bookingCompletedAt: string | undefined
  }

  console.log(`🔍 Screening review: ${data.reviewId}`)

  const result = await processReviewScreening(data)

  await job.progress(100)
  return result
})

moderationQueue.on('completed', (job: Job, result: any) => {
  console.log(
    ` Review ${job.data.reviewId} screened — visible: ${result.isVisible}`
  )
})

moderationQueue.on('failed', (job: Job, err: Error) => {
  console.error(`❌ Review screening failed for ${job.data.reviewId}:`, err.message)
})

console.log('🚀 Moderation worker started')