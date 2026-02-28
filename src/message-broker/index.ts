import { Queue, Worker, Job } from "bullmq"
import { eq } from "drizzle-orm"
import { textAnalysis } from "../microservices/ai"
import { postsTable } from "../db/schema"
import { db } from "../db/database.ts"

export let sentimentQueue: Queue
let sentimentWorker: Worker

export const initializeMessageBroker = () => {
    const connection = {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        maxRetriesPerRequest: null,
    }
    sentimentQueue = new Queue('sentiment', { connection })
    console.log("Sentiment queue initialized")
    if (process.env.SERVER_ROLE === "all" || process.env.SERVER_ROLE === "worker") {
        sentimentWorker = new Worker('sentiment', analyzeSentiment, { 
            connection,
            concurrency: 1, // process one job/time to avoid chrashing the process
         })
        console.log("Sentiment worker initialized")
    }
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

    try {
        console.log(`Post content: ${post.content}`)

    // analyze sentiment of post content
    const analysis = await textAnalysis(post.content)

    const safeSentiment = analysis.sentiment || "ok" // default to ok if sentiment is missing or invalid
    const safeCorrection = analysis.correction || "" // default to empty string if correction is missing

    // update post with sentiment analysis result
    await db.update(postsTable).set({ sentiment: safeSentiment, correction: safeCorrection }).where(eq(postsTable.id, postId))
    console.log(`Sentiment analysis for post ${postId} completed`)

    } catch (error) {
        console.error(`Error analyzing sentiment for post ${postId}:`, error)
        throw error // rethrow error to let bullmq handle retries
    }
}