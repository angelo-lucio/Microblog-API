import { Queue, Worker, Job } from "bullmq"
import IORedis from "ioredis"
import { eq } from "drizzle-orm"
import { textAnalysis } from "../services/ai"
import { postsTable } from "../db/schema"
import { db } from "../database"

let sentimentQueue: Queue
let sentimentWorker: Worker

export const initializeMessageBroker = () => {
    const connection = new IORedis({
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        maxRetriesPerRequest: null,
    })
    sentimentQueue = new Queue('sentiment', { connection })
    sentimentWorker = new Worker('sentiment', analyzeSentiment, { connection })
    console.log("Message broker initialized")
}   

const analyzeSentiment = async (job: Job) => {
    console.log(job.data)
    const { postId } = job.data
    console.log(`Analyzing sentiment for post ${postId}`)

    // fetch post content from database
    const posts = await db.select().from(postsTable).where(eq(postsTable.id, postId))
    const post = posts[0]
    
    if (!post) {
        console.error(`Post with id ${postId} not found`)
        return
    }

    // analyze sentiment of post content
    const analysis = await textAnalysis(post.content)

    // update post with sentiment analysis result
    await db.update(postsTable).set({ sentiment: analysis.sentiment, correction: analysis.correction }).where(eq(postsTable.id, postId))
    console.log(`Sentiment analysis for post ${postId} completed`)
}

export { sentimentQueue }
